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
import { Separator } from '@/components/ui/separator';
import { MapPin, Plus, Edit, Trash2, Search, Star, Globe, Camera, Clock, Calendar, Save, Eye, CheckCircle, XCircle, Send } from 'lucide-react';
import MapPicker from '@/components/MapPicker';

interface CountryOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ProvinceOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface CityOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ApiDestination {
  id: string;
  city_id?: string;
  province_id?: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  main_image: string;
  gallery?: string[];
  latitude: number;
  longitude: number;
  address_ar?: string;
  address_en?: string;
  address_fr?: string;
  category?: string;
  rating: number;
  reviews: number;
  best_time_ar?: string;
  best_time_en?: string;
  best_time_fr?: string;
  duration_ar?: string;
  duration_en?: string;
  duration_fr?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  attractions_ar?: string[];
  attractions_en?: string[];
  attractions_fr?: string[];
  entry_fee?: number;
  currency: string;
  opening_hours_ar?: string;
  opening_hours_en?: string;
  opening_hours_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  submitted_by?: string;
  reviewed_by?: string;
  published_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  published_at?: string;
  rejection_reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

interface DestinationFormData {
  countryId: string;
  provinceId?: string;
  cityId?: string;
  name: { ar: string; en: string; fr: string };
  description: { ar: string; en: string; fr: string };
  mainImage: string;
  gallery: string[];
  latitude: number;
  longitude: number;
  address: { ar: string; en: string; fr: string };
  category?: string;
  rating: number;
  reviews: number;
  bestTime: { ar: string; en: string; fr: string };
  duration: { ar: string; en: string; fr: string };
  highlights: { ar: string[]; en: string[]; fr: string[] };
  attractions: { ar: string[]; en: string[]; fr: string[] };
  entryFee?: number;
  currency: string;
  openingHours: { ar: string; en: string; fr: string };
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  isActive: boolean;
}

const AdminDestinationManagement: React.FC = () => {
  const { language } = useLanguage();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingDestination, setEditingDestination] = useState<ApiDestination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending_review' | 'published' | 'archived'>('all');

