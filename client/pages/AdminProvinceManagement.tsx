import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Search, Globe, Save } from 'lucide-react';

interface CountryOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ApiProvince {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  code?: string;
  description_ar?: string;
  description_en?: string;
  description_fr?: string;
  capital_ar?: string;
  capital_en?: string;
  capital_fr?: string;
  main_image?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  country_name?: string;
}

interface ProvinceFormData {
  countryId: string;
  name: { ar: string; en: string; fr: string };
  code?: string;
  description: { ar: string; en: string; fr: string };
  capital: { ar: string; en: string; fr: string };
  mainImage?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

const AdminProvinceManagement: React.FC = () => {
  const { language } = useLanguage();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProvince, setEditingProvince] = useState<ApiProvince | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<ProvinceFormData>({
    countryId: '',
    name: { ar: '', en: '', fr: '' },
    code: '',
    description: { ar: '', en: '', fr: '' },
    capital: { ar: '', en: '', fr: '' },
    mainImage: '',
    latitude: undefined,
    longitude: undefined,
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
    title: getLocalizedText('إدارة المحافظات', 'Provinces Management', 'Gestion des Provinces'),
    description: getLocalizedText(
      'قم بإدارة المحافظات في جميع الدول: إضافة، تعديل، وحذف محافظات مع تفاصيل كاملة.',
      'Manage provinces across all countries: add, edit, and delete provinces with full details.',
      'Gérez les provinces dans tous les pays : ajouter, modifier et supprimer des provinces avec tous les détails.'
    ),
    selectCountry: getLocalizedText('اختر دولة لعرض محافظاتها', 'Select a country to view its provinces', 'Sélectionnez un pays pour voir ses provinces'),
    addProvince: getLocalizedText('إضافة محافظة جديدة', 'Add New Province', 'Ajouter une Nouvelle Province'),
    editProvince: getLocalizedText('تعديل المحافظة', 'Edit Province', 'Modifier la Province'),
    provinceName: getLocalizedText('اسم المحافظة', 'Province Name', 'Nom de la Province'),
    code: getLocalizedText('رمز المحافظة', 'Province Code', 'Code de la Province'),
    descriptionLabel: getLocalizedText('الوصف', 'Description', 'Description'),
    capital: getLocalizedText('العاصمة', 'Capital', 'Capitale'),
    mainImage: getLocalizedText('الصورة الرئيسية', 'Main Image', 'Image Principale'),
    coordinates: getLocalizedText('الإحداثيات', 'Coordinates', 'Coordonnées'),
    latitude: getLocalizedText('خط العرض', 'Latitude', 'Latitude'),
    longitude: getLocalizedText('خط الطول', 'Longitude', 'Longitude'),
    save: getLocalizedText('حفظ', 'Save', 'Enregistrer'),
    cancel: getLocalizedText('إلغاء', 'Cancel', 'Annuler'),
    noProvinces: getLocalizedText('لا توجد محافظات مضافة لهذه الدولة بعد.', 'No provinces added for this country yet.', 'Aucune province ajoutée pour ce pays pour le moment.'),
    searchPlaceholder: getLocalizedText('البحث في المحافظات...', 'Search provinces...', 'Rechercher des provinces...'),
    required: getLocalizedText('مطلوب', 'Required', 'Requis'),
    optional: getLocalizedText('اختياري', 'Optional', 'Optionnel'),
    provinceSaved: getLocalizedText('تم حفظ بيانات المحافظة بنجاح', 'Province saved successfully', 'Province enregistrée avec succès'),
    provinceDeleted: getLocalizedText('تم حذف المحافظة بنجاح', 'Province deleted successfully', 'Province supprimée avec succès'),
    arabic: getLocalizedText('العربية', 'Arabic', 'Arabe'),
    english: getLocalizedText('الإنجليزية', 'English', 'Anglais'),
    french: getLocalizedText('الفرنسية', 'French', 'Français'),
    fillRequired: getLocalizedText('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields', 'Veuillez remplir tous les champs requis'),
  };

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || '',
      name: { ar: '', en: '', fr: '' },
      code: '',
      description: { ar: '', en: '', fr: '' },
      capital: { ar: '', en: '', fr: '' },
      mainImage: '',
      latitude: undefined,
      longitude: undefined,
      isActive: true,
    });
    setEditingProvince(null);
    setIsAdding(false);
    setError('');
  };

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      setError('');
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
      } else {
        setError(data.error || 'Failed to load countries');
      }
    } catch (err: any) {
      console.error('Error loading countries:', err);
      setError(err.message || 'Failed to load countries');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProvinces = async (countryId: string) => {
    if (!countryId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/provinces?country_id=${encodeURIComponent(countryId)}&active=false`);
      const data = await res.json();
      if (data.success) {
        setProvinces(data.data || []);
      } else {
        setError(data.error || 'Failed to load provinces');
      }
    } catch (err: any) {
      console.error('Error loading provinces:', err);
      setError(err.message || 'Failed to load provinces');
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
      resetForm();
    } else {
      setProvinces([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  const handleEdit = (province: ApiProvince) => {
    setEditingProvince(province);
    setIsAdding(true);
    setFormData({
      countryId: province.country_id,
      name: { ar: province.name_ar, en: province.name_en, fr: province.name_fr },
      code: province.code || '',
      description: {
        ar: province.description_ar || '',
        en: province.description_en || '',
        fr: province.description_fr || '',
      },
      capital: {
        ar: province.capital_ar || '',
        en: province.capital_en || '',
        fr: province.capital_fr || '',
      },
      mainImage: province.main_image || '',
      latitude: province.latitude,
      longitude: province.longitude,
      isActive: province.is_active,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.countryId || !formData.name.ar || !formData.name.en) {
      setError(text.fillRequired);
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
        code: formData.code || undefined,
        description_ar: formData.description.ar || undefined,
        description_en: formData.description.en || undefined,
        description_fr: formData.description.fr || undefined,
        capital_ar: formData.capital.ar || undefined,
        capital_en: formData.capital.en || undefined,
        capital_fr: formData.capital.fr || undefined,
        main_image: formData.mainImage || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        is_active: formData.isActive,
      };

      const url = editingProvince ? `/api/provinces/${editingProvince.id}` : '/api/provinces';
      const method = editingProvince ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save province');
        return;
      }

      setSuccess(text.provinceSaved);
      await loadProvinces(formData.countryId);
      resetForm();
    } catch (err: any) {
      console.error('Error saving province:', err);
      setError(err.message || 'Failed to save province');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (province: ApiProvince) => {
    if (!window.confirm(getLocalizedText('هل أنت متأكد من حذف هذه المحافظة؟', 'Are you sure you want to delete this province?', 'Êtes-vous sûr de vouloir supprimer cette province ?'))) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/provinces/${province.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to delete province');
        return;
      }

      setSuccess(text.provinceDeleted);
      await loadProvinces(selectedCountryId);
    } catch (err: any) {
      console.error('Error deleting province:', err);
      setError(err.message || 'Failed to delete province');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any, lang?: string) => {
    setFormData(prev => {
      if (lang) {
        const fieldValue = prev[field as keyof typeof prev] as any;
        return {
          ...prev,
          [field]: {
            ...(fieldValue && typeof fieldValue === 'object' ? fieldValue : {}),
            [lang]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
    setError('');
  };

  const filteredProvinces = provinces.filter((province) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      province.name_ar.toLowerCase().includes(q) ||
      province.name_en.toLowerCase().includes(q) ||
      province.name_fr.toLowerCase().includes(q) ||
      (province.code && province.code.toLowerCase().includes(q))
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
          {countries.length} {getLocalizedText('دولة', 'countries', 'pays')}
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
            {text.selectCountry}
          </CardTitle>
          <CardDescription>
            {getLocalizedText(
              'اختر دولة أولاً ثم قم بإدارة المحافظات التابعة لها.',
              'Select a country first, then manage its provinces.',
              "Sélectionnez d'abord un pays, puis gérez ses provinces."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/3">
              <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
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
                  countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {getCountryName(country.id)}
                    </option>
                  ))
                )}
              </select>
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
                  setEditingProvince(null);
                  setFormData((prev) => ({
                    ...prev,
                    countryId: selectedCountryId || prev.countryId,
                  }));
                }}
                disabled={!selectedCountryId}
                className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {text.addProvince}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCountryId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provinces List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-tarhal-orange" />
                {getLocalizedText('قائمة المحافظات', 'Provinces List', 'Liste des Provinces')}
              </h3>
              <Badge variant="outline">
                {filteredProvinces.length}{' '}
                {getLocalizedText('محافظة', 'provinces', 'provinces')}
              </Badge>
            </div>
            {filteredProvinces.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {text.noProvinces}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProvinces.map((province) => (
                  <Card key={province.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {language === 'en'
                              ? province.name_en
                              : language === 'fr'
                              ? province.name_fr
                              : province.name_ar}
                          </h4>
                          {province.code && (
                            <p className="text-xs text-gray-500">
                              {getLocalizedText('رمز', 'Code', 'Code')}: {province.code}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {getCountryName(province.country_id)}
                          </p>
                        </div>
                        {!province.is_active && (
                          <Badge variant="outline" className="text-xs">
                            {getLocalizedText('غير نشطة', 'Inactive', 'Inactive')}
                          </Badge>
                        )}
                      </div>
                      {province.capital_ar && (
                        <p className="text-sm text-gray-600">
                          <strong>{getLocalizedText('العاصمة', 'Capital', 'Capitale')}:</strong>{' '}
                          {language === 'en' ? province.capital_en : language === 'fr' ? province.capital_fr : province.capital_ar}
                        </p>
                      )}
                      {province.description_ar && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {language === 'en'
                            ? province.description_en
                            : language === 'fr'
                            ? province.description_fr
                            : province.description_ar}
                        </p>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(province)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(province)}
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
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  {editingProvince ? text.editProvince : text.addProvince}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Province Name */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {text.provinceName} <Badge variant="destructive">{text.required}</Badge>
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="name-ar">{text.arabic}</Label>
                        <Input
                          id="name-ar"
                          value={formData.name.ar}
                          onChange={(e) => handleInputChange('name', e.target.value, 'ar')}
                          placeholder="اسم المحافظة بالعربية"
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
                          placeholder="Province name in English"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="name-fr">{text.french}</Label>
                        <Input
                          id="name-fr"
                          value={formData.name.fr}
                          onChange={(e) => handleInputChange('name', e.target.value, 'fr')}
                          placeholder="Nom de la province en français"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      {text.code} <Badge variant="outline">{text.optional}</Badge>
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g., PROV-001"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {text.descriptionLabel} <Badge variant="outline">{text.optional}</Badge>
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="desc-ar">{text.arabic}</Label>
                        <Textarea
                          id="desc-ar"
                          value={formData.description.ar}
                          onChange={(e) => handleInputChange('description', e.target.value, 'ar')}
                          placeholder="وصف المحافظة بالعربية"
                          dir="rtl"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="desc-en">{text.english}</Label>
                        <Textarea
                          id="desc-en"
                          value={formData.description.en}
                          onChange={(e) => handleInputChange('description', e.target.value, 'en')}
                          placeholder="Province description in English"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="desc-fr">{text.french}</Label>
                        <Textarea
                          id="desc-fr"
                          value={formData.description.fr}
                          onChange={(e) => handleInputChange('description', e.target.value, 'fr')}
                          placeholder="Description de la province en français"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capital */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {text.capital} <Badge variant="outline">{text.optional}</Badge>
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="capital-ar">{text.arabic}</Label>
                        <Input
                          id="capital-ar"
                          value={formData.capital.ar}
                          onChange={(e) => handleInputChange('capital', e.target.value, 'ar')}
                          placeholder="العاصمة بالعربية"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capital-en">{text.english}</Label>
                        <Input
                          id="capital-en"
                          value={formData.capital.en}
                          onChange={(e) => handleInputChange('capital', e.target.value, 'en')}
                          placeholder="Capital in English"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capital-fr">{text.french}</Label>
                        <Input
                          id="capital-fr"
                          value={formData.capital.fr}
                          onChange={(e) => handleInputChange('capital', e.target.value, 'fr')}
                          placeholder="Capitale en français"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Main Image */}
                  <div className="space-y-2">
                    <Label htmlFor="main-image">
                      {text.mainImage} <Badge variant="outline">{text.optional}</Badge>
                    </Label>
                    <Input
                      id="main-image"
                      value={formData.mainImage}
                      onChange={(e) => handleInputChange('mainImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {text.coordinates} <Badge variant="outline">{text.optional}</Badge>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="latitude">{text.latitude}</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.latitude || ''}
                          onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="24.7136"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">{text.longitude}</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.longitude || ''}
                          onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="46.6753"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
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
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProvinceManagement;

