import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, Search, Star, Globe, Phone, Mail, Clock, Save, CheckCircle, XCircle, Send, MapPin, Briefcase } from 'lucide-react';
import MapPicker from '@/components/MapPicker';

interface CountryOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ApiOffice {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  address_ar: string;
  address_en: string;
  address_fr: string;
  phone: string;
  email: string;
  website?: string;
  manager_ar?: string;
  manager_en?: string;
  manager_fr?: string;
  services_ar?: string[];
  services_en?: string[];
  services_fr?: string[];
  working_hours_ar: string;
  working_hours_en: string;
  working_hours_fr: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews: number;
  is_active: boolean;
  is_company_office?: boolean;
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
  submitted_by?: string;
  reviewed_by?: string;
  published_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  published_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  country_name?: string;
}

interface OfficeFormData {
  countryId: string;
  name: { ar: string; en: string; fr: string };
  address: { ar: string; en: string; fr: string };
  phone: string;
  email: string;
  website?: string;
  manager: { ar: string; en: string; fr: string };
  services: { ar: string[]; en: string[]; fr: string[] };
  workingHours: { ar: string; en: string; fr: string };
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  isCompanyOffice: boolean;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
}

const AdminOfficeManagement: React.FC = () => {
  const { language } = useLanguage();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [offices, setOffices] = useState<ApiOffice[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffice, setEditingOffice] = useState<ApiOffice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending_review' | 'published' | 'archived'>('all');
  const [officeTypeFilter, setOfficeTypeFilter] = useState<'all' | 'company' | 'other'>('all');

  const [formData, setFormData] = useState<OfficeFormData>({
    countryId: '',
    name: { ar: '', en: '', fr: '' },
    address: { ar: '', en: '', fr: '' },
    phone: '',
    email: '',
    website: '',
    manager: { ar: '', en: '', fr: '' },
    services: { ar: [], en: [], fr: [] },
    workingHours: { ar: '', en: '', fr: '' },
    latitude: undefined,
    longitude: undefined,
    rating: 4.5,
    reviews: 0,
    isActive: true,
    isCompanyOffice: false,
    status: 'draft',
  });

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    switch (language) {
      case 'en':
        return en;
      case 'fr':
        return fr;
      case 'ar':
      default:
        return ar;
    }
  };

  const text = {
    title: getLocalizedText('إدارة المكاتب السياحية', 'Travel Offices Management', 'Gestion des Bureaux de Voyage'),
    description: getLocalizedText(
      'قم بإدارة المكاتب السياحية: إضافة، تعديل، وحذف مكاتب مع فصل مكاتب الشركة.',
      'Manage travel offices: add, edit, and delete offices with company office separation.',
      'Gérez les bureaux de voyage : ajouter, modifier et supprimer des bureaux avec séparation des bureaux de l\'entreprise.'
    ),
    selectCountry: getLocalizedText('اختر دولة', 'Select Country', 'Sélectionnez un Pays'),
    addOffice: getLocalizedText('إضافة مكتب جديد', 'Add New Office', 'Ajouter un Nouveau Bureau'),
    editOffice: getLocalizedText('تعديل المكتب', 'Edit Office', 'Modifier le Bureau'),
    officeName: getLocalizedText('اسم المكتب', 'Office Name', 'Nom du Bureau'),
    address: getLocalizedText('العنوان', 'Address', 'Adresse'),
    phone: getLocalizedText('الهاتف', 'Phone', 'Téléphone'),
    email: getLocalizedText('البريد الإلكتروني', 'Email', 'Email'),
    website: getLocalizedText('الموقع الإلكتروني', 'Website', 'Site Web'),
    manager: getLocalizedText('المدير', 'Manager', 'Directeur'),
    services: getLocalizedText('الخدمات', 'Services', 'Services'),
    workingHours: getLocalizedText('ساعات العمل', 'Working Hours', 'Heures de Travail'),
    coordinates: getLocalizedText('الإحداثيات', 'Coordinates', 'Coordonnées'),
    rating: getLocalizedText('التقييم', 'Rating', 'Note'),
    reviews: getLocalizedText('عدد المراجعات', 'Reviews', 'Avis'),
    isCompanyOffice: getLocalizedText('مكتب الشركة', 'Company Office', 'Bureau de l\'Entreprise'),
    save: getLocalizedText('حفظ', 'Save', 'Enregistrer'),
    cancel: getLocalizedText('إلغاء', 'Cancel', 'Annuler'),
    submit: getLocalizedText('إرسال للمراجعة', 'Submit for Review', 'Soumettre pour Révision'),
    approve: getLocalizedText('الموافقة والنشر', 'Approve & Publish', 'Approuver et Publier'),
    reject: getLocalizedText('رفض', 'Reject', 'Rejeter'),
    required: getLocalizedText('مطلوب', 'Required', 'Requis'),
    optional: getLocalizedText('اختياري', 'Optional', 'Optionnel'),
    draft: getLocalizedText('مسودة', 'Draft', 'Brouillon'),
    pendingReview: getLocalizedText('قيد المراجعة', 'Pending Review', 'En Révision'),
    published: getLocalizedText('منشور', 'Published', 'Publié'),
    archived: getLocalizedText('مؤرشف', 'Archived', 'Archivé'),
    arabic: getLocalizedText('العربية', 'Arabic', 'Arabe'),
    english: getLocalizedText('الإنجليزية', 'English', 'Anglais'),
    french: getLocalizedText('الفرنسية', 'French', 'Français'),
    companyOffices: getLocalizedText('مكاتب الشركة', 'Company Offices', 'Bureaux de l\'Entreprise'),
    otherOffices: getLocalizedText('مكاتب أخرى', 'Other Offices', 'Autres Bureaux'),
    allOffices: getLocalizedText('جميع المكاتب', 'All Offices', 'Tous les Bureaux'),
  };

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || '',
      name: { ar: '', en: '', fr: '' },
      address: { ar: '', en: '', fr: '' },
      phone: '',
      email: '',
      website: '',
      manager: { ar: '', en: '', fr: '' },
      services: { ar: [], en: [], fr: [] },
      workingHours: { ar: '', en: '', fr: '' },
      latitude: undefined,
      longitude: undefined,
      rating: 4.5,
      reviews: 0,
      isActive: true,
      isCompanyOffice: false,
      status: 'draft',
    });
    setEditingOffice(null);
    setIsAdding(false);
    setError('');
  };

  const loadCountries = async () => {
    try {
      const res = await fetch('/api/countries?active=false');
      const data = await res.json();
      if (data.success) {
        const countriesData = data.data || [];
        // Filter to only show countries that have at least one name
        const validCountries = countriesData.filter((c: any) => 
          (c.name_ar && c.name_ar.trim() !== '') || 
          (c.name_en && c.name_en.trim() !== '') || 
          (c.name_fr && c.name_fr.trim() !== '')
        );
        setCountries(validCountries);
        console.log(`✅ Loaded ${validCountries.length} valid countries (from ${countriesData.length} total)`);
      }
    } catch (err) {
      console.error('Error loading countries:', err);
    }
  };

  const loadOffices = async () => {
    try {
      setIsLoading(true);
      let url = '/api/travel-offices?active=false';
      if (selectedCountryId) {
        url += `&country=${encodeURIComponent(selectedCountryId)}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (officeTypeFilter === 'company') {
        url += `&is_company_office=true`;
      } else if (officeTypeFilter === 'other') {
        url += `&is_company_office=false`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOffices(data.data || []);
      } else {
        setError(data.error || 'Failed to load offices');
      }
    } catch (err: any) {
      console.error('Error loading offices:', err);
      setError(err.message || 'Failed to load offices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    loadOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId, statusFilter, officeTypeFilter]);

  const handleEdit = (office: ApiOffice) => {
    setEditingOffice(office);
    setIsAdding(true);
    setFormData({
      countryId: office.country_id,
      name: { ar: office.name_ar, en: office.name_en, fr: office.name_fr },
      address: { ar: office.address_ar, en: office.address_en, fr: office.address_fr },
      phone: office.phone,
      email: office.email,
      website: office.website,
      manager: {
        ar: office.manager_ar || '',
        en: office.manager_en || '',
        fr: office.manager_fr || '',
      },
      services: {
        ar: office.services_ar || [],
        en: office.services_en || [],
        fr: office.services_fr || [],
      },
      workingHours: {
        ar: office.working_hours_ar,
        en: office.working_hours_en,
        fr: office.working_hours_fr,
      },
      latitude: office.latitude,
      longitude: office.longitude,
      rating: office.rating || 4.5,
      reviews: office.reviews || 0,
      isActive: office.is_active,
      isCompanyOffice: office.is_company_office || false,
      status: office.status || 'draft',
    });
  };

  const validateForm = (): boolean => {
    if (!formData.countryId || !formData.name.ar || !formData.name.en ||
        !formData.address.ar || !formData.address.en ||
        !formData.phone || !formData.email ||
        !formData.workingHours.ar || !formData.workingHours.en) {
      setError(getLocalizedText('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields', 'Veuillez remplir tous les champs requis'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        country_id: formData.countryId,
        name_ar: formData.name.ar,
        name_en: formData.name.en,
        name_fr: formData.name.fr || formData.name.ar,
        address_ar: formData.address.ar,
        address_en: formData.address.en,
        address_fr: formData.address.fr || formData.address.ar,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || undefined,
        manager_ar: formData.manager.ar || undefined,
        manager_en: formData.manager.en || undefined,
        manager_fr: formData.manager.fr || undefined,
        services_ar: formData.services.ar,
        services_en: formData.services.en,
        services_fr: formData.services.fr,
        working_hours_ar: formData.workingHours.ar,
        working_hours_en: formData.workingHours.en,
        working_hours_fr: formData.workingHours.fr || formData.workingHours.ar,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        rating: formData.rating || 4.5,
        reviews: formData.reviews || 0,
        is_active: formData.isActive,
        is_company_office: formData.isCompanyOffice,
        status: formData.status,
      };

      const url = editingOffice ? `/api/travel-offices/${editingOffice.id}` : '/api/travel-offices';
      const method = editingOffice ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save office');
        return;
      }

      setSuccess(getLocalizedText('تم حفظ المكتب بنجاح', 'Office saved successfully', 'Bureau enregistré avec succès'));
      await loadOffices();
      resetForm();
    } catch (err: any) {
      console.error('Error saving office:', err);
      setError(err.message || 'Failed to save office');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!editingOffice) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/travel-offices/${editingOffice.id}/submit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم إرسال المكتب للمراجعة', 'Office submitted for review', 'Bureau soumis pour révision'));
        await loadOffices();
        resetForm();
      } else {
        setError(data.error || 'Failed to submit office');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit office');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!editingOffice) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/travel-offices/${editingOffice.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم الموافقة على المكتب ونشره', 'Office approved and published', 'Bureau approuvé et publié'));
        await loadOffices();
        resetForm();
      } else {
        setError(data.error || 'Failed to approve office');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve office');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!editingOffice) return;
    const reason = window.prompt(getLocalizedText('أدخل سبب الرفض', 'Enter rejection reason', 'Entrez la raison du rejet'));
    if (!reason) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/travel-offices/${editingOffice.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم رفض المكتب', 'Office rejected', 'Bureau rejeté'));
        await loadOffices();
        resetForm();
      } else {
        setError(data.error || 'Failed to reject office');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject office');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (office: ApiOffice) => {
    if (!window.confirm(getLocalizedText('هل أنت متأكد من حذف هذا المكتب؟', 'Are you sure you want to delete this office?', 'Êtes-vous sûr de vouloir supprimer ce bureau ?'))) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/travel-offices/${office.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to delete office');
        return;
      }

      setSuccess(getLocalizedText('تم حذف المكتب بنجاح', 'Office deleted successfully', 'Bureau supprimé avec succès'));
      await loadOffices();
    } catch (err: any) {
      console.error('Error deleting office:', err);
      setError(err.message || 'Failed to delete office');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any, lang?: string) => {
    setFormData(prev => {
      if (lang) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [lang]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
    if (error) setError('');
  };

  const addService = (lang: string) => {
    const input = prompt(`Add new service (${lang}):`);
    if (input && input.trim()) {
      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          [lang]: [...prev.services[lang], input.trim()]
        }
      }));
    }
  };

  const removeService = (lang: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [lang]: prev.services[lang].filter((_, i) => i !== index)
      }
    }));
  };

  const filteredOffices = offices.filter((office) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      office.name_ar.toLowerCase().includes(q) ||
      office.name_en.toLowerCase().includes(q) ||
      office.name_fr.toLowerCase().includes(q) ||
      office.address_ar.toLowerCase().includes(q) ||
      office.phone.includes(q) ||
      office.email.toLowerCase().includes(q)
    );
  });

  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    if (!country) return countryId;
    switch (language) {
      case 'en':
        return country.name_en;
      case 'fr':
        return country.name_fr;
      case 'ar':
      default:
        return country.name_ar;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100">{text.draft}</Badge>;
      case 'pending_review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{text.pendingReview}</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-green-100 text-green-800">{text.published}</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-200">{text.archived}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-tarhal-orange" />
            {text.title}
          </h2>
          <p className="text-gray-600 mt-1">{text.description}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {offices.length} {getLocalizedText('مكتب', 'offices', 'bureaux')}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            {getLocalizedText('تصفية المكاتب', 'Filter Offices', 'Filtrer les Bureaux')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{text.selectCountry}</Label>
              <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{getLocalizedText('الكل', 'All', 'Tous')}</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {getCountryName(country.id)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{getLocalizedText('نوع المكتب', 'Office Type', 'Type de Bureau')}</Label>
              <select
                value={officeTypeFilter}
                onChange={(e) => setOfficeTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">{text.allOffices}</option>
                <option value="company">{text.companyOffices}</option>
                <option value="other">{text.otherOffices}</option>
              </select>
            </div>
            <div>
              <Label>{getLocalizedText('الحالة', 'Status', 'Statut')}</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">{getLocalizedText('الكل', 'All', 'Tous')}</option>
                <option value="draft">{text.draft}</option>
                <option value="pending_review">{text.pendingReview}</option>
                <option value="published">{text.published}</option>
                <option value="archived">{text.archived}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={getLocalizedText('البحث في المكاتب...', 'Search offices...', 'Rechercher des bureaux...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setIsAdding(true);
                setEditingOffice(null);
                setFormData(prev => ({
                  ...prev,
                  countryId: selectedCountryId || prev.countryId,
                }));
              }}
              className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {text.addOffice}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offices List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-tarhal-orange" />
              {getLocalizedText('قائمة المكاتب', 'Offices List', 'Liste des Bureaux')}
            </h3>
            <Badge variant="outline">
              {filteredOffices.length}{' '}
              {getLocalizedText('مكتب', 'offices', 'bureaux')}
            </Badge>
          </div>
          {filteredOffices.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {getLocalizedText('لا توجد مكاتب', 'No offices found', 'Aucun bureau trouvé')}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOffices.map((office) => (
                <Card key={office.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {language === 'en'
                            ? office.name_en
                            : language === 'fr'
                            ? office.name_fr
                            : office.name_ar}
                        </h4>
                        {office.is_company_office && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs mt-1">
                            {text.companyOffices}
                          </Badge>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {getCountryName(office.country_id)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(office.status)}
                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{office.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">
                          {language === 'en' ? office.address_en : language === 'fr' ? office.address_fr : office.address_ar}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{office.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{office.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {language === 'en' ? office.working_hours_en : language === 'fr' ? office.working_hours_fr : office.working_hours_ar}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(office)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(office)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {getLocalizedText('حذف', 'Delete', 'Supprimer')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Form */}
        {isAdding && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingOffice ? text.editOffice : text.addOffice}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Tabs defaultValue="basic" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">{getLocalizedText('أساسي', 'Basic', 'De Base')}</TabsTrigger>
                      <TabsTrigger value="details">{getLocalizedText('تفاصيل', 'Details', 'Détails')}</TabsTrigger>
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.officeName} <Badge variant="destructive">{text.required}</Badge>
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="name-ar">{text.arabic}</Label>
                            <Input
                              id="name-ar"
                              value={formData.name.ar}
                              onChange={(e) => handleInputChange('name', e.target.value, 'ar')}
                              placeholder="اسم المكتب بالعربية"
                              dir="rtl"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="name-en">{text.english}</Label>
                            <Input
                              id="name-en"
                              value={formData.name.en}
                              onChange={(e) => handleInputChange('name', e.target.value, 'en')}
                              placeholder="Office name in English"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="name-fr">{text.french}</Label>
                            <Input
                              id="name-fr"
                              value={formData.name.fr}
                              onChange={(e) => handleInputChange('name', e.target.value, 'fr')}
                              placeholder="Nom du bureau en français"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.address} <Badge variant="destructive">{text.required}</Badge>
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="address-ar">{text.arabic}</Label>
                            <Textarea
                              id="address-ar"
                              value={formData.address.ar}
                              onChange={(e) => handleInputChange('address', e.target.value, 'ar')}
                              placeholder="العنوان بالعربية"
                              dir="rtl"
                              rows={2}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="address-en">{text.english}</Label>
                            <Textarea
                              id="address-en"
                              value={formData.address.en}
                              onChange={(e) => handleInputChange('address', e.target.value, 'en')}
                              placeholder="Address in English"
                              rows={2}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="address-fr">{text.french}</Label>
                            <Textarea
                              id="address-fr"
                              value={formData.address.fr}
                              onChange={(e) => handleInputChange('address', e.target.value, 'fr')}
                              placeholder="Adresse en français"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="phone" className="text-base font-medium">
                            {text.phone} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+1234567890"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-base font-medium">
                            {text.email} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="office@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="website">
                          {text.website} <Badge variant="outline">{text.optional}</Badge>
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value || undefined)}
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.workingHours} <Badge variant="destructive">{text.required}</Badge>
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="hours-ar">{text.arabic}</Label>
                            <Input
                              id="hours-ar"
                              value={formData.workingHours.ar}
                              onChange={(e) => handleInputChange('workingHours', e.target.value, 'ar')}
                              placeholder="ساعات العمل بالعربية"
                              dir="rtl"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="hours-en">{text.english}</Label>
                            <Input
                              id="hours-en"
                              value={formData.workingHours.en}
                              onChange={(e) => handleInputChange('workingHours', e.target.value, 'en')}
                              placeholder="Working hours in English"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="hours-fr">{text.french}</Label>
                            <Input
                              id="hours-fr"
                              value={formData.workingHours.fr}
                              onChange={(e) => handleInputChange('workingHours', e.target.value, 'fr')}
                              placeholder="Heures de travail en français"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is-company-office"
                          checked={formData.isCompanyOffice}
                          onChange={(e) => handleInputChange('isCompanyOffice', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="is-company-office" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {text.isCompanyOffice}
                        </Label>
                      </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.manager} <Badge variant="outline">{text.optional}</Badge>
                        </Label>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="manager-ar">{text.arabic}</Label>
                            <Input
                              id="manager-ar"
                              value={formData.manager.ar}
                              onChange={(e) => handleInputChange('manager', e.target.value, 'ar')}
                              placeholder="اسم المدير بالعربية"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manager-en">{text.english}</Label>
                            <Input
                              id="manager-en"
                              value={formData.manager.en}
                              onChange={(e) => handleInputChange('manager', e.target.value, 'en')}
                              placeholder="Manager name in English"
                            />
                          </div>
                          <div>
                            <Label htmlFor="manager-fr">{text.french}</Label>
                            <Input
                              id="manager-fr"
                              value={formData.manager.fr}
                              onChange={(e) => handleInputChange('manager', e.target.value, 'fr')}
                              placeholder="Nom du directeur en français"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.services} <Badge variant="outline">{text.optional}</Badge>
                        </Label>
                        {['ar', 'en', 'fr'].map((lang) => (
                          <div key={lang} className="space-y-2">
                            <Label>{lang === 'ar' ? text.arabic : lang === 'en' ? text.english : text.french}</Label>
                            <div className="space-y-2">
                              {formData.services[lang].map((service, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={service}
                                    onChange={(e) => {
                                      const newServices = [...formData.services[lang]];
                                      newServices[index] = e.target.value;
                                      handleInputChange('services', { ...formData.services, [lang]: newServices });
                                    }}
                                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeService(lang, index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => addService(lang)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {getLocalizedText('إضافة خدمة', 'Add Service', 'Ajouter un Service')}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="rating">{text.rating}</Label>
                          <Input
                            id="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reviews">{text.reviews}</Label>
                          <Input
                            id="reviews"
                            type="number"
                            min="0"
                            value={formData.reviews}
                            onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          {text.coordinates} <Badge variant="outline">{text.optional}</Badge>
                        </Label>
                        {formData.latitude !== undefined && formData.longitude !== undefined && (
                          <MapPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationChange={(lat, lng) => {
                              handleInputChange('latitude', lat);
                              handleInputChange('longitude', lng);
                            }}
                            height="300px"
                            className="border border-gray-300 rounded-lg"
                          />
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="latitude">{getLocalizedText('خط العرض', 'Latitude', 'Latitude')}</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              value={formData.latitude || ''}
                              onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude">{getLocalizedText('خط الطول', 'Longitude', 'Longitude')}</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              value={formData.longitude || ''}
                              onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-end gap-2 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      {text.cancel}
                    </Button>
                    {editingOffice && editingOffice.status === 'draft' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSubmitForReview}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {text.submit}
                      </Button>
                    )}
                    {editingOffice && editingOffice.status === 'pending_review' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApprove}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {text.approve}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReject}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {text.reject}
                        </Button>
                      </>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {text.save}
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {text.save}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOfficeManagement;

