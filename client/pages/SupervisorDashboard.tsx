import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supervisorManager } from '@/services/supervisorManager';
import { dataManager } from '@/services/dataManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut, 
  Eye,
  Edit,
  Plus,
  Activity,
  Users,
  Calendar,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalCities: number;
  totalOffices: number;
  totalReviews: number;
  avgRating: number;
  recentActivities: number;
}

const SupervisorDashboard: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [supervisor, setSupervisor] = useState(supervisorManager.getCurrentSupervisor());
  const [country, setCountry] = useState(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCities: 0,
    totalOffices: 0,
    totalReviews: 0,
    avgRating: 0,
    recentActivities: 0
  });
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Check authentication
  useEffect(() => {
    if (!supervisorManager.isLoggedIn() || !supervisor) {
      navigate('/supervisor/login');
      return;
    }

    // Load country data
    const countryData = dataManager.getCountryById(supervisor.countryId);
    setCountry(countryData);

    // Load statistics
    loadStatistics();
    loadActivities();
  }, [supervisor, navigate]);

  const loadStatistics = () => {
    if (!supervisor) return;

    const countryData = dataManager.getCountryById(supervisor.countryId);
    const offices = dataManager.getOfficesByCountry(supervisor.countryId);
    const activities = supervisorManager.getActivities(supervisor.id);

    setStats({
      totalCities: countryData?.cities?.length || 0,
      totalOffices: offices.length,
      totalReviews: countryData?.totalReviews || 0,
      avgRating: countryData?.rating || 0,
      recentActivities: activities.filter(a => {
        const activityDate = new Date(a.timestamp);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return activityDate > sevenDaysAgo;
      }).length
    });
  };

  const loadActivities = () => {
    if (!supervisor) return;
    
    const recentActivities = supervisorManager.getActivities(supervisor.id)
      .slice(0, 10); // Get last 10 activities
    setActivities(recentActivities);
  };

  const handleLogout = () => {
    supervisorManager.logoutSupervisor();
    navigate('/supervisor/login');
  };

  const content = {
    ar: {
      dashboard: 'لوحة التحكم',
      welcome: 'مرحباً',
      overview: 'نظرة عامة',
      cities: 'المدن',
      offices: 'المكاتب السياحية',
      reports: 'التقارير',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      totalCities: 'إجمالي المد��',
      totalOffices: 'إجمالي المكاتب',
      totalReviews: 'إجمالي المراجعات',
      avgRating: 'متوسط التقييم',
      recentActivity: 'النشاط الأخير',
      activities: 'أنشطة حديثة',
      noCities: 'لا توجد مدن مضافة بعد',
      noOffices: 'لا توجد مكاتب مضافة بعد',
      noActivities: 'لا توجد أنشطة حديثة',
      addCity: 'إضافة مدينة جديدة',
      addOffice: 'إضافة مكتب جديد',
      viewAll: 'عرض الكل',
      edit: 'تعديل',
      view: 'عرض',
      country: 'الدولة',
      permissions: 'الصلاحيات',
      lastLogin: 'آخر تسجيل دخول',
      memberSince: 'عضو منذ',
      active: 'نشط',
      inactive: 'غير نشط'
    },
    en: {
      dashboard: 'Dashboard',
      welcome: 'Welcome',
      overview: 'Overview',
      cities: 'Cities',
      offices: 'Travel Offices',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout',
      totalCities: 'Total Cities',
      totalOffices: 'Total Offices',
      totalReviews: 'Total Reviews',
      avgRating: 'Average Rating',
      recentActivity: 'Recent Activity',
      activities: 'Recent Activities',
      noCities: 'No cities added yet',
      noOffices: 'No offices added yet',
      noActivities: 'No recent activities',
      addCity: 'Add New City',
      addOffice: 'Add New Office',
      viewAll: 'View All',
      edit: 'Edit',
      view: 'View',
      country: 'Country',
      permissions: 'Permissions',
      lastLogin: 'Last Login',
      memberSince: 'Member Since',
      active: 'Active',
      inactive: 'Inactive'
    },
    fr: {
      dashboard: 'Tableau de Bord',
      welcome: 'Bienvenue',
      overview: 'Aperçu',
      cities: 'Villes',
      offices: 'Bureaux de Voyage',
      reports: 'Rapports',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      totalCities: 'Total Villes',
      totalOffices: 'Total Bureaux',
      totalReviews: 'Total Avis',
      avgRating: 'Note Moyenne',
      recentActivity: 'Activité Récente',
      activities: 'Activités Récentes',
      noCities: 'Aucune ville ajoutée',
      noOffices: 'Aucun bureau ajouté',
      noActivities: 'Aucune activité récente',
      addCity: 'Ajouter Nouvelle Ville',
      addOffice: 'Ajouter Nouveau Bureau',
      viewAll: 'Voir Tout',
      edit: 'Modifier',
      view: 'Voir',
      country: 'Pays',
      permissions: 'Permissions',
      lastLogin: 'Dernière Connexion',
      memberSince: 'Membre Depuis',
      active: 'Actif',
      inactive: 'Inactif'
    }
  };

  const text = content[language];

  if (!supervisor || !country) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {text.dashboard}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Supervisor Info */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={supervisor.avatar} />
                  <AvatarFallback>
                    {supervisor.name[language]?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {supervisor.name[language]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {country.name[language]}
                  </p>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{text.logout}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {text.welcome}, {supervisor.name[language]}!
          </h2>
          <p className="text-gray-600">
            {text.country}: {country.name[language]}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={text.totalCities}
            value={stats.totalCities}
            icon={MapPin}
            color="blue"
          />
          <StatCard
            title={text.totalOffices}
            value={stats.totalOffices}
            icon={Building2}
            color="green"
          />
          <StatCard
            title={text.totalReviews}
            value={stats.totalReviews}
            icon={Users}
            color="purple"
          />
          <StatCard
            title={text.avgRating}
            value={stats.avgRating.toFixed(1)}
            icon={BarChart3}
            color="yellow"
          />
        </div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
            <TabsTrigger value="cities">{text.cities}</TabsTrigger>
            <TabsTrigger value="offices">{text.offices}</TabsTrigger>
            <TabsTrigger value="reports">{text.reports}</TabsTrigger>
            <TabsTrigger value="settings">{text.settings}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    {text.activities}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.details[language]}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString(
                                language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US'
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      {text.noActivities}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supervisor.permissions.canAddCities && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate('/supervisor/cities/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addCity}
                    </Button>
                  )}
                  
                  {supervisor.permissions.canAddOffices && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => navigate('/supervisor/offices/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addOffice}
                    </Button>
                  )}
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate('/supervisor/cities')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {text.viewAll} {text.cities}
                  </Button>
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate('/supervisor/offices')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {text.viewAll} {text.offices}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{text.cities}</CardTitle>
                  {supervisor.permissions.canAddCities && (
                    <Button onClick={() => navigate('/supervisor/cities/add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addCity}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {country.cities && country.cities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {country.cities.map((city, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">
                            {city.name[language]}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {city.description[language]?.substring(0, 100)}...
                          </p>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              {text.view}
                            </Button>
                            {supervisor.permissions.canEditCities && (
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4 mr-1" />
                                {text.edit}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{text.noCities}</p>
                    {supervisor.permissions.canAddCities && (
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/supervisor/cities/add')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {text.addCity}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offices Tab */}
          <TabsContent value="offices">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{text.offices}</CardTitle>
                  {supervisor.permissions.canAddOffices && (
                    <Button onClick={() => navigate('/supervisor/offices/add')}>
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addOffice}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{text.noOffices}</p>
                  {supervisor.permissions.canAddOffices && (
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/supervisor/offices/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addOffice}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>{text.reports}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  Reports functionality coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{text.settings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={supervisor.avatar} />
                          <AvatarFallback className="text-lg">
                            {supervisor.name[language]?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{supervisor.name[language]}</h4>
                          <p className="text-sm text-gray-500">{supervisor.email}</p>
                          <Badge variant={supervisor.isActive ? "default" : "secondary"}>
                            {supervisor.isActive ? text.active : text.inactive}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{text.country}:</span>
                          <span className="ml-2">{country.name[language]}</span>
                        </div>
                        <div>
                          <span className="font-medium">{text.memberSince}:</span>
                          <span className="ml-2">
                            {new Date(supervisor.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {supervisor.lastLogin && (
                          <div>
                            <span className="font-medium">{text.lastLogin}:</span>
                            <span className="ml-2">
                              {new Date(supervisor.lastLogin).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">{text.permissions}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(supervisor.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <Badge variant={value ? "default" : "secondary"}>
                            {value ? '✓' : '✗'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SupervisorDashboard;
