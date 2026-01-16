import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supervisorManager, type Supervisor, type SupervisorPermissions } from '@/services/supervisorManager';
import { dataManager } from '@/services/dataManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Shield,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Activity,
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Settings
} from 'lucide-react';

const AdminSupervisorManagement: React.FC = () => {
  const { language } = useLanguage();
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [viewingSupervisor, setViewingSupervisor] = useState<Supervisor | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalSupervisors: 0,
    activeSupervisors: 0,
    inactiveSupervisors: 0,
    supervisorsByCountry: {},
    recentActivities: 0
  });

  const [formData, setFormData] = useState<Partial<Supervisor>>({
    name: { ar: '', en: '', fr: '' },
    email: '',
    password: '',
    phone: '',
    countryId: '',
    permissions: {
      canEditCountryInfo: false,
      canAddCities: true,
      canEditCities: true,
      canDeleteCities: false,
      canAddOffices: true,
      canEditOffices: true,
      canDeleteOffices: false,
      canViewReports: true,
      canManageReviews: true
    },
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const supervisorData = supervisorManager.getSupervisors();
    const countryData = dataManager.getCountries();
    const supervisorStats = supervisorManager.getStatistics();
    
    setSupervisors(supervisorData);
    setCountries(countryData);
    setStats(supervisorStats);
  };

  const content = {
    ar: {
      supervisorManagement: 'إدارة المشرفين',
      overview: 'نظرة عامة',
      supervisors: 'المشرفين',
      addSupervisor: 'إضافة مشرف جديد',
      editSupervisor: 'تعديل المشرف',
      viewSupervisor: 'عرض تفاصيل المشرف',
      totalSupervisors: 'إجمالي المشرفين',
      activeSupervisors: 'المشرفين النشطين',
      inactiveSupervisors: 'المشرفين غير النشطين',
      recentActivities: 'الأنشطة الحديثة',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      country: 'الدولة',
      permissions: 'الصلاحيات',
      status: 'الحالة',
      actions: 'الإجراءات',
      active: 'نشط',
      inactive: 'غير نشط',
      search: 'البحث...',
      filterByCountry: 'تصفية حسب الدولة',
      allCountries: 'جميع الدول',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      password: 'كلمة المرور',
      confirmDelete: 'هل أنت متأكد من حذف هذا المشرف؟',
      supervisorAdded: 'تم إضافة المشرف بنجاح',
      supervisorUpdated: 'تم تحديث المشرف بنجاح',
      supervisorDeleted: 'تم حذف المشرف بنجاح',
      fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      lastLogin: 'آخر تسجيل دخول',
      memberSince: 'عضو منذ',
      basicInfo: 'المعلومات الأساسية',
      arabic: 'العربية',
      english: 'الإنجليزية',
      french: 'الفرنسية',
      required: 'مطلوب',
      optional: 'اختياري',
      selectCountry: 'اختر دولة',
      permissionSettings: 'إعدادات الصلاحيات',
      canEditCountryInfo: 'تعديل معلومات الدولة',
      canAddCities: 'إضافة مدن جديدة',
      canEditCities: 'تعديل المدن',
      canDeleteCities: 'حذف المدن',
      canAddOffices: 'إضافة مكاتب جديدة',
      canEditOffices: 'تعديل المكاتب',
      canDeleteOffices: 'حذف المكاتب',
      canViewReports: 'عرض التقارير',
      canManageReviews: 'إدارة المراجعات'
    },
    en: {
      supervisorManagement: 'Supervisor Management',
      overview: 'Overview',
      supervisors: 'Supervisors',
      addSupervisor: 'Add New Supervisor',
      editSupervisor: 'Edit Supervisor',
      viewSupervisor: 'View Supervisor Details',
      totalSupervisors: 'Total Supervisors',
      activeSupervisors: 'Active Supervisors',
      inactiveSupervisors: 'Inactive Supervisors',
      recentActivities: 'Recent Activities',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      country: 'Country',
      permissions: 'Permissions',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      search: 'Search...',
      filterByCountry: 'Filter by Country',
      allCountries: 'All Countries',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      password: 'Password',
      confirmDelete: 'Are you sure you want to delete this supervisor?',
      supervisorAdded: 'Supervisor added successfully',
      supervisorUpdated: 'Supervisor updated successfully',
      supervisorDeleted: 'Supervisor deleted successfully',
      fillRequired: 'Please fill all required fields',
      invalidEmail: 'Please enter a valid email address',
      lastLogin: 'Last Login',
      memberSince: 'Member Since',
      basicInfo: 'Basic Information',
      arabic: 'Arabic',
      english: 'English',
      french: 'French',
      required: 'Required',
      optional: 'Optional',
      selectCountry: 'Select Country',
      permissionSettings: 'Permission Settings',
      canEditCountryInfo: 'Edit Country Information',
      canAddCities: 'Add New Cities',
      canEditCities: 'Edit Cities',
      canDeleteCities: 'Delete Cities',
      canAddOffices: 'Add New Offices',
      canEditOffices: 'Edit Offices',
      canDeleteOffices: 'Delete Offices',
      canViewReports: 'View Reports',
      canManageReviews: 'Manage Reviews'
    },
    fr: {
      supervisorManagement: 'Gestion des Superviseurs',
      overview: 'Aperçu',
      supervisors: 'Superviseurs',
      addSupervisor: 'Ajouter Nouveau Superviseur',
      editSupervisor: 'Modifier Superviseur',
      viewSupervisor: 'Voir Détails du Superviseur',
      totalSupervisors: 'Total Superviseurs',
      activeSupervisors: 'Superviseurs Actifs',
      inactiveSupervisors: 'Superviseurs Inactifs',
      recentActivities: 'Activités Récentes',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      country: 'Pays',
      permissions: 'Permissions',
      status: 'Statut',
      actions: 'Actions',
      active: 'Actif',
      inactive: 'Inactif',
      search: 'Rechercher...',
      filterByCountry: 'Filtrer par Pays',
      allCountries: 'Tous les Pays',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      password: 'Mot de Passe',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce superviseur?',
      supervisorAdded: 'Superviseur ajouté avec succès',
      supervisorUpdated: 'Superviseur mis à jour avec succès',
      supervisorDeleted: 'Superviseur supprimé avec succès',
      fillRequired: 'Veuillez remplir tous les champs requis',
      invalidEmail: 'Veuillez entrer une adresse email valide',
      lastLogin: 'Dernière Connexion',
      memberSince: 'Membre Depuis',
      basicInfo: 'Informations de Base',
      arabic: 'Arabe',
      english: 'Anglais',
      french: 'Français',
      required: 'Requis',
      optional: 'Optionnel',
      selectCountry: 'Sélectionner Pays',
      permissionSettings: 'Paramètres des Permissions',
      canEditCountryInfo: 'Modifier Infos Pays',
      canAddCities: 'Ajouter Nouvelles Villes',
      canEditCities: 'Modifier Villes',
      canDeleteCities: 'Supprimer Villes',
      canAddOffices: 'Ajouter Nouveaux Bureaux',
      canEditOffices: 'Modifier Bureaux',
      canDeleteOffices: 'Supprimer Bureaux',
      canViewReports: 'Voir Rapports',
      canManageReviews: 'Gérer Avis'
    }
  };

  const text = content[language];

  const filteredSupervisors = supervisors.filter(supervisor => {
    const matchesSearch = 
      supervisor.name[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supervisor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry = selectedCountry === 'all' || supervisor.countryId === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name?.ar || !formData.name?.en || !formData.email || !formData.countryId) {
      setError(text.fillRequired);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(text.invalidEmail);
      return;
    }

    if (!editingSupervisor && !formData.password) {
      setError('Password is required for new supervisors');
      return;
    }

    try {
      let result;
      if (editingSupervisor) {
        result = supervisorManager.updateSupervisor(editingSupervisor.id, formData);
        setSuccess(text.supervisorUpdated);
      } else {
        result = supervisorManager.addSupervisor(formData as any);
        setSuccess(text.supervisorAdded);
      }

      if (result) {
        resetForm();
        loadData();
      } else {
        setError('Failed to save supervisor');
      }
    } catch (err) {
      setError('An error occurred while saving');
    }
  };

  const resetForm = () => {
    setFormData({
      name: { ar: '', en: '', fr: '' },
      email: '',
      password: '',
      phone: '',
      countryId: '',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    });
    setIsAddingNew(false);
    setEditingSupervisor(null);
    setError('');
    setSuccess('');
  };

  const handleEdit = (supervisor: Supervisor) => {
    setFormData(supervisor);
    setEditingSupervisor(supervisor);
    setIsAddingNew(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = (supervisor: Supervisor) => {
    if (window.confirm(text.confirmDelete)) {
      const result = supervisorManager.deleteSupervisor(supervisor.id);
      if (result) {
        setSuccess(text.supervisorDeleted);
        loadData();
      } else {
        setError('Failed to delete supervisor');
      }
    }
  };

  const updatePermission = (permission: keyof SupervisorPermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{text.supervisorManagement}</h1>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {text.addSupervisor}
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={text.totalSupervisors}
          value={stats.totalSupervisors}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={text.activeSupervisors}
          value={stats.activeSupervisors}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title={text.inactiveSupervisors}
          value={stats.inactiveSupervisors}
          icon={UserX}
          color="red"
        />
        <StatCard
          title={text.recentActivities}
          value={stats.recentActivities}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={text.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">{text.allCountries}</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name[language]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSupervisor ? text.editSupervisor : text.addSupervisor}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{text.basicInfo}</h3>
                
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name-ar">{text.arabic} <Badge variant="destructive">{text.required}</Badge></Label>
                    <Input
                      id="name-ar"
                      value={formData.name?.ar || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, ar: e.target.value }
                      }))}
                      placeholder="الاسم بالعربية"
                      dir="rtl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name-en">{text.english} <Badge variant="destructive">{text.required}</Badge></Label>
                    <Input
                      id="name-en"
                      value={formData.name?.en || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, en: e.target.value }
                      }))}
                      placeholder="Name in English"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name-fr">{text.french}</Label>
                    <Input
                      id="name-fr"
                      value={formData.name?.fr || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: { ...prev.name, fr: e.target.value }
                      }))}
                      placeholder="Nom en français"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{text.email} <Badge variant="destructive">{text.required}</Badge></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="supervisor@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{text.phone}</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                {/* Password and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">
                      {text.password} 
                      {!editingSupervisor && <Badge variant="destructive">{text.required}</Badge>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required={!editingSupervisor}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">{text.country} <Badge variant="destructive">{text.required}</Badge></Label>
                    <select
                      id="country"
                      value={formData.countryId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">{text.selectCountry}</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name[language]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{text.permissionSettings}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.permissions || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={value}
                        onChange={(e) => updatePermission(key as keyof SupervisorPermissions, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor={key} className="text-sm">
                        {text[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isActive">{text.active}</Label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  {text.cancel}
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {text.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Supervisors List */}
      <Card>
        <CardHeader>
          <CardTitle>{text.supervisors}</CardTitle>
          <CardDescription>
            Manage supervisors and their permissions for each country.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSupervisors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No supervisors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSupervisors.map((supervisor) => {
                  const country = countries.find(c => c.id === supervisor.countryId);
                  return (
                    <div key={supervisor.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={supervisor.avatar} />
                            <AvatarFallback>
                              {supervisor.name[language]?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{supervisor.name[language]}</h3>
                            <p className="text-sm text-gray-500">{supervisor.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {country?.name[language] || 'Unknown Country'}
                              </span>
                              <Badge variant={supervisor.isActive ? "default" : "secondary"}>
                                {supervisor.isActive ? text.active : text.inactive}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingSupervisor(supervisor)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(supervisor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(supervisor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Supervisor Modal */}
      {viewingSupervisor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{text.viewSupervisor}</h2>
                <Button variant="ghost" onClick={() => setViewingSupervisor(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={viewingSupervisor.avatar} />
                    <AvatarFallback className="text-lg">
                      {viewingSupervisor.name[language]?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{viewingSupervisor.name[language]}</h3>
                    <p className="text-gray-500">{viewingSupervisor.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={viewingSupervisor.isActive ? "default" : "secondary"}>
                        {viewingSupervisor.isActive ? text.active : text.inactive}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{text.country}:</span>
                    <span className="ml-2">
                      {countries.find(c => c.id === viewingSupervisor.countryId)?.name[language] || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{text.phone}:</span>
                    <span className="ml-2">{viewingSupervisor.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">{text.memberSince}:</span>
                    <span className="ml-2">
                      {new Date(viewingSupervisor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {viewingSupervisor.lastLogin && (
                    <div>
                      <span className="font-medium">{text.lastLogin}:</span>
                      <span className="ml-2">
                        {new Date(viewingSupervisor.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Permissions */}
                <div>
                  <h4 className="font-medium mb-3">{text.permissions}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(viewingSupervisor.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {text[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <Badge variant={value ? "default" : "secondary"}>
                          {value ? '✓' : '��'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupervisorManagement;
