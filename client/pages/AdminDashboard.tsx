import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Save, X, Upload, Eye, Users, MapPin, Calendar, BarChart3, Settings, LogOut, Search, Filter, Star, Image, Globe, TrendingUp, Activity, DollarSign, UserCheck, Bell, Menu, ChevronDown, Download, RefreshCw, Heart, ThumbsUp, MessageSquare, Zap, Award, Shield, Building2, Briefcase, Phone, Mail, Clock, CheckCircle, AlertCircle, FileText, Database, RotateCcw, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAllCountriesWithDynamic, getCountriesStatistics, syncStaticWithDynamic } from '@/data/countries';
import { dataManager, type AdminCountryData, type TravelOffice } from '@/services/dataManager';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '@/services/authService';
import AdminSupervisorManagement from './AdminSupervisorManagement';
import AdminPayments from './AdminPayments';
import SiteSettingsManager from '@/components/SiteSettingsManager';
import TravelOffersManager from '@/components/TravelOffersManager';
import AdminCityManagement from './AdminCityManagement';
import AdminProvinceManagement from './AdminProvinceManagement';
import AdminDestinationManagement from './AdminDestinationManagement';
import AdminEventManagement from './AdminEventManagement';
import AdminOfficeManagement from './AdminOfficeManagement';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [countries, setCountries] = useState<AdminCountryData[]>([]);
  const [offices, setOffices] = useState<TravelOffice[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [isAddingOffice, setIsAddingOffice] = useState(false);
  const [editingCountry, setEditingCountry] = useState<AdminCountryData | null>(null);
  const [editingOffice, setEditingOffice] = useState<TravelOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterContinent, setFilterContinent] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalCountries: 0,
    activeCountries: 0,
    totalOffices: 0,
    activeOffices: 0,
    totalTours: 0,
    totalReviews: 0,
    avgRating: 0,
    officesPerCountry: 0
  });

  const [newCountry, setNewCountry] = useState<Partial<AdminCountryData>>({
    name: { ar: '', en: '', fr: '' },
    capital: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    continent: 'asia',
    mainImage: '',
    gallery: [],
    currency: { ar: '', en: '', fr: '' },
    language: { ar: '', en: '', fr: '' },
    bestTimeToVisit: { ar: '', en: '', fr: '' },
    rating: 4.5,
    totalReviews: 0,
    totalTours: 0,
    highlights: { ar: [], en: [], fr: [] },
    culture: { ar: [], en: [], fr: [] },
    cuisine: { ar: [], en: [], fr: [] },
    transportation: { ar: [], en: [], fr: [] },
    safety: { ar: [], en: [], fr: [] },
    cities: [],
    isActive: true
  });

  const [newOffice, setNewOffice] = useState<Partial<TravelOffice>>({
    countryId: '',
    name: { ar: '', en: '', fr: '' },
    address: { ar: '', en: '', fr: '' },
    phone: '',
    email: '',
    website: '',
    manager: { ar: '', en: '', fr: '' },
    services: { ar: [], en: [], fr: [] },
    workingHours: { ar: '', en: '', fr: '' },
    rating: 4.5,
    reviews: 0,
    isActive: true
  });

  useEffect(() => {
    loadData();
    loadNotifications();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper function to safely parse JSON arrays
  const parseJsonArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const loadData = async () => {
    try {
      // Load countries from API
      const countriesResponse = await fetch('/api/countries?active=false');
      const contentType = countriesResponse.headers.get('content-type');
      
      if (!countriesResponse.ok || !contentType || !contentType.includes('application/json')) {
        setCountries([]);
      } else {
        const countriesData = await countriesResponse.json();
        if (countriesData.success && Array.isArray(countriesData.data)) {
        // Transform API response to match AdminCountryData format
        const transformedCountries = countriesData.data.map((c: any) => ({
          id: c.id,
          name: { ar: c.name_ar || '', en: c.name_en || '', fr: c.name_fr || '' },
          capital: { ar: c.capital_ar || '', en: c.capital_en || '', fr: c.capital_fr || '' },
          description: { ar: c.description_ar || '', en: c.description_en || '', fr: c.description_fr || '' },
          continent: c.continent || 'asia',
          mainImage: c.main_image || '',
          gallery: parseJsonArray(c.gallery),
          currency: { ar: c.currency_ar || '', en: c.currency_en || '', fr: c.currency_fr || '' },
          language: { ar: c.language_ar || '', en: c.language_en || '', fr: c.language_fr || '' },
          bestTimeToVisit: { ar: c.best_time_ar || '', en: c.best_time_en || '', fr: c.best_time_fr || '' },
          rating: c.rating || 4.5,
          totalReviews: c.total_reviews || 0,
          totalTours: c.total_tours || 0,
          highlights: { 
            ar: parseJsonArray(c.highlights_ar), 
            en: parseJsonArray(c.highlights_en), 
            fr: parseJsonArray(c.highlights_fr)
          },
          culture: { 
            ar: parseJsonArray(c.culture_ar), 
            en: parseJsonArray(c.culture_en), 
            fr: parseJsonArray(c.culture_fr)
          },
          cuisine: { 
            ar: parseJsonArray(c.cuisine_ar), 
            en: parseJsonArray(c.cuisine_en), 
            fr: parseJsonArray(c.cuisine_fr)
          },
          transportation: { 
            ar: parseJsonArray(c.transportation_ar), 
            en: parseJsonArray(c.transportation_en), 
            fr: parseJsonArray(c.transportation_fr)
          },
          safety: { 
            ar: parseJsonArray(c.safety_ar), 
            en: parseJsonArray(c.safety_en), 
            fr: parseJsonArray(c.safety_fr)
          },
          cities: [],
          isActive: c.is_active || true,
          createdAt: c.created_at || new Date().toISOString(),
          updatedAt: c.updated_at || new Date().toISOString()
        }));
        setCountries(transformedCountries);
        } else {
          setCountries([]);
        }
      }

      // Load offices from API
      const officesResponse = await fetch('/api/travel-offices?active=false');
      const officesContentType = officesResponse.headers.get('content-type');
      
      if (!officesResponse.ok || !officesContentType || !officesContentType.includes('application/json')) {
        setOffices([]);
      } else {
        const officesData = await officesResponse.json();
        if (officesData.success && Array.isArray(officesData.data)) {
        // Transform API response to match TravelOffice format
        const transformedOffices = officesData.data.map((o: any) => ({
          id: o.id,
          countryId: o.country_id || '',
          name: { ar: o.name_ar || '', en: o.name_en || '', fr: o.name_fr || '' },
          address: { ar: o.address_ar || '', en: o.address_en || '', fr: o.address_fr || '' },
          phone: o.phone || '',
          email: o.email || '',
          website: o.website || '',
          manager: { ar: o.manager_ar || '', en: o.manager_en || '', fr: o.manager_fr || '' },
          services: { 
            ar: parseJsonArray(o.services_ar), 
            en: parseJsonArray(o.services_en), 
            fr: parseJsonArray(o.services_fr)
          },
          workingHours: { ar: o.working_hours_ar || '', en: o.working_hours_en || '', fr: o.working_hours_fr || '' },
          rating: o.rating || 4.5,
          reviews: o.reviews || 0,
          isActive: o.is_active || true,
          createdAt: o.created_at || new Date().toISOString(),
          updatedAt: o.updated_at || new Date().toISOString()
        }));
        setOffices(transformedOffices);
        } else {
          setOffices([]);
        }
      }

      // Load statistics from API (optional, don't fail if it doesn't work)
      try {
        const statsResponse = await fetch('/api/countries/statistics');
        const statsContentType = statsResponse.headers.get('content-type');
        
        if (statsResponse.ok && statsContentType && statsContentType.includes('application/json')) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }
      } catch (err) {
        // Statistics are optional, continue without them
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const loadNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: getLocalizedText('تحديث جديد للنظام', 'System Update', 'Mise à Jour Système'),
        message: getLocalizedText('تم إضافة نظام إدارة المكاتب السياحية الجديد', 'New travel office management system added', 'Nouveau système de gestion des bureaux de voyage ajouté'),
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: getLocalizedText('مكتب جديد', 'New Office', 'Nouveau Bureau'),
        message: getLocalizedText('تم إضافة مكتب سياحي جديد في الرياض', 'New travel office added in Riyadh', 'Nouveau bureau de voyage ajouté à Riyad'),
        type: 'info',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      }
    ];
    setNotifications(mockNotifications);
  };

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    switch (language) {
      case 'ar': return ar;
      case 'en': return en;
      case 'fr': return fr;
      default: return ar;
    }
  };

  const handleSyncData = () => {
    if (syncStaticWithDynamic()) {
      loadData();
      alert(getLocalizedText('تم مزامنة البيانات بنجاح!', 'Data synced successfully!', 'Données synchronisées avec succès!'));
    }
  };

  const handleAddCountry = async () => {
    if (!newCountry.name?.ar || !newCountry.description?.ar) {
      alert(getLocalizedText('يرجى ملء الحقول المطلوبة', 'Please fill required fields', 'Veuillez remplir les champs requis'));
      return;
    }

    try {
      const payload = {
        name_ar: newCountry.name.ar,
        name_en: newCountry.name.en || newCountry.name.ar,
        name_fr: newCountry.name.fr || newCountry.name.ar,
        capital_ar: newCountry.capital?.ar || '',
        capital_en: newCountry.capital?.en || newCountry.capital?.ar || '',
        capital_fr: newCountry.capital?.fr || newCountry.capital?.ar || '',
        description_ar: newCountry.description?.ar || '',
        description_en: newCountry.description?.en || newCountry.description?.ar || '',
        description_fr: newCountry.description?.fr || newCountry.description?.ar || '',
        continent: newCountry.continent || 'asia',
        main_image: newCountry.mainImage || '',
        gallery: newCountry.gallery || [],
        currency_ar: newCountry.currency?.ar || '',
        currency_en: newCountry.currency?.en || newCountry.currency?.ar || '',
        currency_fr: newCountry.currency?.fr || newCountry.currency?.ar || '',
        language_ar: newCountry.language?.ar || '',
        language_en: newCountry.language?.en || newCountry.language?.ar || '',
        language_fr: newCountry.language?.fr || newCountry.language?.ar || '',
        best_time_ar: newCountry.bestTimeToVisit?.ar || '',
        best_time_en: newCountry.bestTimeToVisit?.en || newCountry.bestTimeToVisit?.ar || '',
        best_time_fr: newCountry.bestTimeToVisit?.fr || newCountry.bestTimeToVisit?.ar || '',
        highlights_ar: newCountry.highlights?.ar || [],
        highlights_en: newCountry.highlights?.en || [],
        highlights_fr: newCountry.highlights?.fr || [],
        culture_ar: newCountry.culture?.ar || [],
        culture_en: newCountry.culture?.en || [],
        culture_fr: newCountry.culture?.fr || [],
        cuisine_ar: newCountry.cuisine?.ar || [],
        cuisine_en: newCountry.cuisine?.en || [],
        cuisine_fr: newCountry.cuisine?.fr || [],
        transportation_ar: newCountry.transportation?.ar || [],
        transportation_en: newCountry.transportation?.en || [],
        transportation_fr: newCountry.transportation?.fr || [],
        safety_ar: newCountry.safety?.ar || [],
        safety_en: newCountry.safety?.en || [],
        safety_fr: newCountry.safety?.fr || [],
        rating: newCountry.rating || 4.5,
        total_reviews: newCountry.totalReviews || 0,
        total_tours: newCountry.totalTours || 0,
        is_active: newCountry.isActive !== false
      };

      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        setNewCountry({
          name: { ar: '', en: '', fr: '' },
          capital: { ar: '', en: '', fr: '' },
          description: { ar: '', en: '', fr: '' },
          continent: 'asia',
          mainImage: '',
          gallery: [],
          currency: { ar: '', en: '', fr: '' },
          language: { ar: '', en: '', fr: '' },
          bestTimeToVisit: { ar: '', en: '', fr: '' },
          rating: 4.5,
          totalReviews: 0,
          totalTours: 0,
          highlights: { ar: [], en: [], fr: [] },
          culture: { ar: [], en: [], fr: [] },
          cuisine: { ar: [], en: [], fr: [] },
          transportation: { ar: [], en: [], fr: [] },
          safety: { ar: [], en: [], fr: [] },
          cities: [],
          isActive: true
        });
        setIsAddingCountry(false);
        alert(getLocalizedText('تم إضافة الدولة بنجاح!', 'Country added successfully!', 'Pays ajouté avec succès!'));
      } else {
        // Silent error handling
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const handleUpdateCountry = async () => {
    if (!editingCountry) return;

    try {
      const payload = {
        name_ar: editingCountry.name.ar,
        name_en: editingCountry.name.en || editingCountry.name.ar,
        name_fr: editingCountry.name.fr || editingCountry.name.ar,
        capital_ar: editingCountry.capital?.ar || '',
        capital_en: editingCountry.capital?.en || editingCountry.capital?.ar || '',
        capital_fr: editingCountry.capital?.fr || editingCountry.capital?.ar || '',
        description_ar: editingCountry.description?.ar || '',
        description_en: editingCountry.description?.en || editingCountry.description?.ar || '',
        description_fr: editingCountry.description?.fr || editingCountry.description?.ar || '',
        continent: editingCountry.continent || 'asia',
        main_image: editingCountry.mainImage || '',
        gallery: editingCountry.gallery || [],
        currency_ar: editingCountry.currency?.ar || '',
        currency_en: editingCountry.currency?.en || editingCountry.currency?.ar || '',
        currency_fr: editingCountry.currency?.fr || editingCountry.currency?.ar || '',
        language_ar: editingCountry.language?.ar || '',
        language_en: editingCountry.language?.en || editingCountry.language?.ar || '',
        language_fr: editingCountry.language?.fr || editingCountry.language?.ar || '',
        best_time_ar: editingCountry.bestTimeToVisit?.ar || '',
        best_time_en: editingCountry.bestTimeToVisit?.en || editingCountry.bestTimeToVisit?.ar || '',
        best_time_fr: editingCountry.bestTimeToVisit?.fr || editingCountry.bestTimeToVisit?.ar || '',
        highlights_ar: editingCountry.highlights?.ar || [],
        highlights_en: editingCountry.highlights?.en || [],
        highlights_fr: editingCountry.highlights?.fr || [],
        culture_ar: editingCountry.culture?.ar || [],
        culture_en: editingCountry.culture?.en || [],
        culture_fr: editingCountry.culture?.fr || [],
        cuisine_ar: editingCountry.cuisine?.ar || [],
        cuisine_en: editingCountry.cuisine?.en || [],
        cuisine_fr: editingCountry.cuisine?.fr || [],
        transportation_ar: editingCountry.transportation?.ar || [],
        transportation_en: editingCountry.transportation?.en || [],
        transportation_fr: editingCountry.transportation?.fr || [],
        safety_ar: editingCountry.safety?.ar || [],
        safety_en: editingCountry.safety?.en || [],
        safety_fr: editingCountry.safety?.fr || [],
        rating: editingCountry.rating || 4.5,
        total_reviews: editingCountry.totalReviews || 0,
        total_tours: editingCountry.totalTours || 0,
        is_active: editingCountry.isActive !== false
      };

      const response = await fetch(`/api/countries/${editingCountry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        setEditingCountry(null);
        alert(getLocalizedText('تم تحديث الدولة بنجاح!', 'Country updated successfully!', 'Pays mis à jour avec succès!'));
      } else {
        // Silent error handling
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const handleDeleteCountry = async (id: string) => {
    if (confirm(getLocalizedText('هل أنت متأكد من حذف هذه الدولة؟ سيتم حذف جميع المكاتب المرتبطة بها.', 'Are you sure you want to delete this country? All related offices will be deleted.', 'Êtes-vous s��r de vouloir supprimer ce pays? Tous les bureaux associés seront supprimés.'))) {
      try {
        const response = await fetch(`/api/countries/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        // Check content-type before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return;
        }

        const data = await response.json();
        if (data.success) {
          await loadData();
          alert(getLocalizedText('تم حذف الدولة بنجاح!', 'Country deleted successfully!', 'Pays supprimé avec succès!'));
        }
      } catch (error: any) {
        // Silent error handling
      }
    }
  };

  const handleAddOffice = async () => {
    if (!newOffice.name?.ar || !newOffice.countryId || !newOffice.address?.ar) {
      alert(getLocalizedText('يرجى ملء الحقول المطلوبة', 'Please fill required fields', 'Veuillez remplir les champs requis'));
      return;
    }

    try {
      const payload = {
        country_id: newOffice.countryId,
        name_ar: newOffice.name.ar,
        name_en: newOffice.name.en || newOffice.name.ar,
        name_fr: newOffice.name.fr || newOffice.name.ar,
        address_ar: newOffice.address.ar,
        address_en: newOffice.address.en || newOffice.address.ar,
        address_fr: newOffice.address.fr || newOffice.address.ar,
        phone: newOffice.phone || '',
        email: newOffice.email || '',
        website: newOffice.website || '',
        manager_ar: newOffice.manager?.ar || '',
        manager_en: newOffice.manager?.en || newOffice.manager?.ar || '',
        manager_fr: newOffice.manager?.fr || newOffice.manager?.ar || '',
        services_ar: newOffice.services?.ar || [],
        services_en: newOffice.services?.en || [],
        services_fr: newOffice.services?.fr || [],
        working_hours_ar: newOffice.workingHours?.ar || '',
        working_hours_en: newOffice.workingHours?.en || newOffice.workingHours?.ar || '',
        working_hours_fr: newOffice.workingHours?.fr || newOffice.workingHours?.ar || '',
        rating: newOffice.rating || 4.5,
        reviews: newOffice.reviews || 0,
        is_active: newOffice.isActive !== false
      };

      const response = await fetch('/api/travel-offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        setNewOffice({
          countryId: '',
          name: { ar: '', en: '', fr: '' },
          address: { ar: '', en: '', fr: '' },
          phone: '',
          email: '',
          website: '',
          manager: { ar: '', en: '', fr: '' },
          services: { ar: [], en: [], fr: [] },
          workingHours: { ar: '', en: '', fr: '' },
          rating: 4.5,
          reviews: 0,
          isActive: true
        });
        setIsAddingOffice(false);
        alert(getLocalizedText('تم إضافة المكتب بنجاح!', 'Office added successfully!', 'Bureau ajouté avec succès!'));
      } else {
        // Silent error handling
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const handleUpdateOffice = async () => {
    if (!editingOffice) return;

    try {
      const payload = {
        country_id: editingOffice.countryId,
        name_ar: editingOffice.name.ar,
        name_en: editingOffice.name.en || editingOffice.name.ar,
        name_fr: editingOffice.name.fr || editingOffice.name.ar,
        address_ar: editingOffice.address.ar,
        address_en: editingOffice.address.en || editingOffice.address.ar,
        address_fr: editingOffice.address.fr || editingOffice.address.ar,
        phone: editingOffice.phone || '',
        email: editingOffice.email || '',
        website: editingOffice.website || '',
        manager_ar: editingOffice.manager?.ar || '',
        manager_en: editingOffice.manager?.en || editingOffice.manager?.ar || '',
        manager_fr: editingOffice.manager?.fr || editingOffice.manager?.ar || '',
        services_ar: editingOffice.services?.ar || [],
        services_en: editingOffice.services?.en || [],
        services_fr: editingOffice.services?.fr || [],
        working_hours_ar: editingOffice.workingHours?.ar || '',
        working_hours_en: editingOffice.workingHours?.en || editingOffice.workingHours?.ar || '',
        working_hours_fr: editingOffice.workingHours?.fr || editingOffice.workingHours?.ar || '',
        rating: editingOffice.rating || 4.5,
        reviews: editingOffice.reviews || 0,
        is_active: editingOffice.isActive !== false
      };

      const response = await fetch(`/api/travel-offices/${editingOffice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        setEditingOffice(null);
        alert(getLocalizedText('تم تحديث المكتب بنجاح!', 'Office updated successfully!', 'Bureau mis à jour avec succès!'));
      } else {
        // Silent error handling
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const handleDeleteOffice = async (id: string) => {
    if (!confirm(getLocalizedText('هل أنت متأكد من حذف هذا المكتب؟', 'Are you sure you want to delete this office?', 'Êtes-vous sûr de vouloir supprimer ce bureau?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/travel-offices/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      // Check content-type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        alert(getLocalizedText('تم حذف المكتب بنجاح!', 'Office deleted successfully!', 'Bureau supprimé avec succès!'));
      } else {
      }
    } catch (error: any) {
      // Silent error handling
    }
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.name.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContinent = filterContinent === 'all' || country.continent === filterContinent;
    return matchesSearch && matchesContinent;
  });

  const filteredOffices = offices.filter(office => {
    const matchesCountry = selectedCountry === '' || office.countryId === selectedCountry;
    const matchesSearch = office.name.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      office.name.en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const continents = [
    { value: 'all', label: getLocalizedText('جميع القارات', 'All Continents', 'Tous les Continents') },
    { value: 'africa', label: getLocalizedText('أفريقيا', 'Africa', 'Afrique') },
    { value: 'asia', label: getLocalizedText('آسيا', 'Asia', 'Asie') },
    { value: 'europe', label: getLocalizedText('أوروبا', 'Europe', 'Europe') },
    { value: 'america', label: getLocalizedText('أمريكا', 'America', 'Amérique') }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: getLocalizedText('لوحة التحكم', 'Dashboard', 'Tableau de Bord'), icon: BarChart3, color: 'text-blue-500' },
    { id: 'countries', label: getLocalizedText('إدارة الدول', 'Countries Management', 'Gestion des Pays'), icon: Globe, color: 'text-green-500' },
    { id: 'provinces', label: getLocalizedText('المحافظات', 'Provinces Management', 'Gestion des Provinces'), icon: MapPin, color: 'text-purple-500' },
    { id: 'cities-admin', label: getLocalizedText('المدن السياحية', 'Cities Management', 'Gestion des Villes'), icon: MapPin, color: 'text-pink-500' },
    { id: 'destinations', label: getLocalizedText('الوجهات السياحية', 'Destinations Management', 'Gestion des Destinations'), icon: MapPin, color: 'text-indigo-500' },
    { id: 'events', label: getLocalizedText('الفعاليات والمواسم', 'Events & Seasons', 'Événements et Saisons'), icon: Calendar, color: 'text-teal-500' },
    { id: 'offices', label: getLocalizedText('المكاتب السياحية', 'Travel Offices', 'Bureaux de Voyage'), icon: Building2, color: 'text-orange-500' },
    { id: 'travel-offers', label: getLocalizedText('العروض السياحية', 'Travel Offers', 'Offres de Voyage'), icon: Tag, color: 'text-red-500' },
    { id: 'supervisors', label: getLocalizedText('إدارة المشرف��ن', 'Supervisor Management', 'Gestion des Superviseurs'), icon: UserCheck, color: 'text-blue-600' },
    { id: 'payments', label: getLocalizedText('المدفوعات', 'Payments', 'Paiements'), icon: DollarSign, color: 'text-green-600' },
    { id: 'analytics', label: getLocalizedText('التحليلات', 'Analytics', 'Analytiques'), icon: TrendingUp, color: 'text-purple-500' },
    { id: 'users', label: getLocalizedText('المستخدمين', 'Users', 'Utilisateurs'), icon: Users, color: 'text-indigo-500' },
    { id: 'settings', label: getLocalizedText('الإعدادات', 'Settings', 'Paramètres'), icon: Settings, color: 'text-gray-500' }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-white shadow-xl border-r border-gray-200 flex flex-col`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="text-white font-bold text-lg h-6 w-6" />
            </div>
            {isSidebarOpen && (
              <div className="animate-fade-in">
                <h1 className="text-xl font-bold text-gray-900">CIAR</h1>
                <p className="text-gray-600 text-sm">{getLocalizedText('لو��ة التحكم', 'Admin Dashboard', 'Tableau de Bord')}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                  ? 'bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : item.color} group-hover:scale-110 transition-transform`} />
                {isSidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={async () => {
              await authService.logout();
              navigate('/admin');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-300 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="font-medium">{getLocalizedText('تسجيل الخروج', 'Logout', 'Déconnexion')}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {getLocalizedText('إدارة شاملة للدول والمكاتب السياحية', 'Comprehensive management for countries and travel offices', 'Gestion complète des pays et bureaux de voyage')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Button */}
              <Button
                onClick={handleSyncData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {getLocalizedText('مزامنة', 'Sync', 'Sync')}
              </Button>

              {/* Time Display */}
              <div className="hidden md:block text-right text-sm text-gray-600">
                <p className="font-medium">{currentTime.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                <p className="text-gray-500">{currentTime.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}</p>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-lg relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-scale-in">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{getLocalizedText('الإشعارات', 'Notifications', 'Notifications')}</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                              }`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                              <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-2">{notification.timestamp.toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{getLocalizedText('مرحباً، الأدمن', 'Welcome, Admin', 'Bienvenue, Admin')}</p>
                  <p className="text-xs text-gray-600">{getLocalizedText('مدي�� النظام', 'System Administrator', 'Administrateur Système')}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={() => setIsAddingCountry(true)}
                  className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {getLocalizedText('إضافة دولة جديدة', 'Add New Country', 'Ajouter un Nouveau Pays')}
                </Button>
                <Button
                  onClick={() => setIsAddingOffice(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {getLocalizedText('إضافة مكتب جديد', 'Add New Office', 'Ajouter un Nouveau Bureau')}
                </Button>
                <Button variant="outline" className="shadow-sm">
                  <Download className="h-4 w-4 mr-2" />
                  {getLocalizedText('تصدير البيانات', 'Export Data', 'Exporter les Données')}
                </Button>
                <Button variant="outline" className="shadow-sm" onClick={handleSyncData}>
                  <Database className="h-4 w-4 mr-2" />
                  {getLocalizedText('مزامنة البيانات', 'Sync Data', 'Synchroniser les Données')}
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">{getLocalizedText('إجمالي الدول', 'Total Countries', 'Total des Pays')}</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalCountries}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="text-green-300 text-sm">{stats.activeCountries} {getLocalizedText('نشط', 'active', 'actifs')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">{getLocalizedText('المكاتب السياحية', 'Travel Offices', 'Bureaux de Voyage')}</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalOffices}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Building2 className="h-4 w-4 text-green-200" />
                        <span className="text-green-200 text-sm">{stats.activeOffices} {getLocalizedText('نشط', 'active', 'actifs')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">{getLocalizedText('إجمالي الجولات', 'Total Tours', 'Total des Circuits')}</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalTours}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-4 w-4 text-purple-200" />
                        <span className="text-purple-200 text-sm">{getLocalizedText('متاح', 'available', 'disponibles')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">{getLocalizedText('متوسط التقييم', 'Average Rating', 'Note Moyenne')}</p>
                      <p className="text-3xl font-bold mt-2">{stats.avgRating}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-orange-200 fill-current" />
                        <span className="text-orange-200 text-sm">{stats.totalReviews} {getLocalizedText('مراجعة', 'reviews', 'avis')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-tarhal-orange" />
                      {getLocalizedText('أحدث الدول', 'Latest Countries', 'Derniers Pays')}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {countries.slice(0, 4).map((country) => (
                        <div key={country.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <img src={country.mainImage} alt={country.name.ar} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{country.name.ar}</p>
                            <p className="text-sm text-gray-600">{getLocalizedText('آخر تحديث:', 'Last updated:', 'Dernière mise à jour:')} {new Date(country.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{country.rating}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${country.isActive ? 'bg-green-400' : 'bg-gray-400'} animate-pulse`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-tarhal-orange" />
                      {getLocalizedText('أحدث المكاتب', 'Latest Offices', 'Derniers Bureaux')}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {offices.slice(0, 4).map((office) => {
                        const country = countries.find(c => c.id === office.countryId);
                        return (
                          <div key={office.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{office.name.ar}</p>
                              <p className="text-sm text-gray-600">{country?.name.ar}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{office.rating}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${office.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'countries' && (
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder={getLocalizedText('البحث في الدول...', 'Search countries...', 'Rechercher des pays...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200 focus:border-tarhal-orange"
                      />
                    </div>
                    <select
                      value={filterContinent}
                      onChange={(e) => setFilterContinent(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tarhal-orange bg-white"
                    >
                      {continents.map(continent => (
                        <option key={continent.value} value={continent.value}>
                          {continent.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={() => setIsAddingCountry(true)}
                    className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {getLocalizedText('إضافة دولة جديدة', 'Add New Country', 'Ajouter un Nouveau Pays')}
                  </Button>
                </div>
              </div>

              {/* Countries Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCountries.map((country) => (
                  <div key={country.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="relative h-48">
                      <img src={country.mainImage} alt={country.name.ar} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-3 py-1 text-white text-xs rounded-full font-medium shadow-lg ${country.isActive ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                          {country.isActive ? getLocalizedText('نشط', 'Active', 'Actif') : getLocalizedText('غير نشط', 'Inactive', 'Inactif')}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium text-sm">{country.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{country.name.ar}</h3>
                          <p className="text-sm text-gray-600">{country.name.en}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{country.description.ar}</p>
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-lg font-semibold text-tarhal-orange">{country.totalTours}</p>
                          <p className="text-xs text-gray-600">{getLocalizedText('جولة', 'Tours', 'Circuits')}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-lg font-semibold text-tarhal-blue">{country.totalReviews}</p>
                          <p className="text-xs text-gray-600">{getLocalizedText('مراجعة', 'Reviews', 'Avis')}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-lg font-semibold text-green-600">{offices.filter(o => o.countryId === country.id).length}</p>
                          <p className="text-xs text-gray-600">{getLocalizedText('مكتب', 'Offices', 'Bureaux')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingCountry(country)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteCountry(country.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {getLocalizedText('حذف', 'Delete', 'Supprimer')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Site Settings Manager - Full Width Section */}
              <div className="mt-8">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                      <Image className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{getLocalizedText('إعدادات الموقع', 'Site Settings', 'Paramètres du Site')}</h2>
                      <p className="text-purple-100 mt-1">{getLocalizedText('تخصيص ألوان الموقع وصور الخلفية والفيديو وترتيب المكونات', 'Customize site colors, background images, videos, and component order', 'Personnaliser les couleurs du site, les images de fond, les vidéos et l\'ordre des composants')}</p>
                    </div>
                  </div>
                </div>
                <SiteSettingsManager onUpdate={loadData} />
              </div>
            </div>
          )}

          {activeTab === 'provinces' && (
            <div className="space-y-6">
              <AdminProvinceManagement />
            </div>
          )}

          {activeTab === 'cities-admin' && (
            <div className="space-y-6">
              <AdminCityManagement />
            </div>
          )}

          {activeTab === 'destinations' && (
            <div className="space-y-6">
              <AdminDestinationManagement />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <AdminEventManagement />
            </div>
          )}

          {activeTab === 'offices' && (
            <div className="space-y-6">
              <AdminOfficeManagement />
            </div>
          )}

          {activeTab === 'offices-old' && (
            <div className="space-y-6">
              {/* Header Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder={getLocalizedText('البحث في المكاتب...', 'Search offices...', 'Rechercher des bureaux...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200 focus:border-tarhal-orange"
                      />
                    </div>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-tarhal-orange bg-white"
                    >
                      <option value="">{getLocalizedText('جميع الدول', 'All Countries', 'Tous les Pays')}</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.name.ar}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={() => setIsAddingOffice(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {getLocalizedText('إضافة مكتب جديد', 'Add New Office', 'Ajouter un Nouveau Bureau')}
                  </Button>
                </div>
              </div>

              {/* Offices List */}
              <div className="grid grid-cols-1 gap-6">
                {filteredOffices.map((office) => {
                  const country = countries.find(c => c.id === office.countryId);
                  return (
                    <div key={office.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{office.name.ar}</h3>
                            <p className="text-sm text-gray-600">{office.name.en}</p>
                            <p className="text-sm text-tarhal-orange font-medium">{country?.name.ar}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${office.isActive ? 'bg-green-500' : 'bg-gray-500'
                            }`}>
                            {office.isActive ? getLocalizedText('نشط', 'Active', 'Actif') : getLocalizedText('غير نشط', 'Inactive', 'Inactif')}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{office.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getLocalizedText('العنوان', 'Address', 'Adresse')}</p>
                            <p className="text-sm text-gray-600">{office.address.ar}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getLocalizedText('الهاتف', 'Phone', 'Téléphone')}</p>
                            <p className="text-sm text-gray-600">{office.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{getLocalizedText('البريد الإلكتروني', 'Email', 'Email')}</p>
                            <p className="text-sm text-gray-600">{office.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{office.workingHours.ar}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingOffice(office)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteOffice(office.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {getLocalizedText('حذف', 'Delete', 'Supprimer')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'travel-offers' && (
            <div className="space-y-6">
              <TravelOffersManager />
            </div>
          )}

          {activeTab === 'supervisors' && (
            <div className="space-y-6">
              <AdminSupervisorManagement />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <AdminPayments />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{getLocalizedText('لوحة التحليلات', 'Analytics Dashboard', 'Tableau d\'Analyse')}</h2>
                      <p className="text-purple-200 mt-1">{getLocalizedText('إحصائيات شاملة وتقارير تفصيلية', 'Comprehensive statistics and detailed reports', 'Statistiques complètes et rapports détaillés')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Download className="h-4 w-4 mr-2" />
                      {getLocalizedText('تصدير', 'Export', 'Exporter')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{getLocalizedText('إجمالي الزيارات', 'Total Visits', 'Total des Visites')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">24,567</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">+12.5%</span>
                        <span className="text-gray-500 text-sm">{getLocalizedText('هذا الشهر', 'this month', 'ce mois')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{getLocalizedText('الحجوزات', 'Bookings', 'Réservations')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">+8.2%</span>
                        <span className="text-gray-500 text-sm">{getLocalizedText('هذا الشهر', 'this month', 'ce mois')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{getLocalizedText('الإيرادات', 'Revenue', 'Revenus')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$45.2K</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 text-sm font-medium">+15.3%</span>
                        <span className="text-gray-500 text-sm">{getLocalizedText('هذا الشهر', 'this month', 'ce mois')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">{getLocalizedText('متوسط التقييم', 'Avg Rating', 'Note Moyenne')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">4.8</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-500 text-sm">{stats.totalReviews} {getLocalizedText('مراجعة', 'reviews', 'avis')}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitors Chart */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إحصائيات الزوار', 'Visitor Statistics', 'Statistiques des Visiteurs')}</h3>
                    <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg">
                      <option>{getLocalizedText('آخر 7 أيام', 'Last 7 Days', 'Derniers 7 Jours')}</option>
                      <option>{getLocalizedText('آخر 30 يوم', 'Last 30 Days', 'Derniers 30 Jours')}</option>
                      <option>{getLocalizedText('آخر 3 أشهر', 'Last 3 Months', 'Derniers 3 Mois')}</option>
                    </select>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[65, 78, 82, 90, 85, 92, 88].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg hover:from-purple-600 hover:to-purple-500 transition-all cursor-pointer"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-600">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">{getLocalizedText('أكثر الدول زيارة', 'Top Visited Countries', 'Pays les Plus Visités')}</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'السعودية', en: 'Saudi Arabia', visits: 3456, color: 'bg-green-500' },
                      { name: 'الإمارات', en: 'UAE', visits: 2890, color: 'bg-blue-500' },
                      { name: 'مصر', en: 'Egypt', visits: 2567, color: 'bg-orange-500' },
                      { name: 'المغرب', en: 'Morocco', visits: 1998, color: 'bg-red-500' },
                      { name: 'السودان', en: 'Sudan', visits: 1654, color: 'bg-purple-500' }
                    ].map((country, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 w-8">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{language === 'ar' ? country.name : country.en}</span>
                            <span className="text-sm text-gray-600">{country.visits.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`${country.color} h-2 rounded-full`} style={{ width: `${(country.visits / 3456) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{getLocalizedText('النشاط الأخير', 'Recent Activity', 'Activité Récente')}</h3>
                <div className="space-y-4">
                  {[
                    { icon: UserCheck, text: { ar: 'مستخدم جديد انضم', en: 'New user registered', fr: 'Nouvel utilisateur inscrit' }, time: '5 min ago', color: 'text-green-600', bg: 'bg-green-100' },
                    { icon: Calendar, text: { ar: 'حجز جديد لمصر', en: 'New booking for Egypt', fr: 'Nouvelle réservation pour l\'Égypte' }, time: '12 min ago', color: 'text-blue-600', bg: 'bg-blue-100' },
                    { icon: Star, text: { ar: 'تقييم 5 نجوم للسعودية', en: '5-star review for Saudi Arabia', fr: 'Avis 5 étoiles pour l\'Arabie Saoudite' }, time: '23 min ago', color: 'text-yellow-600', bg: 'bg-yellow-100' },
                    { icon: DollarSign, text: { ar: 'دفعة بقيمة $450', en: 'Payment of $450', fr: 'Paiement de  $450' }, time: '1 hour ago', color: 'text-emerald-600', bg: 'bg-emerald-100' }
                  ].map((activity, i) => {
                    const Icon = activity.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 ${activity.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{language === 'ar' ? activity.text.ar : language === 'fr' ? activity.text.fr : activity.text.en}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{getLocalizedText('إدارة المستخدمين', 'User Management', 'Gestion des Utilisateurs')}</h2>
                      <p className="text-blue-200 mt-1">{getLocalizedText('إدارة شاملة للمستخدمين والصلاحيات', 'Comprehensive user and permissions management', 'Gestion complète des utilisateurs et permissions')}</p>
                    </div>
                  </div>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    <Plus className="h-4 w-4 mr-2" />
                    {getLocalizedText('مستخدم جديد', 'New User', 'Nouvel Utilisateur')}
                  </Button>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-medium">{getLocalizedText('إجمالي المستخدمين', 'Total Users', 'Total des Utilisateurs')}</p>
                      <p className="text-2xl font-bold text-gray-900">1,234</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-medium">{getLocalizedText('نشط', 'Active', 'Actifs')}</p>
                      <p className="text-2xl font-bold text-gray-900">1,089</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-medium">{getLocalizedText('مدراء', 'Admins', 'Administrateurs')}</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs font-medium">{getLocalizedText('متصل الآن', 'Online Now', 'En Ligne Maintenant')}</p>
                      <p className="text-2xl font-bold text-gray-900">89</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={getLocalizedText('البحث عن مستخدم...', 'Search users...', 'Rechercher des utilisateurs...')}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>{getLocalizedText('جميع الأدوار', 'All Roles', 'Tous les Rôles')}</option>
                      <option>{getLocalizedText('مدير', 'Admin', 'Administrateur')}</option>
                      <option>{getLocalizedText('مشرف', 'Supervisor', 'Superviseur')}</option>
                      <option>{getLocalizedText('مستخدم', 'User', 'Utilisateur')}</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>{getLocalizedText('جميع الحالات', 'All Status', 'Tous les Statuts')}</option>
                      <option>{getLocalizedText('نشط', 'Active', 'Actif')}</option>
                      <option>{getLocalizedText('معطل', 'Inactive', 'Inactif')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('المستخدم', 'User', 'Utilisateur')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('البريد الإلكتروني', 'Email', 'Email')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('الدور', 'Role', 'Rôle')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('الحالة', 'Status', 'Statut')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('آخر نشاط', 'Last Active', 'Dernière Activité')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {getLocalizedText('الإجراءات', 'Actions', 'Actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { name: 'أحمد محمد', email: 'ahmed@example.com', role: 'Admin', status: 'active', lastActive: '2 min ago', avatar: 'A' },
                        { name: 'فاطمة علي', email: 'fatima@example.com', role: 'Supervisor', status: 'active', lastActive: '5 min ago', avatar: 'F' },
                        { name: 'محمد خالد', email: 'mohamed@example.com', role: 'User', status: 'active', lastActive: '1 hour ago', avatar: 'M' },
                        { name: 'سارة حسن', email: 'sara@example.com', role: 'User', status: 'inactive', lastActive: '2 days ago', avatar: 'S' },
                        { name: 'عمر عبدالله', email: 'omar@example.com', role: 'Supervisor', status: 'active', lastActive: '30 min ago', avatar: 'O' }
                      ].map((user, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.avatar}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{user.email}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-700' :
                                user.role === 'Supervisor' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                              {user.status === 'active' ? getLocalizedText('نشط', 'Active', 'Actif') : getLocalizedText('معطل', 'Inactive', 'Inactif')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{user.lastActive}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {getLocalizedText('عرض', 'Showing', 'Affichage')} 1-5 {getLocalizedText('من', 'of', 'de')} 1,234
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled>
                      {getLocalizedText('السابق', 'Previous', 'Précédent')}
                    </Button>
                    <Button size="sm" variant="outline">
                      {getLocalizedText('التالي', 'Next', 'Suivant')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Settings Header */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{getLocalizedText('إعدادات النظام الشاملة', 'Comprehensive System Settings', 'Paramètres Système Complets')}</h2>
                    <p className="text-gray-200 mt-1">{getLocalizedText('إدارة كاملة لجميع إعدادات النظام', 'Complete management of all system settings', 'Gestion complète de tous les paramètres')}</p>
                  </div>
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. General Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('الإعدادات العامة', 'General Settings', 'Paramètres Généraux')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('اسم الموقع', 'Site Name', 'Nom du Site')}</label>
                      <Input defaultValue="Tarhal" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('البريد الإلكتروني', 'Contact Email', 'Email de Contact')}</label>
                      <Input type="email" defaultValue="info@tarhal.com" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('رقم الهاتف', 'Phone', 'Téléphone')}</label>
                      <Input defaultValue="+966 11 123 4567" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 2. Language & Localization */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('اللغة والترجمة', 'Language & Localization', 'Langue et Localisation')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('اللغة الافتراضية', 'Default Language', 'Langue par Défaut')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="ar">{getLocalizedText('العربية', 'Arabic', 'Arabe')}</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                        <span className="text-sm text-gray-700">{getLocalizedText('تفعيل العربية', 'Enable Arabic', 'Activer Arabe')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                        <span className="text-sm text-gray-700">{getLocalizedText('تفعيل الإنجليزية', 'Enable English', 'Activer Anglais')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                        <span className="text-sm text-gray-700">{getLocalizedText('تفعيل الفرنسية', 'Enable French', 'Activer Français')}</span>
                      </label>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 3. Email Configuration */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات البريد', 'Email Settings', 'Paramètres Email')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('خادم SMTP', 'SMTP Server', 'Serveur SMTP')}</label>
                      <Input defaultValue="smtp.gmail.com" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('المنفذ', 'Port', 'Port')}</label>
                      <Input type="number" defaultValue="587" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('اسم المرسل', 'Sender Name', 'Nom de l\'Expéditeur')}</label>
                      <Input defaultValue="Tarhal Team" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 4. Notification Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات الإشعارات', 'Notification Settings', 'Paramètres de Notification')}</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('إشعارات البريد', 'Email Notifications', 'Notifications Email')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('إشعارات الموقع', 'Push Notifications', 'Notifications Push')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('إشعارات SMS', 'SMS Notifications', 'Notifications SMS')}</span>
                      <input type="checkbox" className="w-4 h-4 text-orange-600 rounded" />
                    </label>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('تردد الإشعارات', 'Frequency', 'Fréquence')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        <option>{getLocalizedText('فوري', 'Instant', 'Instantané')}</option>
                        <option>{getLocalizedText('يومي', 'Daily', 'Quotidien')}</option>
                        <option>{getLocalizedText('أسبوعي', 'Weekly', 'Hebdomadaire')}</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 5. Security Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات الأمان', 'Security Settings', 'Paramètres de Sécurité')}</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('المصادقة الثنائية', '2FA', 'Authentification 2FA')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded" />
                    </label>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('مدة الجلسة (دقيقة)', 'Session Timeout (min)', 'Délai de Session (min)')}</label>
                      <Input type="number" defaultValue="30" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('محاولات تسجيل الدخول', 'Login Attempts', 'Tentatives de Connexion')}</label>
                      <Input type="number" defaultValue="5" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 6. Backup & Restore */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Database className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('النسخ الاحتياطي', 'Backup & Restore', 'Sauvegarde et Restauration')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('جدولة النسخ', 'Backup Schedule', 'Planning de Sauvegarde')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option>{getLocalizedText('يومي', 'Daily', 'Quotidien')}</option>
                        <option>{getLocalizedText('أسبوعي', 'Weekly', 'Hebdomadaire')}</option>
                        <option>{getLocalizedText('شهري', 'Monthly', 'Mensuel')}</option>
                      </select>
                    </div>
                    <Button variant="outline" className="w-full h-9 text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      {getLocalizedText('نسخة احتياطية الآن', 'Backup Now', 'Sauvegarder Maintenant')}
                    </Button>
                    <Button variant="outline" className="w-full h-9 text-sm">
                      <Upload className="h-4 w-4 mr-2" />
                      {getLocalizedText('استعادة', 'Restore', 'Restaurer')}
                    </Button>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 7. API Configuration */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات API', 'API Settings', 'Paramètres API')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('مفتاح API', 'API Key', 'Clé API')}</label>
                      <Input defaultValue="••••••••••••••••" type="password" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('معدل الطلبات/ساعة', 'Rate Limit/hr', 'Limite de Requêtes/h')}</label>
                      <Input type="number" defaultValue="1000" className="h-9 text-sm" />
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('تفعيل API', 'Enable API', 'Activer API')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-pink-600 rounded" />
                    </label>
                  </div>
                  <Button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 8. Theme Customization */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('تخصيص المظهر', 'Theme Customization', 'Personnalisation du Thème')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('اللون الأساسي', 'Primary Color', 'Couleur Principale')}</label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#ea580c" className="h-9 w-16" />
                        <Input defaultValue="#ea580c" className="h-9 flex-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('اللون الثانوي', 'Secondary Color', 'Couleur Secondaire')}</label>
                      <div className="flex gap-2">
                        <Input type="color" defaultValue="#0284c7" className="h-9 w-16" />
                        <Input defaultValue="#0284c7" className="h-9 flex-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('نمط الأزرار', 'Button Style', 'Style de Bouton')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option>{getLocalizedText('مستدير', 'Rounded', 'Arrondi')}</option>
                        <option>{getLocalizedText('مربع', 'Square', 'Carré')}</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 9. SEO Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات SEO', 'SEO Settings', 'Paramètres SEO')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('عنوان الصفحة', 'Meta Title', 'Titre Meta')}</label>
                      <Input defaultValue="Tarhal - Travel Worldwide" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('الوصف', 'Meta Description', 'Description Meta')}</label>
                      <Textarea defaultValue="Discover amazing destinations" rows={2} className="text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('الكلمات المفتاحية', 'Keywords', 'Mots-clés')}</label>
                      <Input defaultValue="travel, tourism, vacation" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 10. Social Media Links */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Share2 className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('روابط التواصل', 'Social Media', 'Réseaux Sociaux')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Facebook</label>
                      <Input defaultValue="https://facebook.com/tarhal" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Instagram</label>
                      <Input defaultValue="https://instagram.com/tarhal" className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Twitter</label>
                      <Input defaultValue="https://twitter.com/tarhal" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 11. Currency Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات العملة', 'Currency Settings', 'Paramètres de Devise')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('العملة الافتراضية', 'Default Currency', 'Devise par Défaut')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                        <option value="SAR">SAR - {getLocalizedText('ريال سعودي', 'Saudi Riyal', 'Riyal Saoudien')}</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('موضع الرمز', 'Symbol Position', 'Position du Symbole')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                        <option>{getLocalizedText('قبل', 'Before', 'Avant')}</option>
                        <option>{getLocalizedText('بعد', 'After', 'Après')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('المنازل العشرية', 'Decimal Places', 'Décimales')}</label>
                      <Input type="number" defaultValue="2" min="0" max="4" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 12. Timezone Configuration */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات المنطقة', 'Timezone Settings', 'Paramètres de Fuseau')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('المنطقة الزمنية', 'Timezone', 'Fuseau Horaire')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                        <option>Asia/Riyadh (GMT+3)</option>
                        <option>UTC (GMT+0)</option>
                        <option>America/New_York (GMT-5)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('صيغة الوقت', 'Time Format', 'Format de l\'Heure')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500">
                        <option>24 {getLocalizedText('ساعة', 'Hour', 'Heures')}</option>
                        <option>12 {getLocalizedText('ساعة', 'Hour', 'Heures')}</option>
                      </select>
                    </div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('التوقيت الصيفي', 'Daylight Saving', 'Heure d\'Été')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-violet-600 rounded" />
                    </label>
                  </div>
                  <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 13. Advanced System Settings */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إعدادات متقدمة', 'Advanced Settings', 'Paramètres Avancés')}</h3>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('وضع التطوير', 'Debug Mode', 'Mode Debug')}</span>
                      <input type="checkbox" className="w-4 h-4 text-slate-600 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{getLocalizedText('مراقبة الأداء', 'Performance Monitor', 'Moniteur de Performance')}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-600 rounded" />
                    </label>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('مستوى السجلات', 'Log Level', 'Niveau de Journalisation')}</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500">
                        <option>Error</option>
                        <option>Warning</option>
                        <option>Info</option>
                        <option>Debug</option>
                      </select>
                    </div>
                    <Button variant="outline" className="w-full h-9 text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      {getLocalizedText('معلومات النظام', 'System Info', 'Info Système')}
                    </Button>
                  </div>
                  <Button className="w-full mt-4 bg-slate-600 hover:bg-slate-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 14. Cache Management */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('إدارة الذاكرة', 'Cache Management', 'Gestion du Cache')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">{getLocalizedText('حجم الذاكرة', 'Cache Size', 'Taille du Cache')}</span>
                        <span className="text-xs font-semibold text-amber-600">45.2 MB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('مدة الانتهاء (ساعة)', 'Expiration (hrs)', 'Expiration (h)')}</label>
                      <Input type="number" defaultValue="24" className="h-9 text-sm" />
                    </div>
                    <Button variant="outline" className="w-full h-9 text-sm text-red-600 border-red-300 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {getLocalizedText('مسح الذاكرة', 'Clear Cache', 'Vider le Cache')}
                    </Button>
                  </div>
                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

                {/* 15. Maintenance Mode */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-rose-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('وضع الصيانة', 'Maintenance Mode', 'Mode Maintenance')}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-rose-900">{getLocalizedText('تفعيل وضع الصيانة', 'Enable Maintenance', 'Activer Maintenance')}</span>
                        <input type="checkbox" className="w-5 h-5 text-rose-600 rounded" />
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('رسالة الصيانة', 'Maintenance Message', 'Message de Maintenance')}</label>
                      <Textarea defaultValue={getLocalizedText('الموقع تحت الصيانة', 'Site under maintenance', 'Site en maintenance')} rows={2} className="text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">{getLocalizedText('وقت الانتهاء المتوقع', 'Estimated Time', 'Temps Estimé')}</label>
                      <Input type="datetime-local" className="h-9 text-sm" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white h-9 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    {getLocalizedText('حفظ', 'Save', 'Enregistrer')}
                  </Button>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Country Modal */}
      {isAddingCountry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{getLocalizedText('إضافة دولة جديدة', 'Add New Country', 'Ajouter un Nouveau Pays')}</h3>
                <button
                  onClick={() => setIsAddingCountry(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الاسم بالعربية *', 'Arabic Name *', 'Nom en Arabe *')}</label>
                  <Input
                    value={newCountry.name?.ar || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, name: { ...newCountry.name!, ar: e.target.value } })}
                    placeholder={getLocalizedText('اسم الدولة بالعربية', 'Country name in Arabic', 'Nom du pays en arabe')}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الاسم بالإنجليزية *', 'English Name *', 'Nom en Anglais *')}</label>
                  <Input
                    value={newCountry.name?.en || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, name: { ...newCountry.name!, en: e.target.value } })}
                    placeholder="Country name in English"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الاسم بالفرنسية', 'French Name', 'Nom en Français')}</label>
                  <Input
                    value={newCountry.name?.fr || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, name: { ...newCountry.name!, fr: e.target.value } })}
                    placeholder="Nom du pays en français"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('القارة', 'Continent', 'Continent')}</label>
                  <select
                    value={newCountry.continent || 'asia'}
                    onChange={(e) => setNewCountry({ ...newCountry, continent: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-tarhal-orange"
                  >
                    <option value="africa">{getLocalizedText('أفريقيا', 'Africa', 'Afrique')}</option>
                    <option value="asia">{getLocalizedText('آسيا', 'Asia', 'Asie')}</option>
                    <option value="europe">{getLocalizedText('أوروبا', 'Europe', 'Europe')}</option>
                    <option value="america">{getLocalizedText('أمريك��', 'America', 'Amérique')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('رابط الصورة الرئيسية', 'Main Image URL', 'URL de l\'Image Principale')}</label>
                  <Input
                    value={newCountry.mainImage || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, mainImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('وصف الدولة *', 'Country Description *', 'Description du Pays *')}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Textarea
                    value={newCountry.description?.ar || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, description: { ...newCountry.description!, ar: e.target.value } })}
                    placeholder={getLocalizedText('وصف مفصل باللغة العربية...', 'Detailed description in Arabic...', 'Description détaillée en arabe...')}
                    rows={3}
                    className="rounded-xl"
                  />
                  <Textarea
                    value={newCountry.description?.en || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, description: { ...newCountry.description!, en: e.target.value } })}
                    placeholder="Detailed description in English..."
                    rows={3}
                    className="rounded-xl"
                  />
                  <Textarea
                    value={newCountry.description?.fr || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, description: { ...newCountry.description!, fr: e.target.value } })}
                    placeholder="Description détaillée en français..."
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العاصمة بالعربية', 'Capital in Arabic', 'Capitale en Arabe')}</label>
                  <Input
                    value={newCountry.capital?.ar || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, capital: { ...newCountry.capital!, ar: e.target.value } })}
                    placeholder={getLocalizedText('اسم العاصمة بالعربية', 'Capital name in Arabic', 'Nom de la capitale en arabe')}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العاصمة بالإنجليزية', 'Capital in English', 'Capitale en Anglais')}</label>
                  <Input
                    value={newCountry.capital?.en || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, capital: { ...newCountry.capital!, en: e.target.value } })}
                    placeholder="Capital name in English"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العاصمة بالفرنسية', 'Capital in French', 'Capitale en Français')}</label>
                  <Input
                    value={newCountry.capital?.fr || ''}
                    onChange={(e) => setNewCountry({ ...newCountry, capital: { ...newCountry.capital!, fr: e.target.value } })}
                    placeholder="Nom de la capitale en français"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('التقييم', 'Rating', 'Évaluation')}</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newCountry.rating || 4.5}
                    onChange={(e) => setNewCountry({ ...newCountry, rating: parseFloat(e.target.value) || 4.5 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد الجولات', 'Number of Tours', 'Nombre de Circuits')}</label>
                  <Input
                    type="number"
                    value={newCountry.totalTours || 0}
                    onChange={(e) => setNewCountry({ ...newCountry, totalTours: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد المراجعات', 'Number of Reviews', 'Nombre d\'Avis')}</label>
                  <Input
                    type="number"
                    value={newCountry.totalReviews || 0}
                    onChange={(e) => setNewCountry({ ...newCountry, totalReviews: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCountry.isActive || false}
                    onChange={(e) => setNewCountry({ ...newCountry, isActive: e.target.checked })}
                    className="w-4 h-4 text-tarhal-orange bg-gray-100 border-gray-300 rounded focus:ring-tarhal-orange focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{getLocalizedText('دولة نشطة', 'Active Country', 'Pays Actif')}</span>
                </label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleAddCountry}
                className="flex-1 bg-tarhal-orange hover:bg-tarhal-orange-dark text-white rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {getLocalizedText('حفظ الدولة', 'Save Country', 'Enregistrer le Pays')}
              </Button>
              <Button
                onClick={() => setIsAddingCountry(false)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                {getLocalizedText('إلغاء', 'Cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Office Modal */}
      {isAddingOffice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{getLocalizedText('إضافة مكتب سياحي جديد', 'Add New Travel Office', 'Ajouter un Nouveau Bureau de Voyage')}</h3>
                <button
                  onClick={() => setIsAddingOffice(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الدولة *', 'Country *', 'Pays *')}</label>
                <select
                  value={newOffice.countryId || ''}
                  onChange={(e) => setNewOffice({ ...newOffice, countryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{getLocalizedText('اختر الدولة', 'Select Country', 'Sélectionner le Pays')}</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name.ar} ({country.name.en})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المكتب بالعربية *', 'Office Name in Arabic *', 'Nom du Bureau en Arabe *')}</label>
                  <Input
                    value={newOffice.name?.ar || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, name: { ...newOffice.name!, ar: e.target.value } })}
                    placeholder={getLocalizedText('اسم المكتب بالعربية', 'Office name in Arabic', 'Nom du bureau en arabe')}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المكتب بالإنجليزية', 'Office Name in English', 'Nom du Bureau en Anglais')}</label>
                  <Input
                    value={newOffice.name?.en || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, name: { ...newOffice.name!, en: e.target.value } })}
                    placeholder="Office name in English"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المكتب بالفرنسية', 'Office Name in French', 'Nom du Bureau en Français')}</label>
                  <Input
                    value={newOffice.name?.fr || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, name: { ...newOffice.name!, fr: e.target.value } })}
                    placeholder="Nom du bureau en français"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العنوان بالعربية *', 'Address in Arabic *', 'Adresse en Arabe *')}</label>
                  <Input
                    value={newOffice.address?.ar || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, address: { ...newOffice.address!, ar: e.target.value } })}
                    placeholder={getLocalizedText('العنوان الكامل بالعربية', 'Full address in Arabic', 'Adresse complète en arabe')}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العنوان بالإنجليزية', 'Address in English', 'Adresse en Anglais')}</label>
                  <Input
                    value={newOffice.address?.en || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, address: { ...newOffice.address!, en: e.target.value } })}
                    placeholder="Full address in English"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العنوان بالفرنسية', 'Address in French', 'Adresse en Français')}</label>
                  <Input
                    value={newOffice.address?.fr || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, address: { ...newOffice.address!, fr: e.target.value } })}
                    placeholder="Adresse complète en français"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('رقم الهاتف *', 'Phone Number *', 'Numéro de Téléphone *')}</label>
                  <Input
                    value={newOffice.phone || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, phone: e.target.value })}
                    placeholder="+966 11 123 4567"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('البريد الإلكتروني *', 'Email *', 'Email *')}</label>
                  <Input
                    type="email"
                    value={newOffice.email || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, email: e.target.value })}
                    placeholder="office@example.com"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الموقع الإلكتروني', 'Website', 'Site Web')}</label>
                  <Input
                    type="url"
                    value={newOffice.website || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, website: e.target.value })}
                    placeholder="https://www.example.com"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المدير بالعربية', 'Manager Name in Arabic', 'Nom du Manager en Arabe')}</label>
                  <Input
                    value={newOffice.manager?.ar || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, manager: { ...newOffice.manager!, ar: e.target.value } })}
                    placeholder={getLocalizedText('اسم مدير المكتب', 'Office manager name', 'Nom du gestionnaire du bureau')}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم ال��دير بالإنجليزية', 'Manager Name in English', 'Nom du Manager en Anglais')}</label>
                  <Input
                    value={newOffice.manager?.en || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, manager: { ...newOffice.manager!, en: e.target.value } })}
                    placeholder="Office manager name"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('ساعات العمل بالعربية', 'Working Hours in Arabic', 'Heures de Travail en Arabe')}</label>
                  <Input
                    value={newOffice.workingHours?.ar || ''}
                    onChange={(e) => setNewOffice({ ...newOffice, workingHours: { ...newOffice.workingHours!, ar: e.target.value } })}
                    placeholder={getLocalizedText('السبت - الخميس: 9:00 - 18:00', 'Saturday - Thursday: 9:00 - 18:00', 'Samedi - Jeudi: 9:00 - 18:00')}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('التقييم', 'Rating', 'Évaluation')}</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newOffice.rating || 4.5}
                    onChange={(e) => setNewOffice({ ...newOffice, rating: parseFloat(e.target.value) || 4.5 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد المراجعات', 'Number of Reviews', 'Nombre d\'Avis')}</label>
                  <Input
                    type="number"
                    value={newOffice.reviews || 0}
                    onChange={(e) => setNewOffice({ ...newOffice, reviews: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOffice.isActive || false}
                    onChange={(e) => setNewOffice({ ...newOffice, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{getLocalizedText('مكتب نشط', 'Active Office', 'Bureau Actif')}</span>
                </label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleAddOffice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {getLocalizedText('حفظ المكتب', 'Save Office', 'Enregistrer le Bureau')}
              </Button>
              <Button
                onClick={() => setIsAddingOffice(false)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                {getLocalizedText('إلغاء', 'Cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Country Modal */}
      {editingCountry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{getLocalizedText('تعديل الدولة', 'Edit Country', 'Modifier le Pays')}</h3>
                <button
                  onClick={() => setEditingCountry(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الاسم بالعربية', 'Arabic Name', 'Nom en Arabe')}</label>
                  <Input
                    value={editingCountry.name.ar}
                    onChange={(e) => setEditingCountry({ ...editingCountry, name: { ...editingCountry.name, ar: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الاسم بالإنجليزية', 'English Name', 'Nom en Anglais')}</label>
                  <Input
                    value={editingCountry.name.en}
                    onChange={(e) => setEditingCountry({ ...editingCountry, name: { ...editingCountry.name, en: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('التقييم', 'Rating', 'Évaluation')}</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingCountry.rating}
                    onChange={(e) => setEditingCountry({ ...editingCountry, rating: parseFloat(e.target.value) || 4.5 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد الجولات', 'Tours', 'Circuits')}</label>
                  <Input
                    type="number"
                    value={editingCountry.totalTours}
                    onChange={(e) => setEditingCountry({ ...editingCountry, totalTours: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد المراجعات', 'Reviews', 'Avis')}</label>
                  <Input
                    type="number"
                    value={editingCountry.totalReviews}
                    onChange={(e) => setEditingCountry({ ...editingCountry, totalReviews: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('الوصف بالعربية', 'Description in Arabic', 'Description en Arabe')}</label>
                <Textarea
                  value={editingCountry.description.ar}
                  onChange={(e) => setEditingCountry({ ...editingCountry, description: { ...editingCountry.description, ar: e.target.value } })}
                  rows={3}
                  className="rounded-xl"
                />
              </div>


              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCountry.isActive}
                    onChange={(e) => setEditingCountry({ ...editingCountry, isActive: e.target.checked })}
                    className="w-4 h-4 text-tarhal-orange bg-gray-100 border-gray-300 rounded focus:ring-tarhal-orange focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{getLocalizedText('دولة نشطة', 'Active Country', 'Pays Actif')}</span>
                </label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleUpdateCountry}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {getLocalizedText('حفظ التغييرات', 'Save Changes', 'Enregistrer les Modifications')}
              </Button>
              <Button
                onClick={() => setEditingCountry(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                {getLocalizedText('��لغاء', 'Cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Office Modal */}
      {editingOffice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{getLocalizedText('تعديل المكتب السياحي', 'Edit Travel Office', 'Modifier le Bureau de Voyage')}</h3>
                <button
                  onClick={() => setEditingOffice(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المكتب ��العربية', 'Office Name in Arabic', 'Nom du Bureau en Arabe')}</label>
                  <Input
                    value={editingOffice.name.ar}
                    onChange={(e) => setEditingOffice({ ...editingOffice, name: { ...editingOffice.name, ar: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('اسم المكتب بالإنجليزية', 'Office Name in English', 'Nom du Bureau en Anglais')}</label>
                  <Input
                    value={editingOffice.name.en}
                    onChange={(e) => setEditingOffice({ ...editingOffice, name: { ...editingOffice.name, en: e.target.value } })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('رقم الهاتف', 'Phone Number', 'Numéro de Téléphone')}</label>
                  <Input
                    value={editingOffice.phone}
                    onChange={(e) => setEditingOffice({ ...editingOffice, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('البريد الإلكتروني', 'Email', 'Email')}</label>
                  <Input
                    type="email"
                    value={editingOffice.email}
                    onChange={(e) => setEditingOffice({ ...editingOffice, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('العنوان بالعربية', 'Address in Arabic', 'Adresse en Arabe')}</label>
                <Input
                  value={editingOffice.address.ar}
                  onChange={(e) => setEditingOffice({ ...editingOffice, address: { ...editingOffice.address, ar: e.target.value } })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('التقييم', 'Rating', 'Évaluation')}</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingOffice.rating}
                    onChange={(e) => setEditingOffice({ ...editingOffice, rating: parseFloat(e.target.value) || 4.5 })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{getLocalizedText('عدد المراجعات', 'Reviews', 'Avis')}</label>
                  <Input
                    type="number"
                    value={editingOffice.reviews}
                    onChange={(e) => setEditingOffice({ ...editingOffice, reviews: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffice.isActive}
                    onChange={(e) => setEditingOffice({ ...editingOffice, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{getLocalizedText('مكتب نشط', 'Active Office', 'Bureau Actif')}</span>
                </label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                onClick={handleUpdateOffice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {getLocalizedText('حفظ التغييرات', 'Save Changes', 'Enregistrer les Modifications')}
              </Button>
              <Button
                onClick={() => setEditingOffice(null)}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                {getLocalizedText('إلغاء', 'Cancel', 'Annuler')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
