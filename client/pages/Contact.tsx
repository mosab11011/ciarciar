import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar, User, Building, Globe, MessageSquare, CheckCircle, AlertCircle, Zap, HeadphonesIcon, Sparkles, TrendingUp, Award, Shield, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GoogleMap from '@/components/GoogleMap';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  message: string;
  contactMethod: string;
  tripType: string;
}

export default function Contact() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    country: '',
    subject: '',
    message: '',
    contactMethod: 'email',
    tripType: 'leisure'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ContactForm>>({});
  const { language } = useLanguage();

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    if (language === 'ar') return ar;
    if (language === 'fr') return fr;
    return en;
  };

  const headerImages = [
    'https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg',
    'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg',
    'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg',
    'https://images.pexels.com/photos/33351942/pexels-photo-33351942.jpeg',
    'https://images.pexels.com/photos/53537/caravan-desert-safari-dune-53537.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = getLocalizedText('الاسم الكامل مطلوب', 'Full name is required', 'Le nom complet est requis');
    }

    if (!formData.email.trim()) {
      newErrors.email = getLocalizedText('البريد الإلكتروني مطلوب', 'Email is required', 'L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = getLocalizedText('يرجى إدخال بريد إلكتروني صحيح', 'Please enter a valid email', 'Veuillez saisir un email valide');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = getLocalizedText('موضوع الرسالة مطلوب', 'Subject is required', 'Le sujet est requis');
    }

    if (!formData.message.trim()) {
      newErrors.message = getLocalizedText('محتوى الرسالة مطلوب', 'Message is required', 'Le message est requis');
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof ContactForm]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormErrors({});
        setFormData({
          name: '',
          email: '',
          phone: '',
          country: '',
          subject: '',
          message: '',
          contactMethod: 'email',
          tripType: 'leisure'
        });
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      setFormErrors({ message: getLocalizedText('حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'An error occurred. Please try again.', 'Une erreur s\'est produite. Veuillez réessayer.') });
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: getLocalizedText('اتصل بنا', 'Call Us', 'Appelez-nous'),
      details: ['+249 123 456 789', '+966 11 234 5678', '+971 4 567 8901'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: getLocalizedText('راسلنا', 'Email Us', 'Envoyez-nous un email'),
      details: ['info@tarhal.com', 'booking@tarhal.com', 'support@tarhal.com'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: getLocalizedText('زورنا', 'Visit Us', 'Visitez-nous'),
      details: [
        getLocalizedText('الخرطوم، السودان', 'Khartoum, Sudan', 'Khartoum, Soudan'),
        getLocalizedText('الرياض، السعودية', 'Riyadh, Saudi Arabia', 'Riyad, Arabie Saoudite'),
        getLocalizedText('دبي، الإمارات', 'Dubai, UAE', 'Dubaï, EAU')
      ],
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: getLocalizedText('أوقات العمل', 'Working Hours', 'Heures d\'ouverture'),
      details: [
        getLocalizedText('السبت - الخميس: 9 صباحاً - 6 مساءً', 'Sat - Thu: 9 AM - 6 PM', 'Sam - Jeu: 9h - 18h'),
        getLocalizedText('الجمعة: 2 ظهراً - 6 مساءً', 'Friday: 2 PM - 6 PM', 'Vendredi: 14h - 18h'),
        getLocalizedText('دعم طوارئ: 24/7', 'Emergency support: 24/7', 'Support d\'urgence: 24/7')
      ],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const socialPlatforms = [
    { name: 'WhatsApp', icon: <MessageCircle className="h-5 w-5" />, color: 'bg-green-500', url: '#' },
    { name: 'Telegram', icon: <MessageSquare className="h-5 w-5" />, color: 'bg-blue-500', url: '#' },
    { name: 'Facebook', icon: <span className="text-lg">📘</span>, color: 'bg-blue-600', url: '#' },
    { name: 'Instagram', icon: <span className="text-lg">📷</span>, color: 'bg-pink-500', url: '#' },
    { name: 'Twitter', icon: <span className="text-lg">🐦</span>, color: 'bg-blue-400', url: '#' },
    { name: 'LinkedIn', icon: <span className="text-lg">💼</span>, color: 'bg-blue-700', url: '#' },
    { name: 'YouTube', icon: <span className="text-lg">📺</span>, color: 'bg-red-500', url: '#' }
  ];

  const officeLocations = [
    {
      city: getLocalizedText('الخرطوم', 'Khartoum', 'Khartoum'),
      country: getLocalizedText('السودان', 'Sudan', 'Soudan'),
      address: getLocalizedText('شارع البلدية، الخرطوم', 'Municipality Street, Khartoum', 'Rue de la Municipalité, Khartoum'),
      phone: '+249 123 456 789',
      email: 'khartoum@tarhal.com',
      manager: getLocalizedText('أحمد محمد علي', 'Ahmed Mohamed Ali', 'Ahmed Mohamed Ali'),
      image: 'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg'
    },
    {
      city: getLocalizedText('الرياض', 'Riyadh', 'Riyad'),
      country: getLocalizedText('السعودية', 'Saudi Arabia', 'Arabie Saoudite'),
      address: getLocalizedText('طريق الملك عبدالعزيز، الرياض', 'King Abdulaziz Road, Riyadh', 'Route du roi Abdulaziz, Riyad'),
      phone: '+966 11 234 5678',
      email: 'riyadh@tarhal.com',
      manager: getLocalizedText('محمد عبدالله', 'Mohammed Abdullah', 'Mohammed Abdullah'),
      image: 'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg'
    },
    {
      city: getLocalizedText('دبي', 'Dubai', 'Dubaï'),
      country: getLocalizedText('الإمارات', 'UAE', 'EAU'),
      address: getLocalizedText('شارع الشيخ زايد، دبي', 'Sheikh Zayed Road, Dubai', 'Route Sheikh Zayed, Dubaï'),
      phone: '+971 4 567 8901',
      email: 'dubai@tarhal.com',
      manager: getLocalizedText('فاطمة أحمد', 'Fatima Ahmed', 'Fatima Ahmed'),
      image: 'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg'
    },
    {
      city: getLocalizedText('القاهرة', 'Cairo', 'Le Caire'),
      country: getLocalizedText('مصر', 'Egypt', 'Égypte'),
      address: getLocalizedText('شارع التحرير، القاهرة', 'Tahrir Street, Cairo', 'Rue Tahrir, Le Caire'),
      phone: '+20 2 234 5678',
      email: 'cairo@tarhal.com',
      manager: getLocalizedText('عمر حسن', 'Omar Hassan', 'Omar Hassan'),
      image: 'https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg'
    },
    {
      city: getLocalizedText('إسطنبول', 'Istanbul', 'Istanbul'),
      country: getLocalizedText('تركيا', 'Turkey', 'Turquie'),
      address: getLocalizedText('شارع الاستقلال، إسطنبول', 'Istiklal Street, Istanbul', 'Rue Istiklal, Istanbul'),
      phone: '+90 212 345 6789',
      email: 'istanbul@tarhal.com',
      manager: getLocalizedText('أيلين أوزتورك', 'Aylin Ozturk', 'Aylin Ozturk'),
      image: 'https://images.pexels.com/photos/33351942/pexels-photo-33351942.jpeg'
    },
    {
      city: getLocalizedText('الدار البيضاء', 'Casablanca', 'Casablanca'),
      country: getLocalizedText('المغرب', 'Morocco', 'Maroc'),
      address: getLocalizedText('شارع محمد الخامس، الدار البيضاء', 'Mohammed V Avenue, Casablanca', 'Avenue Mohammed V, Casablanca'),
      phone: '+212 522 123 456',
      email: 'casablanca@tarhal.com',
      manager: getLocalizedText('يوسف بن علي', 'Youssef Ben Ali', 'Youssef Ben Ali'),
      image: 'https://images.pexels.com/photos/53537/caravan-desert-safari-dune-53537.jpeg'
    }
  ];

  const countries = [
    getLocalizedText('السودان', 'Sudan', 'Soudan'),
    getLocalizedText('السعودية', 'Saudi Arabia', 'Arabie Saoudite'),
    getLocalizedText('الإمارات', 'UAE', 'EAU'),
    getLocalizedText('مصر', 'Egypt', 'Égypte'),
    getLocalizedText('الأردن', 'Jordan', 'Jordanie'),
    getLocalizedText('لبنان', 'Lebanon', 'Liban'),
    getLocalizedText('سوريا', 'Syria', 'Syrie'),
    getLocalizedText('العراق', 'Iraq', 'Irak'),
    getLocalizedText('الكويت', 'Kuwait', 'Koweït'),
    getLocalizedText('قطر', 'Qatar', 'Qatar'),
    getLocalizedText('البحرين', 'Bahrain', 'Bahreïn'),
    getLocalizedText('عمان', 'Oman', 'Oman'),
    getLocalizedText('المغرب', 'Morocco', 'Maroc'),
    getLocalizedText('الجزائر', 'Algeria', 'Algérie'),
    getLocalizedText('تونس', 'Tunisia', 'Tunisie'),
    getLocalizedText('ليبيا', 'Libya', 'Libye'),
    getLocalizedText('تركيا', 'Turkey', 'Turquie'),
    getLocalizedText('إيران', 'Iran', 'Iran'),
    getLocalizedText('باكستان', 'Pakistan', 'Pakistan'),
    getLocalizedText('أفغانستان', 'Afghanistan', 'Afghanistan'),
    getLocalizedText('ماليزيا', 'Malaysia', 'Malaisie'),
    getLocalizedText('إندونيسيا', 'Indonesia', 'Indonésie'),
    getLocalizedText('أخرى', 'Other', 'Autre')
  ];

  const subjects = [
    getLocalizedText('استفسار عام', 'General Inquiry', 'Demande générale'),
    getLocalizedText('حجز رحلة', 'Trip Booking', 'Réservation de voyage'),
    getLocalizedText('إلغاء أو تعديل', 'Cancellation or Modification', 'Annulation ou modification'),
    getLocalizedText('شكوى', 'Complaint', 'Réclamation'),
    getLocalizedText('اقتراح', 'Suggestion', 'Suggestion'),
    getLocalizedText('طلب عرض سعر', 'Quote Request', 'Demande de devis'),
    getLocalizedText('دعم تقني', 'Technical Support', 'Support technique'),
    getLocalizedText('شراكة تجارية', 'Business Partnership', 'Partenariat commercial')
  ];

  return (
    <Layout>
      {/* Hero Header - Premium */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {headerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-tarhal-navy/90 via-tarhal-blue-dark/80 to-tarhal-navy/85"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy/70 via-transparent to-tarhal-blue/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,165,0,0.1),transparent_60%)]"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-tarhal-orange" />
                <span className="text-sm font-semibold text-white">{getLocalizedText('دعم فوري 24/7', '24/7 Instant Support', 'Support instant 24/7')}</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
                {getLocalizedText('تواصل معنا', 'Contact Us', 'Contactez-nous')}
                <span className="block text-tarhal-orange text-3xl md:text-4xl lg:text-5xl font-normal mt-3 bg-gradient-to-r from-tarhal-orange to-yellow-300 bg-clip-text text-transparent">
                  {getLocalizedText('نحن هنا لخدمتكم', 'We Are Here to Serve You', 'Nous sommes là pour vous servir')}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 animate-fade-in leading-relaxed font-light" style={{ animationDelay: '250ms' }}>
                {getLocalizedText(
                  'فريقنا المتخصص جاهز للإجابة على جميع استفساراتكم ومساعدتكم في تخطيط رحلتكم المثالية',
                  'Our specialized team is ready to answer all your inquiries and help you plan your perfect trip',
                  'Notre équipe spécialisée est prête à répondre à toutes vos questions et à vous aider à planifier votre voyage parfait'
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in mb-8" style={{ animationDelay: '500ms' }}>
                <a href="tel:+249123456789" className="flex items-center gap-3 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark hover:from-tarhal-orange-dark hover:to-tarhal-orange text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold">
                  <Phone className="h-5 w-5" />
                  <span>+249 123 456 789</span>
                </a>
                <a href="mailto:info@tarhal.com" className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold">
                  <Mail className="h-5 w-5" />
                  <span>info@tarhal.com</span>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '700ms' }}>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-tarhal-orange mb-1">2h</div>
                  <div className="text-xs text-white/80">{getLocalizedText('متوسط وقت الرد', 'Avg Response Time', 'Temps de réponse moyen')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-tarhal-orange mb-1">24/7</div>
                  <div className="text-xs text-white/80">{getLocalizedText('دعم متاح', 'Support Available', 'Support disponible')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-tarhal-orange mb-1">98%</div>
                  <div className="text-xs text-white/80">{getLocalizedText('رضا العملاء', 'Customer Satisfaction', 'Satisfaction client')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Actions - Premium */}
      <section className="py-16 bg-gradient-to-br from-tarhal-orange/5 via-tarhal-blue/5 to-tarhal-orange/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-tarhal-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tarhal-blue rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-tarhal-orange/20 rounded-full px-4 py-2 mb-4">
              <Zap className="h-4 w-4 text-tarhal-orange" />
              <span className="text-sm font-semibold text-tarhal-blue-dark">{getLocalizedText('تواصل فوري', 'Instant Contact', 'Contact instantané')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-4 animate-fade-in">
              {getLocalizedText('اتصل بنا الآن', 'Contact Us Now', 'Contactez-nous maintenant')}
            </h2>
            <p className="text-lg text-tarhal-gray-dark animate-slide-up max-w-2xl mx-auto">
              {getLocalizedText('طرق سريعة للتواصل مع فريقنا', 'Quick Ways to Reach Our Team', 'Moyens rapides de contacter notre équipe')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-scale-in max-w-4xl mx-auto">
            <Button
              onClick={() => window.open('https://wa.me/249123456789', '_blank')}
              className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <MessageCircle className="h-6 w-6 relative z-10" />
              <span className="relative z-10">{getLocalizedText('واتساب', 'WhatsApp', 'WhatsApp')}</span>
            </Button>

            <Button
              onClick={() => window.open('tel:+249123456789', '_blank')}
              className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <Phone className="h-6 w-6 relative z-10" />
              <span className="relative z-10">{getLocalizedText('اتصال هاتفي', 'Phone Call', 'Appel téléphonique')}</span>
            </Button>

            <Button
              onClick={() => window.open('mailto:info@tarhal.com', '_blank')}
              className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <Mail className="h-6 w-6 relative z-10" />
              <span className="relative z-10">{getLocalizedText('إرسال بريد', 'Send Email', 'Envoyer un email')}</span>
            </Button>

            <Button
              onClick={() => window.open('https://t.me/tarhaltravel', '_blank')}
              className="group relative bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <MessageSquare className="h-6 w-6 relative z-10" />
              <span className="relative z-10">{getLocalizedText('تليجرام', 'Telegram', 'Telegram')}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Information Cards - Premium */}
      <section className="py-20 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-0 w-full h-96 bg-gradient-to-r from-tarhal-orange/20 to-transparent"></div>
          <div className="absolute bottom-20 right-0 w-full h-96 bg-gradient-to-l from-tarhal-blue/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <MessageCircle className="h-4 w-4" />
              <span>{getLocalizedText('تواصل معنا', 'Get in Touch', 'Contactez-nous')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-4 animate-fade-in">
              {getLocalizedText('طرق التواصل', 'Contact Methods', 'Méthodes de contact')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark animate-slide-up max-w-2xl mx-auto">
              {getLocalizedText('اختر الطريقة الأنسب للتواصل معنا', 'Choose the Best Way to Reach Us', 'Choisissez le meilleur moyen de nous joindre')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group relative text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-scale-in border border-tarhal-gray-light/50 overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Icon Container */}
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {info.icon}
                  </div>
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-4 group-hover:text-tarhal-orange transition-colors duration-300">{info.title}</h3>
                  <div className="space-y-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-tarhal-gray-dark text-sm leading-relaxed group-hover:text-tarhal-blue-dark transition-colors duration-300">{detail}</p>
                    ))}
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-tarhal-orange to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact & Business Hours */}
      <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Emergency Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-tarhal-blue-dark">
                    {getLocalizedText('الطوارئ', 'Emergency', 'Urgence')}
                  </h3>
                  <p className="text-tarhal-gray-dark">
                    {getLocalizedText('دعم 24/7 للحالات الطارئة', '24/7 Emergency Support', 'Support d\'urgence 24/7')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <Phone className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-tarhal-blue-dark">
                      {getLocalizedText('خط الطوارئ', 'Emergency Line', 'Ligne d\'urgence')}
                    </p>
                    <p className="text-tarhal-gray-dark">+249 999 999 999</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-semibold text-tarhal-blue-dark">
                      {getLocalizedText('واتساب الطوارئ', 'Emergency WhatsApp', 'WhatsApp d\'urgence')}
                    </p>
                    <p className="text-tarhal-gray-dark">+249 999 999 998</p>
                  </div>
                </div>

                <Button
                  onClick={() => window.open('tel:+249999999999', '_blank')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  {getLocalizedText('اتصل بالطوارئ الآن', 'Call Emergency Now', 'Appeler l\'urgence maintenant')}
                </Button>
              </div>
            </div>

            {/* Business Hours Status */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-tarhal-blue-dark">
                    {getLocalizedText('حالة العمل', 'Business Status', 'Statut commercial')}
                  </h3>
                  <p className="text-tarhal-gray-dark">
                    {getLocalizedText('أوقات العمل والتوفر', 'Working Hours and Availability', 'Heures d\'ouverture et disponibilité')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-tarhal-blue-dark">
                      {getLocalizedText('مفتوح الآن', 'Open Now', 'Ouvert maintenant')}
                    </span>
                  </div>
                  <span className="text-sm text-tarhal-gray-dark">9:00 {getLocalizedText('ص', 'AM', 'h')} - 6:00 {getLocalizedText('م', 'PM', 'h')}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-tarhal-gray-dark">
                      {getLocalizedText('السبت - الخميس:', 'Sat - Thu:', 'Sam - Jeu:')}
                    </span>
                    <span className="font-medium">9:00 {getLocalizedText('ص', 'AM', 'h')} - 6:00 {getLocalizedText('م', 'PM', 'h')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tarhal-gray-dark">
                      {getLocalizedText('الجمعة:', 'Friday:', 'Vendredi:')}
                    </span>
                    <span className="font-medium">2:00 {getLocalizedText('م', 'PM', 'h')} - 6:00 {getLocalizedText('م', 'PM', 'h')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tarhal-gray-dark">
                      {getLocalizedText('الطوارئ:', 'Emergency:', 'Urgence:')}
                    </span>
                    <span className="font-medium text-green-600">24/7</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-tarhal-gray-dark">
                    {getLocalizedText('الرد خلال', 'Response within', 'Réponse dans')} <span className="font-bold text-tarhal-orange">2 {getLocalizedText('ساعات', 'hours', 'heures')}</span> {getLocalizedText('في أوقات العمل', 'during business hours', 'pendant les heures d\'ouverture')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form - Premium */}
      <section className="py-24 bg-gradient-to-br from-tarhal-blue via-tarhal-blue-dark to-tarhal-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-tarhal-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
                <MessageCircle className="h-4 w-4 text-tarhal-orange" />
                <span className="text-sm font-semibold text-white">{getLocalizedText('تواصل معنا', 'Get in Touch', 'Contactez-nous')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {getLocalizedText('أرسل لنا رسالة', 'Send Us a Message', 'Envoyez-nous un message')}
              </h2>
              <p className="text-xl text-white/90 mb-10 leading-relaxed font-light">
                {getLocalizedText(
                  'املأ النموذج وسنتواصل معك في أقرب وقت ممكن',
                  'Fill out the form and we will contact you as soon as possible',
                  'Remplissez le formulaire et nous vous contacterons dès que possible'
                )}
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-sm">{getLocalizedText('معلومات آمنة', 'Secure Information', 'Informations sécurisées')}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-sm">{getLocalizedText('رد سريع', 'Quick Response', 'Réponse rapide')}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Award className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-sm">{getLocalizedText('خدمة متميزة', 'Premium Service', 'Service premium')}</span>
                </div>
              </div>

              {submitted ? (
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-8 text-center animate-scale-in">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {getLocalizedText('تم إرسال رسالتك بنجاح!', 'Your message was sent successfully!', 'Votre message a été envoyé avec succès!')}
                  </h3>
                  <p className="text-white/80">
                    {getLocalizedText('سنتواصل معك خلال 24 ساعة', 'We will contact you within 24 hours', 'Nous vous contacterons dans les 24 heures')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('الاسم الكامل', 'Full Name', 'Nom complet')} *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={getLocalizedText('أدخل اسمك الكامل', 'Enter your full name', 'Entrez votre nom complet')}
                        required
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/60 focus:outline-none backdrop-blur-sm ${formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-tarhal-orange'
                          }`}
                      />
                      {formErrors.name && (
                        <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('البريد الإلكتروني', 'Email', 'Email')} *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/60 focus:outline-none backdrop-blur-sm ${formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-tarhal-orange'
                          }`}
                      />
                      {formErrors.email && (
                        <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('رقم الهاتف', 'Phone Number', 'Numéro de téléphone')}
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+249 123 456 789"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('الدولة', 'Country', 'Pays')}
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tarhal-orange backdrop-blur-sm"
                      >
                        <option value="" className="bg-tarhal-navy">
                          {getLocalizedText('اختر دولتك', 'Select your country', 'Sélectionnez votre pays')}
                        </option>
                        {countries.map((country, idx) => (
                          <option key={idx} value={country} className="bg-tarhal-navy">{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('موضوع الرسالة', 'Subject', 'Sujet')} *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none backdrop-blur-sm ${formErrors.subject ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-tarhal-orange'
                          }`}
                      >
                        <option value="" className="bg-tarhal-navy">
                          {getLocalizedText('اختر الموضوع', 'Select subject', 'Sélectionnez le sujet')}
                        </option>
                        {subjects.map((subject, idx) => (
                          <option key={idx} value={subject} className="bg-tarhal-navy">{subject}</option>
                        ))}
                      </select>
                      {formErrors.subject && (
                        <p className="text-red-300 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {formErrors.subject}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-medium">
                        {getLocalizedText('نوع الرحلة', 'Trip Type', 'Type de voyage')}
                      </label>
                      <select
                        name="tripType"
                        value={formData.tripType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tarhal-orange backdrop-blur-sm"
                      >
                        <option value="leisure" className="bg-tarhal-navy">
                          {getLocalizedText('سياحة وترفيه', 'Leisure & Tourism', 'Loisirs et tourisme')}
                        </option>
                        <option value="business" className="bg-tarhal-navy">
                          {getLocalizedText('رحلة عمل', 'Business Trip', 'Voyage d\'affaires')}
                        </option>
                        <option value="pilgrimage" className="bg-tarhal-navy">
                          {getLocalizedText('حج وعمرة', 'Hajj & Umrah', 'Hajj et Omra')}
                        </option>
                        <option value="medical" className="bg-tarhal-navy">
                          {getLocalizedText('سياحة علاجية', 'Medical Tourism', 'Tourisme médical')}
                        </option>
                        <option value="education" className="bg-tarhal-navy">
                          {getLocalizedText('سياحة تعليمية', 'Educational Tourism', 'Tourisme éducatif')}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">
                      {getLocalizedText('طريقة التواصل المفضلة', 'Preferred Contact Method', 'Méthode de contact préférée')}
                    </label>
                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="email"
                          checked={formData.contactMethod === 'email'}
                          onChange={handleInputChange}
                          className="text-tarhal-orange"
                        />
                        <Mail className="h-4 w-4" />
                        {getLocalizedText('بريد إلكتروني', 'Email', 'Email')}
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={formData.contactMethod === 'phone'}
                          onChange={handleInputChange}
                          className="text-tarhal-orange"
                        />
                        <Phone className="h-4 w-4" />
                        {getLocalizedText('هاتف', 'Phone', 'Téléphone')}
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="whatsapp"
                          checked={formData.contactMethod === 'whatsapp'}
                          onChange={handleInputChange}
                          className="text-tarhal-orange"
                        />
                        <MessageCircle className="h-4 w-4" />
                        {getLocalizedText('واتساب', 'WhatsApp', 'WhatsApp')}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-medium">
                      {getLocalizedText('رسالتك', 'Your Message', 'Votre message')} *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder={getLocalizedText(
                        'اكتب رسالتك هنا... أخبرنا عن رحلتك المثالية وسنساعدك في تحقيقها',
                        'Write your message here... Tell us about your dream trip and we will help make it happen',
                        'Écrivez votre message ici... Parlez-nous de votre voyage de rêve et nous vous aiderons à le réaliser'
                      )}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange resize-none backdrop-blur-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-4 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        {getLocalizedText('جاري الإرسال...', 'Sending...', 'Envoi en cours...')}
                      </>
                    ) : (
                      <>
                        {getLocalizedText('إرسال الرسالة', 'Send Message', 'Envoyer le message')}
                        <Send className="mr-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Illustration - Premium */}
            <div className="relative animate-slide-in-right">
              <div className="relative w-full min-h-[500px] flex items-center justify-center">
                {/* Animated Background Circles */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-tarhal-orange/30 to-tarhal-orange-dark/20 rounded-full blur-3xl animate-pulse-slow"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-tarhal-orange/20 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 text-center w-full">
                  <div className="relative w-48 h-48 mx-auto mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center shadow-2xl animate-float">
                      <MessageCircle className="h-24 w-24 text-white" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDelay: '0s' }}>
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute top-1/2 -right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 animate-bounce" style={{ animationDelay: '1s' }}>
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {getLocalizedText('نتلقى رسائلكم بسرعة', 'We Receive Your Messages Quickly', 'Nous recevons vos messages rapidement')}
                  </h3>
                  <p className="text-white/90 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    {getLocalizedText(
                      'فريقنا المتخصص جاهز للرد على استفساراتكم في أقل من 2 ساعة',
                      'Our specialized team is ready to respond to your inquiries in less than 2 hours',
                      'Notre équipe spécialisée est prête à répondre à vos demandes en moins de 2 heures'
                    )}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-tarhal-orange mb-1">2h</div>
                      <div className="text-xs text-white/70">{getLocalizedText('وقت الرد', 'Response', 'Réponse')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-tarhal-orange mb-1">24/7</div>
                      <div className="text-xs text-white/70">{getLocalizedText('متاح', 'Available', 'Disponible')}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                      <div className="text-2xl font-bold text-tarhal-orange mb-1">98%</div>
                      <div className="text-xs text-white/70">{getLocalizedText('رضا', 'Satisfaction', 'Satisfaction')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media - Premium */}
      <section className="py-20 bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-tarhal-orange rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-tarhal-blue rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Globe className="h-4 w-4" />
            <span>{getLocalizedText('تواصل اجتماعي', 'Social Media', 'Réseaux sociaux')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-4 animate-fade-in">
            {getLocalizedText('تابعونا على وسائل التواصل', 'Follow Us on Social Media', 'Suivez-nous sur les réseaux sociaux')}
          </h2>
          <p className="text-xl text-tarhal-gray-dark mb-12 animate-slide-up max-w-2xl mx-auto">
            {getLocalizedText(
              'ابقوا على اطلاع بأحدث العروض والوجهات السياحية',
              'Stay updated with the latest offers and destinations',
              'Restez informé des dernières offres et destinations'
            )}
          </p>

          <div className="flex justify-center gap-5 flex-wrap animate-scale-in max-w-4xl mx-auto">
            {socialPlatforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                className={`group relative w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative z-10 text-xl">{platform.icon}</div>
                <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 group-hover:-bottom-12 transition-all duration-300 whitespace-nowrap">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Office Locations - Premium */}
      <section className="py-24 bg-gradient-to-br from-tarhal-blue-dark via-tarhal-navy to-tarhal-blue-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,0,0.2),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.2),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Building className="h-4 w-4 text-tarhal-orange" />
              <span className="text-sm font-semibold text-white">{getLocalizedText('مكاتبنا', 'Our Offices', 'Nos bureaux')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              {getLocalizedText('مكاتبنا حول العالم', 'Our Offices Around the World', 'Nos bureaux dans le monde')}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-slide-up leading-relaxed">
              {getLocalizedText(
                'زوروا مكاتبنا في أهم المدن العربية والعالمية',
                'Visit our offices in major Arab and international cities',
                'Visitez nos bureaux dans les principales villes arabes et internationales'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeLocations.map((office, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden hover:bg-white/15 border border-white/20 hover:border-tarhal-orange/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-scale-in shadow-xl hover:shadow-2xl"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={office.image}
                    alt={office.city}
                    className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-2xl font-bold mb-1">{office.city}</h3>
                    <p className="text-sm text-white/90 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-tarhal-orange" />
                      {office.country}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 bg-tarhal-orange/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {getLocalizedText('مكتب', 'Office', 'Bureau')}
                  </div>
                </div>

                <div className="p-6 text-white">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 group/item">
                      <MapPin className="h-5 w-5 text-tarhal-orange mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">{office.address}</span>
                    </div>
                    <div className="flex items-center gap-3 group/item">
                      <Phone className="h-5 w-5 text-tarhal-orange flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="text-sm hover:text-tarhal-orange transition-colors duration-300">{office.phone}</a>
                    </div>
                    <div className="flex items-center gap-3 group/item">
                      <Mail className="h-5 w-5 text-tarhal-orange flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <a href={`mailto:${office.email}`} className="text-sm hover:text-tarhal-orange transition-colors duration-300 break-all">{office.email}</a>
                    </div>
                    <div className="flex items-center gap-3 group/item">
                      <User className="h-5 w-5 text-tarhal-orange flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                      <span className="text-sm">
                        <span className="text-white/70">{getLocalizedText('مدير المكتب:', 'Manager:', 'Responsable:')} </span>
                        <span className="font-semibold">{office.manager}</span>
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark hover:from-tarhal-orange-dark hover:to-tarhal-orange text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    {getLocalizedText('تواصل مع المكتب', 'Contact Office', 'Contacter le bureau')}
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps - Premium */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-0 w-full h-96 bg-gradient-to-r from-tarhal-orange/20 to-transparent"></div>
          <div className="absolute bottom-20 right-0 w-full h-96 bg-gradient-to-l from-tarhal-blue/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <MapPin className="h-4 w-4" />
              <span>{getLocalizedText('الموقع', 'Location', 'Emplacement')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              {getLocalizedText('موقعنا على الخريطة', 'Our Location on the Map', 'Notre emplacement sur la carte')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up leading-relaxed">
              {getLocalizedText(
                'يمكنكم العثور على مكاتبنا بسهولة في جميع أنحاء العالم',
                'You can easily find our offices around the world',
                'Vous pouvez facilement trouver nos bureaux dans le monde entier'
              )}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-tarhal-gray-light/50 animate-scale-in hover:shadow-3xl transition-shadow duration-500">
            <div className="h-[500px] rounded-2xl overflow-hidden border border-tarhal-gray-light/30">
              <GoogleMap className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Premium */}
      <section className="py-20 bg-gradient-to-br from-tarhal-orange/5 via-white to-tarhal-blue/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-40 h-40 border-4 border-tarhal-orange rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 border-4 border-tarhal-blue rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <MessageSquare className="h-4 w-4" />
              <span>{getLocalizedText('أسئلة شائعة', 'FAQ', 'FAQ')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-4">
              {getLocalizedText('الأسئلة الشائعة', 'Frequently Asked Questions', 'Questions fréquemment posées')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-2xl mx-auto">
              {getLocalizedText('إجابات سريعة على أكثر الأسئلة شيوعاً', 'Quick answers to common questions', 'Réponses rapides aux questions courantes')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: {
                  ar: 'ما هي أوقات عمل خدمة العملاء؟',
                  en: 'What are customer service hours?',
                  fr: 'Quelles sont les heures de service client?'
                },
                a: {
                  ar: 'نعمل من السبت إلى الخميس من 9 صباحاً حتى 6 مساءً، والجمعة من 2 ظهراً حتى 6 مساءً.',
                  en: 'We work Saturday to Thursday from 9 AM to 6 PM, and Friday from 2 PM to 6 PM.',
                  fr: 'Nous travaillons du samedi au jeudi de 9h à 18h, et le vendredi de 14h à 18h.'
                },
                icon: Clock
              },
              {
                q: {
                  ar: 'كم يستغرق الرد على الاستفسارات؟',
                  en: 'How long does it take to respond to inquiries?',
                  fr: 'Combien de temps faut-il pour répondre aux demandes?'
                },
                a: {
                  ar: 'نرد على جميع الاستفسارات خلال 2 ساعة خلال أوقات العمل.',
                  en: 'We respond to all inquiries within 2 hours during business hours.',
                  fr: 'Nous répondons à toutes les demandes dans les 2 heures pendant les heures de bureau.'
                },
                icon: Zap
              },
              {
                q: {
                  ar: 'هل تتوفر خدمة الطوارئ؟',
                  en: 'Is emergency service available?',
                  fr: 'Un service d\'urgence est-il disponible?'
                },
                a: {
                  ar: 'نعم، لدينا خدمة طوارئ متاحة 24/7 للحالات العاجلة.',
                  en: 'Yes, we have a 24/7 emergency service available for urgent cases.',
                  fr: 'Oui, nous avons un service d\'urgence disponible 24h/24 et 7j/7 pour les cas urgents.'
                },
                icon: Shield
              }
            ].map((faq, idx) => {
              const IconComponent = faq.icon;
              return (
                <div key={idx} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-tarhal-gray-light/50 hover:border-tarhal-orange/30 transition-all duration-300 transform hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2 group-hover:text-tarhal-orange transition-colors duration-300">
                        {language === 'ar' ? faq.q.ar : language === 'fr' ? faq.q.fr : faq.q.en}
                      </h3>
                      <p className="text-tarhal-gray-dark leading-relaxed">
                        {language === 'ar' ? faq.a.ar : language === 'fr' ? faq.a.fr : faq.a.en}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
