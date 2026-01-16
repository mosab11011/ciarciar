import { useState, useEffect } from 'react';
import { SiteSettings, UpdateSiteSettingsRequest } from '@shared/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Upload, Trash2, GripVertical, Palette, Image as ImageIcon, Video, Move } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SiteSettingsManagerProps {
  onUpdate?: () => void;
}

const AVAILABLE_COMPONENTS = [
  { id: 'hero', label: { ar: 'الهيدر الرئيسي', en: 'Hero Header', fr: 'En-tête Principal' } },
  { id: 'travel-offices', label: { ar: 'المكاتب السياحية', en: 'Travel Offices', fr: 'Bureaux de Voyage' } },
  { id: 'discover', label: { ar: 'قسم الاكتشاف', en: 'Discover Section', fr: 'Section Découverte' } },
  { id: 'features', label: { ar: 'المميزات', en: 'Features', fr: 'Caractéristiques' } },
  { id: 'about', label: { ar: 'من نحن', en: 'About Us', fr: 'À Propos' } },
  { id: 'destinations', label: { ar: 'الوجهات المميزة', en: 'Featured Destinations', fr: 'Destinations Phares' } },
  { id: 'testimonials', label: { ar: 'شهادات العملاء', en: 'Testimonials', fr: 'Témoignages' } },
  { id: 'payment-methods', label: { ar: 'طرق الدفع', en: 'Payment Methods', fr: 'Moyens de Paiement' } },
  { id: 'statistics', label: { ar: 'الإحصائيات', en: 'Statistics', fr: 'Statistiques' } },
  { id: 'newsletter', label: { ar: 'النشرة الإخبارية', en: 'Newsletter', fr: 'Newsletter' } },
  { id: 'services', label: { ar: 'الخدمات', en: 'Services', fr: 'Services' } },
  { id: 'map', label: { ar: 'الخريطة', en: 'Map', fr: 'Carte' } },
  { id: 'contact', label: { ar: 'اتصل بنا', en: 'Contact', fr: 'Contact' } },
  // 16 مكون ديناميكي جديد وقوي
  { id: 'gallery', label: { ar: 'معرض الصور', en: 'Photo Gallery', fr: 'Galerie Photos' } },
  { id: 'blog', label: { ar: 'المدونة', en: 'Blog', fr: 'Blog' } },
  { id: 'partners', label: { ar: 'الشركاء', en: 'Partners', fr: 'Partenaires' } },
  { id: 'awards', label: { ar: 'الجوائز والإنجازات', en: 'Awards & Achievements', fr: 'Prix et Réalisations' } },
  { id: 'team', label: { ar: 'فريق العمل', en: 'Our Team', fr: 'Notre Équipe' } },
  { id: 'faq', label: { ar: 'الأسئلة الشائعة', en: 'FAQ', fr: 'FAQ' } },
  { id: 'pricing', label: { ar: 'الأسعار والعروض', en: 'Pricing & Offers', fr: 'Tarifs et Offres' } },
  { id: 'reviews', label: { ar: 'التقييمات والمراجعات', en: 'Reviews & Ratings', fr: 'Avis et Notes' } },
  { id: 'social-media', label: { ar: 'وسائل التواصل الاجتماعي', en: 'Social Media', fr: 'Réseaux Sociaux' } },
  { id: 'video-gallery', label: { ar: 'معرض الفيديو', en: 'Video Gallery', fr: 'Galerie Vidéo' } },
  { id: 'timeline', label: { ar: 'الخط الزمني', en: 'Timeline', fr: 'Chronologie' } },
  { id: 'countdown', label: { ar: 'العد التنازلي', en: 'Countdown Timer', fr: 'Compte à Rebours' } },
  { id: 'promotions', label: { ar: 'العروض الترويجية', en: 'Promotions', fr: 'Promotions' } },
  { id: 'live-chat', label: { ar: 'الدردشة المباشرة', en: 'Live Chat', fr: 'Chat en Direct' } },
  { id: 'weather-widget', label: { ar: 'طقس الوجهات', en: 'Weather Widget', fr: 'Widget Météo' } },
  { id: 'currency-converter', label: { ar: 'محول العملات', en: 'Currency Converter', fr: 'Convertisseur de Devises' } }
];

