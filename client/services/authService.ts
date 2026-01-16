/**
 * Admin Authentication Service
 * Handles admin login, logout, and token management
 */

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

class AuthService {
  /**
   * Login admin user
   */
  async login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser; token?: string }> {
    try {
      console.log('🔐 [AuthService] Attempting login for:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('📡 [AuthService] Login response status:', response.status, response.statusText);
      console.log('📡 [AuthService] Login response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        // Check content-type to see if it's JSON or HTML
        const contentType = response.headers.get('content-type');
        console.log('📦 [AuthService] Response content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          // Try to parse error message
          try {
            const errorData = await response.json();
            console.error('❌ [AuthService] Login error (JSON):', errorData);
            return {
              success: false,
              error: errorData.error || `Server error: ${response.status}`
            };
          } catch (parseError) {
            console.error('❌ [AuthService] Failed to parse error JSON:', parseError);
            return {
              success: false,
              error: `Server error: ${response.status} ${response.statusText}`
            };
          }
        } else {
          // Response is HTML (likely index.html from catch-all route)
          const text = await response.text();
          console.error('❌ [AuthService] Received HTML instead of JSON!');
          console.error('   Response preview:', text.substring(0, 200));
          return {
            success: false,
            error: `API endpoint not found. The server returned HTML instead of JSON. Please check if the API routes are correctly configured. (Status: ${response.status})`
          };
        }
      }

      // Check content-type for successful responses too
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ [AuthService] Successful status but non-JSON response!');
        console.error('   Status:', response.status);
        console.error('   Content-type:', contentType);
        console.error('   Response preview:', text.substring(0, 500));
        
        // If we got HTML instead of JSON, it means API routes are not configured correctly
        if (contentType && contentType.includes('text/html')) {
          return {
            success: false,
            error: 'API endpoint not found. The server returned HTML instead of JSON. This usually means the API routes are not properly configured on the server. Please check server configuration and .htaccess file.'
          };
        }
        
        return {
          success: false,
          error: 'Invalid response format. Expected JSON but received: ' + (contentType || 'unknown')
        };
      }

      const data = await response.json();
      console.log('✅ [AuthService] Login successful, received data:', { 
        success: data.success, 
        hasToken: !!data.data?.token,
        hasUser: !!data.data?.user 
      });

      if (data.success && data.data) {
        // Save token and user info
        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
        
        return {
          success: true,
          user: data.data.user,
          token: data.data.token
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'خطأ في الاتصال بالخادم. يرجى التأكد من أن الخادم يعمل على المنفذ 8080.'
        };
      }
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  }

  /**
   * Logout admin user
   */
  async logout(): Promise<void> {
    try {
      // Call logout API (optional)
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AdminUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Verify token with server
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [AuthService] verifyToken: Received non-JSON response');
        return false;
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Update user info
        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        return true;
      }

      // Token invalid, clear storage
      this.logout();
      return false;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
