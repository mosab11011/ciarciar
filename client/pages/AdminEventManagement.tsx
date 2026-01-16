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
import { Calendar, Plus, Edit, Trash2, Search, Globe, Camera, Clock, Save, Eye, CheckCircle, XCircle, Send, MapPin, Repeat, Ticket, Users } from 'lucide-react';
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

interface DestinationOption {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
}

interface ApiEvent {
  id: string;
  destination_id?: string;
  city_id?: string;
  province_id?: string;
  country_id: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  event_type: 'festival' | 'season' | 'cultural' | 'sports' | 'religious' | 'other';
  start_date: string;
  end_date: string;
  main_image?: string;
  gallery?: string[];
  location_ar?: string;
  location_en?: string;
  location_fr?: string;
  latitude?: number;
  longitude?: number;
  organizer_ar?: string;
  organizer_en?: string;
  organizer_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  ticket_price?: number;
  currency: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
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
  destination_name?: string;
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

interface EventFormData {
  countryId: string;
  provinceId?: string;
  cityId?: string;
  destinationId?: string;
  title: { ar: string; en: string; fr: string };
  description: { ar: string; en: string; fr: string };
  eventType: 'festival' | 'season' | 'cultural' | 'sports' | 'religious' | 'other';
  startDate: string;
  endDate: string;
  mainImage?: string;
  gallery: string[];
  location: { ar: string; en: string; fr: string };
  latitude?: number;
  longitude?: number;
  organizer: { ar: string; en: string; fr: string };
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  ticketPrice?: number;
  currency: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  highlights: { ar: string[]; en: string[]; fr: string[] };
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  isActive: boolean;
}

const AdminEventManagement: React.FC = () => {
  const { language } = useLanguage();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending_review' | 'published' | 'archived'>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'festival' | 'season' | 'cultural' | 'sports' | 'religious' | 'other'>('all');

  const [formData, setFormData] = useState<EventFormData>({
    countryId: '',
    provinceId: undefined,
    cityId: undefined,
    destinationId: undefined,
    title: { ar: '', en: '', fr: '' },
    description: { ar: '', en: '', fr: '' },
    eventType: 'festival',
    startDate: '',
    endDate: '',
    mainImage: undefined,
    gallery: [],
    location: { ar: '', en: '', fr: '' },
    latitude: undefined,
    longitude: undefined,
    organizer: { ar: '', en: '', fr: '' },
    contactPhone: '',
    contactEmail: '',
    website: '',
    ticketPrice: undefined,
    currency: 'USD',
    isRecurring: false,
    recurrencePattern: undefined,
    highlights: { ar: [], en: [], fr: [] },
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
    title: getLocalizedText('إدارة الفعاليات والمواسم', 'Events & Seasons Management', 'Gestion des Événements et Saisons'),
    description: getLocalizedText(
      'قم بإدارة الفعاليات والمواسم السياحية: إضافة، تعديل، وحذف فعاليات مع تفاصيل كاملة.',
      'Manage tourist events and seasons: add, edit, and delete events with full details.',
      'Gérez les événements et saisons touristiques : ajouter, modifier et supprimer des événements avec tous les détails.'
    ),
    selectCountry: getLocalizedText('اختر دولة', 'Select Country', 'Sélectionnez un Pays'),
    selectProvince: getLocalizedText('اختر محافظة', 'Select Province', 'Sélectionnez une Province'),
    selectCity: getLocalizedText('اختر مدينة', 'Select City', 'Sélectionnez une Ville'),
    selectDestination: getLocalizedText('اختر وجهة', 'Select Destination', 'Sélectionnez une Destination'),
    addEvent: getLocalizedText('إضافة فعالية جديدة', 'Add New Event', 'Ajouter un Nouvel Événement'),
    editEvent: getLocalizedText('تعديل الفعالية', 'Edit Event', 'Modifier l\'Événement'),
    eventTitle: getLocalizedText('عنوان الفعالية', 'Event Title', 'Titre de l\'Événement'),
    description: getLocalizedText('الوصف', 'Description', 'Description'),
    eventType: getLocalizedText('نوع الفعالية', 'Event Type', 'Type d\'Événement'),
    startDate: getLocalizedText('تاريخ البداية', 'Start Date', 'Date de Début'),
    endDate: getLocalizedText('تاريخ النهاية', 'End Date', 'Date de Fin'),
    location: getLocalizedText('الموقع', 'Location', 'Emplacement'),
    organizer: getLocalizedText('المنظم', 'Organizer', 'Organisateur'),
    contact: getLocalizedText('معلومات الاتصال', 'Contact Info', 'Informations de Contact'),
    ticketPrice: getLocalizedText('سعر التذكرة', 'Ticket Price', 'Prix du Billet'),
    isRecurring: getLocalizedText('فعالية متكررة', 'Recurring Event', 'Événement Récurrent'),
    recurrencePattern: getLocalizedText('نمط التكرار', 'Recurrence Pattern', 'Modèle de Récurrence'),
    highlights: getLocalizedText('النقاط المميزة', 'Highlights', 'Points Forts'),
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
    festival: getLocalizedText('مهرجان', 'Festival', 'Festival'),
    season: getLocalizedText('موسم', 'Season', 'Saison'),
    cultural: getLocalizedText('ثقافي', 'Cultural', 'Culturel'),
    sports: getLocalizedText('رياضي', 'Sports', 'Sportif'),
    religious: getLocalizedText('ديني', 'Religious', 'Religieux'),
    other: getLocalizedText('أخرى', 'Other', 'Autre'),
  };

  const eventTypes = [
    { value: 'festival', label: text.festival },
    { value: 'season', label: text.season },
    { value: 'cultural', label: text.cultural },
    { value: 'sports', label: text.sports },
    { value: 'religious', label: text.religious },
    { value: 'other', label: text.other },
  ];

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || '',
      provinceId: selectedProvinceId || undefined,
      cityId: selectedCityId || undefined,
      destinationId: selectedDestinationId || undefined,
      title: { ar: '', en: '', fr: '' },
      description: { ar: '', en: '', fr: '' },
      eventType: 'festival',
      startDate: '',
      endDate: '',
      mainImage: undefined,
      gallery: [],
      location: { ar: '', en: '', fr: '' },
      latitude: undefined,
      longitude: undefined,
      organizer: { ar: '', en: '', fr: '' },
      contactPhone: '',
      contactEmail: '',
      website: '',
      ticketPrice: undefined,
      currency: 'USD',
      isRecurring: false,
      recurrencePattern: undefined,
      highlights: { ar: [], en: [], fr: [] },
      status: 'draft',
      isActive: true,
    });
    setEditingEvent(null);
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

