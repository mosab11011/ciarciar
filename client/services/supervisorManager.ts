export interface SupervisorPermissions {
  canEditCountryInfo: boolean;
  canAddCities: boolean;
  canEditCities: boolean;
  canDeleteCities: boolean;
  canAddOffices: boolean;
  canEditOffices: boolean;
  canDeleteOffices: boolean;
  canViewReports: boolean;
  canManageReviews: boolean;
}

export interface Supervisor {
  id: string;
  email: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  countryId: string;
  permissions: SupervisorPermissions;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  password: string; // In production, this should be hashed
}

export interface SupervisorActivity {
  id: string;
  supervisorId: string;
  action: string;
  targetType: 'city' | 'office' | 'country' | 'review';
  targetId: string;
  details: {
    ar: string;
    en: string;
    fr: string;
  };
  timestamp: string;
}

class SupervisorManager {
  private readonly SUPERVISORS_KEY = 'supervisors_data';
  private readonly ACTIVITIES_KEY = 'supervisor_activities';
  private readonly SESSION_KEY = 'supervisor_session';

  // Default permissions for new supervisors
  private defaultPermissions: SupervisorPermissions = {
    canEditCountryInfo: false,
    canAddCities: true,
    canEditCities: true,
    canDeleteCities: false,
    canAddOffices: true,
    canEditOffices: true,
    canDeleteOffices: false,
    canViewReports: true,
    canManageReviews: true
  };

