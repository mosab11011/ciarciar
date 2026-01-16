import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Calendar, DollarSign, Globe, Star, Tag, Search, Filter, Clock, Users, MapPin, Upload, CheckCircle, AlertCircle, Eye, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TravelOffer {
  id: string;
  country_id: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  original_price: number;
  discount_price: number;
  discount_percentage: number;
  duration_days?: number;
  duration_text_ar?: string;
  duration_text_en?: string;
  duration_text_fr?: string;
  start_date?: string;
  end_date?: string;
  valid_until?: string;
  max_participants: number;
  includes_ar?: string[];
  includes_en?: string[];
  includes_fr?: string[];
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  images?: string[];
  main_image?: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Country {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

export default function TravelOffersManager() {
  const { language, t } = useLanguage();
  const [offers, setOffers] = useState<TravelOffer[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingOffer, setEditingOffer] = useState<TravelOffer | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all');
  const [viewingOffer, setViewingOffer] = useState<TravelOffer | null>(null);
  const [newInclude, setNewInclude] = useState({ ar: '', en: '', fr: '' });
  const [newHighlight, setNewHighlight] = useState({ ar: '', en: '', fr: '' });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seeding, setSeeding] = useState(false);
  const [stepSeeding, setStepSeeding] = useState(false);
  const [stepProgress, setStepProgress] = useState<{ current: number; total: number; hasMore: boolean; nextSkip: number | null } | null>(null);

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    switch (language) {
      case 'ar': return ar;
      case 'en': return en;
      case 'fr': return fr;
      default: return ar;
    }
  };

  useEffect(() => {
    loadOffers();
    loadCountries();
  }, []);

  // Reload countries when form is opened
  useEffect(() => {
    if (isAdding && countries.length === 0 && !loadingCountries) {
      console.log('Form opened but no countries, reloading...');
      loadCountries();
    }
  }, [isAdding]);

  // Debug: Log countries state changes
  useEffect(() => {
    console.log('Countries state updated:', {
      count: countries.length,
      loadingCountries,
      isAdding,
      sample: countries.slice(0, 3).map(c => ({ 
        id: c.id, 
        name_ar: c.name_ar, 
        name_en: c.name_en,
        name_fr: c.name_fr 
      }))
    });
  }, [countries, loadingCountries, isAdding]);

  const loadCountries = async () => {
    try {
      setLoadingCountries(true);
      
      // Try multiple endpoints to ensure we get countries
      let countriesData: Country[] = [];
      
      // First try: Get all countries (active and inactive)
      try {
        const res1 = await fetch('/api/countries?active=false');
        const contentType1 = res1.headers.get('content-type');
        if (res1.ok && contentType1 && contentType1.includes('application/json')) {
          const data1 = await res1.json();
          if (data1.success && Array.isArray(data1.data)) {
            countriesData = data1.data;
          }
        }
      } catch (e) {
        // Continue to next attempt
      }
      
      // Second try: Get all countries without active parameter
      if (countriesData.length === 0) {
        try {
          const res2 = await fetch('/api/countries');
          const contentType2 = res2.headers.get('content-type');
          if (res2.ok && contentType2 && contentType2.includes('application/json')) {
            const data2 = await res2.json();
            if (data2.success && Array.isArray(data2.data)) {
              countriesData = data2.data;
            }
          }
        } catch (e) {
          // Continue to next attempt
        }
      }
      
      // Third try: Get only active countries
      if (countriesData.length === 0) {
        try {
          const res3 = await fetch('/api/countries?active=true');
          const contentType3 = res3.headers.get('content-type');
          if (res3.ok && contentType3 && contentType3.includes('application/json')) {
            const data3 = await res3.json();
            if (data3.success && Array.isArray(data3.data)) {
              countriesData = data3.data;
            }
          }
        } catch (e) {
          // Continue even if all attempts fail
        }
      }
      
      // Filter to only show countries that have at least one name
      const validCountries = countriesData.filter((c: Country) => 
        (c.name_ar && c.name_ar.trim() !== '') || 
        (c.name_en && c.name_en.trim() !== '') || 
        (c.name_fr && c.name_fr.trim() !== '')
      );
      
      setCountries(validCountries);
    } catch (error) {
      // Set empty array if all attempts fail
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/travel-offers');
      const data = await response.json();
      if (data.success && data.data) {
        setOffers(data.data);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'country_id':
        return !value ? getLocalizedText('يجب اختيار الدولة', 'Please select a country', 'Veuillez sélectionner un pays') : '';
      case 'title_ar':
        return !value || value.trim() === '' ? getLocalizedText('العنوان بالعربية مطلوب', 'Arabic title is required', 'Le titre en arabe est requis') : '';
      case 'description_ar':
        return !value || value.trim() === '' ? getLocalizedText('الوصف بالعربية مطلوب', 'Arabic description is required', 'La description en arabe est requise') : '';
      case 'original_price':
        if (!value || value <= 0) return getLocalizedText('السعر الأصلي يجب أن يكون أكبر من الصفر', 'Original price must be greater than zero', 'Le prix original doit être supérieur à zéro');
        if (editingOffer?.discount_price && value <= editingOffer.discount_price) {
          return getLocalizedText('السعر الأصلي يجب أن يكون أكبر من سعر العرض', 'Original price must be greater than discount price', 'Le prix original doit être supérieur au prix réduit');
        }
        return '';
      case 'discount_price':
        if (!value || value <= 0) return getLocalizedText('سعر العرض يجب أن يكون أكبر من الصفر', 'Discount price must be greater than zero', 'Le prix réduit doit être supérieur à zéro');
        if (editingOffer?.original_price && value >= editingOffer.original_price) {
          return getLocalizedText('سعر العرض يجب أن يكون أقل من السعر الأصلي', 'Discount price must be less than original price', 'Le prix réduit doit être inférieur au prix original');
        }
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    if (editingOffer) {
      setEditingOffer({ ...editingOffer, [field]: value });
      // Clear error for this field when user starts typing
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
      // Validate price fields
      if (field === 'original_price' || field === 'discount_price') {
        const error = validateField(field, value);
        if (error) {
          setErrors({ ...errors, [field]: error });
        } else {
          const newErrors = { ...errors };
          delete newErrors[field];
          setErrors(newErrors);
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getLocalizedText('هل أنت متأكد من حذف هذا العرض؟', 'Are you sure you want to delete this offer?', 'Êtes-vous sûr de vouloir supprimer cette offre?'))) {
      return;
    }

    try {
      const response = await fetch(`/api/travel-offers/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        loadOffers();
        alert(getLocalizedText('تم حذف العرض بنجاح!', 'Offer deleted successfully!', 'Offre supprimée avec succès!'));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    const requiredFields = ['country_id', 'title_ar', 'description_ar', 'original_price', 'discount_price'];
    
    requiredFields.forEach(field => {
      const error = validateField(field, editingOffer[field as keyof TravelOffer]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert(getLocalizedText('يرجى تصحيح الأخطاء في النموذج', 'Please correct the errors in the form', 'Veuillez corriger les erreurs dans le formulaire'));
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      const method = editingOffer.id ? 'PUT' : 'POST';
      const url = editingOffer.id ? `/api/travel-offers/${editingOffer.id}` : '/api/travel-offers';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOffer)
      });

      const data = await response.json();
      if (data.success) {
        loadOffers();
        setIsAdding(false);
        setEditingOffer(null);
        resetForm();
        setErrors({});
        alert(getLocalizedText('تم حفظ العرض بنجاح!', 'Offer saved successfully!', 'Offre enregistrée avec succès!'));
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewInclude({ ar: '', en: '', fr: '' });
    setNewHighlight({ ar: '', en: '', fr: '' });
    setNewImageUrl('');
    setErrors({});
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (!country) return countryId;
    return country[`name_${language}` as keyof Country] || country.name_ar;
  };

  const handleSeedOffers = async () => {
    if (!confirm(getLocalizedText(
      'هل أنت متأكد من إضافة 10 عروض لكل دولة؟ قد يستغرق هذا بعض الوقت.',
      'Are you sure you want to add 10 offers for each country? This may take some time.',
      'Êtes-vous sûr de vouloir ajouter 10 offres pour chaque pays? Cela peut prendre un certain temps.'
    ))) {
      return;
    }

    try {
      setSeeding(true);
      const response = await fetch('/api/travel-offers/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        alert(getLocalizedText(
          `تم إضافة ${data.totalCreated} عرض بنجاح لـ ${data.totalCountries} دولة!`,
          `Successfully added ${data.totalCreated} offers for ${data.totalCountries} countries!`,
          `${data.totalCreated} offres ajoutées avec succès pour ${data.totalCountries} pays!`
        ));
        loadOffers();
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setSeeding(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (selectedCountry && offer.country_id !== selectedCountry) return false;
    if (filterActive === 'active' && !offer.is_active) return false;
    if (filterActive === 'inactive' && offer.is_active) return false;
    if (filterFeatured === 'featured' && !offer.is_featured) return false;
    if (filterFeatured === 'normal' && offer.is_featured) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = (offer[`title_${language}` as keyof TravelOffer] || offer.title_ar || '').toString().toLowerCase();
      const desc = (offer[`description_${language}` as keyof TravelOffer] || offer.description_ar || '').toString().toLowerCase();
      if (!title.includes(query) && !desc.includes(query)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Tag className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{getLocalizedText('العروض السياحية', 'Travel Offers', 'Offres de Voyage')}</h2>
              <p className="text-red-100 mt-1">{getLocalizedText('إدارة العروض السياحية المميزة', 'Manage travel offers and promotions', 'Gérer les offres et promotions de voyage')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  setSeeding(true);
                  
                  // Step 1: Delete countries without names (optional, don't fail if it errors)
                  try {
                    const deleteResponse = await fetch('/api/countries/seed', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (deleteResponse.ok) {
                      const deleteData = await deleteResponse.json();
                      console.log('Delete result:', deleteData);
                    }
                  } catch (deleteError) {
                    // Continue even if delete fails
                    console.log('Delete step skipped');
                  }
                  
                  // Step 2: Try to update countries without names (optional)
                  try {
                    const updateResponse = await fetch('/api/countries/seed/update-names', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (updateResponse.ok) {
                      const updateData = await updateResponse.json();
                      console.log('Update result:', updateData);
                    }
                  } catch (updateError) {
                    // Continue even if update fails
                    console.log('Update step skipped');
                  }
                  
                  // Step 3: Load all countries (main step)
                  const response = await fetch('/api/countries/seed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  // Check if response is OK and JSON
                  const contentType = response.headers.get('content-type');
                  if (!response.ok || !contentType || !contentType.includes('application/json')) {
                    // If API failed, still try to reload countries that might already exist
                    await loadCountries();
                    return;
                  }
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    alert(getLocalizedText(
                      `تم تحميل ${data.created || 0} دولة جديدة و تحديث ${data.updated || 0} دولة! (${data.skipped || 0} موجودة مسبقاً)`,
                      `Successfully loaded ${data.created || 0} new countries and updated ${data.updated || 0}! (${data.skipped || 0} already existed)`,
                      `${data.created || 0} nouveaux pays chargés et ${data.updated || 0} mis à jour! (${data.skipped || 0} déjà existants)`
                    ));
                  }
                  
                  // Always reload countries after seeding
                  await loadCountries();
                } catch (error: any) {
                  // Even if there's an error, try to reload existing countries
                  try {
                    await loadCountries();
                  } catch (reloadError) {
                    // Silent error handling
                  }
                } finally {
                  setSeeding(false);
                }
              }}
              disabled={seeding}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  {getLocalizedText('تحميل جميع الدول', 'Load All Countries', 'Charger Tous les Pays')}
                </>
              )}
            </Button>
            <Button
              onClick={async () => {
                try {
                  setStepSeeding(true);
                  const skip = stepProgress?.nextSkip ?? 0;
                  
                  const response = await fetch(`/api/countries/seed/step?skip=${skip}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const data = await response.json();
                  
                  if (data.success) {
                    setStepProgress({
                      current: data.currentSkip + 5,
                      total: data.totalCountries,
                      hasMore: data.hasMore,
                      nextSkip: data.nextSkip
                    });
                    
                    alert(getLocalizedText(
                      `✅ تم إضافة ${data.created} دول! التقدم: ${data.progress}${data.hasMore ? '\n\nاضغط مرة أخرى لإضافة 5 دول أخرى' : '\n\n🎉 تم إكمال جميع الدول الـ 31!'}`,
                      `✅ Added ${data.created} countries! Progress: ${data.progress}${data.hasMore ? '\n\nClick again to add 5 more countries' : '\n\n🎉 All 31 countries completed!'}`,
                      `✅ ${data.created} pays ajoutés! Progression: ${data.progress}${data.hasMore ? '\n\nCliquez à nouveau pour ajouter 5 pays de plus' : '\n\n🎉 Tous les 31 pays terminés!'}`
                    ));
                    
                    await loadCountries();
                    
                    // إذا لم يتبق المزيد، إعادة تعيين التقدم
                    if (!data.hasMore) {
                      setStepProgress(null);
                    }
                  }
                } catch (error: any) {
                  // Silent error handling
                } finally {
                  setStepSeeding(false);
                }
              }}
              disabled={stepSeeding || seeding}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {stepSeeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {stepProgress ? (
                    getLocalizedText(
                      `جاري الإضافة... ${stepProgress.current}/${stepProgress.total}`,
                      `Adding... ${stepProgress.current}/${stepProgress.total}`,
                      `Ajout... ${stepProgress.current}/${stepProgress.total}`
                    )
                  ) : (
                    getLocalizedText('جاري الإضافة...', 'Adding...', 'Ajout...')
                  )}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {stepProgress ? (
                    getLocalizedText(
                      `إضافة 5 دول أخرى (${stepProgress.current}/${stepProgress.total})`,
                      `Add 5 More (${stepProgress.current}/${stepProgress.total})`,
                      `Ajouter 5 de Plus (${stepProgress.current}/${stepProgress.total})`
                    )
                  ) : (
                    getLocalizedText('إضافة الدول خطوة بخطوة', 'Add Countries Step by Step', 'Ajouter les Pays Étape par Étape')
                  )}
                </>
              )}
            </Button>
            <Button
              onClick={handleSeedOffers}
              disabled={seeding || stepSeeding}
              className="bg-white/20 text-white hover:bg-white/30 font-semibold border border-white/30"
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {getLocalizedText('جاري الإضافة...', 'Adding...', 'Ajout en cours...')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {getLocalizedText('إضافة 10 عروض لكل دولة', 'Add 10 Offers per Country', 'Ajouter 10 Offres par Pays')}
                </>
              )}
            </Button>
            <Button
              onClick={async () => {
                // Always reload countries when opening form
                console.log('Opening form, current countries count:', countries.length);
                await loadCountries();
                console.log('After reload, countries count:', countries.length);
                setEditingOffer({
                  id: '',
                  country_id: '',
                  title_ar: '',
                  title_en: '',
                  title_fr: '',
                  description_ar: '',
                  description_en: '',
                  description_fr: '',
                  original_price: 0,
                  discount_price: 0,
                  discount_percentage: 0,
                  max_participants: 20,
                  currency: 'USD',
                  is_featured: false,
                  is_active: true,
                  includes_ar: [],
                  includes_en: [],
                  includes_fr: [],
                  highlights_ar: [],
                  highlights_en: [],
                  highlights_fr: [],
                  images: [],
                  created_at: '',
                  updated_at: ''
                });
                setIsAdding(true);
                resetForm();
              }}
              className="bg-white text-red-600 hover:bg-red-50 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              {getLocalizedText('إضافة عرض جديد', 'Add New Offer', 'Ajouter une Nouvelle Offre')}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={getLocalizedText('بحث في العروض...', 'Search offers...', 'Rechercher des offres...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loadingCountries}
          >
            <option value="">{getLocalizedText('جميع الدول', 'All Countries', 'Tous les Pays')}</option>
            {loadingCountries ? (
              <option value="" disabled>{getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')}</option>
            ) : countries.length === 0 ? (
              <option value="" disabled>{getLocalizedText('لا توجد دول', 'No countries', 'Aucun pays')}</option>
            ) : (
              countries.map(country => (
                <option key={country.id} value={country.id}>{getCountryName(country.id)}</option>
              ))
            )}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">{getLocalizedText('جميع الحالات', 'All Status', 'Tous les Statuts')}</option>
            <option value="active">{getLocalizedText('نشط فقط', 'Active Only', 'Actif Seulement')}</option>
            <option value="inactive">{getLocalizedText('غير نشط فقط', 'Inactive Only', 'Inactif Seulement')}</option>
          </select>
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">{getLocalizedText('جميع العروض', 'All Offers', 'Toutes les Offres')}</option>
            <option value="featured">{getLocalizedText('مميز فقط', 'Featured Only', 'Mis en Avant Seulement')}</option>
            <option value="normal">{getLocalizedText('عادي فقط', 'Normal Only', 'Normal Seulement')}</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && editingOffer && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{editingOffer.id ? getLocalizedText('تعديل العرض', 'Edit Offer', 'Modifier l\'Offre') : getLocalizedText('إضافة عرض جديد', 'Add New Offer', 'Ajouter une Nouvelle Offre')}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setEditingOffer(null);
                resetForm();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                {getLocalizedText('المعلومات الأساسية', 'Basic Information', 'Informations de Base')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('الدولة', 'Country', 'Pays')}
                    <span className="text-red-600">*</span>
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('اختر الدولة التي ينتمي إليها العرض', 'Select the country for this offer', 'Sélectionnez le pays de cette offre')} />
                  </Label>
                  {loadingCountries ? (
                    <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mt-1 bg-gray-100 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      <span className="text-sm text-gray-600">{getLocalizedText('جاري تحميل الدول...', 'Loading countries...', 'Chargement des pays...')}</span>
                    </div>
                  ) : countries.length === 0 ? (
                    <div className="w-full px-4 py-3 border border-yellow-500 rounded-lg mt-1 bg-yellow-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-900 mb-1">
                            {getLocalizedText(
                              'لا توجد دول متاحة',
                              'No countries available',
                              'Aucun pays disponible'
                            )}
                          </p>
                          <p className="text-xs text-yellow-700 mb-2">
                            {getLocalizedText(
                              'يجب إضافة دول أولاً قبل إضافة عروض سياحية.',
                              'You must add countries first before adding travel offers.',
                              'Vous devez d\'abord ajouter des pays avant d\'ajouter des offres de voyage.'
                            )}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log('Manual reload countries clicked');
                                loadCountries();
                              }}
                              className="text-xs"
                            >
                              {getLocalizedText('إعادة تحميل الدول', 'Reload Countries', 'Recharger les Pays')}
                            </Button>
                          </div>
                          <p className="text-xs text-yellow-600 mt-2">
                            {getLocalizedText(
                              'انتقل إلى قسم "إدارة الدول" في القائمة الجانبية لإضافة دول جديدة.',
                              'Go to "Countries Management" section in the sidebar to add new countries.',
                              'Allez dans la section "Gestion des Pays" dans la barre latérale pour ajouter de nouveaux pays.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        required
                        value={editingOffer.country_id}
                        onChange={(e) => handleFieldChange('country_id', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg mt-1 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                          errors.country_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">{getLocalizedText('اختر الدولة', 'Select Country', 'Sélectionner un Pays')}</option>
                        {loadingCountries ? (
                          <option value="" disabled>{getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')}</option>
                        ) : countries.length === 0 ? (
                          <option value="" disabled>{getLocalizedText('لا توجد دول متاحة', 'No countries available', 'Aucun pays disponible')}</option>
                        ) : (
                          countries.map(country => {
                            let countryName = '';
                            if (language === 'en') {
                              countryName = country.name_en || country.name_ar || country.id;
                            } else if (language === 'fr') {
                              countryName = country.name_fr || country.name_ar || country.id;
                            } else {
                              countryName = country.name_ar || country.name_en || country.id;
                            }
                            return (
                              <option key={country.id} value={country.id}>
                                {countryName}
                              </option>
                            );
                          })
                        )}
                      </select>
                      {errors.country_id && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.country_id}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('العنوان (عربي)', 'Title (Arabic)', 'Titre (Arabe)')}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    required
                    value={editingOffer.title_ar}
                    onChange={(e) => handleFieldChange('title_ar', e.target.value)}
                    placeholder={getLocalizedText('مثال: رحلة ممتعة إلى دبي', 'Example: Amazing trip to Dubai', 'Exemple: Voyage incroyable à Dubaï')}
                    className={`mt-1 ${errors.title_ar ? 'border-red-500' : ''}`}
                  />
                  {errors.title_ar && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title_ar}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    {getLocalizedText('العنوان (إنجليزي)', 'Title (English)', 'Titre (Anglais)')}
                  </Label>
                  <Input
                    value={editingOffer.title_en}
                    onChange={(e) => handleFieldChange('title_en', e.target.value)}
                    placeholder={getLocalizedText('Example: Amazing trip to Dubai', 'Example: Amazing trip to Dubai', 'Exemple: Voyage incroyable à Dubaï')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    {getLocalizedText('العنوان (فرنسي)', 'Title (French)', 'Titre (Français)')}
                  </Label>
                  <Input
                    value={editingOffer.title_fr}
                    onChange={(e) => handleFieldChange('title_fr', e.target.value)}
                    placeholder={getLocalizedText('Exemple: Voyage incroyable à Dubaï', 'Example: Amazing trip to Dubai', 'Exemple: Voyage incroyable à Dubaï')}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-green-600" />
                {getLocalizedText('الوصف', 'Description', 'Description')}
              </h4>
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  {getLocalizedText('الوصف (عربي)', 'Description (Arabic)', 'Description (Arabe)')}
                  <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  required
                  value={editingOffer.description_ar}
                  onChange={(e) => handleFieldChange('description_ar', e.target.value)}
                  placeholder={getLocalizedText('وصف تفصيلي للعرض باللغة العربية...', 'Detailed description in Arabic...', 'Description détaillée en arabe...')}
                  rows={5}
                  className={`mt-1 ${errors.description_ar ? 'border-red-500' : ''}`}
                />
                {errors.description_ar && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description_ar}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-semibold">
                    {getLocalizedText('الوصف (إنجليزي)', 'Description (English)', 'Description (Anglais)')}
                  </Label>
                  <Textarea
                    value={editingOffer.description_en}
                    onChange={(e) => handleFieldChange('description_en', e.target.value)}
                    placeholder={getLocalizedText('Detailed description in English...', 'Detailed description in English...', 'Description détaillée en anglais...')}
                    rows={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold">
                    {getLocalizedText('الوصف (فرنسي)', 'Description (French)', 'Description (Français)')}
                  </Label>
                  <Textarea
                    value={editingOffer.description_fr}
                    onChange={(e) => handleFieldChange('description_fr', e.target.value)}
                    placeholder={getLocalizedText('Description détaillée en français...', 'Detailed description in English...', 'Description détaillée en français...')}
                    rows={5}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                {getLocalizedText('التسعير', 'Pricing', 'Tarification')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('العملة', 'Currency', 'Devise')}
                  </Label>
                  <select
                    value={editingOffer.currency}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="USD">USD - $ (دولار أمريكي)</option>
                    <option value="EUR">EUR - € (يورو)</option>
                    <option value="GBP">GBP - £ (جنيه إسترليني)</option>
                    <option value="SAR">SAR - ر.س (ريال سعودي)</option>
                    <option value="AED">AED - د.إ (درهم إماراتي)</option>
                    <option value="SDG">SDG - ج.س (جنيه سوداني)</option>
                    <option value="EGP">EGP - ج.م (جنيه مصري)</option>
                    <option value="KWD">KWD - د.ك (دينار كويتي)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('السعر الأصلي', 'Original Price', 'Prix Original')}
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={editingOffer.original_price || ''}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        const discount = editingOffer.discount_price || 0;
                        const percentage = price > 0 && discount > 0 ? Math.round(((price - discount) / price) * 100) : 0;
                        handleFieldChange('original_price', price);
                        setEditingOffer({ ...editingOffer, original_price: price, discount_percentage: percentage });
                      }}
                      placeholder="0.00"
                      className={`mt-1 ${errors.original_price ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.original_price && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.original_price}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('سعر العرض', 'Discount Price', 'Prix Réduit')}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={editingOffer.discount_price || ''}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const original = editingOffer.original_price || 0;
                      const percentage = original > 0 && discount > 0 ? Math.round(((original - discount) / original) * 100) : 0;
                      handleFieldChange('discount_price', discount);
                      setEditingOffer({ ...editingOffer, discount_price: discount, discount_percentage: percentage });
                    }}
                    placeholder="0.00"
                    className={`mt-1 ${errors.discount_price ? 'border-red-500' : ''}`}
                  />
                  {errors.discount_price && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.discount_price}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('نسبة الخصم', 'Discount %', 'Réduction %')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('يتم حسابها تلقائياً', 'Calculated automatically', 'Calculé automatiquement')} />
                  </Label>
                  <Input
                    type="number"
                    value={editingOffer.discount_percentage || 0}
                    readOnly
                    className="mt-1 bg-gray-100 font-bold text-red-600 cursor-not-allowed"
                  />
                  {editingOffer.discount_percentage > 0 && (
                    <p className="text-green-600 text-xs mt-1 font-semibold">
                      {getLocalizedText('توفير', 'Save', 'Économiser')}: {editingOffer.original_price - editingOffer.discount_price} {editingOffer.currency}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration & Dates */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                {getLocalizedText('المدة والتواريخ', 'Duration & Dates', 'Durée et Dates')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('عدد الأيام', 'Duration (Days)', 'Durée (Jours)')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('مدة الرحلة بالأيام', 'Trip duration in days', 'Durée du voyage en jours')} />
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingOffer.duration_days || ''}
                    onChange={(e) => handleFieldChange('duration_days', parseInt(e.target.value) || undefined)}
                    placeholder={getLocalizedText('مثال: 7', 'Example: 7', 'Exemple: 7')}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('تاريخ البدء', 'Start Date', 'Date de Début')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('تاريخ بدء الرحلة', 'Trip start date', 'Date de début du voyage')} />
                  </Label>
                  <Input
                    type="date"
                    value={editingOffer.start_date || ''}
                    onChange={(e) => handleFieldChange('start_date', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('تاريخ الانتهاء', 'End Date', 'Date de Fin')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('تاريخ انتهاء الرحلة', 'Trip end date', 'Date de fin du voyage')} />
                  </Label>
                  <Input
                    type="date"
                    value={editingOffer.end_date || ''}
                    onChange={(e) => handleFieldChange('end_date', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('صالح حتى', 'Valid Until', 'Valable Jusqu\'au')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('تاريخ انتهاء صلاحية العرض', 'Offer expiry date', 'Date d\'expiration de l\'offre')} />
                  </Label>
                  <Input
                    type="date"
                    value={editingOffer.valid_until || ''}
                    onChange={(e) => handleFieldChange('valid_until', e.target.value || undefined)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    {getLocalizedText('الحد الأقصى للمشاركين', 'Max Participants', 'Participants Maximum')}
                    <HelpCircle className="h-3 w-3 text-gray-400" title={getLocalizedText('أقصى عدد من الأشخاص يمكنهم الاشتراك', 'Maximum number of participants', 'Nombre maximum de participants')} />
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingOffer.max_participants || 20}
                    onChange={(e) => handleFieldChange('max_participants', parseInt(e.target.value) || 20)}
                    placeholder="20"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Includes */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {getLocalizedText('يشمل', 'Includes', 'Comprend')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder={getLocalizedText('يشمل (عربي) - مثال: إفطار يومي', 'Include (Arabic) - Example: Daily breakfast', 'Comprend (Arabe) - Exemple: Petit-déjeuner quotidien')}
                  value={newInclude.ar}
                  onChange={(e) => setNewInclude({ ...newInclude, ar: e.target.value })}
                />
                <Input
                  placeholder={getLocalizedText('Include (English) - Example: Daily breakfast', 'Include (English) - Example: Daily breakfast', 'Comprend (Anglais) - Exemple: Petit-déjeuner quotidien')}
                  value={newInclude.en}
                  onChange={(e) => setNewInclude({ ...newInclude, en: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder={getLocalizedText('Comprend (Français) - Exemple: Petit-déjeuner quotidien', 'Include (English) - Example: Daily breakfast', 'Comprend (Français) - Exemple: Petit-déjeuner quotidien')}
                    value={newInclude.fr}
                    onChange={(e) => setNewInclude({ ...newInclude, fr: e.target.value })}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newInclude.ar) {
                        const includes = editingOffer.includes_ar || [];
                        const includesEn = editingOffer.includes_en || [];
                        const includesFr = editingOffer.includes_fr || [];
                        setEditingOffer({
                          ...editingOffer,
                          includes_ar: [...includes, newInclude.ar],
                          includes_en: [...includesEn, newInclude.en || newInclude.ar],
                          includes_fr: [...includesFr, newInclude.fr || newInclude.ar]
                        });
                        setNewInclude({ ar: '', en: '', fr: '' });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {(editingOffer.includes_ar || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="flex-1 text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const includes = [...(editingOffer.includes_ar || [])];
                        const includesEn = [...(editingOffer.includes_en || [])];
                        const includesFr = [...(editingOffer.includes_fr || [])];
                        includes.splice(index, 1);
                        includesEn.splice(index, 1);
                        includesFr.splice(index, 1);
                        setEditingOffer({ ...editingOffer, includes_ar: includes, includes_en: includesEn, includes_fr: includesFr });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
                {(!editingOffer.includes_ar || editingOffer.includes_ar.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-2">{getLocalizedText('لا توجد عناصر بعد', 'No items yet', 'Aucun élément pour le moment')}</p>
                )}
              </div>
            </div>

            {/* Highlights */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                {getLocalizedText('النقاط البارزة', 'Highlights', 'Points Forts')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder={getLocalizedText('نقطة بارزة (عربي) - مثال: زيارة برج خليفة', 'Highlight (Arabic) - Example: Visit Burj Khalifa', 'Point Fort (Arabe) - Exemple: Visite de la Burj Khalifa')}
                  value={newHighlight.ar}
                  onChange={(e) => setNewHighlight({ ...newHighlight, ar: e.target.value })}
                />
                <Input
                  placeholder={getLocalizedText('Highlight (English) - Example: Visit Burj Khalifa', 'Highlight (English) - Example: Visit Burj Khalifa', 'Point Fort (Anglais) - Exemple: Visite de la Burj Khalifa')}
                  value={newHighlight.en}
                  onChange={(e) => setNewHighlight({ ...newHighlight, en: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder={getLocalizedText('Point Fort (Français) - Exemple: Visite de la Burj Khalifa', 'Highlight (English) - Example: Visit Burj Khalifa', 'Point Fort (Français) - Exemple: Visite de la Burj Khalifa')}
                    value={newHighlight.fr}
                    onChange={(e) => setNewHighlight({ ...newHighlight, fr: e.target.value })}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (newHighlight.ar) {
                        const highlights = editingOffer.highlights_ar || [];
                        const highlightsEn = editingOffer.highlights_en || [];
                        const highlightsFr = editingOffer.highlights_fr || [];
                        setEditingOffer({
                          ...editingOffer,
                          highlights_ar: [...highlights, newHighlight.ar],
                          highlights_en: [...highlightsEn, newHighlight.en || newHighlight.ar],
                          highlights_fr: [...highlightsFr, newHighlight.fr || newHighlight.ar]
                        });
                        setNewHighlight({ ar: '', en: '', fr: '' });
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {(editingOffer.highlights_ar || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <Star className="h-4 w-4 text-yellow-600 fill-current flex-shrink-0" />
                    <span className="flex-1 text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const highlights = [...(editingOffer.highlights_ar || [])];
                        const highlightsEn = [...(editingOffer.highlights_en || [])];
                        const highlightsFr = [...(editingOffer.highlights_fr || [])];
                        highlights.splice(index, 1);
                        highlightsEn.splice(index, 1);
                        highlightsFr.splice(index, 1);
                        setEditingOffer({ ...editingOffer, highlights_ar: highlights, highlights_en: highlightsEn, highlights_fr: highlightsFr });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
                {(!editingOffer.highlights_ar || editingOffer.highlights_ar.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-2">{getLocalizedText('لا توجد عناصر بعد', 'No items yet', 'Aucun élément pour le moment')}</p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="border-b pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                {getLocalizedText('الصور', 'Images', 'Images')}
              </h4>
              <div className="flex gap-2 mb-4">
                <Input
                  type="url"
                  placeholder={getLocalizedText('رابط الصورة (URL) - مثال: https://example.com/image.jpg', 'Image URL - Example: https://example.com/image.jpg', 'URL de l\'Image - Exemple: https://example.com/image.jpg')}
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newImageUrl) {
                      const images = editingOffer.images || [];
                      setEditingOffer({
                        ...editingOffer,
                        images: [...images, newImageUrl],
                        main_image: editingOffer.main_image || newImageUrl
                      });
                      setNewImageUrl('');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {getLocalizedText('إضافة', 'Add', 'Ajouter')}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {(editingOffer.images || []).map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                    {editingOffer.main_image === img && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {getLocalizedText('رئيسي', 'Main', 'Principal')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      {editingOffer.main_image !== img && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setEditingOffer({ ...editingOffer, main_image: img })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {getLocalizedText('رئيسي', 'Set Main', 'Définir Principal')}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          const images = [...(editingOffer.images || [])];
                          images.splice(index, 1);
                          setEditingOffer({ ...editingOffer, images, main_image: editingOffer.main_image === img ? (images[0] || '') : editingOffer.main_image });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {editingOffer.main_image && (
                <div>
                  <Label className="text-sm font-semibold">{getLocalizedText('الصورة الرئيسية (URL)', 'Main Image (URL)', 'Image Principale (URL)')}</Label>
                  <Input
                    value={editingOffer.main_image}
                    onChange={(e) => handleFieldChange('main_image', e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              )}
              {(!editingOffer.images || editingOffer.images.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">{getLocalizedText('لا توجد صور بعد', 'No images yet', 'Aucune image pour le moment')}</p>
              )}
            </div>

            {/* Status */}
            <div className="pb-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                {getLocalizedText('الحالة', 'Status', 'Statut')}
              </h4>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingOffer.is_featured}
                    onChange={(e) => handleFieldChange('is_featured', e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold flex items-center gap-2">
                      {getLocalizedText('عرض مميز', 'Featured Offer', 'Offre en Vedette')}
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </span>
                    <p className="text-xs text-gray-500">{getLocalizedText('يظهر في المقدمة', 'Shows at the top', 'Apparaît en haut')}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editingOffer.is_active}
                    onChange={(e) => handleFieldChange('is_active', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold flex items-center gap-2">
                      {getLocalizedText('نشط', 'Active', 'Actif')}
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </span>
                    <p className="text-xs text-gray-500">{getLocalizedText('العرض متاح للعرض', 'Offer is available', 'L\'offre est disponible')}</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white flex-1 text-lg py-6">
                <Save className="h-5 w-5 mr-2" />
                {saving ? getLocalizedText('جاري الحفظ...', 'Saving...', 'Enregistrement...') : getLocalizedText('حفظ العرض', 'Save Offer', 'Enregistrer l\'Offre')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingOffer(null); resetForm(); }} className="flex-1 text-lg py-6">
                <X className="h-5 w-5 mr-2" />
                {getLocalizedText('إلغاء', 'Cancel', 'Annuler')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* View Offer Modal */}
      {viewingOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{viewingOffer[`title_${language}` as keyof TravelOffer] || viewingOffer.title_ar}</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewingOffer(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {viewingOffer.main_image && (
                <img src={viewingOffer.main_image} alt={viewingOffer.title_ar} className="w-full h-64 object-cover rounded-lg" />
              )}
              <div>
                <h4 className="font-semibold mb-2">{getLocalizedText('الوصف', 'Description', 'Description')}</h4>
                <p className="text-gray-600">{viewingOffer[`description_${language}` as keyof TravelOffer] || viewingOffer.description_ar}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">{getLocalizedText('السعر الأصلي', 'Original Price', 'Prix Original')}:</span>
                  <span className="line-through text-gray-500 ml-2">{viewingOffer.original_price} {viewingOffer.currency}</span>
                </div>
                <div>
                  <span className="font-semibold">{getLocalizedText('سعر العرض', 'Discount Price', 'Prix Réduit')}:</span>
                  <span className="text-red-600 font-bold ml-2">{viewingOffer.discount_price} {viewingOffer.currency}</span>
                </div>
                <div>
                  <span className="font-semibold">{getLocalizedText('نسبة الخصم', 'Discount', 'Réduction')}:</span>
                  <span className="text-red-600 ml-2">{viewingOffer.discount_percentage}%</span>
                </div>
                <div>
                  <span className="font-semibold">{getLocalizedText('الدولة', 'Country', 'Pays')}:</span>
                  <span className="ml-2">{getCountryName(viewingOffer.country_id)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map(offer => (
          <div key={offer.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {offer.main_image && (
              <div className="h-48 overflow-hidden relative">
                <img src={offer.main_image} alt={offer.title_ar} className="w-full h-full object-cover" />
                {offer.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {getLocalizedText('مميز', 'Featured', 'Vedette')}
                  </div>
                )}
                {!offer.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-gray-600 text-white px-4 py-2 rounded-full font-semibold">
                      {getLocalizedText('غير نشط', 'Inactive', 'Inactif')}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                  {offer.discount_percentage}% {getLocalizedText('خصم', 'OFF', 'RÉDUCTION')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {offer[`title_${language}` as keyof TravelOffer] || offer.title_ar}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {offer[`description_${language}` as keyof TravelOffer] || offer.description_ar}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Globe className="h-4 w-4" />
                <span>{getCountryName(offer.country_id)}</span>
                {offer.duration_days && (
                  <>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4" />
                    <span>{offer.duration_days} {getLocalizedText('يوم', 'days', 'jours')}</span>
                  </>
                )}
                {offer.max_participants && (
                  <>
                    <span className="mx-2">•</span>
                    <Users className="h-4 w-4" />
                    <span>{offer.max_participants}</span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500 line-through">{offer.original_price} {offer.currency}</span>
                  <span className="text-xl font-bold text-red-600 ml-2">{offer.discount_price} {offer.currency}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingOffer(offer)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {getLocalizedText('عرض', 'View', 'Voir')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingOffer(offer);
                    setIsAdding(true);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(offer.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{getLocalizedText('لا توجد عروض', 'No offers found', 'Aucune offre trouvée')}</p>
        </div>
      )}
    </div>
  );
}
