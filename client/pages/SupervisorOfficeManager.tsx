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
  Building2, 
  Star,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  User,
  Users
} from 'lucide-react';

interface OfficeFormData {
  name: { ar: string; en: string; fr: string };
  address: { ar: string; en: string; fr: string };
  phone: string;
  email: string;
  website?: string;
  manager: { ar: string; en: string; fr: string };
  services: { ar: string[]; en: string[]; fr: string[] };
  workingHours: { ar: string; en: string; fr: string };
  coordinates?: { lat: number; lng: number };
  rating: number;
  reviews: number;
  isActive: boolean;
}

const SupervisorOfficeManager: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { mode, officeId } = useParams(); // mode: 'add' or 'edit'
  const [supervisor, setSupervisor] = useState(supervisorManager.getCurrentSupervisor());
  const [country, setCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<OfficeFormData>({
    name: { ar: '', en: '', fr: '' },
    address: { ar: '', en: '', fr: '' },
    phone: '',
    email: '',
    website: '',
    manager: { ar: '', en: '', fr: '' },
    services: { ar: [], en: [], fr: [] },
    workingHours: { ar: '', en: '', fr: '' },
    coordinates: { lat: 0, lng: 0 },
    rating: 0,
    reviews: 0,
    isActive: true
  });

  // Check authentication and permissions
  useEffect(() => {
    if (!supervisorManager.isLoggedIn() || !supervisor) {
      navigate('/supervisor/login');
      return;
    }

    if (mode === 'add' && !supervisor.permissions.canAddOffices) {
      navigate('/supervisor/dashboard');
      return;
    }

    if (mode === 'edit' && !supervisor.permissions.canEditOffices) {
      navigate('/supervisor/dashboard');
      return;
    }

    // Load country data
    const countryData = dataManager.getCountryById(supervisor.countryId);
    setCountry(countryData);

    // Load existing office data if editing
    if (mode === 'edit' && officeId) {
      const offices = dataManager.getOfficesByCountry(supervisor.countryId);
      const existingOffice = offices.find(o => o.id === officeId);
      if (existingOffice) {
        setFormData(existingOffice);
      } else {
        setError('Office not found');
      }
    }
  }, [supervisor, navigate, mode, officeId]);

  const content = {
    ar: {
      addOffice: 'إضافة مكتب سياحي جديد',
      editOffice: 'تعديل المكتب السياحي',
      basicInfo: 'المعلومات ال��ساسية',
      contactInfo: 'معلومات الاتصال',
      services: 'الخدمات',
      details: 'التفاصيل الإضافية',
      officeName: 'اسم المكتب',
      address: 'العنوان',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      website: 'الموقع الإلكتروني',
      manager: 'المدير',
      workingHours: 'ساعات العمل',
      latitude: 'خط العرض',
      longitude: 'خط الطول',
      rating: 'التقييم',
      reviews: 'عدد المراجعات',
      isActive: 'نشط',
      officeServices: 'خدمات المكتب',
      addService: 'إضافة خدمة',
      save: 'حفظ',
      cancel: 'إلغاء',
      backToDashboard: 'العودة للوحة التحكم',
      arabic: 'العربية',
      english: 'الإنجليزية',
      french: 'الفرنسية',
      required: 'مطلوب',
      optional: 'اختياري',
      officeAdded: 'تم إضافة المكتب بنجاح',
      officeUpdated: 'تم تحديث المكتب بنجاح',
      fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      invalidPhone: 'يرجى إدخال رقم ��اتف صحيح',
      invalidRating: 'التقييم يجب أن يكون بين 0 و 5',
      invalidReviews: 'عدد المراجعات يجب أن يكون رقماً صحيحاً',
      location: 'الموقع الجغرافي'
    },
    en: {
      addOffice: 'Add New Travel Office',
      editOffice: 'Edit Travel Office',
      basicInfo: 'Basic Information',
      contactInfo: 'Contact Information',
      services: 'Services',
      details: 'Additional Details',
      officeName: 'Office Name',
      address: 'Address',
      phone: 'Phone Number',
      email: 'Email Address',
      website: 'Website',
      manager: 'Manager',
      workingHours: 'Working Hours',
      latitude: 'Latitude',
      longitude: 'Longitude',
      rating: 'Rating',
      reviews: 'Number of Reviews',
      isActive: 'Active',
      officeServices: 'Office Services',
      addService: 'Add Service',
      save: 'Save',
      cancel: 'Cancel',
      backToDashboard: 'Back to Dashboard',
      arabic: 'Arabic',
      english: 'English',
      french: 'French',
      required: 'Required',
      optional: 'Optional',
      officeAdded: 'Office added successfully',
      officeUpdated: 'Office updated successfully',
      fillRequired: 'Please fill all required fields',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      invalidRating: 'Rating must be between 0 and 5',
      invalidReviews: 'Number of reviews must be a valid number',
      location: 'Geographic Location'
    },
    fr: {
      addOffice: 'Ajouter Nouveau Bureau de Voyage',
      editOffice: 'Modifier le Bureau de Voyage',
      basicInfo: 'Informations de Base',
      contactInfo: 'Informations de Contact',
      services: 'Services',
      details: 'Détails Supplémentaires',
      officeName: 'Nom du Bureau',
      address: 'Adresse',
      phone: 'Numéro de Téléphone',
      email: 'Adresse E-mail',
      website: 'Site Web',
      manager: 'Gestionnaire',
      workingHours: 'Heures de Travail',
      latitude: 'Latitude',
      longitude: 'Longitude',
      rating: 'Évaluation',
      reviews: 'Nombre d\'Avis',
      isActive: 'Actif',
      officeServices: 'Services du Bureau',
      addService: 'Ajouter un Service',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      backToDashboard: 'Retour au Tableau de Bord',
      arabic: 'Arabe',
      english: 'Anglais',
      french: 'Français',
      required: 'Requis',
      optional: 'Optionnel',
      officeAdded: 'Bureau ajouté avec succès',
      officeUpdated: 'Bureau mis à jour avec succès',
      fillRequired: 'Veuillez remplir tous les champs requis',
      invalidEmail: 'Veuillez entrer une adresse e-mail valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      invalidRating: 'L\'évaluation doit être entre 0 et 5',
      invalidReviews: 'Le nombre d\'avis doit être un nombre valide',
      location: 'Localisation Géographique'
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
    const input = prompt(`Add new service (${lang}):`);
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
        !formData.address.ar || !formData.address.en ||
        !formData.phone || !formData.email) {
      setError(text.fillRequired);
      return false;
    }

    // Validate email
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(text.invalidEmail);
      return false;
    }

    // Validate phone (simple validation)
    if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
      setError(text.invalidPhone);
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
      const officeData = {
        ...formData,
        id: mode === 'edit' ? officeId : `office_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        countryId: supervisor.countryId,
        createdAt: mode === 'edit' ? formData.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let success;
      if (mode === 'add') {
        success = dataManager.addOffice(officeData);
      } else {
        success = dataManager.updateOffice(officeId, officeData);
      }
      
      if (success) {
        // Log activity
        supervisorManager.logActivity(
          supervisor.id,
          mode === 'add' ? 'office_added' : 'office_updated',
          'office',
          officeData.id,
          {
            ar: `${mode === 'add' ? 'تم إضافة' : 'تم تحديث'} مكتب: ${officeData.name.ar}`,
            en: `${mode === 'add' ? 'Added' : 'Updated'} office: ${officeData.name.en}`,
            fr: `${mode === 'add' ? 'Ajouté' : 'Mis à jour'} bureau: ${officeData.name.fr}`
          }
        );

        setSuccess(mode === 'add' ? text.officeAdded : text.officeUpdated);
        
        // Redirect after success
        setTimeout(() => {
          navigate('/supervisor/dashboard');
        }, 2000);
      } else {
        setError('Failed to save office data');
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
                {mode === 'add' ? text.addOffice : text.editOffice}
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
              <TabsTrigger value="contact">{text.contactInfo}</TabsTrigger>
              <TabsTrigger value="services">{text.services}</TabsTrigger>
              <TabsTrigger value="details">{text.details}</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.basicInfo}</CardTitle>
                  <CardDescription>
                    Basic information about the travel office
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Office Name */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {text.officeName} <Badge variant="destructive">{text.required}</Badge>
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  {/* Address */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      {text.address} <Badge variant="destructive">{text.required}</Badge>
                    </Label>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="address-ar">{text.arabic}</Label>
                        <Textarea
                          id="address-ar"
                          value={formData.address.ar}
                          onChange={(e) => handleInputChange('address', e.target.value, 'ar')}
                          placeholder="عنوان المكتب بالعربية"
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
                          placeholder="Office address in English"
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
                          placeholder="Adresse du bureau en français"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {text.manager}
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          placeholder="Nom du gestionnaire en français"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.contactInfo}</CardTitle>
                  <CardDescription>
                    Contact details for the office
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {text.phone} <Badge variant="destructive" className="ml-2">{text.required}</Badge>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 234 567 8900"
                        type="tel"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {text.email} <Badge variant="destructive" className="ml-2">{text.required}</Badge>
                      </Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="office@example.com"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      {text.website} <Badge variant="secondary" className="ml-2">{text.optional}</Badge>
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.example.com"
                      type="url"
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {text.workingHours}
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="hours-ar">{text.arabic}</Label>
                        <Input
                          id="hours-ar"
                          value={formData.workingHours.ar}
                          onChange={(e) => handleInputChange('workingHours', e.target.value, 'ar')}
                          placeholder="السبت - الخميس: 9:00 - 17:00"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours-en">{text.english}</Label>
                        <Input
                          id="hours-en"
                          value={formData.workingHours.en}
                          onChange={(e) => handleInputChange('workingHours', e.target.value, 'en')}
                          placeholder="Mon - Fri: 9:00 AM - 5:00 PM"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours-fr">{text.french}</Label>
                        <Input
                          id="hours-fr"
                          value={formData.workingHours.fr}
                          onChange={(e) => handleInputChange('workingHours', e.target.value, 'fr')}
                          placeholder="Lun - Ven: 9h00 - 17h00"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.officeServices}</CardTitle>
                  <CardDescription>
                    Services offered by the travel office
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
                          onClick={() => addArrayItem('services', lang)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {text.addService}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.services[lang].map((service, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={service}
                              onChange={(e) => {
                                const newServices = [...formData.services[lang]];
                                newServices[index] = e.target.value;
                                handleInputChange('services', {
                                  ...formData.services,
                                  [lang]: newServices
                                });
                              }}
                              dir={lang === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeArrayItem('services', lang, index)}
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
                    Additional office details and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                      <Label htmlFor="reviews" className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {text.reviews}
                      </Label>
                      <Input
                        id="reviews"
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={(e) => handleInputChange('reviews', parseInt(e.target.value) || 0)}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  {/* Geographic Location */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {text.location} <Badge variant="secondary" className="ml-2">{text.optional}</Badge>
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">{text.latitude}</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={formData.coordinates?.lat || ''}
                          onChange={(e) => handleInputChange('coordinates', {
                            ...formData.coordinates,
                            lat: parseFloat(e.target.value) || 0
                          })}
                          placeholder="15.5007"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">{text.longitude}</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={formData.coordinates?.lng || ''}
                          onChange={(e) => handleInputChange('coordinates', {
                            ...formData.coordinates,
                            lng: parseFloat(e.target.value) || 0
                          })}
                          placeholder="32.5599"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isActive">{text.isActive}</Label>
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

export default SupervisorOfficeManager;