  const loadDestinations = async (countryId: string, provinceId?: string, cityId?: string) => {
    if (!countryId) {
      setDestinations([]);
      return;
    }
    try {
      let url = `/api/destinations?country_id=${encodeURIComponent(countryId)}&active=false`;
      if (provinceId) {
        url += `&province_id=${encodeURIComponent(provinceId)}`;
      }
      if (cityId) {
        url += `&city_id=${encodeURIComponent(cityId)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data || []);
      }
    } catch (err) {
      console.error('Error loading destinations:', err);
    }
  };

  const loadEvents = async () => {
    if (!selectedCountryId) {
      setEvents([]);
      return;
    }
    try {
      setIsLoading(true);
      let url = `/api/events?country_id=${encodeURIComponent(selectedCountryId)}&active=false`;
      if (selectedProvinceId) {
        url += `&province_id=${encodeURIComponent(selectedProvinceId)}`;
      }
      if (selectedCityId) {
        url += `&city_id=${encodeURIComponent(selectedCityId)}`;
      }
      if (selectedDestinationId) {
        url += `&destination_id=${encodeURIComponent(selectedDestinationId)}`;
      }
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (eventTypeFilter !== 'all') {
        url += `&event_type=${eventTypeFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
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
      loadDestinations(selectedCountryId);
      loadEvents();
      resetForm();
    } else {
      setProvinces([]);
      setCities([]);
      setDestinations([]);
      setEvents([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedCountryId) {
      loadCities(selectedCountryId, selectedProvinceId);
      loadDestinations(selectedCountryId, selectedProvinceId);
      loadEvents();
      setFormData(prev => ({ ...prev, provinceId: selectedProvinceId || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedCountryId) {
      loadDestinations(selectedCountryId, selectedProvinceId, selectedCityId);
      loadEvents();
      setFormData(prev => ({ ...prev, cityId: selectedCityId || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId]);

  useEffect(() => {
    if (selectedCountryId) {
      loadEvents();
      setFormData(prev => ({ ...prev, destinationId: selectedDestinationId || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestinationId, statusFilter, eventTypeFilter]);

  const handleEdit = (event: ApiEvent) => {
    setEditingEvent(event);
    setIsAdding(true);
    setFormData({
      countryId: event.country_id,
      provinceId: event.province_id || undefined,
      cityId: event.city_id || undefined,
      destinationId: event.destination_id || undefined,
      title: { ar: event.title_ar, en: event.title_en, fr: event.title_fr },
      description: { ar: event.description_ar, en: event.description_en, fr: event.description_fr },
      eventType: event.event_type,
      startDate: event.start_date,
      endDate: event.end_date,
      mainImage: event.main_image,
      gallery: event.gallery || [],
      location: {
        ar: event.location_ar || '',
        en: event.location_en || '',
        fr: event.location_fr || '',
      },
      latitude: event.latitude,
      longitude: event.longitude,
      organizer: {
        ar: event.organizer_ar || '',
        en: event.organizer_en || '',
        fr: event.organizer_fr || '',
      },
      contactPhone: event.contact_phone || '',
      contactEmail: event.contact_email || '',
      website: event.website || '',
      ticketPrice: event.ticket_price,
      currency: event.currency || 'USD',
      isRecurring: event.is_recurring,
      recurrencePattern: event.recurrence_pattern,
      highlights: {
        ar: event.highlights_ar || [],
        en: event.highlights_en || [],
        fr: event.highlights_fr || [],
      },
      status: event.status || 'draft',
      isActive: event.is_active,
    });
  };

  const validateForm = (): boolean => {
    if (!formData.countryId || !formData.title.ar || !formData.title.en ||
        !formData.description.ar || !formData.description.en ||
        !formData.startDate || !formData.endDate) {
      setError(getLocalizedText('يرجى ملء جميع الحقول المطلوبة', 'Please fill all required fields', 'Veuillez remplir tous les champs requis'));
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError(getLocalizedText('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 'Start date must be before end date', 'La date de début doit être avant la date de fin'));
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
        destination_id: formData.destinationId || undefined,
        title_ar: formData.title.ar,
        title_en: formData.title.en,
        title_fr: formData.title.fr || formData.title.ar,
        description_ar: formData.description.ar,
        description_en: formData.description.en,
        description_fr: formData.description.fr || formData.description.ar,
        event_type: formData.eventType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        main_image: formData.mainImage || undefined,
        gallery: formData.gallery,
        location_ar: formData.location.ar || undefined,
        location_en: formData.location.en || undefined,
        location_fr: formData.location.fr || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        organizer_ar: formData.organizer.ar || undefined,
        organizer_en: formData.organizer.en || undefined,
        organizer_fr: formData.organizer.fr || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
        website: formData.website || undefined,
        ticket_price: formData.ticketPrice || undefined,
        currency: formData.currency || 'USD',
        is_recurring: formData.isRecurring,
        recurrence_pattern: formData.recurrencePattern || undefined,
        highlights_ar: formData.highlights.ar,
        highlights_en: formData.highlights.en,
        highlights_fr: formData.highlights.fr,
        status: formData.status,
        is_active: formData.isActive,
      };

      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to save event');
        return;
      }

      setSuccess(getLocalizedText('تم حفظ الفعالية بنجاح', 'Event saved successfully', 'Événement enregistré avec succès'));
      await loadEvents();
      resetForm();
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!editingEvent) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${editingEvent.id}/submit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم إرسال الفعالية للمراجعة', 'Event submitted for review', 'Événement soumis pour révision'));
        await loadEvents();
        resetForm();
      } else {
        setError(data.error || 'Failed to submit event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!editingEvent) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${editingEvent.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم الموافقة على الفعالية ونشرها', 'Event approved and published', 'Événement approuvé et publié'));
        await loadEvents();
        resetForm();
      } else {
        setError(data.error || 'Failed to approve event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!editingEvent) return;
    const reason = window.prompt(getLocalizedText('أدخل سبب الرفض', 'Enter rejection reason', 'Entrez la raison du rejet'));
    if (!reason) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events/${editingEvent.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(getLocalizedText('تم رفض الفعالية', 'Event rejected', 'Événement rejeté'));
        await loadEvents();
        resetForm();
      } else {
        setError(data.error || 'Failed to reject event');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (event: ApiEvent) => {
    if (!window.confirm(getLocalizedText('هل أنت متأكد من حذف هذه الفعالية؟', 'Are you sure you want to delete this event?', 'Êtes-vous sûr de vouloir supprimer cet événement ?'))) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to delete event');
        return;
      }

      setSuccess(getLocalizedText('تم حذف الفعالية بنجاح', 'Event deleted successfully', 'Événement supprimé avec succès'));
      await loadEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
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

  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      event.title_ar.toLowerCase().includes(q) ||
      event.title_en.toLowerCase().includes(q) ||
      event.title_fr.toLowerCase().includes(q)
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

  const getEventTypeBadge = (type: string) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? (
      <Badge variant="outline" className="text-xs">
        {eventType.label}
      </Badge>
    ) : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-tarhal-orange" />
            {text.title}
          </h2>
          <p className="text-gray-600 mt-1">{text.description}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          {events.length} {getLocalizedText('فعالية', 'events', 'événements')}
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
            {getLocalizedText('تصفية الفعاليات', 'Filter Events', 'Filtrer les Événements')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>{text.selectCountry}</Label>
              <select
                value={selectedCountryId}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value);
                  setSelectedProvinceId('');
                  setSelectedCityId('');
                  setSelectedDestinationId('');
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
            <div>
              <Label>{text.eventType}</Label>
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">{getLocalizedText('الكل', 'All', 'Tous')}</option>
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={getLocalizedText('البحث في الفعاليات...', 'Search events...', 'Rechercher des événements...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => {
                setIsAdding(true);
                setEditingEvent(null);
                setFormData(prev => ({
                  ...prev,
                  countryId: selectedCountryId || prev.countryId,
                  provinceId: selectedProvinceId || prev.provinceId,
                  cityId: selectedCityId || prev.cityId,
                  destinationId: selectedDestinationId || prev.destinationId,
                }));
              }}
              disabled={!selectedCountryId}
              className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {text.addEvent}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedCountryId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-tarhal-orange" />
                {getLocalizedText('قائمة الفعاليات', 'Events List', 'Liste des Événements')}
              </h3>
              <Badge variant="outline">
                {filteredEvents.length}{' '}
                {getLocalizedText('فعالية', 'events', 'événements')}
              </Badge>
            </div>
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {getLocalizedText('لا توجد فعاليات', 'No events found', 'Aucun événement trouvé')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {event.main_image && (
                      <div className="relative h-40">
                        <img
                          src={event.main_image}
                          alt={event.title_ar}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {getStatusBadge(event.status)}
                          {getEventTypeBadge(event.event_type)}
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900">
                        {language === 'en'
                          ? event.title_en
                          : language === 'fr'
                          ? event.title_fr
                          : event.title_ar}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      </div>
                      {event.is_recurring && (
                        <Badge variant="outline" className="text-xs">
                          <Repeat className="h-3 w-3 mr-1" />
                          {getLocalizedText('متكررة', 'Recurring', 'Récurrent')}
                        </Badge>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {language === 'en'
                          ? event.description_en
                          : language === 'fr'
                          ? event.description_fr
                          : event.description_ar}
                      </p>
                      {event.ticket_price && (
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Ticket className="h-4 w-4" />
                          <span>{event.ticket_price} {event.currency}</span>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {getLocalizedText('تعديل', 'Edit', 'Modifier')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(event)}
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
                    {editingEvent ? text.editEvent : text.addEvent}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">{getLocalizedText('أساسي', 'Basic', 'De Base')}</TabsTrigger>
                        <TabsTrigger value="dates">{getLocalizedText('التواريخ', 'Dates', 'Dates')}</TabsTrigger>
                        <TabsTrigger value="details">{getLocalizedText('تفاصيل', 'Details', 'Détails')}</TabsTrigger>
                      </TabsList>

                      {/* Basic Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.eventTitle} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="title-ar">{text.arabic}</Label>
                              <Input
                                id="title-ar"
                                value={formData.title.ar}
                                onChange={(e) => handleInputChange('title', e.target.value, 'ar')}
                                placeholder="عنوان الفعالية بالعربية"
                                dir="rtl"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="title-en">{text.english}</Label>
                              <Input
                                id="title-en"
                                value={formData.title.en}
                                onChange={(e) => handleInputChange('title', e.target.value, 'en')}
                                placeholder="Event title in English"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="title-fr">{text.french}</Label>
                              <Input
                                id="title-fr"
                                value={formData.title.fr}
                                onChange={(e) => handleInputChange('title', e.target.value, 'fr')}
                                placeholder="Titre de l'événement en français"
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
                                placeholder="وصف الفعالية بالعربية"
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
                                placeholder="Event description in English"
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
                                placeholder="Description de l'événement en français"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="event-type" className="text-base font-medium">
                            {text.eventType} <Badge variant="destructive">{text.required}</Badge>
                          </Label>
                          <select
                            id="event-type"
                            value={formData.eventType}
                            onChange={(e) => handleInputChange('eventType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          >
                            {eventTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="main-image" className="text-base font-medium">
                            {getLocalizedText('الصورة الرئيسية', 'Main Image', 'Image Principale')} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <div className="flex space-x-2">
                            <Camera className="w-5 h-5 text-gray-400 mt-2" />
                            <Input
                              id="main-image"
                              value={formData.mainImage || ''}
                              onChange={(e) => handleInputChange('mainImage', e.target.value || undefined)}
                              placeholder="https://example.com/image.jpg"
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
                      </TabsContent>

                      {/* Dates Tab */}
                      <TabsContent value="dates" className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="start-date" className="text-base font-medium">
                              {text.startDate} <Badge variant="destructive">{text.required}</Badge>
                            </Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date" className="text-base font-medium">
                              {text.endDate} <Badge variant="destructive">{text.required}</Badge>
                            </Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={formData.endDate}
                              onChange={(e) => handleInputChange('endDate', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is-recurring"
                              checked={formData.isRecurring}
                              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="is-recurring" className="flex items-center gap-2">
                              <Repeat className="h-4 w-4" />
                              {text.isRecurring}
                            </Label>
                          </div>
                          {formData.isRecurring && (
                            <div>
                              <Label htmlFor="recurrence-pattern">{text.recurrencePattern}</Label>
                              <Input
                                id="recurrence-pattern"
                                value={formData.recurrencePattern || ''}
                                onChange={(e) => handleInputChange('recurrencePattern', e.target.value || undefined)}
                                placeholder="e.g., yearly, monthly, weekly"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.location} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="location-ar">{text.arabic}</Label>
                              <Input
                                id="location-ar"
                                value={formData.location.ar}
                                onChange={(e) => handleInputChange('location', e.target.value, 'ar')}
                                placeholder="الموقع بالعربية"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location-en">{text.english}</Label>
                              <Input
                                id="location-en"
                                value={formData.location.en}
                                onChange={(e) => handleInputChange('location', e.target.value, 'en')}
                                placeholder="Location in English"
                              />
                            </div>
                            <div>
                              <Label htmlFor="location-fr">{text.french}</Label>
                              <Input
                                id="location-fr"
                                value={formData.location.fr}
                                onChange={(e) => handleInputChange('location', e.target.value, 'fr')}
                                placeholder="Emplacement en français"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {getLocalizedText('الإحداثيات', 'Coordinates', 'Coordonnées')} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <p className="text-sm text-gray-500">
                            {getLocalizedText('انقر على الخريطة لاختيار الموقع', 'Click on the map to select location', 'Cliquez sur la carte pour sélectionner l\'emplacement')}
                          </p>
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

                      {/* Details Tab */}
                      <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-base font-medium">
                            {text.organizer} <Badge variant="outline">{text.optional}</Badge>
                          </Label>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <Label htmlFor="organizer-ar">{text.arabic}</Label>
                              <Input
                                id="organizer-ar"
                                value={formData.organizer.ar}
                                onChange={(e) => handleInputChange('organizer', e.target.value, 'ar')}
                                placeholder="المنظم بالعربية"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <Label htmlFor="organizer-en">{text.english}</Label>
                              <Input
                                id="organizer-en"
                                value={formData.organizer.en}
                                onChange={(e) => handleInputChange('organizer', e.target.value, 'en')}
                                placeholder="Organizer in English"
                              />
                            </div>
                            <div>
                              <Label htmlFor="organizer-fr">{text.french}</Label>
                              <Input
                                id="organizer-fr"
                                value={formData.organizer.fr}
                                onChange={(e) => handleInputChange('organizer', e.target.value, 'fr')}
                                placeholder="Organisateur en français"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="ticket-price">{text.ticketPrice}</Label>
                            <Input
                              id="ticket-price"
                              type="number"
                              step="0.01"
                              value={formData.ticketPrice || ''}
                              onChange={(e) => handleInputChange('ticketPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
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

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="contact-phone">{getLocalizedText('الهاتف', 'Phone', 'Téléphone')}</Label>
                            <Input
                              id="contact-phone"
                              value={formData.contactPhone || ''}
                              onChange={(e) => handleInputChange('contactPhone', e.target.value || undefined)}
                              placeholder="+1234567890"
                            />
                          </div>
                          <div>
                            <Label htmlFor="contact-email">{getLocalizedText('البريد الإلكتروني', 'Email', 'Email')}</Label>
                            <Input
                              id="contact-email"
                              type="email"
                              value={formData.contactEmail || ''}
                              onChange={(e) => handleInputChange('contactEmail', e.target.value || undefined)}
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="website">{getLocalizedText('الموقع الإلكتروني', 'Website', 'Site Web')}</Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website || ''}
                            onChange={(e) => handleInputChange('website', e.target.value || undefined)}
                            placeholder="https://example.com"
                          />
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
                      {editingEvent && editingEvent.status === 'draft' && (
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
                      {editingEvent && editingEvent.status === 'pending_review' && (
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

export default AdminEventManagement;