  // Get all supervisors
  getSupervisors(): Supervisor[] {
    try {
      const data = localStorage.getItem(this.SUPERVISORS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading supervisors:', error);
      return [];
    }
  }

  // Save supervisors
  private saveSupervisors(supervisors: Supervisor[]): boolean {
    try {
      localStorage.setItem(this.SUPERVISORS_KEY, JSON.stringify(supervisors));
      return true;
    } catch (error) {
      console.error('Error saving supervisors:', error);
      return false;
    }
  }

  // Add new supervisor
  addSupervisor(supervisorData: Omit<Supervisor, 'id' | 'createdAt' | 'updatedAt'>): Supervisor | null {
    try {
      const supervisors = this.getSupervisors();
      
      // Check if email already exists
      if (supervisors.some(s => s.email === supervisorData.email)) {
        throw new Error('Email already exists');
      }

      const newSupervisor: Supervisor = {
        ...supervisorData,
        id: `supervisor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        permissions: supervisorData.permissions || this.defaultPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      supervisors.push(newSupervisor);
      if (this.saveSupervisors(supervisors)) {
        this.logActivity(newSupervisor.id, 'supervisor_created', 'supervisor', newSupervisor.id, {
          ar: `تم إنشاء حساب مشرف جديد: ${newSupervisor.name.ar}`,
          en: `New supervisor account created: ${newSupervisor.name.en}`,
          fr: `Nouveau compte superviseur créé: ${newSupervisor.name.fr}`
        });
        return newSupervisor;
      }
      return null;
    } catch (error) {
      console.error('Error adding supervisor:', error);
      return null;
    }
  }

  // Update supervisor
  updateSupervisor(id: string, updates: Partial<Supervisor>): boolean {
    try {
      const supervisors = this.getSupervisors();
      const index = supervisors.findIndex(s => s.id === id);
      
      if (index === -1) return false;
      
      const oldSupervisor = supervisors[index];
      supervisors[index] = {
        ...supervisors[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      if (this.saveSupervisors(supervisors)) {
        this.logActivity(id, 'supervisor_updated', 'supervisor', id, {
          ar: `تم تحديث بيانات المشرف: ${supervisors[index].name.ar}`,
          en: `Supervisor data updated: ${supervisors[index].name.en}`,
          fr: `Données du superviseur mises à jour: ${supervisors[index].name.fr}`
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating supervisor:', error);
      return false;
    }
  }

  // Delete supervisor
  deleteSupervisor(id: string): boolean {
    try {
      const supervisors = this.getSupervisors();
      const supervisor = supervisors.find(s => s.id === id);
      if (!supervisor) return false;
      
      const filteredSupervisors = supervisors.filter(s => s.id !== id);
      
      if (this.saveSupervisors(filteredSupervisors)) {
        this.logActivity(id, 'supervisor_deleted', 'supervisor', id, {
          ar: `تم حذف حساب المشرف: ${supervisor.name.ar}`,
          en: `Supervisor account deleted: ${supervisor.name.en}`,
          fr: `Compte superviseur supprimé: ${supervisor.name.fr}`
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      return false;
    }
  }

  // Get supervisor by ID
  getSupervisorById(id: string): Supervisor | null {
    const supervisors = this.getSupervisors();
    return supervisors.find(s => s.id === id) || null;
  }

  // Get supervisors by country
  getSupervisorsByCountry(countryId: string): Supervisor[] {
    const supervisors = this.getSupervisors();
    return supervisors.filter(s => s.countryId === countryId && s.isActive);
  }

  // Login supervisor
  loginSupervisor(email: string, password: string): Supervisor | null {
    try {
      const supervisors = this.getSupervisors();
      const supervisor = supervisors.find(s => 
        s.email === email && 
        s.password === password && 
        s.isActive
      );
      
      if (supervisor) {
        // Update last login
        this.updateSupervisor(supervisor.id, { lastLogin: new Date().toISOString() });
        
        // Create session
        const session = {
          supervisorId: supervisor.id,
          email: supervisor.email,
          countryId: supervisor.countryId,
          permissions: supervisor.permissions,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        
        this.logActivity(supervisor.id, 'supervisor_login', 'supervisor', supervisor.id, {
          ar: `تسجيل دخول المشرف: ${supervisor.name.ar}`,
          en: `Supervisor login: ${supervisor.name.en}`,
          fr: `Connexion superviseur: ${supervisor.name.fr}`
        });
        
        return supervisor;
      }
      return null;
    } catch (error) {
      console.error('Error during supervisor login:', error);
      return null;
    }
  }

  // Logout supervisor
  logoutSupervisor(): boolean {
    try {
      const session = this.getCurrentSession();
      if (session) {
        const supervisor = this.getSupervisorById(session.supervisorId);
        if (supervisor) {
          this.logActivity(supervisor.id, 'supervisor_logout', 'supervisor', supervisor.id, {
            ar: `تسجيل خروج المشرف: ${supervisor.name.ar}`,
            en: `Supervisor logout: ${supervisor.name.en}`,
            fr: `Déconnexion superviseur: ${supervisor.name.fr}`
          });
        }
      }
      localStorage.removeItem(this.SESSION_KEY);
      return true;
    } catch (error) {
      console.error('Error during supervisor logout:', error);
      return false;
    }
  }

  // Get current session
  getCurrentSession(): any {
    try {
      const session = localStorage.getItem(this.SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Check if supervisor is logged in
  isLoggedIn(): boolean {
    const session = this.getCurrentSession();
    return session !== null;
  }

  // Get current supervisor
  getCurrentSupervisor(): Supervisor | null {
    const session = this.getCurrentSession();
    if (session) {
      return this.getSupervisorById(session.supervisorId);
    }
    return null;
  }

  // Check permission
  hasPermission(permission: keyof SupervisorPermissions): boolean {
    const session = this.getCurrentSession();
    if (session && session.permissions) {
      return session.permissions[permission] === true;
    }
    return false;
  }

  // Update permissions
  updatePermissions(supervisorId: string, permissions: SupervisorPermissions): boolean {
    const result = this.updateSupervisor(supervisorId, { permissions });
    if (result) {
      // Update session if it's the current supervisor
      const session = this.getCurrentSession();
      if (session && session.supervisorId === supervisorId) {
        session.permissions = permissions;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    }
    return result;
  }

  // Activity logging
  logActivity(supervisorId: string, action: string, targetType: SupervisorActivity['targetType'], targetId: string, details: { ar: string; en: string; fr: string }): void {
    try {
      const activities = this.getActivities();
      const newActivity: SupervisorActivity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        supervisorId,
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date().toISOString()
      };
      
      activities.unshift(newActivity); // Add to beginning
      
      // Keep only last 1000 activities
      if (activities.length > 1000) {
        activities.splice(1000);
      }
      
      localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Get activities
  getActivities(supervisorId?: string): SupervisorActivity[] {
    try {
      const data = localStorage.getItem(this.ACTIVITIES_KEY);
      const activities = data ? JSON.parse(data) : [];
      
      if (supervisorId) {
        return activities.filter((a: SupervisorActivity) => a.supervisorId === supervisorId);
      }
      
      return activities;
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  // Get statistics
  getStatistics() {
    const supervisors = this.getSupervisors();
    const activities = this.getActivities();
    
    const totalSupervisors = supervisors.length;
    const activeSupervisors = supervisors.filter(s => s.isActive).length;
    const inactiveSupervisors = totalSupervisors - activeSupervisors;
    
    // Group by country
    const supervisorsByCountry = supervisors.reduce((acc, supervisor) => {
      acc[supervisor.countryId] = (acc[supervisor.countryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivities = activities.filter(a => 
      new Date(a.timestamp) > sevenDaysAgo
    ).length;
    
    return {
      totalSupervisors,
      activeSupervisors,
      inactiveSupervisors,
      supervisorsByCountry,
      recentActivities,
      totalActivities: activities.length
    };
  }

  // Validate supervisor data
  validateSupervisorData(data: Partial<Supervisor>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.name?.ar || data.name.ar.trim().length < 2) {
      errors.push('Arabic name is required (min 2 characters)');
    }
    
    if (!data.name?.en || data.name.en.trim().length < 2) {
      errors.push('English name is required (min 2 characters)');
    }
    
    if (!data.countryId) {
      errors.push('Country assignment is required');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear all data
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.SUPERVISORS_KEY);
      localStorage.removeItem(this.ACTIVITIES_KEY);
      localStorage.removeItem(this.SESSION_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing supervisor data:', error);
      return false;
    }
  }
}

// Create singleton instance
export const supervisorManager = new SupervisorManager();
export default supervisorManager;