export default function SiteSettingsManager({ onUpdate }: SiteSettingsManagerProps) {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    switch (language) {
      case 'ar': return ar;
      case 'en': return en;
      case 'fr': return fr;
      default: return ar;
    }
  };

  // Convert hex to HSL
  const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Apply dynamic colors to CSS variables
  const applyDynamicColors = (settings: SiteSettings) => {
    if (!settings) return;
    
    const root = document.documentElement;
    if (settings.primaryColor) {
      const hsl = hexToHsl(settings.primaryColor);
      if (hsl) {
        root.style.setProperty('--tarhal-blue', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty('--tarhal-blue-dark', `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 15, 20)}%`);
      }
    }
    if (settings.secondaryColor) {
      const hsl = hexToHsl(settings.secondaryColor);
      if (hsl) {
        root.style.setProperty('--tarhal-orange', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        root.style.setProperty('--tarhal-orange-dark', `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 15, 20)}%`);
      }
    }
    if (settings.backgroundColor) {
      root.style.setProperty('--background', settings.backgroundColor);
    }
    if (settings.headerBackgroundColor) {
      const hsl = hexToHsl(settings.headerBackgroundColor);
      if (hsl) {
        root.style.setProperty('--tarhal-navy', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      }
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      applyDynamicColors(settings);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site-settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
        applyDynamicColors(data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      alert(getLocalizedText('خطأ في تحميل الإعدادات', 'Error loading settings', 'Erreur lors du chargement des paramètres'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const updateData: UpdateSiteSettingsRequest = {
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        backgroundColor: settings.backgroundColor,
        headerBackgroundColor: settings.headerBackgroundColor,
        headerVideoUrl: settings.headerVideoUrl,
        headerVideoPoster: settings.headerVideoPoster,
        headerBackgroundImages: settings.headerBackgroundImages || [],
        discoverSectionBackgroundImage: settings.discoverSectionBackgroundImage,
        featuresSectionBackgroundImage: settings.featuresSectionBackgroundImage,
        componentOrder: settings.componentOrder || [],
        settingsJson: settings.settingsJson || {}
      };

      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success && data.data) {
        setSettings(data.data);
        // Apply colors dynamically
        applyDynamicColors(data.data);
        console.log('Settings saved and colors applied:', data.data);
        alert(getLocalizedText('تم حفظ الإعدادات بنجاح!', 'Settings saved successfully!', 'Paramètres enregistrés avec succès!'));
        if (onUpdate) onUpdate();
      } else {
        console.error('Save failed:', data);
        alert(getLocalizedText('خطأ في حفظ الإعدادات: ' + (data.error || 'Unknown error'), 'Error saving settings: ' + (data.error || 'Unknown error'), 'Erreur lors de l\'enregistrement des paramètres: ' + (data.error || 'Erreur inconnue')));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(getLocalizedText('خطأ في حفظ الإعدادات', 'Error saving settings', 'Erreur lors de l\'enregistrement des paramètres'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(getLocalizedText('هل أنت متأكد من إعادة تعيين الإعدادات إلى الافتراضية؟', 'Are you sure you want to reset settings to default?', 'Êtes-vous sûr de vouloir réinitialiser les paramètres par défaut?'))) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/site-settings/reset', {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        applyDynamicColors(data.data);
        alert(getLocalizedText('تم إعادة تعيين الإعدادات!', 'Settings reset!', 'Paramètres réinitialisés!'));
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert(getLocalizedText('خطأ في إعادة التعيين', 'Error resetting', 'Erreur lors de la réinitialisation'));
    } finally {
      setSaving(false);
    }
  };

  const addHeaderImage = () => {
    if (!newImageUrl.trim() || !settings) return;
    setSettings({
      ...settings,
      headerBackgroundImages: [...(settings.headerBackgroundImages || []), newImageUrl.trim()]
    });
    setNewImageUrl('');
  };

  const removeHeaderImage = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      headerBackgroundImages: (settings.headerBackgroundImages || []).filter((_, i) => i !== index)
    });
  };

  const moveComponent = (index: number, direction: 'up' | 'down') => {
    if (!settings || !settings.componentOrder) return;
    const newOrder = [...settings.componentOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSettings({ ...settings, componentOrder: newOrder });
  };

  if (loading) {
    return <div className="text-center py-8">{getLocalizedText('جاري التحميل...', 'Loading...', 'Chargement...')}</div>;
  }

  if (!settings) {
    return <div className="text-center py-8 text-red-600">{getLocalizedText('خطأ في تحميل الإعدادات', 'Error loading settings', 'Erreur lors du chargement des paramètres')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('الألوان', 'Colors', 'Couleurs')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{getLocalizedText('اللون الأساسي', 'Primary Color', 'Couleur Principale')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={settings.primaryColor || '#1e40af'}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.primaryColor || '#1e40af'}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>{getLocalizedText('اللون الثانوي', 'Secondary Color', 'Couleur Secondaire')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={settings.secondaryColor || '#f97316'}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.secondaryColor || '#f97316'}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>{getLocalizedText('لون الخلفية', 'Background Color', 'Couleur de Fond')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.backgroundColor || '#ffffff'}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label>{getLocalizedText('لون خلفية الهيدر', 'Header Background Color', 'Couleur de Fond de l\'En-tête')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={settings.headerBackgroundColor || '#0f172a'}
                onChange={(e) => setSettings({ ...settings, headerBackgroundColor: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.headerBackgroundColor || '#0f172a'}
                onChange={(e) => setSettings({ ...settings, headerBackgroundColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header Video Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Video className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('فيديو الهيدر', 'Header Video', 'Vidéo d\'En-tête')}</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label>{getLocalizedText('رابط الفيديو (URL)', 'Video URL', 'URL de la Vidéo')}</Label>
            <Input
              value={settings.headerVideoUrl || ''}
              onChange={(e) => setSettings({ ...settings, headerVideoUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="mt-1"
            />
          </div>
          <div>
            <Label>{getLocalizedText('صورة الغلاف (Poster)', 'Video Poster Image', 'Image de Couverture')}</Label>
            <Input
              value={settings.headerVideoPoster || ''}
              onChange={(e) => setSettings({ ...settings, headerVideoPoster: e.target.value })}
              placeholder="https://example.com/poster.jpg"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Background Images Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('صور الخلفية', 'Background Images', 'Images de Fond')}</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label>{getLocalizedText('صور خلفية الهيدر', 'Header Background Images', 'Images de Fond de l\'En-tête')}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button onClick={addHeaderImage} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                {getLocalizedText('إضافة', 'Add', 'Ajouter')}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {(settings.headerBackgroundImages || []).map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Header ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeHeaderImage(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>{getLocalizedText('صورة خلفية قسم الاكتشاف', 'Discover Section Background Image', 'Image de Fond de la Section Découverte')}</Label>
            <Input
              value={settings.discoverSectionBackgroundImage || ''}
              onChange={(e) => setSettings({ ...settings, discoverSectionBackgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>
          <div>
            <Label>{getLocalizedText('صورة خلفية قسم المميزات', 'Features Section Background Image', 'Image de Fond de la Section Caractéristiques')}</Label>
            <Input
              value={settings.featuresSectionBackgroundImage || ''}
              onChange={(e) => setSettings({ ...settings, featuresSectionBackgroundImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Component Order Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Move className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">{getLocalizedText('ترتيب المكونات', 'Component Order', 'Ordre des Composants')}</h3>
        </div>
        <div className="space-y-2">
          {(settings.componentOrder || []).map((componentId, index) => {
            const component = AVAILABLE_COMPONENTS.find(c => c.id === componentId);
            return component ? (
              <div key={componentId} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <GripVertical className="h-5 w-5 text-gray-400" />
                <span className="flex-1">{component.label[language] || component.label.ar}</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveComponent(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveComponent(index, 'down')}
                    disabled={index === (settings.componentOrder?.length || 0) - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          {getLocalizedText('حفظ الإعدادات', 'Save Settings', 'Enregistrer les Paramètres')}
        </Button>
        <Button onClick={handleReset} variant="outline" disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {getLocalizedText('إعادة التعيين', 'Reset to Default', 'Réinitialiser')}
        </Button>
      </div>
    </div>
  );
}

