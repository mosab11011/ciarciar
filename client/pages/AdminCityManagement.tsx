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
import { MapPin, Plus, Edit, Trash2, Search, Star, Globe, Camera, Clock, Calendar, Save, Filter, ArrowUpDown, TrendingUp, Eye, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountryOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ApiCity {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  image: string;
  attractions_ar?: string[];
  attractions_en?: string[];
  attractions_fr?: string[];
  best_time_ar: string;
  best_time_en: string;
  best_time_fr: string;
  duration_ar: string;
  duration_en: string;
  duration_fr: string;
  rating: number;
  reviews: number;
  is_active: boolean;
}

interface CityFormData {
  countryId: string;
  name: { ar: string; en: string; fr: string };
  description: { ar: string; en: string; fr: string };
  image: string;
  attractions: { ar: string[]; en: string[]; fr: string[] };
  bestTime: { ar: string; en: string; fr: string };
  duration: { ar: string; en: string; fr: string };
  rating: number;
  reviews: number;
  highlights: { ar: string[]; en: string[]; fr: string[] };
  gallery: string[];
  isActive: boolean;
}

const AdminCityManagement: React.FC = () => {
  const { language } = useLanguage();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCity, setEditingCity] = useState<ApiCity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<CityFormData>({
    countryId: '',
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    image: '',
    attractions: { ar: [], en: [], fr: [] },
    bestTime: { ar: '', en: '', fr: '' },
    duration: { ar: '', en: '', fr: '' },
    rating: 4.5,
    reviews: 0,
    highlights: { ar: [], en: [], fr: [] },
    gallery: [],
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
    title: getLocalizedText('إدارة المدن السياحية', 'Tourist Cities Management', 'Gestion des Villes Touristiques'),
    description: getLocalizedText(
      'قم بإدارة المدن السياحية في جميع الدول: إضافة، تعديل، وحذف مدن مع تفاصيل كاملة.',
      'Manage tourist cities across all countries: add, edit, and delete cities with full details.',
      'Gérez les villes touristiques dans tous les pays : ajouter, modifier et supprimer des villes avec tous les détails.'
    ),
    selectCountry: getLocalizedText('اختر دولة لعرض مدنها', 'Select a country to view its cities', 'Sélectionnez un pays pour voir ses villes'),
    addCity: getLocalizedText('إضافة مدينة جديدة', 'Add New City', 'Ajouter une Nouvelle Ville'),
    editCity: getLocalizedText('تعديل المدينة', 'Edit City', 'Modifier la Ville'),
    cityNameAr: getLocalizedText('اسم المدينة (عربي)', 'City Name (Arabic)', 'Nom de la Ville (Arabe)'),
    cityNameEn: getLocalizedText('اسم المدينة (إنجليزي)', 'City Name (English)', 'Nom de la Ville (Anglais)'),
    cityNameFr: getLocalizedText('اسم المدينة (فرنسي)', 'City Name (French)', 'Nom de la Ville (Français)'),
    descriptionAr: getLocalizedText('الوصف (عربي)', 'Description (Arabic)', 'Description (Arabe)'),
    descriptionEn: getLocalizedText('الوصف (إنجليزي)', 'Description (English)', 'Description (Anglais)'),
    descriptionFr: getLocalizedText('الوصف (فرنسي)', 'Description (French)', 'Description (Français)'),
    imageUrl: getLocalizedText('رابط الصورة الرئيسية', 'Main Image URL', 'URL de l\'Image Principale'),
    bestTimeAr: getLocalizedText('أفضل وقت للزيارة (عربي)', 'Best Time to Visit (Arabic)', 'Meilleur Moment pour Visiter (Arabe)'),
    bestTimeEn: getLocalizedText('أفضل وقت للزيارة (إنجليزي)', 'Best Time to Visit (English)', 'Meilleur Moment pour Visiter (Anglais)'),
    bestTimeFr: getLocalizedText('أفضل وقت للزيارة (فرنسي)', 'Best Time to Visit (French)', 'Meilleur Moment pour Visiter (Français)'),
    durationAr: getLocalizedText('المدة المقترحة (عربي)', 'Suggested Duration (Arabic)', 'Durée Suggérée (Arabe)'),
    durationEn: getLocalizedText('المدة المقترحة (إنجليزي)', 'Suggested Duration (English)', 'Durée Suggérée (Anglais)'),
    durationFr: getLocalizedText('المدة المقترحة (فرنسي)', 'Suggested Duration (French)', 'Durée Suggérée (Français)'),
    rating: getLocalizedText('التقييم', 'Rating', 'Évaluation'),
    reviews: getLocalizedText('عدد المراجعات', 'Number of Reviews', 'Nombre d\'Avis'),
    isActive: getLocalizedText('المدينة نشطة', 'City is Active', 'Ville Active'),
    save: getLocalizedText('حفظ', 'Save', 'Enregistrer'),
    cancel: getLocalizedText('إلغاء', 'Cancel', 'Annuler'),
    noCities: getLocalizedText('لا توجد مدن مضافة لهذه الدولة بعد.', 'No cities added for this country yet.', 'Aucune ville ajoutée pour ce pays pour le moment.'),
    searchPlaceholder: getLocalizedText('البحث في المدن...', 'Search cities...', 'Rechercher des villes...'),
    citySaved: getLocalizedText('تم حفظ بيانات المدينة بنجاح', 'City saved successfully', 'Ville enregistrée avec succès'),
    cityDeleted: getLocalizedText('تم حذف المدينة بنجاح', 'City deleted successfully', 'Ville supprimée avec succès'),
    basicInfo: getLocalizedText('المعلومات الأساسية', 'Basic Information', 'Informations de Base'),
    mediaGallery: getLocalizedText('معرض الصور', 'Media Gallery', 'Galerie Média'),
    attractions: getLocalizedText('المعالم السياحية', 'Tourist Attractions', 'Attractions Touristiques'),
    details: getLocalizedText('التفاصيل', 'Details', 'Détails'),
    mainImage: getLocalizedText('الصورة الرئيسية', 'Main Image', 'Image Principale'),
    addHighlight: getLocalizedText('إضافة نقطة مميزة', 'Add Highlight', 'Ajouter un Point Fort'),
    addAttraction: getLocalizedText('إضافة معلم سياحي', 'Add Attraction', 'Ajouter une Attraction'),
    addGalleryImage: getLocalizedText('إضافة صورة للمعرض', 'Add Gallery Image', 'Ajouter Image Galerie'),
    highlights: getLocalizedText('النقاط المميزة', 'Highlights', 'Points Forts'),
    arabic: getLocalizedText('العربية', 'Arabic', 'Arabe'),
    english: getLocalizedText('الإنجليزية', 'English', 'Anglais'),
    french: getLocalizedText('الفرنسية', 'French', 'Français'),
    required: getLocalizedText('مطلوب', 'Required', 'Requis'),
    optional: getLocalizedText('اختياري', 'Optional', 'Optionnel'),
    fillRequired: getLocalizedText('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields', 'Veuillez remplir tous les champs requis'),
    invalidRating: getLocalizedText('التقييم يجب أن يكون بين 0 و 5', 'Rating must be between 0 and 5', 'L\'évaluation doit être entre 0 et 5'),
    invalidReviews: getLocalizedText('عدد المراجعات يجب أن يكون رقماً صحيحاً', 'Number of reviews must be a valid number', 'Le nombre d\'avis doit être un nombre valide'),
    cityName: getLocalizedText('اسم المدينة', 'City Name', 'Nom de la Ville'),
    descriptionLabel: getLocalizedText('الوصف', 'Description', 'Description'),
    bestTime: getLocalizedText('أفضل وقت للزيارة', 'Best Time to Visit', 'Meilleur Moment pour Visiter'),
    duration: getLocalizedText('المدة المقترحة', 'Suggested Duration', 'Durée Suggérée'),
  };

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || '',
      name: { ar: '', en: '', fr: '' },
      description: { ar: '', en: '', fr: '' },
      image: '',
      attractions: { ar: [], en: [], fr: [] },
      bestTime: { ar: '', en: '', fr: '' },
      duration: { ar: '', en: '', fr: '' },
      rating: 4.5,
      reviews: 0,
      highlights: { ar: [], en: [], fr: [] },
      gallery: [],
      isActive: true,
    });
    setEditingCity(null);
    setIsAdding(false);
    setError('');
  };

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch all countries (both active and inactive) by explicitly setting active=false
      const res = await fetch('/api/countries?active=false');
      console.log('Countries API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Countries API response:', data);
      console.log('Response success:', data.success);
      console.log('Response data type:', typeof data.data);
      console.log('Response data is array:', Array.isArray(data.data));
      
      if (data.success) {
        const countriesData = Array.isArray(data.data) ? data.data : [];
        console.log('Loaded countries count:', countriesData.length);
        
        if (countriesData.length > 0) {
          // Filter to only show countries that have at least one name
          const validCountries = countriesData.filter((c: any) => 
            (c.name_ar && c.name_ar.trim() !== '') || 
            (c.name_en && c.name_en.trim() !== '') || 
            (c.name_fr && c.name_fr.trim() !== '')
          );
          
          console.log('First country sample:', validCountries[0]);
          console.log(`Setting countries state with ${validCountries.length} valid countries (from ${countriesData.length} total)`);
          setCountries(validCountries);
          setError(''); // Clear any previous errors
          console.log('Countries state should be updated now');
        } else {
          console.warn('No countries returned from API');
          // Try without active parameter as fallback
          const res2 = await fetch('/api/countries');
          const data2 = await res2.json();
          if (data2.success && Array.isArray(data2.data) && data2.data.length > 0) {
            // Filter to only show countries that have at least one name
            const validCountries = data2.data.filter((c: any) => 
              (c.name_ar && c.name_ar.trim() !== '') || 
              (c.name_en && c.name_en.trim() !== '') || 
              (c.name_fr && c.name_fr.trim() !== '')
            );
            console.log(`Loaded ${validCountries.length} valid countries from fallback (from ${data2.data.length} total)`);
            setCountries(validCountries);
            setError('');
          } else {
            setError(getLocalizedText('لا توجد دول متاحة', 'No countries available', 'Aucun pays disponible'));
          }
        }
      } else {
        console.error('API returned error:', data.error);
        setError(data.error || 'Failed to load countries');
      }
    } catch (err: any) {
      console.error('Error loading countries:', err);
      setError(err.message || 'Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = async (countryId: string) => {
    if (!countryId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/cities?country_id=${encodeURIComponent(countryId)}&active=false`);
      const data = await res.json();
      if (data.success) {
        setCities(data.data || []);
      } else {
        setError(data.error || 'Failed to load cities');
      }
    } catch (err: any) {
      console.error('Error loading cities:', err);
      setError(err.message || 'Failed to load cities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, loading countries...');
    loadCountries();
  }, []);
  
  // Reload countries when form is opened
  useEffect(() => {
    if (isAdding && countries.length === 0) {
      console.log('Form opened but no countries, reloading...');
      loadCountries();
    }
  }, [isAdding]);
  
  // Debug: Log countries state changes
  useEffect(() => {
    console.log('Countries state updated:', {
      count: countries.length,
      isLoading,
      sample: countries.slice(0, 3).map(c => ({ 
        id: c.id, 
        name_ar: c.name_ar, 
        name_en: c.name_en,
        name_fr: c.name_fr 
      }))
    });
  }, [countries, isLoading]);

  useEffect(() => {
    if (selectedCountryId) {
      loadCities(selectedCountryId);
      resetForm();
    } else {
      setCities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  const handleEdit = (city: ApiCity) => {
    setEditingCity(city);
    setIsAdding(true);
    setFormData({
      countryId: city.country_id,
      name: { ar: city.name_ar, en: city.name_en, fr: city.name_fr },
      description: { ar: city.description_ar, en: city.description_en, fr: city.description_fr },
      image: city.image,
      attractions: {
        ar: city.attractions_ar || [],
        en: city.attractions_en || [],
        fr: city.attractions_fr || [],
      },
      bestTime: {
        ar: city.best_time_ar,
        en: city.best_time_en,
        fr: city.best_time_fr,
      },
      duration: {
        ar: city.duration_ar,
        en: city.duration_en,
        fr: city.duration_fr,
      },
      rating: city.rating || 4.5,
      reviews: city.reviews || 0,
      highlights: { ar: [], en: [], fr: [] }, // Not in API schema yet
      gallery: [], // Not in API schema yet
      isActive: city.is_active,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.countryId || !formData.name.ar || !formData.name.en || 
        !formData.description.ar || !formData.description.en || !formData.image) {
      setError(text.fillRequired);
      return false;
    }
    if (formData.rating < 0 || formData.rating > 5) {
      setError(text.invalidRating);
      return false;
    }
    if (formData.reviews < 0 || !Number.isInteger(formData.reviews)) {
      setError(text.invalidReviews);
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
        name_en: formData.name.en || formData.name.ar,
        name_fr: formData.name.fr || formData.name.ar,
        description_ar: formData.description.ar,
        description_en: formData.description.en || formData.description.ar,
        description_fr: formData.description.fr || formData.description.ar,
        image: formData.image,
        attractions_ar: formData.attractions.ar || [],
        attractions_en: formData.attractions.en || [],
        attractions_fr: formData.attractions.fr || [],
        best_time_ar: formData.bestTime.ar,
        best_time_en: formData.bestTime.en || formData.bestTime.ar,
        best_time_fr: formData.bestTime.fr || formData.bestTime.ar,
        duration_ar: formData.duration.ar,
        duration_en: formData.duration.en || formData.duration.ar,
        duration_fr: formData.duration.fr || formData.duration.ar,
        rating: formData.rating || 4.5,
        reviews: formData.reviews || 0,
        is_active: formData.isActive,
      };

      const url = editingCity ? `/api/cities/${editingCity.id}` : '/api/cities';
      const method = editingCity ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save city');
        return;
      }

      setSuccess(text.citySaved);
      await loadCities(formData.countryId);
      resetForm();
    } catch (err: any) {
      console.error('Error saving city:', err);
      setError(err.message || 'Failed to save city');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (city: ApiCity) => {
    if (!window.confirm(getLocalizedText('هل أنت متأكد من حذف هذه المدينة؟', 'Are you sure you want to delete this city?', 'Êtes-vous sûr de vouloir supprimer cette ville ?'))) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/cities/${city.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to delete city');
        return;
      }

      setSuccess(text.cityDeleted);
      await loadCities(selectedCountryId);
    } catch (err: any) {
      console.error('Error deleting city:', err);
      setError(err.message || 'Failed to delete city');
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

  const filteredCities = cities
    .filter((city) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          city.name_ar.toLowerCase().includes(q) ||
          city.name_en.toLowerCase().includes(q) ||
          city.name_fr.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Active/Inactive filter
      if (filterActive === 'active' && !city.is_active) return false;
      if (filterActive === 'inactive' && city.is_active) return false;

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = language === 'en' ? a.name_en : language === 'fr' ? a.name_fr : a.name_ar;
          const nameB = language === 'en' ? b.name_en : language === 'fr' ? b.name_fr : b.name_ar;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'reviews':
          comparison = a.reviews - b.reviews;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate statistics
  const stats = {
    totalCities: cities.length,
    activeCities: cities.filter(c => c.is_active).length,
    inactiveCities: cities.filter(c => !c.is_active).length,
    averageRating: cities.length > 0 
      ? (cities.reduce((sum, c) => sum + c.rating, 0) / cities.length).toFixed(1)
      : '0.0',
    totalReviews: cities.reduce((sum, c) => sum + c.reviews, 0),
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId);
    if (!country) {
      console.warn('Country not found:', countryId);
      return countryId;
    }
    switch (language) {
      case 'en':
        return country.name_en || country.name_ar || countryId;
      case 'fr':
        return country.name_fr || country.name_ar || countryId;
      case 'ar':
      default:
        return country.name_ar || country.name_en || countryId;
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
          {isLoading ? (
            getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')
          ) : (
            <>
              {countries.length} {getLocalizedText('دولة', 'countries', 'pays')}
            </>
          )}
        </Badge>
      </div>

      {error && countries.length === 0 && (
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
            {text.selectCountry}
          </CardTitle>
          <CardDescription>
            {getLocalizedText(
              'اختر دولة أولاً ثم قم بإدارة المدن التابعة لها.',
              'Select a country first, then manage its cities.',
              'Sélectionnez d’abord un pays, puis gérez ses villes.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <select
                value={selectedCountryId}
                onChange={(e) => {
                  console.log('Country selected:', e.target.value);
                  setSelectedCountryId(e.target.value);
                }}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-tarhal-orange focus:border-transparent"
              >
                <option value="">
                  {isLoading 
                    ? getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')
                    : getLocalizedText('اختر دولة', 'Select country', 'Sélectionnez un pays')
                  }
                </option>
                {countries.length > 0 && (
                  <>
                    {console.log('Rendering', countries.length, 'countries in select dropdown')}
                    {countries.map((country) => {
                      const countryName = getCountryName(country.id);
                      console.log('Country option:', country.id, countryName, country);
                      return (
                        <option key={country.id} value={country.id}>
                          {countryName || country.name_ar || country.name_en || country.id}
                        </option>
                      );
                    })}
                  </>
                )}
                {!isLoading && countries.length === 0 && (
                  <option value="" disabled>
                    {getLocalizedText('لا توجد دول متاحة', 'No countries available', 'Aucun pays disponible')}
                  </option>
                )}
              </select>
              {countries.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {getLocalizedText(
                    `${countries.length} دولة متاحة`,
                    `${countries.length} countries available`,
                    `${countries.length} pays disponibles`
                  )}
                </p>
              )}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={text.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => {
                  setIsAdding(true);
                  setEditingCity(null);
                  // Reload countries if empty
                  if (countries.length === 0) {
                    loadCountries();
                  }
                  setFormData((prev) => ({
                    ...prev,
                    countryId: selectedCountryId || prev.countryId,
                  }));
                }}
                className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {text.addCity}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCountryId && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {getLocalizedText('إجمالي المدن', 'Total Cities', 'Total des Villes')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCities}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {getLocalizedText('المدن النشطة', 'Active Cities', 'Villes Actives')}
                    </p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeCities}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {getLocalizedText('متوسط التقييم', 'Avg Rating', 'Note Moyenne')}
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600 fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {getLocalizedText('إجمالي المراجعات', 'Total Reviews', 'Total Avis')}
                    </p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalReviews}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cities List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-tarhal-orange" />
                    {getLocalizedText('قائمة المدن', 'Cities List', 'Liste des Villes')}
                  </h3>
                  <Badge variant="outline">
                    {filteredCities.length}{' '}
                    {getLocalizedText('مدينة', 'cities', 'villes')}
                  </Badge>
                </div>
                
                {/* Filters and Sort */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="all">
                        {getLocalizedText('الكل', 'All', 'Tous')}
                      </option>
                      <option value="active">
                        {getLocalizedText('نشطة فقط', 'Active Only', 'Actives Seulement')}
                      </option>
                      <option value="inactive">
                        {getLocalizedText('غير نشطة', 'Inactive', 'Inactives')}
                      </option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'reviews')}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="name">
                        {getLocalizedText('الاسم', 'Name', 'Nom')}
                      </option>
                      <option value="rating">
                        {getLocalizedText('التقييم', 'Rating', 'Note')}
                      </option>
                      <option value="reviews">
                        {getLocalizedText('المراجعات', 'Reviews', 'Avis')}
                      </option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            {filteredCities.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {text.noCities}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCities.map((city) => (
                  <Card key={city.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 group">
                      <img
                        src={city.image}
                        alt={city.name_ar}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute top-2 right-2">
                        {city.is_active ? (
                          <Badge className="bg-green-500 text-white">
                            {getLocalizedText('نشطة', 'Active', 'Active')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500 text-white border-white">
                            {getLocalizedText('غير نشطة', 'Inactive', 'Inactive')}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-300">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-semibold text-sm">{city.rating.toFixed(1)}</span>
                            <span className="text-gray-200 text-xs">
                              ({city.reviews})
                            </span>
                          </div>
                          {city.best_time_ar && (
                            <div className="flex items-center gap-1 text-white text-xs bg-black/30 px-2 py-1 rounded">
                              <Calendar className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {language === 'en' ? city.best_time_en : language === 'fr' ? city.best_time_fr : city.best_time_ar}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">
                          {language === 'en'
                            ? city.name_en
                            : language === 'fr'
                            ? city.name_fr
                            : city.name_ar}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {getCountryName(city.country_id)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                        {language === 'en'
                          ? city.description_en
                          : language === 'fr'
                          ? city.description_fr
                          : city.description_ar}
                      </p>
                      {city.duration_ar && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {language === 'en' ? city.duration_en : language === 'fr' ? city.duration_fr : city.duration_ar}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(city)}
                          className="flex-1 sm:flex-initial"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-initial"
                          onClick={() => handleDelete(city)}
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
                    {editingCity ? text.editCity : text.addCity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">{text.basicInfo}</TabsTrigger>
                        <TabsTrigger value="attractions">{text.attractions}</TabsTrigger>
                        <TabsTrigger value="details">{text.details}</TabsTrigger>
                        <TabsTrigger value="media">{text.mediaGallery}</TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>{text.basicInfo}</CardTitle>
                            <CardDescription>
                              Basic information about the city
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Country Selection */}
                            <div className="space-y-2">
                              <Label className="text-base font-medium">
                                {getLocalizedText('الدولة', 'Country', 'Pays')} <Badge variant="destructive">{text.required}</Badge>
                              </Label>
                              <select
                                value={formData.countryId}
                                onChange={(e) => handleInputChange('countryId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-tarhal-orange focus:border-transparent"
                                required
                              >
                                <option value="">
                                  {isLoading 
                                    ? getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')
                                    : getLocalizedText('اختر دولة', 'Select country', 'Sélectionnez un pays')
                                  }
                                </option>
                                {countries.length > 0 && (
                                  countries.map((country) => {
                                    const countryName = getCountryName(country.id);
                                    return (
                                      <option key={country.id} value={country.id}>
                                        {countryName || country.name_ar || country.name_en || country.id}
                                      </option>
                                    );
                                  })
                                )}
                                {!isLoading && countries.length === 0 && (
                                  <option value="" disabled>
                                    {getLocalizedText('لا توجد دول متاحة', 'No countries available', 'Aucun pays disponible')}
                                  </option>
                                )}
                              </select>
                              {!isLoading && countries.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">
                                  {getLocalizedText('لا توجد دول متاحة. يرجى التحقق من الاتصال بالخادم.', 'No countries available. Please check server connection.', 'Aucun pays disponible. Veuillez vérifier la connexion au serveur.')}
                                </p>
                              )}
                            </div>

                            {/* City Name */}
                            <div className="space-y-4">
                              <Label className="text-base font-medium">
                                {getLocalizedText('اسم المدينة', 'City Name', 'Nom de la Ville')} <Badge variant="destructive">{text.required}</Badge>
                              </Label>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="name-ar">{text.arabic}</Label>
                                  <Input
                                    id="name-ar"
                                    value={formData.name.ar}
                                    onChange={(e) => handleInputChange('name', e.target.value, 'ar')}
                                    placeholder="اسم المدينة بالعربية"
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
                                    placeholder="City name in English"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="name-fr">{text.french}</Label>
                                  <Input
                                    id="name-fr"
                                    value={formData.name.fr}
                                    onChange={(e) => handleInputChange('name', e.target.value, 'fr')}
                                    placeholder="Nom de la ville en français"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                              <Label className="text-base font-medium">
                                {text.descriptionLabel} <Badge variant="destructive">{text.required}</Badge>
                              </Label>
                              
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="desc-ar">{text.arabic}</Label>
                                  <Textarea
                                    id="desc-ar"
                                    value={formData.description.ar}
                                    onChange={(e) => handleInputChange('description', e.target.value, 'ar')}
                                    placeholder="وصف المدينة بالعربية"
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
                                    placeholder="City description in English"
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
                                    placeholder="Description de la ville en français"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Main Image */}
                            <div className="space-y-2">
                              <Label htmlFor="main-image" className="text-base font-medium">
                                {text.mainImage} <Badge variant="destructive">{text.required}</Badge>
                              </Label>
                              <div className="flex space-x-2">
                                <Camera className="w-5 h-5 text-gray-400 mt-2" />
                                <Input
                                  id="main-image"
                                  value={formData.image}
                                  onChange={(e) => handleInputChange('image', e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  required
                                />
                              </div>
                              {formData.image && (
                                <div className="mt-2">
                                  <img 
                                    src={formData.image} 
                                    alt="Preview" 
                                    className="w-32 h-24 object-cover rounded-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Tourist Attractions Tab */}
                      <TabsContent value="attractions" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>{text.attractions}</CardTitle>
                            <CardDescription>
                              Tourist attractions and points of interest
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {['ar', 'en', 'fr'].map((lang) => (
                              <div key={lang} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-base font-medium">
                                    {text[lang === 'ar' ? 'arabic' : lang === 'en' ? 'english' : 'french']}
                                  </Label>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addArrayItem('attractions', lang)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {text.addAttraction}
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {formData.attractions[lang].map((attraction, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <Input
                                        value={attraction}
                                        onChange={(e) => {
                                          const newAttractions = [...formData.attractions[lang]];
                                          newAttractions[index] = e.target.value;
                                          handleInputChange('attractions', {
                                            ...formData.attractions,
                                            [lang]: newAttractions
                                          });
                                        }}
                                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeArrayItem('attractions', lang, index)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Details Tab */}
                      <TabsContent value="details" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>{text.details}</CardTitle>
                            <CardDescription>
                              Additional details about the city
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Best Time to Visit */}
                            <div className="space-y-4">
                              <Label className="text-base font-medium flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {text.bestTime}
                              </Label>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="bestTime-ar">{text.arabic}</Label>
                                  <Input
                                    id="bestTime-ar"
                                    value={formData.bestTime.ar}
                                    onChange={(e) => handleInputChange('bestTime', e.target.value, 'ar')}
                                    placeholder="مثال: مارس - مايو"
                                    dir="rtl"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="bestTime-en">{text.english}</Label>
                                  <Input
                                    id="bestTime-en"
                                    value={formData.bestTime.en}
                                    onChange={(e) => handleInputChange('bestTime', e.target.value, 'en')}
                                    placeholder="e.g.: March - May"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="bestTime-fr">{text.french}</Label>
                                  <Input
                                    id="bestTime-fr"
                                    value={formData.bestTime.fr}
                                    onChange={(e) => handleInputChange('bestTime', e.target.value, 'fr')}
                                    placeholder="p.ex.: Mars - Mai"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-4">
                              <Label className="text-base font-medium flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {text.duration}
                              </Label>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="duration-ar">{text.arabic}</Label>
                                  <Input
                                    id="duration-ar"
                                    value={formData.duration.ar}
                                    onChange={(e) => handleInputChange('duration', e.target.value, 'ar')}
                                    placeholder="مثال: 2-3 أيام"
                                    dir="rtl"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="duration-en">{text.english}</Label>
                                  <Input
                                    id="duration-en"
                                    value={formData.duration.en}
                                    onChange={(e) => handleInputChange('duration', e.target.value, 'en')}
                                    placeholder="e.g.: 2-3 days"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="duration-fr">{text.french}</Label>
                                  <Input
                                    id="duration-fr"
                                    value={formData.duration.fr}
                                    onChange={(e) => handleInputChange('duration', e.target.value, 'fr')}
                                    placeholder="p.ex.: 2-3 jours"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Rating and Reviews */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="rating" className="flex items-center">
                                  <Star className="w-4 h-4 mr-2" />
                                  {text.rating}
                                </Label>
                                <Input
                                  id="rating"
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  value={formData.rating}
                                  onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                                  placeholder="4.5"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="reviews">{text.reviews}</Label>
                                <Input
                                  id="reviews"
                                  type="number"
                                  min="0"
                                  value={formData.reviews}
                                  onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                                  placeholder="100"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Media Gallery Tab */}
                      <TabsContent value="media" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>{text.mediaGallery}</CardTitle>
                            <CardDescription>
                              Image gallery for the city
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Gallery Images</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const url = prompt('Enter image URL:');
                                  if (url && url.trim()) {
                                    handleInputChange('gallery', [...formData.gallery, url.trim()]);
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {text.addGalleryImage}
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {formData.gallery.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={imageUrl}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      const newGallery = formData.gallery.filter((_, i) => i !== index);
                                      handleInputChange('gallery', newGallery);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        {text.cancel}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-[120px] bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
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
        </>
      )}
    </div>
  );
};

export default AdminCityManagement;


