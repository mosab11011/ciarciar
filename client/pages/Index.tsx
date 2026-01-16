import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Users, Award, Shield, MapPin, Mail, Phone, Send, CheckCircle, Sparkles, TrendingUp, Heart, Map, Headphones, ShieldCheck, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import PaymentMethods from '@/components/PaymentMethods';
import { getAllCountriesWithDynamic, getCountryName, getCountryDescription, syncStaticWithDynamic } from '@/data/countries';
import GoogleMap from '@/components/GoogleMap';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tourismImageIndex, setTourismImageIndex] = useState(0);
  const { t, i18n } = useTranslation();
  const { t: tLang, formatNumber } = useLanguage();
  const { selectedCountry, userCountry, isDetecting, showAllCountries, setShowAllCountries } = useLocation();
  const [countries, setCountries] = useState(getAllCountriesWithDynamic());
  const [isVisible, setIsVisible] = useState(false);
  const { settings: siteSettings, loading: settingsLoading } = useSiteSettings();

  // Helper function to transform API country format to static format
  const transformApiCountry = (country: any): any => {
    // If already in static format, return as is
    if (country.name && typeof country.name === 'object') {
      return country;
    }
    
    // Get static country data to ensure unique images
    const staticCountries = getAllCountriesWithDynamic();
    const staticCountry = staticCountries.find(sc => sc.id === country.id);
    
    // Transform API format to static format
    return {
      ...country,
      name: {
        ar: country.name_ar || '',
        en: country.name_en || '',
        fr: country.name_fr || ''
      },
      description: {
        ar: country.description_ar || '',
        en: country.description_en || '',
        fr: country.description_fr || ''
      },
      // Use image from static data if available, otherwise use API image
      mainImage: staticCountry?.mainImage || country.main_image || country.mainImage || '',
      totalTours: country.total_tours || country.totalTours || 0,
      flag: country.flag || '🏳️', // Default flag if not available
      rating: country.rating || 0
    };
  };

  useEffect(() => {
    // مزامنة البيانات الثابتة مع النظام الديناميكي عند التحميل الأول
    syncStaticWithDynamic();
    
    // Load countries from API and filter by offers
    const loadCountriesWithOffers = async () => {
      try {
        // Load countries
        const countriesRes = await fetch('/api/countries?active=true');
        const countriesData = await countriesRes.json();
        let allCountries = countriesData.success ? countriesData.data : [];
        
        // Load offers to filter countries
        const offersRes = await fetch('/api/travel-offers?is_active=true');
        const offersData = await offersRes.json();
        
        if (offersData.success && Array.isArray(offersData.data)) {
          const offers = offersData.data;
          // Get unique country IDs from offers
          const countryIdsWithOffers = new Set(offers.map((offer: any) => offer.country_id));
          
          // Filter countries to only include those with offers
          const countriesWithOffers = allCountries.filter((c: any) => 
            countryIdsWithOffers.has(c.id) &&
            ((c.name_ar && c.name_ar.trim() !== '') || 
             (c.name_en && c.name_en.trim() !== '') || 
             (c.name_fr && c.name_fr.trim() !== ''))
          ).map((c: any) => transformApiCountry(c)); // Transform API format to static format
          
          console.log(`✅ [Index] Loaded ${countriesWithOffers.length} countries with offers (from ${allCountries.length} total)`);
          setCountries(countriesWithOffers);
        } else {
          // Fallback to static data if API fails
          setCountries(getAllCountriesWithDynamic());
        }
      } catch (error) {
        console.error('Error loading countries with offers:', error);
        // Fallback to static data
        setCountries(getAllCountriesWithDynamic());
      }
    };
    
    loadCountriesWithOffers();
    setIsVisible(true);
  }, []);

  const defaultHeaderImages = [
    'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
    'https://images.pexels.com/photos/5117917/pexels-photo-5117917.jpeg',
    'https://images.pexels.com/photos/4669408/pexels-photo-4669408.jpeg',
    'https://images.pexels.com/photos/11542516/pexels-photo-11542516.jpeg',
    'https://images.pexels.com/photos/33388483/pexels-photo-33388483.jpeg',
  ];
  const headerImages = siteSettings?.headerBackgroundImages && siteSettings.headerBackgroundImages.length > 0
    ? siteSettings.headerBackgroundImages
    : defaultHeaderImages;

  // Real walking traveler with luggage (MP4)
  const travelerVideo = 'https://videos.pexels.com/video-files/4101518/4101518-uhd_2560_1440_25fps.mp4';
  const travelerArriveImage = 'https://images.pexels.com/photos/3769119/pexels-photo-3769119.jpeg';

  const tourismImages = [
    'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
    'https://images.pexels.com/photos/4669408/pexels-photo-4669408.jpeg',
    'https://images.pexels.com/photos/33388483/pexels-photo-33388483.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTourismImageIndex((prev) => (prev + 1) % tourismImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Globe,
      title: t('home.features.offices.title'),
      description: t('home.features.offices.desc'),
      gradient: 'from-blue-500 to-blue-600',
      stat: '50+'
    },
    {
      icon: Users,
      title: t('home.features.team.title'),
      description: t('home.features.team.desc'),
      gradient: 'from-green-500 to-green-600',
      stat: '24/7'
    },
    {
      icon: Award,
      title: t('home.features.quality.title'),
      description: t('home.features.quality.desc'),
      gradient: 'from-purple-500 to-purple-600',
      stat: '15+'
    },
    {
      icon: Shield,
      title: t('home.features.security.title'),
      description: t('home.features.security.desc'),
      gradient: 'from-orange-500 to-orange-600',
      stat: '100%'
    }
  ];

  const heroHighlights = [
    {
      icon: <Headphones className="h-5 w-5" />,
      title: t('home.hero.highlights.support', 'دعم فوري 24/7'),
      desc: t('home.hero.highlights.languages', 'فريق يتحدث العربية والإنجليزية والفرنسية')
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: t('home.hero.highlights.trust', 'اعتمادات وثقة'),
      desc: t('home.hero.highlights.verified', 'مكاتب معتمدة وشركاء موثوقون في 50+ وجهة')
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: t('home.hero.highlights.payments', 'خيارات دفع آمنة'),
      desc: t('home.hero.highlights.ssl', 'بوابات محمية وتشفير SSL لحجوزاتك')
    }
  ];

  const aboutCards = [
    {
      front: {
        title: 'رؤيتنا',
        icon: '@',
        description: 'أن نكون الشركة الرائدة في مجال السياحة'
      },
      back: {
        content: 'نسعى لأن نكون الخيار الأول للمسافرين حول العالم من خلال تقديم خدمات استثنائية وتجارب لا تُنسى في كل رحلة.'
      }
    },
    {
      front: {
        title: 'مهمتنا',
        icon: '🎯',
        description: 'تقديم أفضل الخدمات السياحية'
      },
      back: {
        content: 'نقدم حلول سياحية متكاملة تشمل الحجوزات والإرشاد والدعم لضمان حصول عملائنا على تجربة سفر مثالية.'
      }
    },
    {
      front: {
        title: 'قيمنا',
        icon: '💎',
        description: 'الجودة والمصداقية والاحترافية'
      },
      back: {
        content: 'نؤمن بالشفافية والصدق في التعامل مع عملائنا، ونلتزم بأعلى معايير الجودة في جميع خدماتنا.'
      }
    }
  ];

  // Helper function to get country name (handles both static and API country structures)
  const getCountryNameSafe = (country: any, language: 'ar' | 'en' | 'fr' = 'ar'): string => {
    // Check if country has API structure (name_ar, name_en, name_fr)
    if (country.name_ar || country.name_en || country.name_fr) {
      return country[`name_${language}`] || country.name_ar || country.name_en || country.name_fr || '';
    }
    // Check if country has static structure (name.ar, name.en, name.fr)
    if (country.name && typeof country.name === 'object') {
      return country.name[language] || country.name.ar || '';
    }
    return '';
  };

  // Use actual countries data with geo-location filtering - Always show exactly 12 countries
  const getDisplayedCountries = () => {
    // Always use static countries to ensure we have at least 12 countries
    const staticCountries = getAllCountriesWithDynamic();
    
    // Combine API countries with static countries, removing duplicates using both ID and name
    const allCountriesMap: Record<string, any> = {};
    const seenNames: Record<string, boolean> = {};
    
    // Helper function to get unique key for a country
    const getCountryKey = (country: any): string => {
      if (country && country.id) {
        return country.id;
      }
      const name = getCountryNameSafe(country, i18n.language as 'ar' | 'en' | 'fr');
      return name.toLowerCase().trim();
    };
    
    // Add static countries first (they have all required data)
    staticCountries.forEach(country => {
      if (!country) return;
      const key = getCountryKey(country);
      const name = getCountryNameSafe(country, i18n.language as 'ar' | 'en' | 'fr').toLowerCase().trim();
      
      // Only add if not already seen (by ID or name)
      if (key && !allCountriesMap[key] && !seenNames[name]) {
        allCountriesMap[key] = country;
        seenNames[name] = true;
      }
    });
    
    // Add API countries if they exist and aren't duplicates
    countries.forEach(country => {
      if (!country) return;
      const key = getCountryKey(country);
      const name = getCountryNameSafe(country, i18n.language as 'ar' | 'en' | 'fr').toLowerCase().trim();
      
      // Only add if not already seen (by ID or name)
      if (key && !allCountriesMap[key] && !seenNames[name]) {
        allCountriesMap[key] = country;
        seenNames[name] = true;
      }
    });
    
    // Convert to array and take first 12
    const allCountries = Object.values(allCountriesMap);
    
    const activeCountry = selectedCountry || userCountry;

    if (!showAllCountries && activeCountry) {
      // Show user's country first, then others
      const userCountryData = allCountries.filter(c =>
        getCountryNameSafe(c, i18n.language as 'ar' | 'en' | 'fr') === activeCountry
      );
      const otherCountries = allCountries.filter(c =>
        getCountryNameSafe(c, i18n.language as 'ar' | 'en' | 'fr') !== activeCountry
      );

      // Combine and ensure exactly 12 countries
      const combined = [...userCountryData, ...otherCountries];
      return combined.slice(0, 12);
    }

    // Always return exactly 12 countries
    return allCountries.slice(0, 12);
  };

  const displayedCountries = getDisplayedCountries();
  
  // Debug: Log the number of countries being displayed
  useEffect(() => {
    console.log(`[Travel Offices] Displaying ${displayedCountries.length} countries:`, 
      displayedCountries.map(c => getCountryNameSafe(c, i18n.language as 'ar' | 'en' | 'fr')));
  }, [displayedCountries, i18n.language]);
  
  const userCountryData = countries.find(c =>
    getCountryNameSafe(c, i18n.language as 'ar' | 'en' | 'fr') === (selectedCountry || userCountry)
  );

  return (
      <Layout>
        <style>{`
          @keyframes traveler-walk-real {
            0% { transform: translateX(-140%) translateY(4px) scale(0.9); opacity: 0; }
            25% { opacity: 1; }
            55% { transform: translateX(5%) translateY(-2px) scale(1); }
            60% { opacity: 1; }
            75% { transform: translateX(10%) translateY(-2px) scale(1.02); opacity: 0.3; }
            100% { transform: translateX(10%) translateY(-2px) scale(1.02); opacity: 0; }
          }
          @keyframes traveler-arrive {
            0%, 55% { opacity: 0; transform: translateX(-10%) translateY(6px) scale(0.96); }
            65% { opacity: 1; transform: translateX(8%) translateY(0) scale(1); }
            80% { opacity: 1; transform: translateX(10%) translateY(0) scale(1.02); }
            100% { opacity: 1; transform: translateX(10%) translateY(0) scale(1.02); }
          }
          @keyframes suitcase-drop {
            0% { transform: translateY(-30px) rotate(-8deg); opacity: 0; }
            60% { transform: translateY(-10px) rotate(-4deg); opacity: 0; }
            75% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }
          @keyframes map-open {
            0% { transform: scale(0.5) translateY(20px) rotate(-6deg); opacity: 0; }
            75% { transform: scale(0.5) translateY(20px) rotate(-6deg); opacity: 0; }
            90% { transform: scale(1.02) translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.35; transform: scale(0.98); }
            50% { opacity: 0.7; transform: scale(1.03); }
          }
        `}</style>
      {/* Hero Header - Professional Luxury Design */}
      <section className="relative h-[65vh] min-h-[600px] overflow-hidden">
        {/* Clean Background System - Images Only */}
        <div className="absolute inset-0">
          {/* Background images slideshow */}
          {headerImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${image})` }}
              aria-hidden={index !== currentImageIndex}
            />
          ))}

          {/* Elegant Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-tarhal-navy/85 via-tarhal-blue-dark/75 to-tarhal-navy/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy/70 via-transparent to-tarhal-blue/40"></div>

          {/* Subtle Luxury Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,165,0,0.08),transparent_60%)]"></div>
          {/* Blue tint - blur removed */}
          <div className="absolute inset-0 bg-tarhal-blue/12 mix-blend-multiply"></div>
        </div>

        {/* Hero Content - Global Standard */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-3xl">
                {/* Global-Standard Logo */}
                {/* <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 w-fit shadow-lg">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-tarhal-orange via-yellow-300 to-tarhal-orange-dark flex items-center justify-center text-tarhal-navy font-extrabold text-lg tracking-tight shadow-inner">
                    CI
                  </div>
                  <div className="leading-tight">
                    <div className="text-white text-sm font-semibold uppercase tracking-[0.2em]">CIAR</div>
                    <div className="text-white/80 text-xs">{t('home.hero.companyTagline', 'Global Real Estate & Tourism')}</div>
                  </div>
                </div> */}

                {/* Badge */}
                {/* <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-5 animate-fade-in">
                  <div className="w-6 h-6 bg-tarhal-orange rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{t('home.hero.badge', 'شركة عالمية بمعايير 2025')}</span>
                </div> */}

                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight animate-slide-up">
                  <span className="block mb-2">{t('home.hero.title', 'مرحبا بكم في')}</span>
                  <span className="block bg-gradient-to-r from-tarhal-orange to-yellow-300 bg-clip-text text-transparent">
                    {t('home.hero.companyName', 'CIAR')}
                  </span>
                  <span className="block text-2xl md:text-3xl lg:text-4xl font-light text-white/90 mt-2">
                    {/* {t('home.hero.domain', 'Real Estate & Tourism Excellence')} */}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed font-light animate-slide-up max-w-3xl" style={{ animationDelay: '250ms' }}>
                  {t('home.hero.subtitle', 'رفيقكم المثالي لاستكشاف العالم وتملك أصول عقارية آمنة في أهم الوجهات العالمية عبر شبكة خبراء تعمل على مدار الساعة.')}
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
                  <Link to="/offices">
                    <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark hover:brightness-110 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5">
                      <span className="flex items-center gap-2">
                        {t('home.hero.exploreButton', 'استكشف مكاتبنا حول العالم')}
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="border-2 border-white/70 text-white hover:bg-white hover:text-tarhal-blue-dark px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-xl">
                      <span className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        {t('home.hero.contactButton', 'احجز استشارة فورية')}
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Hero Highlights */}
                {/* <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 animate-slide-up" style={{ animationDelay: '700ms' }}>
                  {heroHighlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl bg-white/10 border border-white/15 p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                          {item.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-sm text-white/80 leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    </div> */}
                  {/* ))} */}
                {/* </div> */}
              </div>

              {/* Traveler animation scene (real walking character) */}
              {/* <div className="relative w-full lg:translate-y-4 translate-y-2">
                <div className="absolute -inset-6 bg-gradient-to-br from-tarhal-blue/25 via-tarhal-orange/20 to-transparent blur-3xl pointer-events-none"></div>
                <div className="relative h-[420px] max-w-[420px] w-full mx-auto overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-tarhal-navy/60 via-tarhal-blue/30 to-transparent opacity-70"></div>
                  <div className="absolute inset-x-6 bottom-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                  <div className="absolute inset-x-6 bottom-14 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent blur-sm"></div> */}

                  {/* Path dots */}
                  {/* <div className="absolute inset-x-10 bottom-28 flex justify-between">
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-white/40"></span>
                    ))}
                  </div> */}

                  {/* Walking character (real video) */}
                  {/* <div
                    className="absolute bottom-8 left-0 w-full flex justify-start"
                    style={{ animation: 'traveler-walk-real 11s linear infinite' }}
                  >
                    <div className="relative h-60 w-52 sm:w-60 overflow-hidden rounded-3xl shadow-2xl">
                      <video
                        src={travelerVideo}
                        className="absolute bottom-0 left-0 h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={travelerArriveImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy/35 via-transparent to-transparent"></div>
                    </div>
                  </div> */}

                  {/* Map unfold near traveler */}
                  {/* <div
                    className="absolute bottom-24 right-8"
                    style={{ animation: 'map-open 11s ease-in-out infinite' }}
                  >
                    <div className="h-16 w-24 rounded-2xl bg-white/90 text-tarhal-blue-dark shadow-xl border border-white/60 flex items-center justify-center gap-2">
                      <Map className="h-6 w-6 text-tarhal-orange" />
                      <span className="font-semibold text-sm">{t('home.hero.map', 'Map')}</span>
                    </div>
                  </div> */}

                  {/* Glow pulse */}
                  {/* <div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tarhal-orange/25 via-transparent to-tarhal-blue/25"
                    style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
                  ></div> */}
                {/* </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Offices Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-tarhal-navy via-tarhal-blue-dark to-tarhal-navy relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,165,0,0.3),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <MapPin className="h-4 w-4 text-tarhal-orange" />
              <span className="text-sm font-semibold text-tarhal-blue">{t('home.offices.badge', 'وجهاتنا المميزة')}</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-tarhal-blue-dark dark:text-white mb-6 animate-fade-in">
              {t('home.offices.title', 'مكاتبنا السياحية')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark dark:text-white/80 max-w-3xl mx-auto animate-slide-up font-light">
              {t('home.offices.subtitle', 'اكتشف وجهاتنا المميزة حول العالم')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {displayedCountries.map((country, index) => {
              // Get cover image (mainImage) and specific image (from gallery if available)
              const coverImage = country.mainImage || '';
              const specificImage = (country.gallery && country.gallery.length > 0) ? country.gallery[0] : coverImage;
              
              return (
                <Link
                  key={country.id || index}
                  to={`/offices/${country.id}`}
                  className="group bg-white dark:bg-tarhal-navy/50 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 animate-scale-in block border border-white/10 dark:border-white/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    {/* Cover Image */}
                    <img
                      src={coverImage}
                      alt={getCountryName(country, i18n.language as 'ar' | 'en' | 'fr')}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                    />
                    {/* Specific Image (appears on hover) */}
                    {specificImage && specificImage !== coverImage && (
                      <img
                        src={specificImage}
                        alt={getCountryName(country, i18n.language as 'ar' | 'en' | 'fr')}
                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-125 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
                      />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                      {country.totalTours || 0} {t('common.tours', 'جولة')}
                    </div>

                    {/* Flag */}
                    <div className="absolute top-4 left-4 text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg z-10">
                      {country.flag || '🏳️'}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full z-10">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-bold text-tarhal-blue-dark">{country.rating || 4.5}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white dark:bg-tarhal-navy/50">
                    <h3 className="text-lg font-bold text-tarhal-blue-dark dark:text-white mb-2 group-hover:text-tarhal-orange transition-colors duration-300">
                      {getCountryName(country, i18n.language as 'ar' | 'en' | 'fr')}
                    </h3>
                    <p className="text-sm text-tarhal-gray-dark dark:text-white/80 line-clamp-2 mb-3">
                      {getCountryDescription(country, i18n.language as 'ar' | 'en' | 'fr')}
                    </p>

                    {/* View More Indicator */}
                    <div className="flex items-center gap-2 text-tarhal-orange text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>{t('common.viewDetails', 'عرض التفاصيل')}</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/offices">
              <Button className="group bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-10 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 rounded-xl shadow-2xl hover:shadow-[0_20px_40px_rgba(255,165,0,0.4)]">
                <span className="flex items-center gap-2">
                  {t('home.offices.viewAll', 'عرض جميع المكاتب')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Discover Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-tarhal-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tarhal-blue/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Images Stack - Premium */}
            <div className="relative group">
              <div className="relative w-full h-[500px] overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700">
                {tourismImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center transition-all duration-[1500ms] transform ${index === tourismImageIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-110'
                      }`}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                ))}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-3xl flex items-center justify-center shadow-2xl animate-float transform rotate-6 group-hover:rotate-12 transition-transform duration-500">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-white mx-auto mb-1" />
                  <div className="text-white text-2xl font-bold">50+</div>
                  <div className="text-white/90 text-xs font-medium">{t('home.discover.countries', 'دولة')}</div>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-4 border-tarhal-orange/30 rounded-2xl transform rotate-12"></div>
            </div>

            {/* Content - Premium */}
            <div className="space-y-8 animate-slide-in-right">
              {/* Section Badge */}
              <div className="inline-flex items-center gap-2 bg-tarhal-orange/10 text-tarhal-orange px-4 py-2 rounded-full text-sm font-semibold">
                <TrendingUp className="h-4 w-4" />
                <span>{t('home.discover.badge', 'اكتشف العالم')}</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-tarhal-blue-dark dark:text-white leading-tight">
                {t('home.discover.title', 'اكتشف جمال العالم')}
                <span className="block bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark bg-clip-text text-transparent mt-2">
                  {t('home.discover.titleHighlight', 'معنا')}
                </span>
              </h2>

              <p className="text-xl text-tarhal-gray-dark leading-relaxed font-light">
                {t('home.discover.description', 'من الشواطئ الاستوائية الخلابة إلى القمم الجبلية الشاهقة، ومن المدن التاريخية العريقة إلى الوجهات العصرية المذهلة. نحن هنا لنجعل رحلتك تجربة لا تُنسى مليئة بالمغامرات والذكريات الجميلة.')}
              </p>

              {/* Stats Grid - Premium */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="group text-center p-6 bg-white dark:bg-tarhal-navy/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-tarhal-gray-light/50 dark:border-white/10 hover:border-tarhal-orange/50 transform hover:-translate-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark bg-clip-text text-transparent mb-2">
                    {formatNumber(50)}+
                  </div>
                  <div className="text-tarhal-gray-dark dark:text-white/80 font-medium">{t('home.discover.countries', 'دولة')}</div>
                </div>
                <div className="group text-center p-6 bg-white dark:bg-tarhal-navy/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-tarhal-gray-light/50 dark:border-white/10 hover:border-tarhal-blue/50 transform hover:-translate-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-tarhal-blue to-tarhal-blue-dark bg-clip-text text-transparent mb-2">
                    {formatNumber(1000)}+
                  </div>
                  <div className="text-tarhal-gray-dark dark:text-white/80 font-medium">{t('home.discover.happyClients', 'عميل سعيد')}</div>
                </div>
              </div>

              {/* CTA */}
              <Link to="/offices">
                <Button className="group bg-gradient-to-r from-tarhal-blue to-tarhal-blue-dark text-white px-8 py-6 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl">
                  <span className="flex items-center gap-2">
                    {t('home.discover.cta', 'استكشف وجهاتنا')}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-tarhal-blue-dark via-tarhal-navy to-tarhal-blue-dark relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-tarhal-orange rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-tarhal-blue rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <Award className="h-4 w-4 text-tarhal-orange" />
              <span className="text-sm font-semibold text-white">{t('home.features.badge', 'لماذا نحن الأفضل')}</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              {t('home.features.title', 'لماذا تختار CIAR؟')}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-slide-up font-light">
              {t('home.features.subtitle', 'نقدم لكم أفضل الخدمات السياحية بمعايير عالمية واحترافية عالية')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative text-center p-8 bg-white/10 rounded-3xl hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-scale-in shadow-xl hover:shadow-2xl"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>

                  {/* Icon Container */}
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                    <IconComponent className="h-10 w-10 text-white" />
                    {/* Stat Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-xs font-bold text-tarhal-orange">{feature.stat}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-tarhal-orange transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>

                  {/* Decorative Line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-tarhal-orange to-transparent group-hover:w-20 transition-all duration-500"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us Cards Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 border-4 border-tarhal-orange rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 border-4 border-tarhal-blue rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Heart className="h-4 w-4" />
              <span>{t('home.about.badge', 'من نحن')}</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-tarhal-blue-dark dark:text-white mb-6 animate-fade-in">
              {t('home.about.title', 'معلومات عنا')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark dark:text-white/80 max-w-3xl mx-auto animate-slide-up font-light">
              {t('home.about.subtitle', 'تعرف على قيمنا ومهمتنا في خدمة عملائنا الكرام')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {aboutCards.map((card, index) => (
              <div
                key={index}
                className="group perspective-1000 h-72 animate-rotate-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                  {/* Front - Premium */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-tarhal-blue via-tarhal-blue-dark to-tarhal-navy rounded-3xl p-8 flex flex-col items-center justify-center text-white shadow-2xl border border-white/10">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{card.front.icon}</div>
                    <h3 className="text-2xl font-bold mb-4">{card.front.title}</h3>
                    <p className="text-center text-white/90 leading-relaxed">{card.front.description}</p>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full"></div>
                  </div>

                  {/* Back - Premium */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-tarhal-orange via-tarhal-orange-dark to-orange-600 dark:from-tarhal-orange-dark dark:via-tarhal-orange dark:to-orange-700 rounded-3xl p-8 flex items-center justify-center text-white shadow-2xl border border-white/10">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                    <p className="text-center text-lg leading-relaxed font-light relative z-10">{card.back.content}</p>
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/about">
              <Button className="group bg-gradient-to-r from-tarhal-blue to-tarhal-blue-dark text-white px-10 py-6 text-lg font-bold transform hover:scale-105 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl">
                <span className="flex items-center gap-2">
                  {t('home.about.learnMore', 'اعرف المزيد عنا')}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Methods - Trusted Partners */}
      <PaymentMethods
        variant="light"
        title="طرق الدفع المعتمدة"
        subtitle="خيارات دفع آمنة وسريعة مع شركائنا الرسميين لضمان تجربة حجز مريحة"
        className="bg-white"
      />

      {/* Statistics Section - Premium */}
      <section className="py-24 bg-gradient-to-br from-tarhal-navy via-tarhal-blue-dark to-tarhal-navy dark:from-tarhal-navy dark:via-tarhal-blue-dark dark:to-tarhal-navy text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-4 border-white/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 border-4 border-white/25 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-1/3 w-12 h-12 border-4 border-white/15 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/10 rounded-full"></div>
        </div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-tarhal-blue/10 to-transparent"></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 text-tarhal-orange" />
              <span className="text-sm font-semibold text-tarhal-blue">{t('home.statistics.badge', 'إحصائياتنا')}</span>
            </div>

            <h2 className="text-5xl md:text-6xl text-tarhal-blue-dark mb-6 animate-fade-in">
              {t('home.statistics.title', 'أرقامنا تتحدث عن نجاحنا')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up font-light">
              {t('home.statistics.subtitle', 'نفخر بثقة عملائنا وخبرتنا العريقة في مجال السياحة')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: '50,000+', label: t('home.statistics.clients', 'عميل سعيد'), gradient: 'from-tarhal-orange to-tarhal-orange-dark', delay: 0 },
              { icon: Globe, value: String(countries.length), label: t('home.statistics.countries', 'دولة ووجهة'), gradient: 'from-green-500 to-green-600', delay: 100 },
              { icon: Award, value: '15+', label: t('home.statistics.experience', 'سنة خبرة'), gradient: 'from-purple-500 to-purple-600', delay: 200 },
              { icon: Star, value: '4.9', label: t('home.statistics.rating', 'تقييم العملاء'), gradient: 'from-yellow-400 to-yellow-500', delay: 300 }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group animate-scale-in" style={{ animationDelay: `${stat.delay}ms` }}>
                  <div className={`relative w-28 h-28 bg-gradient-to-br ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                    <IconComponent className="h-14 w-14 text-white" />
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
                  </div>
                  <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:text-tarhal-orange transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-white/80 font-medium text-lg">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Destinations - Premium */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-0 w-full h-96 bg-gradient-to-r from-tarhal-orange/20 to-transparent"></div>
          <div className="absolute bottom-20 right-0 w-full h-96 bg-gradient-to-l from-tarhal-blue/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-tarhal-blue/10 text-tarhal-blue px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star className="h-4 w-4 fill-current" />
                <span>{t('home.destinations.badge', 'الأكثر شعبية')}</span>
              </div>

            <h2 className="text-5xl md:text-6xl font-bold text-tarhal-blue-dark dark:text-white mb-6 animate-fade-in">
              {t('home.destinations.title', 'الوجهات المميزة')}
            </h2>
              <p className="text-xl text-tarhal-gray-dark dark:text-white/80 max-w-3xl mx-auto animate-slide-up font-light">
                {t('home.destinations.subtitle', 'اكتشف أجمل الوجهات السياحية التي نوصي بها لرحلة لا تُنسى')}
              </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.slice(0, 6).map((country, index) => (
              <div
                key={country.id}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all duration-700 animate-scale-in border border-white/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={country.mainImage}
                    alt={getCountryName(country, i18n.language as 'ar' | 'en' | 'fr')}
                    className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                  />
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Country Flag - Premium */}
                  <div className="absolute top-6 right-6 text-5xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl">
                    {country.flag}
                  </div>

                  {/* Premium Rating Badge */}
                  <div className="absolute top-6 left-6 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark dark:from-tarhal-orange-dark dark:to-tarhal-orange text-white px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl">
                    <Star className="h-5 w-5 fill-current" />
                    <span>{country.rating}</span>
                  </div>

                  {/* Content - Premium */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-tarhal-orange transition-colors duration-300">
                      {getCountryName(country, i18n.language as 'ar' | 'en' | 'fr')}
                    </h3>
                    <p className="text-white/90 mb-6 line-clamp-2 text-lg leading-relaxed">
                      {getCountryDescription(country, i18n.language as 'ar' | 'en' | 'fr')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1 bg-white/20 dark:bg-white/10 px-3 py-1.5 rounded-full">
                          <MapPin className="h-4 w-4" />
                          {country.totalTours} {t('common.tours', 'جولة')}
                        </span>
                        <span className="flex items-center gap-1 bg-white/20 dark:bg-white/10 px-3 py-1.5 rounded-full">
                          <Users className="h-4 w-4" />
                          {country.totalReviews} {t('common.reviews', 'مراجعة')}
                        </span>
                      </div>
                      <Link to={`/offices/${country.id}`}>
                        <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark hover:from-tarhal-orange-dark hover:to-tarhal-orange text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 rounded-xl shadow-xl">
                          {t('home.destinations.explore', 'استكشف')}
                          <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials - Premium */}
      <section className="py-24 bg-gradient-to-br from-white via-slate-50/50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-tarhal-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tarhal-blue/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-tarhal-orange/10 text-tarhal-orange px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Heart className="h-4 w-4" />
              <span>{t('home.testimonials.badge', 'شهادات عملائنا')}</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              {t('home.testimonials.title', 'آراء عملائنا')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up font-light">
              {t('home.testimonials.subtitle', 'نفخر بثقة عملائنا الكرام وتجاربهم الرائعة معنا')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'أحمد محمد العلي',
                country: 'السعودية',
                image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                rating: 5,
                review: 'تجربة رائعة مع شركة CIAR، تنظيم ممتاز وخدمة عملاء متميزة. أنصح الجميع بالتعامل معهم.',
                trip: 'رحلة إلى تركيا',
                verified: true
              },
              {
                name: 'فاطمة أحمد',
                country: 'الإمارات',
                image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                rating: 5,
                review: 'خدمة احترافية عالية المستوى، الفريق متعاون جداً والأسعار مناسبة. رحلة لا تُنسى!',
                trip: 'رحلة إلى المغرب',
                verified: true
              },
              {
                name: 'علي حسن',
                country: 'السودان',
                image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
                rating: 5,
                review: 'أفضل شركة سياحة تعاملت معها، كل شيء كان منظم ومرتب. شكراً لفريق CIAR الرائع.',
                trip: 'رحلة إلى مصر',
                verified: true
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 animate-scale-in border border-tarhal-gray-light/50 hover:border-tarhal-orange/50 transform hover:-translate-y-2 relative overflow-hidden"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-tarhal-orange/5 rounded-full blur-2xl"></div>

                {/* Verified Badge */}
                {testimonial.verified && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>مُتحقق</span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-tarhal-orange/20 dark:border-tarhal-orange/30 group-hover:border-tarhal-orange transition-colors duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-tarhal-blue-dark dark:text-white mb-1">{testimonial.name}</h4>
                    <p className="text-tarhal-gray-dark dark:text-white/80 text-sm mb-1">{testimonial.country}</p>
                    <p className="text-tarhal-orange text-sm font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {testimonial.trip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-tarhal-gray-dark leading-relaxed italic relative z-10 text-lg">
                  "{testimonial.review}"
                </p>

                {/* Quote Icon */}
                <div className="absolute bottom-4 right-4 text-tarhal-orange/10 text-6xl font-serif">"</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-20 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              ابق على اطلاع بأحدث العروض
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12 animate-slide-up">
              اشترك في نشرتنا الإخبارية واحصل على أفضل الصفقات والعروض الحصرية قبل الجميع
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex gap-4 animate-scale-in">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300"
                />
                <Button className="bg-white text-tarhal-orange hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl transform hover:scale-105 transition-all duration-300">
                  اشتراك
                  <Send className="mr-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-white/70 text-sm mt-4">
                لن نشارك بياناتك مع أي طرف ثالث. يمكنك إلغاء الاشتراك في أي وقت.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark dark:text-white mb-6 animate-fade-in">
              خدماتنا المميزة
            </h2>
            <p className="text-xl text-tarhal-gray-dark dark:text-white/80 max-w-3xl mx-auto animate-slide-up">
              نقدم لك مجموعة شاملة من الخدمات السياحية لضمان رحلة مثالية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '✈️',
                title: 'حجز الطيران',
                description: 'أفضل أسعار تذاكر الطيران مع جميع الخطوط الجوية العالمية',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '🏨',
                title: 'حجز الفنادق',
                description: 'اختر من بين آلاف الفنادق المصنفة في جميع أنحاء العالم',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '🚗',
                title: 'استئجار السيارات',
                description: 'أحدث السيارات وأفضل الأسعار لرحلة مريحة وآمنة',
                color: 'from-purple-500 to-purple-600'
              },
              {
                icon: '🗺️',
                title: 'الجولات السياحية',
                description: 'برامج سياحية متنوعة مع مرشدين محليين خبراء',
                color: 'from-orange-500 to-orange-600'
              },
              {
                icon: '📋',
                title: 'استخراج التأشيرات',
                description: 'نساعدك في استخراج جميع أنواع التأشيرات بسهولة ويسر',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: '🛡️',
                title: 'التأمين السياحي',
                description: 'حماية شاملة لرحلتك ضد جميع المخاطر المحتملة',
                color: 'from-indigo-500 to-indigo-600'
              },
              {
                icon: '💼',
                title: 'السياحة العلاجية',
                description: 'برامج متخصصة للسياحة العلاجية في أفضل المراكز الطبية',
                color: 'from-pink-500 to-pink-600'
              },
              {
                icon: '🎓',
                title: 'السياحة التعليمية',
                description: 'رحلات تعليمية وثقافية للطلاب والمهتمين بالتعلم',
                color: 'from-cyan-500 to-cyan-600'
              }
            ].map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in hover:-translate-y-2" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-tarhal-blue-dark mb-4 text-center">
                  {service.title}
                </h3>
                <p className="text-tarhal-gray-dark text-center leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PaymentMethods
        variant="light"
        title="طرق الدفع المعتمدة"
        subtitle="خيارات دفع آمنة وسريعة لكل خدماتنا السياحية"
        className="bg-gray-50"
      />

      {/* Maps Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              مواقعنا حول العالم
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              تجد مكاتبنا في أهم المدن السياحية حول العالم
            </p>
          </div>

          <div className="bg-tarhal-gray-light rounded-2xl p-8 h-96 shadow-xl animate-scale-in overflow-hidden">
            <GoogleMap className="w-full h-full rounded-xl" />
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-tarhal-orange rounded-full"></div>
              <span className="text-tarhal-gray-dark font-medium">المقر الرئيسي - الخرطوم</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-tarhal-gray-dark font-medium">مكتب الرياض</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-tarhal-gray-dark font-medium">مكتب دبي</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-tarhal-gray-dark font-medium">مكتب اسطنبول</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contact Form */}
            <div className="animate-slide-in-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                تواصل معنا
              </h2>
              <p className="text-xl text-white/80 mb-8">
                نحن هنا لخدمتكم على مدار الساعة
              </p>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange"
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange"
                  />
                </div>
                <input
                  type="text"
                  placeholder="الموضوع"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange"
                />
                <textarea
                  rows={5}
                  placeholder="رسالتك"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-tarhal-orange resize-none"
                ></textarea>
                <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  إرسال الرسالة
                  <Send className="mr-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Animated Illustration */}
            <div className="relative animate-slide-in-right">
              <div className="relative w-full h-96 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-tarhal-orange/20 to-tarhal-orange-dark/20 rounded-full animate-pulse-slow"></div>
                <div className="relative z-10 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                    <Mail className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    نتلقى رسائلكم بسرعة
                  </h3>
                  <p className="text-white/80">
                    فريقنا جاهز للرد على استفساراتكم في أقل من 24 ساعة
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Component 1: Hero Video Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              شاهد فيديو تعريفي
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              تعرف على خدماتنا ووجهاتنا من خلال هذا الفيديو القصير
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative w-full h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-xl animate-scale-in">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-tarhal-orange rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="text-white text-2xl">▶️</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-tarhal-blue-dark">
                <p>فيديو تعريفي عن CIAR</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Component 2: Partners Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-navy to-tarhal-blue-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              شركاؤنا
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              نفخر بالتعاون مع أفضل الشركات في مجال السياحة
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4'].map((partner, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="w-16 h-16 bg-tarhal-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold text-white">{partner}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 3: Awards Section */}
      <section className="py-20 bg-gradient-to-br from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              جوائزنا وإنجازاتنا
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              نفخر بجوائزنا التي تعكس التزامنا بالجودة والتميز
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'جائزة أفضل شركة سياحية', year: '2023', icon: '🏆' },
              { title: 'شهادة الجودة العالمية', year: '2022', icon: '⭐' },
              { title: 'جائزة خدمة العملاء', year: '2021', icon: '👑' }
            ].map((award, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-6xl mb-4">{award.icon}</div>
                <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">{award.title}</h3>
                <p className="text-tarhal-gray-dark">{award.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 4: Blog Preview Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              من مدونتنا
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              اقرأ أحدث المقالات والنصائح السياحية
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'أفضل الوجهات في تركيا', excerpt: 'اكتشف أجمل الأماكن في تركيا...', image: 'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg' },
              { title: 'نصائح للسفر الآمن', excerpt: 'تعرف على كيفية السفر بأمان...', image: 'https://images.pexels.com/photos/4669408/pexels-photo-4669408.jpeg' },
              { title: 'رحلات العائلة المثالية', excerpt: 'أفكار لرحلات عائلية ممتعة...', image: 'https://images.pexels.com/photos/33388483/pexels-photo-33388483.jpeg' }
            ].map((post, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-3">{post.title}</h3>
                  <p className="text-tarhal-gray-dark mb-4">{post.excerpt}</p>
                  <Button variant="outline" className="w-full">اقرأ المزيد</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 5: FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              إجابات على أكثر الأسئلة شيوعاً حول خدماتنا
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { question: 'كيف أحجز رحلة؟', answer: 'يمكنك الحجز عبر موقعنا أو الاتصال بنا مباشرة.' },
              { question: 'ما هي طرق الدفع المتاحة؟', answer: 'نقبل جميع البطاقات الائتمانية والتحويلات البنكية.' },
              { question: 'هل يمكن إلغاء الحجز؟', answer: 'نعم، وفقاً لشروط الإلغاء المحددة.' }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-3">{faq.question}</h3>
                <p className="text-tarhal-gray-dark">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 6: Team Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-navy to-tarhal-blue-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              فريقنا
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              تعرف على الفريق الذي يقف وراء نجاحنا
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'أحمد محمد', role: 'مدير تنفيذي', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
              { name: 'فاطمة علي', role: 'مديرة التسويق', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
              { name: 'علي حسن', role: 'مدير العمليات', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
              { name: 'سارة أحمد', role: 'مديرة العملاء', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }
            ].map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-white/80">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 7: Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              معرض الصور
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              لحظات مميزة من رحلات عملائنا
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
              'https://images.pexels.com/photos/4669408/pexels-photo-4669408.jpeg',
              'https://images.pexels.com/photos/33388483/pexels-photo-33388483.jpeg',
              'https://images.pexels.com/photos/5117917/pexels-photo-5117917.jpeg',
              'https://images.pexels.com/photos/11542516/pexels-photo-11542516.jpeg',
              'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
              'https://images.pexels.com/photos/4669408/pexels-photo-4669408.jpeg',
              'https://images.pexels.com/photos/33388483/pexels-photo-33388483.jpeg'
            ].map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-48 object-cover transform hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 8: Events Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              الفعاليات القادمة
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              انضم إلينا في فعالياتنا السياحية المميزة
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'معرض السياحة الدولي', date: '15 ديسمبر 2023', location: 'الخرطوم' },
              { title: 'ورشة عمل التخطيط للسفر', date: '20 يناير 2024', location: 'أونلاين' }
            ].map((event, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <h3 className="text-2xl font-bold text-white mb-4">{event.title}</h3>
                <p className="text-white/80 mb-2">📅 {event.date}</p>
                <p className="text-white/80 mb-4">📍 {event.location}</p>
                <Button className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white">سجل الآن</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 9: Social Proof Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              ما يقوله عملاؤنا
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              شهادات حقيقية من عملائنا السعداء
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { quote: '"خدمة استثنائية ورحلة لا تُنسى!"', name: 'محمد أحمد', rating: 5 },
              { quote: '"أفضل تجربة سياحية في حياتي."', name: 'لينا علي', rating: 5 }
            ].map((proof, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex items-center mb-4">
                  {[...Array(proof.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-tarhal-gray-dark text-lg italic mb-4">"{proof.quote}"</p>
                <p className="text-tarhal-blue-dark font-bold">- {proof.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Component 10: Footer Links Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-navy to-tarhal-blue-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              روابط مفيدة
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              اكتشف المزيد من المعلومات والخدمات
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'سياسة الخصوصية', icon: '🔒' },
              { title: 'شروط الاستخدام', icon: '📋' },
              { title: 'الدعم الفني', icon: '🛠️' },
              { title: 'خريطة الموقع', icon: '🗺️' }
            ].map((link, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="text-4xl mb-4">{link.icon}</div>
                <h3 className="text-xl font-bold text-white">{link.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