  const [formData, setFormData] = useState<DestinationFormData>({
    countryId: '',
    provinceId: undefined,
    cityId: undefined,
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    mainImage: '',
    gallery: [],
    latitude: 24.7136,
    longitude: 46.6753,
    address: { ar: '', en: '', fr: '' },
    category: '',
    rating: 4.5,
    reviews: 0,
    bestTime: { ar: '', en: '', fr: '' },
    duration: { ar: '', en: '', fr: '' },
    highlights: { ar: [], en: [], fr: [] },
    attractions: { ar: [], en: [], fr: [] },
    entryFee: undefined,
    currency: 'USD',
    openingHours: { ar: '', en: '', fr: '' },
    contactPhone: '',
    contactEmail: '',
    website: '',
    status: 'draft',
    isActive: true,
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
    title: getLocalizedText('إدارة الوجهات السياحية', 'Destinations Management', 'Gestion des Destinations'),
    description: getLocalizedText(
      'قم بإدارة الوجهات السياحية: إضافة، تعديل، وحذف وجهات مع خرائط تفاعلية وتفاصيل كاملة.',
      'Manage tourist destinations: add, edit, and delete destinations with interactive maps and full details.',
      'Gérez les destinations touristiques : ajouter, modifier et supprimer des destinations avec des cartes interactives et tous les détails.'
    ),
    selectCountry: getLocalizedText('اختر دولة', 'Select Country', 'Sélectionnez un Pays'),
    selectProvince: getLocalizedText('اختر محافظة', 'Select Province', 'Sélectionnez une Province'),
    selectCity: getLocalizedText('اختر مدينة', 'Select City', 'Sélectionnez une Ville'),
    addDestination: getLocalizedText('إضافة وجهة جديدة', 'Add New Destination', 'Ajouter une Nouvelle Destination'),
    editDestination: getLocalizedText('تعديل الوجهة', 'Edit Destination', 'Modifier la Destination'),
    destinationName: getLocalizedText('اسم الوجهة', 'Destination Name', 'Nom de la Destination'),
    description: getLocalizedText('الوصف', 'Description', 'Description'),
    mainImage: getLocalizedText('الصورة الرئيسية', 'Main Image', 'Image Principale'),
    location: getLocalizedText('الموقع', 'Location', 'Emplacement'),
    coordinates: getLocalizedText('الإحداثيات', 'Coordinates', 'Coordonnées'),
    category: getLocalizedText('الفئة', 'Category', 'Catégorie'),
    rating: getLocalizedText('التقييم', 'Rating', 'Note'),
    reviews: getLocalizedText('عدد المراجعات', 'Reviews', 'Avis'),
    bestTime: getLocalizedText('أفضل وقت للزيارة', 'Best Time to Visit', 'Meilleur Moment'),
    duration: getLocalizedText('المدة', 'Duration', 'Durée'),
    highlights: getLocalizedText('النقاط المميزة', 'Highlights', 'Points Forts'),
    attractions: getLocalizedText('المعالم', 'Attractions', 'Attractions'),
    entryFee: getLocalizedText('رسوم الدخول', 'Entry Fee', 'Frais d\'Entrée'),
    openingHours: getLocalizedText('ساعات العمل', 'Opening Hours', 'Heures d\'Ouverture'),
    contact: getLocalizedText('معلومات الاتصال', 'Contact Info', 'Informations de Contact'),
    gallery: getLocalizedText('معرض الصور', 'Gallery', 'Galerie'),
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
  };

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || '',
      provinceId: selectedProvinceId || undefined,
      cityId: selectedCityId || undefined,
      name: { ar: '', en: '', fr: '' },
      description: { ar: '', en: '', fr: '' },
      mainImage: '',
      gallery: [],
      latitude: 24.7136,
      longitude: 46.6753,
      address: { ar: '', en: '', fr: '' },
      category: '',
      rating: 4.5,
      reviews: 0,
      bestTime: { ar: '', en: '', fr: '' },
      duration: { ar: '', en: '', fr: '' },
      highlights: { ar: [], en: [], fr: [] },
      attractions: { ar: [], en: [], fr: [] },
      entryFee: undefined,
      currency: 'USD',
      openingHours: { ar: '', en: '', fr: '' },
      contactPhone: '',
      contactEmail: '',
      website: '',
      status: 'draft',
      isActive: true,
    });
    setEditingDestination(null);
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

  const loadProvinces = async (countryId: string) => {
    if (!countryId) {
      setProvinces([]);
      return;
    }
    try {
      const res = await fetch(`/api/provinces?country_id=${encodeURIComponent(countryId)}&active=false`);
      const data = await res.json();
      if (data.success) {
        setProvinces(data.data || []);
      }
    } catch (err) {
      console.error('Error loading provinces:', err);
    }
  };

  const loadCities = async (countryId: string, provinceId?: string) => {
    if (!countryId) {
      setCities([]);
      return;
    }
    try {
      let url = `/api/cities?country_id=${encodeURIComponent(countryId)}&active=false`;
      if (provinceId) {
        // Note: cities API might need province_id filter
        url += `&province_id=${encodeURIComponent(provinceId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (err) {
      console.error('Error loading cities:', err);
    }
  };

  const loadDestinations = async () => {
    if (!selectedCountryId) {
      setDestinations([]);
      return;
    }
    try {
      setIsLoading(true);
      let url = `/api/destinations?country_id=${encodeURIComponent(selectedCountryId)}&active=false`;
      if (selectedProvinceId) {
        url += `&province_id=${encodeURIComponent(selectedProvinceId)}`;
      }
      if (selectedCityId) {
        url += `&city_id=${encodeURIComponent(selectedCityId)}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data || []);
      } else {
        setError(data.error || 'Failed to load destinations');
      }
    } catch (err: any) {
      console.error('Error loading destinations:', err);
      setError(err.message || 'Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      loadProvinces(selectedCountryId);
      loadCities(selectedCountryId);
      loadDestinations();
      resetForm();
    } else {
      setProvinces([]);
      setCities([]);
      setDestinations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedCountryId) {
      loadCities(selectedCountryId, selectedProvinceId);
      loadDestinations();
      setFormData(prev => ({ ...prev, provinceId: selectedProvinceId || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedCountryId) {
      loadDestinations();
      setFormData(prev => ({ ...prev, cityId: selectedCityId || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, statusFilter]);

  const handleEdit = (destination: ApiDestination) => {
    setEditingDestination(destination);
    setIsAdding(true);
    setFormData({
      countryId: destination.country_id,
      provinceId: destination.province_id || undefined,
      cityId: destination.city_id || undefined,
      name: { ar: destination.name_ar, en: destination.name_en, fr: destination.name_fr },
      description: { ar: destination.description_ar, en: destination.description_en, fr: destination.description_fr },
      mainImage: destination.main_image,
      gallery: destination.gallery || [],
      latitude: destination.latitude,
      longitude: destination.longitude,
      address: {
        ar: destination.address_ar || '',
        en: destination.address_en || '',
        fr: destination.address_fr || '',
      },
      category: destination.category || '',
      rating: destination.rating || 4.5,
      reviews: destination.reviews || 0,
      bestTime: {
        ar: destination.best_time_ar || '',
        en: destination.best_time_en || '',
        fr: destination.best_time_fr || '',
      },
      duration: {
        ar: destination.duration_ar || '',
        en: destination.duration_en || '',
        fr: destination.duration_fr || '',
      },
      highlights: {
        ar: destination.highlights_ar || [],
        en: destination.highlights_en || [],
        fr: destination.highlights_fr || [],
      },
      attractions: {
        ar: destination.attractions_ar || [],
        en: destination.attractions_en || [],
        fr: destination.attractions_fr || [],
      },
      entryFee: destination.entry_fee,
      currency: destination.currency || 'USD',
      openingHours: {
        ar: destination.opening_hours_ar || '',
        en: destination.opening_hours_en || '',
        fr: destination.opening_hours_fr || '',
      },
      contactPhone: destination.contact_phone || '',
      contactEmail: destination.contact_email || '',
      website: destination.website || '',
      status: destination.status || 'draft',
      isActive: destination.is_active,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.countryId || !formData.name.ar || !formData.name.en ||
        !formData.description.ar || !formData.description.en ||
        !formData.mainImage || formData.latitude === undefined || formData.longitude === undefined) {
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
        province_id: formData.provinceId || undefined,
        city_id: formData.cityId || undefined,
        name_ar: formData.name.ar,
        name_en: formData.name.en,
        name_fr: formData.name.fr || formData.name.ar,
        description_ar: formData.description.ar,
        description_en: formData.description.en,
        description_fr: formData.description.fr || formData.description.ar,
        main_image: formData.mainImage,
        gallery: formData.gallery,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address_ar: formData.address.ar || undefined,
        address_en: formData.address.en || undefined,
        address_fr: formData.address.fr || undefined,
        category: formData.category || undefined,
        rating: formData.rating || 4.5,
        reviews: formData.reviews || 0,
        best_time_ar: formData.bestTime.ar || undefined,
        best_time_en: formData.bestTime.en || undefined,
        best_time_fr: formData.bestTime.fr || undefined,
        duration_ar: formData.duration.ar || undefined,
        duration_en: formData.duration.en || undefined,
        duration_fr: formData.duration.fr || undefined,
        highlights_ar: formData.highlights.ar,
        highlights_en: formData.highlights.en,
        highlights_fr: formData.highlights.fr,
        attractions_ar: formData.attractions.ar,
        attractions_en: formData.attractions.en,
        attractions_fr: formData.attractions.fr,
        entry_fee: formData.entryFee || undefined,
        currency: formData.currency || 'USD',
        opening_hours_ar: formData.openingHours.ar || undefined,
        opening_hours_en: formData.openingHours.en || undefined,
        opening_hours_fr: formData.openingHours.fr || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
        website: formData.website || undefined,
        status: formData.status,
        is_active: formData.isActive,
      };

      const url = editingDestination ? `/api/destinations/${editingDestination.id}` : '/api/destinations';
      const method = editingDestination ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save destination');
        return;
      }

      setSuccess(getLocalizedText('تم حفظ الوجهة بنجاح', 'Destination saved successfully', 'Destination enregistrée avec succès'));
      await loadDestinations();
      resetForm();
    } catch (err: any) {
      console.error('Error saving destination:', err);
      setError(err.message || 'Failed to save destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!editingDestination) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/destinations/${editingDestination.id}/submit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم إرسال الوجهة للمراجعة', 'Destination submitted for review', 'Destination soumise pour révision'));
        await loadDestinations();
        resetForm();
      } else {
        setError(data.error || 'Failed to submit destination');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!editingDestination) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/destinations/${editingDestination.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم الموافقة على الوجهة ونشرها', 'Destination approved and published', 'Destination approuvée et publiée'));
        await loadDestinations();
        resetForm();
      } else {
        setError(data.error || 'Failed to approve destination');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!editingDestination) return;
    const reason = window.prompt(getLocalizedText('أدخل سبب الرفض', 'Enter rejection reason', 'Entrez la raison du rejet'));
    if (!reason) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/destinations/${editingDestination.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم رفض الوجهة', 'Destination rejected', 'Destination rejetée'));
        await loadDestinations();
        resetForm();
      } else {
        setError(data.error || 'Failed to reject destination');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject destination');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (destination: ApiDestination) => {
    if (!window.confirm(getLocalizedText('هل أنت متأكد من حذف هذه الوجهة؟', 'Are you sure you want to delete this destination?', 'Êtes-vous sûr de vouloir supprimer cette destination ?'))) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/destinations/${destination.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to delete destination');
        return;
      }

      setSuccess(getLocalizedText('تم حذف الوجهة بنجاح', 'Destination deleted successfully', 'Destination supprimée avec succès'));
      await loadDestinations();
    } catch (err: any) {
      console.error('Error deleting destination:', err);
      setError(err.message || 'Failed to delete destination');
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

  const addArrayItem = (field: string, lang: string) => {
    const input = prompt(`Add new item (${lang}):`);
    if (input && input.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: [...prev[field][lang], input.trim()]
        }
      }));
    }
  };

  const removeArrayItem = (field: string, lang: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: prev[field][lang].filter((_, i) => i !== index)
      }
    }));
  };

  const filteredDestinations = destinations.filter((destination) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      destination.name_ar.toLowerCase().includes(q) ||
      destination.name_en.toLowerCase().includes(q) ||
      destination.name_fr.toLowerCase().includes(q)
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

  const getStatusBadge = (status: string) => {
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
            <MapPin className="h-6 w-6 text-tarhal-orange" />
            {text.title}
          </h2>
          <p className="text-gray-600 mt-1">{text.description}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {destinations.length} {getLocalizedText('وجهة', 'destinations', 'destinations')}
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
            {getLocalizedText('تصفية الوجهات', 'Filter Destinations', 'Filtrer les Destinations')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{text.selectCountry}</Label>
              <select
                value={selectedCountryId}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value);
                  setSelectedProvinceId('');
                  setSelectedCityId('');
                }}
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
              <Label>{text.selectProvince}</Label>
              <select
                value={selectedProvinceId}
                onChange={(e) => setSelectedProvinceId(e.target.value)}
                disabled={!selectedCountryId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{getLocalizedText('الكل', 'All', 'Tous')}</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {language === 'en' ? province.name_en : language === 'fr' ? province.name_fr : province.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>{text.selectCity}</Label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                disabled={!selectedCountryId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{getLocalizedText('الكل', 'All', 'Tous')}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {language === 'en' ? city.name_en : language === 'fr' ? city.name_fr : city.name_ar}
                  </option>
                ))}
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
                placeholder={getLocalizedText('البحث في الوجهات...', 'Search destinations...', 'Rechercher des destinations...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setIsAdding(true);
                setEditingDestination(null);
                setFormData(prev => ({
                  ...prev,
                  countryId: selectedCountryId || prev.countryId,
                  provinceId: selectedProvinceId || prev.provinceId,
                  cityId: selectedCityId || prev.cityId,
                }));
              }}
              disabled={!selectedCountryId}
              className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {text.addDestination}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCountryId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Destinations List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-tarhal-orange" />
                {getLocalizedText('قائمة الوجهات', 'Destinations List', 'Liste des Destinations')}
              </h3>
              <Badge variant="outline">
                {filteredDestinations.length}{' '}
                {getLocalizedText('وجهة', 'destinations', 'destinations')}
              </Badge>
            </div>
            {filteredDestinations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {getLocalizedText('لا توجد وجهات', 'No destinations found', 'Aucune destination trouvée')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDestinations.map((destination) => (
                  <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <img
                        src={destination.main_image}
                        alt={destination.name_ar}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(destination.status)}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <div className="flex items-center gap-1 text-yellow-300 text-sm">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{destination.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900">
                        {language === 'en'
                          ? destination.name_en
                          : language === 'fr'
                          ? destination.name_fr
                          : destination.name_ar}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {language === 'en'
                          ? destination.description_en
                          : language === 'fr'
                          ? destination.description_fr
                          : destination.description_ar}
                      </p>
                      {destination.category && (
                        <Badge variant="outline" className="text-xs">
                          {destination.category}
                        </Badge>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(destination)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(destination)}
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
                    {editingDestination ? text.editDestination : text.addDestination}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">{getLocalizedText('أساسي', 'Basic', 'De Base')}</TabsTrigger>
                        <TabsTrigger value="location">{text.location}</TabsTrigger>
                        <TabsTrigger value="details">{getLocalizedText('تفاصيل', 'Details', 'Détails')}</TabsTrigger>
                      </TabsList>

                      {/* Basic Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.destinationName} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="name-ar">{text.arabic}</Label>
                              <Input
                                id="name-ar"
                                value={formData.name.ar}
                                onChange={(e) => handleInputChange('name', e.target.value, 'ar')}
                                placeholder="اسم الوجهة بالعربية"
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
                                placeholder="Destination name in English"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="name-fr">{text.french}</Label>
                              <Input
                                id="name-fr"
                                value={formData.name.fr}
                                onChange={(e) => handleInputChange('name', e.target.value, 'fr')}
                                placeholder="Nom de la destination en français"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.description} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="desc-ar">{text.arabic}</Label>
                              <Textarea
                                id="desc-ar"
                                value={formData.description.ar}
                                onChange={(e) => handleInputChange('description', e.target.value, 'ar')}
                                placeholder="وصف الوجهة بالعربية"
                                dir="rtl"
                                rows={3}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="desc-en">{text.english}</Label>
                              <Textarea
                                id="desc-en"
                                value={formData.description.en}
                                onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                                placeholder="Destination description in English"
                                rows={3}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="desc-fr">{text.french}</Label>
                              <Textarea
                                id="desc-fr"
                                value={formData.description.fr}
                                onChange={(e) => handleInputChange('description', e.target.value, 'fr')}
                                placeholder="Description de la destination en français"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="main-image" className="text-base font-medium">
                            {text.mainImage} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <div className="flex space-x-2">
                            <Camera className="w-5 h-5 text-gray-400 mt-2" />
                            <Input
                              id="main-image"
                              value={formData.mainImage}
                              onChange={(e) => handleInputChange('mainImage', e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              required
                            />
                          </div>
                          {formData.mainImage && (
                            <div className="mt-2">
                              <img 
                                src={formData.mainImage} 
                                alt="Preview" 
                                className="w-32 h-24 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">
                            {text.category} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            placeholder="e.g., beach, mountain, historical"
                          />
                        </div>
                      </TabsContent>

                      {/* Location Tab */}
                      <TabsContent value="location" className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.coordinates} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <p className="text-sm text-gray-500">
                            {getLocalizedText('انقر على الخريطة لاختيار الموقع', 'Click on the map to select location', 'Cliquez sur la carte pour sélectionner l\'emplacement')}
                          </p>
                          <MapPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationChange={(lat, lng) => {
                              handleInputChange('latitude', lat);
                              handleInputChange('longitude', lng);
                            }}
                            height="400px"
                            className="border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="latitude">{text.latitude}</Label>
                            <Input
                              id="latitude"
                              type="number"
                              step="any"
                              value={formData.latitude}
                              onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude">{text.longitude}</Label>
                            <Input
                              id="longitude"
                              type="number"
                              step="any"
                              value={formData.longitude}
                              onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {getLocalizedText('العنوان', 'Address', 'Adresse')} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="address-ar">{text.arabic}</Label>
                              <Input
                                id="address-ar"
                                value={formData.address.ar}
                                onChange={(e) => handleInputChange('address', e.target.value, 'ar')}
                                placeholder="العنوان بالعربية"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address-en">{text.english}</Label>
                              <Input
                                id="address-en"
                                value={formData.address.en}
                                onChange={(e) => handleInputChange('address', e.target.value, 'en')}
                                placeholder="Address in English"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address-fr">{text.french}</Label>
                              <Input
                                id="address-fr"
                                value={formData.address.fr}
                                onChange={(e) => handleInputChange('address', e.target.value, 'fr')}
                                placeholder="Adresse en français"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Details Tab */}
                      <TabsContent value="details" className="space-y-4">
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
                          <Label>{text.bestTime}</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <Input
                              value={formData.bestTime.ar}
                              onChange={(e) => handleInputChange('bestTime', e.target.value, 'ar')}
                              placeholder="أفضل وقت للزيارة"
                              dir="rtl"
                            />
                            <Input
                              value={formData.bestTime.en}
                              onChange={(e) => handleInputChange('bestTime', e.target.value, 'en')}
                              placeholder="Best time to visit"
                            />
                            <Input
                              value={formData.bestTime.fr}
                              onChange={(e) => handleInputChange('bestTime', e.target.value, 'fr')}
                              placeholder="Meilleur moment pour visiter"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{text.duration}</Label>
                          <div className="grid grid-cols-1 gap-3">
                            <Input
                              value={formData.duration.ar}
                              onChange={(e) => handleInputChange('duration', e.target.value, 'ar')}
                              placeholder="المدة المقترحة"
                              dir="rtl"
                            />
                            <Input
                              value={formData.duration.en}
                              onChange={(e) => handleInputChange('duration', e.target.value, 'en')}
                              placeholder="Suggested duration"
                            />
                            <Input
                              value={formData.duration.fr}
                              onChange={(e) => handleInputChange('duration', e.target.value, 'fr')}
                              placeholder="Durée suggérée"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="entry-fee">{text.entryFee}</Label>
                            <Input
                              id="entry-fee"
                              type="number"
                              step="0.01"
                              value={formData.entryFee || ''}
                              onChange={(e) => handleInputChange('entryFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="currency">{getLocalizedText('العملة', 'Currency', 'Devise')}</Label>
                            <Input
                              id="currency"
                              value={formData.currency}
                              onChange={(e) => handleInputChange('currency', e.target.value)}
                              placeholder="USD"
                            />
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
                      {editingDestination && editingDestination.status === 'draft' && (
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
                      {editingDestination && editingDestination.status === 'pending_review' && (
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
      )}
    </div>
  );
};

export default AdminDestinationManagement;

