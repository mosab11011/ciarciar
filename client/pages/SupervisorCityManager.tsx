import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supervisorManager } from '@/services/supervisorManager';
import { dataManager } from '@/services/dataManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  MapPin, 
  Star,
  Camera,
  Globe,
  Clock,
  Calendar
} from 'lucide-react';

interface CityFormData {
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
}

const SupervisorCityManager: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { mode, cityId } = useParams(); // mode: 'add' or 'edit'
  const [supervisor, setSupervisor] = useState(supervisorManager.getCurrentSupervisor());
  const [country, setCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<CityFormData>({
    name: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    image: '',
    attractions: { ar: [], en: [], fr: [] },
    bestTime: { ar: '', en: '', fr: '' },
    duration: { ar: '', en: '', fr: '' },
    rating: 0,
    reviews: 0,
    highlights: { ar: [], en: [], fr: [] },
    gallery: []
  });

  // Check authentication and permissions
  useEffect(() => {
    if (!supervisorManager.isLoggedIn() || !supervisor) {
      navigate('/supervisor/login');
      return;
    }

    if (mode === 'add' && !supervisor.permissions.canAddCities) {
      navigate('/supervisor/dashboard');
      return;
    }

    if (mode === 'edit' && !supervisor.permissions.canEditCities) {
      navigate('/supervisor/dashboard');
      return;
    }

    // Load country data (for display purposes)
    const countryData = dataManager.getCountryById(supervisor.countryId);
    setCountry(countryData);

    // Load existing city data if editing
    if (mode === 'edit' && cityId) {
      fetch(`/api/cities/${cityId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            const city = result.data;
            // Convert API format to form format
            setFormData({
              name: { ar: city.name_ar, en: city.name_en, fr: city.name_fr },
              description: { ar: city.description_ar, en: city.description_en, fr: city.description_fr },
              image: city.image,
              attractions: { 
                ar: city.attractions_ar || [], 
                en: city.attractions_en || [], 
                fr: city.attractions_fr || [] 
              },
              bestTime: { ar: city.best_time_ar, en: city.best_time_en, fr: city.best_time_fr },
              duration: { ar: city.duration_ar, en: city.duration_en, fr: city.duration_fr },
              rating: city.rating || 4.5,
              reviews: city.reviews || 0,
              highlights: { ar: [], en: [], fr: [] }, // Not in API schema
              gallery: [] // Not in API schema
            });
      } else {
        setError('City not found');
      }
        })
        .catch(err => {
          console.error('Error loading city:', err);
          setError('Failed to load city data');
        });
    }
  }, [supervisor, navigate, mode, cityId]);

  const content = {
    ar: {
      addCity: 'إضافة مدينة جديدة',
      editCity: 'تعديل المدينة',
      basicInfo: 'المعلومات الأساسية',
      mediaGallery: 'معرض الصور',
      attractions: 'المعالم السياحية',
      details: 'التفاصيل',
      cityName: 'اسم المدينة',
      description: 'الوصف',
      mainImage: 'الصورة الرئيسية',
      imageUrl: 'رابط الصورة',
      bestTime: 'أفضل وقت للزيارة',
      duration: 'المدة المقترحة',
      rating: 'التقييم',
      reviews: 'عدد المراجعات',
      highlights: 'النقاط المميزة',
      addHighlight: 'إضافة نقطة مميزة',
      addAttraction: 'إضافة معلم سياحي',
      addGalleryImage: 'إضافة صورة للمعرض',
      save: 'حفظ',
      cancel: 'إلغاء',
      backToDashboard: 'العودة للوحة التحكم',
      arabic: 'العربية',
      english: 'الإنجليزية',
      french: 'الفرنسية',
      required: 'مطلوب',
      optional: 'اختياري',
      cityAdded: 'تم إضافة المدينة بنجاح',
      cityUpdated: 'تم تحديث المدينة بنجاح',
      fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
      invalidRating: 'التقييم يجب أن يكون بين 0 و 5',
      invalidReviews: 'عدد المراجعات يجب أن يكون رقماً صحيحاً'
    },
    en: {
      addCity: 'Add New City',
      editCity: 'Edit City',
      basicInfo: 'Basic Information',
      mediaGallery: 'Media Gallery',
      attractions: 'Tourist Attractions',
      details: 'Details',
      cityName: 'City Name',
      description: 'Description',
      mainImage: 'Main Image',
      imageUrl: 'Image URL',
      bestTime: 'Best Time to Visit',
      duration: 'Suggested Duration',
      rating: 'Rating',
      reviews: 'Number of Reviews',
      highlights: 'Highlights',
      addHighlight: 'Add Highlight',
      addAttraction: 'Add Attraction',
      addGalleryImage: 'Add Gallery Image',
      save: 'Save',
      cancel: 'Cancel',
      backToDashboard: 'Back to Dashboard',
      arabic: 'Arabic',
      english: 'English',
      french: 'French',
      required: 'Required',
      optional: 'Optional',
      cityAdded: 'City added successfully',
      cityUpdated: 'City updated successfully',
      fillRequired: 'Please fill all required fields',
      invalidRating: 'Rating must be between 0 and 5',
      invalidReviews: 'Number of reviews must be a valid number'
    },
    fr: {
      addCity: 'Ajouter Nouvelle Ville',
      editCity: 'Modifier la Ville',
      basicInfo: 'Informations de Base',
      mediaGallery: 'Galerie Média',
      attractions: 'Attractions Touristiques',
      details: 'Détails',
      cityName: 'Nom de la Ville',
      description: 'Description',
      mainImage: 'Image Principale',
      imageUrl: 'URL de l\'Image',
      bestTime: 'Meilleur Moment pour Visiter',
      duration: 'Durée Suggérée',
      rating: 'Évaluation',
      reviews: 'Nombre d\'Avis',
      highlights: 'Points Forts',
      addHighlight: 'Ajouter un Point Fort',
      addAttraction: 'Ajouter une Attraction',
      addGalleryImage: 'Ajouter Image Galerie',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      backToDashboard: 'Retour au Tableau de Bord',
      arabic: 'Arabe',
      english: 'Anglais',
      french: 'Français',
      required: 'Requis',
      optional: 'Optionnel',
      cityAdded: 'Ville ajoutée avec succès',
      cityUpdated: 'Ville mise à jour avec succès',
      fillRequired: 'Veuillez remplir tous les champs requis',
      invalidRating: 'L\'évaluation doit être entre 0 et 5',
      invalidReviews: 'Le nombre d\'avis doit être un nombre valide'
    }
  };

  const text = content[language];

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

  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.name.ar || !formData.name.en || 
        !formData.description.ar || !formData.description.en ||
        !formData.image) {
      setError(text.fillRequired);
      return false;
    }

    // Validate rating
    if (formData.rating < 0 || formData.rating > 5) {
      setError(text.invalidRating);
      return false;
    }

    // Validate reviews count
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
    
    try {
      const cityData = {
        ...formData,
        id: mode === 'edit' ? cityId : `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Update country data
      const updatedCountry = { ...country };
      
      if (mode === 'add') {
        updatedCountry.cities = [...(updatedCountry.cities || []), cityData];
      } else {
        const cityIndex = updatedCountry.cities?.findIndex(c => c.id === cityId);
        if (cityIndex !== -1) {
          updatedCountry.cities[cityIndex] = cityData;
        }
      }

      const success = dataManager.updateCountry(supervisor.countryId, updatedCountry);
      
      if (success) {
        // Log activity
        supervisorManager.logActivity(
          supervisor.id,
          mode === 'add' ? 'city_added' : 'city_updated',
          'city',
          cityData.id,
          {
            ar: `${mode === 'add' ? 'تم إضافة' : 'تم تحديث'} مدينة: ${cityData.name.ar}`,
            en: `${mode === 'add' ? 'Added' : 'Updated'} city: ${cityData.name.en}`,
            fr: `${mode === 'add' ? 'Ajouté' : 'Mis à jour'} ville: ${cityData.name.fr}`
          }
        );

        setSuccess(mode === 'add' ? text.cityAdded : text.cityUpdated);
        
        // Redirect after success
        setTimeout(() => {
          navigate('/supervisor/dashboard');
        }, 2000);
      } else {
        setError('Failed to save city data');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/supervisor/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {text.backToDashboard}
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'add' ? text.addCity : text.editCity}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
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
                  {/* City Name */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {text.cityName} <Badge variant="destructive">{text.required}</Badge>
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
                      {text.description} <Badge variant="destructive">{text.required}</Badge>
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
                            e.target.style.display = 'none';
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
                            e.target.style.display = 'none';
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
              onClick={() => navigate('/supervisor/dashboard')}
            >
              {text.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
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
      </main>
    </div>
  );
};

export default SupervisorCityManager;
