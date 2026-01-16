import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllCountriesWithDynamic, getCountryName as getCountryNameFromData, getCountryDescription } from '@/data/countries';
import { 
  Search, 
  Globe, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  Filter,
  ArrowRight,
  Tag,
  CheckCircle,
  Navigation
} from 'lucide-react';

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
  mainImage?: string;
  gallery?: string[];
  flag?: string;
}

export default function TravelOffers() {
  const { language } = useLanguage();
  const { selectedCountry: detectedCountryName, isDetecting, setSelectedCountry: setLocationCountry } = useLocation();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<TravelOffer[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [allCountriesData, setAllCountriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('auto');
  const [sortBy, setSortBy] = useState<'newest' | 'price' | 'discount'>('newest');

  // Find country ID from country name
  const findCountryIdByName = (countryName: string | null): string | null => {
    if (!countryName) return null;
    const country = countries.find(c => 
      c.name_ar === countryName || 
      c.name_en === countryName || 
      c.name_fr === countryName
    );
    return country?.id || null;
  };

  useEffect(() => {
    console.log('🔄 [TravelOffers] Component mounted, loading countries...');
    // Load all countries with images from static data for reference
    const staticCountries = getAllCountriesWithDynamic();
    console.log(`✅ [TravelOffers] Loaded ${staticCountries.length} static countries with images`);
    
    // Log sample countries with images
    if (staticCountries.length > 0) {
      console.log('📸 [TravelOffers] Sample countries with images:', staticCountries.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name.ar,
        hasMainImage: !!c.mainImage,
        galleryCount: c.gallery?.length || 0
      })));
    }
    
    setAllCountriesData(staticCountries);
    loadCountries();
  }, []);

  // Debug: Log countries state changes
  useEffect(() => {
    console.log('📊 [TravelOffers] Countries state changed:', {
      count: countries.length,
      isLoading: isLoadingCountries,
      error: countriesError,
      sample: countries.slice(0, 3).map(c => ({
        id: c.id,
        name_ar: c.name_ar,
        name_en: c.name_en
      }))
    });
  }, [countries, isLoadingCountries, countriesError]);

  // Auto-select country based on user location
  useEffect(() => {
    if (!isDetecting && countries.length > 0 && detectedCountryName) {
      const countryId = findCountryIdByName(detectedCountryName);
      if (countryId && selectedCountryId === 'auto') {
        console.log('Auto-selecting country:', detectedCountryName, countryId);
        setSelectedCountryId(countryId);
      }
    }
  }, [isDetecting, detectedCountryName, countries, selectedCountryId]);

  // Load offers when country changes
  useEffect(() => {
    if (selectedCountryId !== 'auto') {
      loadOffers();
    }
  }, [selectedCountryId]);

  const loadCountries = async () => {
    setIsLoadingCountries(true);
    setCountriesError(''); // Clear previous errors
    
    try {
      console.log('🌍 [TravelOffers] Starting to load countries...');
      
      // Try multiple endpoints with timeout and retry logic
      let loadedCountries: Country[] = [];
      let lastError: any = null;
      let successMethod = '';
      
      // Helper function to fetch with timeout
      const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          clearTimeout(timeoutId);
          throw error;
        }
      };
      
      // Method 1: Try all countries (active=false)
      try {
        console.log('🔄 [TravelOffers] Method 1: Trying /api/countries?active=false');
        const response = await fetchWithTimeout('/api/countries?active=false');
        
        console.log('📡 [TravelOffers] Method 1 - Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📦 [TravelOffers] Method 1 - Response data:', {
          success: data.success,
          dataLength: data.data?.length || 0,
          count: data.count,
          firstFew: data.data?.slice(0, 3).map((c: any) => ({
            id: c.id,
            name_ar: c.name_ar,
            name_en: c.name_en,
            is_active: c.is_active
          }))
        });
        
        if (data.success && data.data && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            loadedCountries = data.data;
            successMethod = 'Method 1 (active=false)';
            console.log(`✅ [TravelOffers] ${successMethod}: Loaded ${loadedCountries.length} countries`);
          } else {
            console.warn('⚠️ [TravelOffers] Method 1: Response successful but data array is empty', data);
          }
        } else {
          console.warn('⚠️ [TravelOffers] Method 1: Invalid response format', data);
        }
      } catch (e: any) {
        lastError = e;
        console.error('❌ [TravelOffers] Method 1 failed:', e.message || e);
        if (e.name === 'AbortError') {
          console.error('❌ [TravelOffers] Method 1: Request timeout');
        }
      }
      
      // Method 2: If no countries, try without active parameter
      if (loadedCountries.length === 0) {
        try {
          console.log('🔄 [TravelOffers] Method 2: Trying /api/countries');
          const response = await fetchWithTimeout('/api/countries');
          
          console.log('📡 [TravelOffers] Method 2 - Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('📦 [TravelOffers] Method 2 - Response data:', {
            success: data.success,
            dataLength: data.data?.length || 0
          });
          
          if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            loadedCountries = data.data;
            successMethod = 'Method 2 (no param)';
            console.log(`✅ [TravelOffers] ${successMethod}: Loaded ${loadedCountries.length} countries`);
          }
        } catch (e: any) {
          lastError = e;
          console.error('❌ [TravelOffers] Method 2 failed:', e.message || e);
        }
      }
      
      // Method 3: Try active countries as last resort
      if (loadedCountries.length === 0) {
        try {
          console.log('🔄 [TravelOffers] Method 3: Trying /api/countries?active=true');
          const response = await fetchWithTimeout('/api/countries?active=true');
          
          console.log('📡 [TravelOffers] Method 3 - Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
            loadedCountries = data.data;
            successMethod = 'Method 3 (active=true)';
            console.log(`✅ [TravelOffers] ${successMethod}: Loaded ${loadedCountries.length} countries`);
          }
        } catch (e: any) {
          lastError = e;
          console.error('❌ [TravelOffers] Method 3 failed:', e.message || e);
        }
      }
      
      // Filter to only show countries that have at least one name
      const validCountries = loadedCountries.filter((c: Country) => {
        const hasName = (c.name_ar && c.name_ar.trim() !== '') || 
                       (c.name_en && c.name_en.trim() !== '') || 
                       (c.name_fr && c.name_fr.trim() !== '');
        if (!hasName) {
          console.warn('⚠️ [TravelOffers] Country without valid name:', {
            id: c.id,
            name_ar: c.name_ar,
            name_en: c.name_en,
            name_fr: c.name_fr
          });
        }
        return hasName;
      });
      
      console.log(`✅ [TravelOffers] Countries with valid names: ${validCountries.length} (${successMethod})`);
      
      // Merge with static countries to ensure all countries are available (not just those with offers)
      const staticCountries = getAllCountriesWithDynamic();
      const allCountriesMap: Record<string, Country> = {};
      
      // Add API countries first
      validCountries.forEach(country => {
        if (country && country.id) {
          allCountriesMap[country.id] = {
            id: country.id,
            name_ar: country.name_ar,
            name_en: country.name_en,
            name_fr: country.name_fr
          };
        }
      });
      
      // Add static countries that aren't in API
      staticCountries.forEach(staticCountry => {
        if (!allCountriesMap[staticCountry.id]) {
          allCountriesMap[staticCountry.id] = {
            id: staticCountry.id,
            name_ar: staticCountry.name.ar,
            name_en: staticCountry.name.en,
            name_fr: staticCountry.name.fr
          };
        }
      });
      
      const allCountriesList = Object.values(allCountriesMap);
      
      console.log(`✅ [TravelOffers] Merged countries: ${allCountriesList.length} total (${validCountries.length} from API, ${staticCountries.length} static)`);
      
      // Remove duplicates by ID and name - More strict checking
      const uniqueCountriesMap: Record<string, Country> = {};
      const seenNames: Record<string, boolean> = {};
      const seenIds: Record<string, boolean> = {};
      
      allCountriesList.forEach(country => {
        if (!country || !country.id) return;
        
        const nameAr = (country.name_ar || '').toLowerCase().trim();
        const nameEn = (country.name_en || '').toLowerCase().trim();
        const nameFr = (country.name_fr || '').toLowerCase().trim();
        const nameKey = nameAr || nameEn || nameFr;
        
        // Check if already seen by ID
        if (seenIds[country.id]) {
          console.warn(`⚠️ [TravelOffers] Duplicate country by ID: ${country.id} (${country.name_ar || country.name_en})`);
          return;
        }
        
        // Check if already seen by name (any language)
        if (nameKey && seenNames[nameKey]) {
          console.warn(`⚠️ [TravelOffers] Duplicate country by name: ${nameKey} (ID: ${country.id})`);
          return;
        }
        
        // Add to unique list
        uniqueCountriesMap[country.id] = country;
        seenIds[country.id] = true;
        if (nameKey) {
          seenNames[nameKey] = true;
        }
      });
      
      const uniqueCountriesList = Object.values(uniqueCountriesMap);
      
      console.log(`✅ [TravelOffers] After removing duplicates: ${uniqueCountriesList.length} unique countries`);
      
      if (uniqueCountriesList.length > 0) {
        console.log('✅ [TravelOffers] Sample countries:', uniqueCountriesList.slice(0, 10).map(c => ({
          id: c.id,
          name_ar: c.name_ar,
          name_en: c.name_en
        })));
      }
      
      // Set all unique countries (not just those with offers)
      setCountries(uniqueCountriesList);
      
      // Set error messages only if we have real errors
      if (validCountries.length === 0) {
        if (loadedCountries.length === 0) {
          // No countries at all
          const errorMsg = lastError 
            ? (lastError.message || 'Unknown error')
            : 'No countries found in database';
          console.error(`❌ [TravelOffers] No countries loaded: ${errorMsg}`);
          setCountriesError(getLocalizedText(
            `فشل تحميل الدول: ${errorMsg}. يرجى التحقق من اتصال السيرفر وقاعدة البيانات.`,
            `Failed to load countries: ${errorMsg}. Please check server connection and database.`,
            `Échec du chargement des pays: ${errorMsg}. Veuillez vérifier la connexion au serveur et la base de données.`
          ));
        } else {
          // Countries loaded but none have valid names
          console.warn(`⚠️ [TravelOffers] Found ${loadedCountries.length} countries but none have valid names`);
          setCountriesError(getLocalizedText(
            `تم العثور على ${loadedCountries.length} دولة ولكن لا يوجد لديها أسماء صالحة. يرجى تحديثها من لوحة الأدمن.`,
            `Found ${loadedCountries.length} countries but none have valid names. Please update them from the admin panel.`,
            `${loadedCountries.length} pays trouvés mais aucun n'a de noms valides. Veuillez les mettre à jour depuis le panneau d'administration.`
          ));
        }
      } else if (validCountries.length < 5) {
        // Very few countries - might indicate a problem
        console.warn(`⚠️ [TravelOffers] Only ${validCountries.length} countries loaded - expected more`);
      }
    } catch (error: any) {
      console.error('❌ [TravelOffers] Critical error loading countries:', error);
      setCountriesError(getLocalizedText(
        `خطأ حرج في تحميل الدول: ${error.message || 'Unknown error'}. يرجى التحقق من اتصال السيرفر.`,
        `Critical error loading countries: ${error.message || 'Unknown error'}. Please check server connection.`,
        `Erreur critique lors du chargement des pays: ${error.message || 'Erreur inconnue'}. Veuillez vérifier la connexion au serveur.`
      ));
      // Even on error, set empty array to show proper UI state
      setCountries([]);
    } finally {
      setIsLoadingCountries(false);
      console.log('🏁 [TravelOffers] loadCountries finished. Countries count:', countries.length);
    }
  };

  const loadOffers = async () => {
    try {
      console.log('🎫 Starting to load offers...', { selectedCountryId });
      setLoading(true);
      
      const url = selectedCountryId && selectedCountryId !== 'all' && selectedCountryId !== 'auto'
        ? `/api/travel-offers?is_active=true&country_id=${selectedCountryId}`
        : '/api/travel-offers?is_active=true';
      
      console.log('📡 Fetching offers from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Offers response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Offers response data:', data);
      
      if (data.success) {
        const offersData = data.data || [];
        console.log(`✅ Loaded ${offersData.length} offers`);
        setOffers(offersData);
        
        if (offersData.length === 0) {
          console.warn('⚠️ No offers found');
        }
      } else {
        console.error('❌ Offers API returned error:', data.error);
      }
    } catch (error: any) {
      console.error('❌ Error loading offers:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    switch (language) {
      case 'en': return en;
      case 'fr': return fr;
      default: return ar;
    }
  };

  const getCountryName = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (!country) return countryId;
    return country[`name_${language}` as keyof Country] || country.name_ar;
  };

  const getCountryCapital = (countryId: string) => {
    const country = countries.find(c => c.id === countryId);
    if (!country) return '';
    return country[`capital_${language}` as keyof Country] || country.capital_ar || '';
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountryId(countryId);
    if (countryId !== 'all' && countryId !== 'auto') {
      const country = countries.find(c => c.id === countryId);
      if (country) {
        // Update LocationContext to match selected country
        const countryName = country[`name_${language}` as keyof Country] || country.name_ar;
        setLocationCountry(countryName);
      }
    } else if (countryId === 'all') {
      setLocationCountry(null);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = (offer[`title_${language}` as keyof TravelOffer] || offer.title_ar || '').toLowerCase();
      const description = (offer[`description_${language}` as keyof TravelOffer] || offer.description_ar || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.discount_price - b.discount_price;
      case 'discount':
        return b.discount_percentage - a.discount_percentage;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {getLocalizedText(
                  'العروض السياحية المميزة',
                  'Special Travel Offers',
                  'Offres de Voyage Spéciales'
                )}
              </h1>
              <p className="text-xl text-red-100 mb-8">
                {getLocalizedText(
                  'اكتشف أفضل العروض والخصومات على رحلاتك القادمة',
                  'Discover the best offers and discounts on your next trip',
                  'Découvrez les meilleures offres et réductions pour votre prochain voyage'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder={getLocalizedText(
                    'ابحث عن عرض...',
                    'Search for an offer...',
                    'Rechercher une offre...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Country Filter */}
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <select
                  value={selectedCountryId}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[200px]"
                >
                  <option value="auto" disabled={!detectedCountryName}>
                    {isDetecting 
                      ? getLocalizedText('جاري الكشف...', 'Detecting...', 'Détection...')
                      : detectedCountryName 
                        ? getLocalizedText(
                            `دولتي (${detectedCountryName})`,
                            `My Country (${detectedCountryName})`,
                            `Mon Pays (${detectedCountryName})`
                          )
                        : getLocalizedText('تلقائي', 'Auto', 'Auto')
                    }
                  </option>
                  <option value="all">
                    {getLocalizedText('جميع الدول', 'All Countries', 'Tous les Pays')}
                  </option>
                  {isLoadingCountries && (
                    <option value="" disabled>
                      {getLocalizedText('جاري تحميل الدول...', 'Loading countries...', 'Chargement des pays...')}
                    </option>
                  )}
                  {!isLoadingCountries && countries.length === 0 && (
                    <option value="" disabled>
                      {countriesError || getLocalizedText('لا توجد دول متاحة', 'No countries available', 'Aucun pays disponible')}
                    </option>
                  )}
                  {countries.length > 0 && countries.map(country => {
                    const countryName = country[`name_${language}` as keyof Country] || country.name_ar || country.name_en || country.name_fr || country.id;
                    return (
                      <option key={country.id} value={country.id}>
                        {countryName}
                      </option>
                    );
                  })}
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

              {/* Sort */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[180px]"
                >
                  <option value="newest">
                    {getLocalizedText('الأحدث', 'Newest', 'Plus récent')}
                  </option>
                  <option value="price">
                    {getLocalizedText('السعر', 'Price', 'Prix')}
                  </option>
                  <option value="discount">
                    {getLocalizedText('أكبر خصم', 'Biggest Discount', 'Plus grande réduction')}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {getLocalizedText(
                  'لا توجد عروض متاحة',
                  'No offers available',
                  'Aucune offre disponible'
                )}
              </h3>
              <p className="text-gray-500">
                {getLocalizedText(
                  'جرب البحث بكلمات مختلفة أو اختر دولة أخرى',
                  'Try searching with different keywords or select another country',
                  'Essayez de rechercher avec des mots-clés différents ou sélectionnez un autre pays'
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  {getLocalizedText(
                    `عرض ${filteredOffers.length} عرض`,
                    `Showing ${filteredOffers.length} offers`,
                    `Affichage de ${filteredOffers.length} offres`
                  )}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  // Track used images per country to ensure no duplicates (using object instead of Set)
                  const usedImagesByCountry: Record<string, Record<string, boolean>> = {};
                  
                  return filteredOffers.map((offer, offerGlobalIndex) => {
                    // Get country-specific images - ALWAYS use country images, ignore offer.main_image
                    const countryData = allCountriesData.find(c => c.id === offer.country_id);
                    
                    if (!countryData) {
                      console.warn(`⚠️ [TravelOffers] Country data not found for country_id: ${offer.country_id}`);
                    }
                    
                    const countryMainImage = countryData?.mainImage || '';
                    const countryGallery = countryData?.gallery || [];
                    
                    // Initialize tracking for this country if not exists
                    if (!usedImagesByCountry[offer.country_id]) {
                      usedImagesByCountry[offer.country_id] = {};
                    }
                    const usedImagesForCountry = usedImagesByCountry[offer.country_id];
                    
                    // ALWAYS use country images - IGNORE offer.main_image completely
                    let offerImage = '';
                    
                    // Get all offers for this country to determine which image to use
                    const countryOffers = filteredOffers.filter(o => o.country_id === offer.country_id);
                    const offerIndexInCountry = countryOffers.indexOf(offer);
                    
                    // Priority 1: Use different images from country gallery for different offers
                    if (countryGallery && Array.isArray(countryGallery) && countryGallery.length > 0) {
                      // Try to use different images - cycle through gallery, avoiding duplicates
                      let selectedIndex = offerIndexInCountry % countryGallery.length;
                      let attempts = 0;
                      const usedCount = Object.keys(usedImagesForCountry).length;
                      
                      // Find an unused image (if all used, cycle through again)
                      while (attempts < countryGallery.length * 2 && usedImagesForCountry[countryGallery[selectedIndex]]) {
                        selectedIndex = (selectedIndex + 1) % countryGallery.length;
                        attempts++;
                      }
                      
                      // If we've tried all images, clear and start fresh for this country
                      if (attempts >= countryGallery.length && usedCount >= countryGallery.length) {
                        Object.keys(usedImagesForCountry).forEach(key => delete usedImagesForCountry[key]);
                        selectedIndex = offerIndexInCountry % countryGallery.length;
                      }
                      
                      offerImage = countryGallery[selectedIndex];
                      usedImagesForCountry[offerImage] = true;
                      
                      console.log(`🖼️ [TravelOffers] Offer ${offer.id} (${offer.country_id}): Using gallery image ${selectedIndex + 1}/${countryGallery.length}, Used: ${Object.keys(usedImagesForCountry).length}/${countryGallery.length}`);
                    } 
                    // Priority 2: Use main image if no gallery available
                    else if (countryMainImage) {
                      offerImage = countryMainImage;
                      console.log(`🖼️ [TravelOffers] Offer ${offer.id} (${offer.country_id}): Using main image`);
                    } 
                    // Priority 3: Last resort - use offer image only if country has absolutely no images
                    else {
                      offerImage = offer.main_image || '';
                      console.warn(`⚠️ [TravelOffers] Offer ${offer.id} (${offer.country_id}): No country images found, using offer image as fallback`);
                    }
                    
                    // Debug log for first few offers
                    if (offerGlobalIndex < 5) {
                      console.log(`🖼️ [TravelOffers] Offer ${offer.id} (${offer.country_id}): Final image = ${offerImage ? 'SET' : 'EMPTY'}, Country found: ${countryData ? 'YES' : 'NO'}, Gallery: ${countryGallery?.length || 0} images, Main: ${countryMainImage ? 'YES' : 'NO'}`);
                    }
                  
                  return (
                    <div
                      key={offer.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                    >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {offerImage ? (
                        <img
                          src={offerImage}
                          alt={offer[`title_${language}` as keyof TravelOffer] as string || offer.title_ar}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to country image or default
                            const fallbackImage = countryMainImage || countryGallery[0] || 'https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg';
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <Tag className="h-16 w-16 text-white opacity-50" />
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {offer.discount_percentage > 0 && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                          {offer.discount_percentage}% {getLocalizedText('خصم', 'OFF', 'RÉDUCTION')}
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {offer.is_featured && (
                        <div className="absolute top-4 left-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {getLocalizedText('مميز', 'Featured', 'En vedette')}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-semibold">
                          {getCountryName(offer.country_id)}
                          {getCountryCapital(offer.country_id) && (
                            <span className="text-gray-400 mx-1">•</span>
                          )}
                          {getCountryCapital(offer.country_id) && (
                            <span className="text-gray-600">{getCountryCapital(offer.country_id)}</span>
                          )}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                        {offer[`title_${language}` as keyof TravelOffer] || offer.title_ar}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {offer[`description_${language}` as keyof TravelOffer] || offer.description_ar}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                        {offer.duration_days && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {offer.duration_days} {getLocalizedText('يوم', 'days', 'jours')}
                            </span>
                          </div>
                        )}
                        {offer.max_participants && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{offer.max_participants}</span>
                          </div>
                        )}
                        {offer.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(offer.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Includes */}
                      {offer[`includes_${language}` as keyof TravelOffer] && 
                       Array.isArray(offer[`includes_${language}` as keyof TravelOffer]) &&
                       (offer[`includes_${language}` as keyof TravelOffer] as string[]).length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            {getLocalizedText('يشمل:', 'Includes:', 'Comprend:')}
                          </p>
                          <ul className="space-y-1">
                            {(offer[`includes_${language}` as keyof TravelOffer] as string[]).slice(0, 3).map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4 pt-4 border-t">
                        <div>
                          {offer.original_price > offer.discount_price && (
                            <span className="text-sm text-gray-500 line-through block">
                              {offer.original_price} {offer.currency}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-red-600">
                            {offer.discount_price} {offer.currency}
                          </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => navigate(`/offers/${offer.id}`)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {getLocalizedText('عرض التفاصيل', 'View Details', 'Voir les Détails')}
                        <ArrowRight className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                  );
                  });
                })()}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

