import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Calendar, Users, Plane, Hotel, Camera, ArrowRight, Heart, Share2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PaymentMethods from '@/components/PaymentMethods';
import { getAllCountriesWithDynamic, getCountryName, getCountryDescription } from '@/data/countries';
import { dataManager } from '@/services/dataManager';
import { useLanguage } from '@/contexts/LanguageContext';

interface TravelOffice {
  id: string;
  name: string;
  nameAr: string;
  continent: string;
  country: string;
  capital: string;
  image: string;
  rating: number;
  reviews: number;
  tours: number;
  hotels: number;
  attractions: number;
  bestTime: string;
  languages: string[];
  currency: string;
  description: string;
  popular: boolean;
  featured: boolean;
}

export default function TravelOffices() {
  const [searchQuery, setSearchQuery] = useState('');
  const { language, t } = useLanguage();
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // تحويل بيانات الدول إلى تنسيق TravelOffice
  const transformCountryToOffice = (country: any): TravelOffice => ({
    id: country.id,
    name: country.name.en,
    nameAr: country.name.ar,
    continent: getContinent(country.id),
    country: country.name.en,
    capital: country.capital[language] || country.capital.ar,
    image: country.mainImage,
    rating: country.rating,
    reviews: country.totalReviews,
    tours: country.totalTours,
    hotels: country.totalHotels,
    attractions: country.cities.length * 5, // تقدير عدد المعالم
    bestTime: country.bestTime[language] || country.bestTime.ar,
    languages: [country.language.ar, country.language.en, country.language.fr].filter(Boolean),
    currency: country.currency[language] || country.currency.ar,
    description: country.description[language] || country.description.ar,
    popular: country.rating >= 4.7,
    featured: ['sudan', 'saudi', 'uae'].includes(country.id)
  });

  const getContinent = (countryId: string): string => {
    const continentMap: { [key: string]: string } = {
      'sudan': 'africa',
      'saudi': 'asia',
      'uae': 'asia'
    };
    return continentMap[countryId] || 'asia';
  };

  const countries = getAllCountriesWithDynamic();
  const [travelOffices, setTravelOffices] = useState<TravelOffice[]>([]);

  useEffect(() => {
    const transformedOffices = countries.map(transformCountryToOffice);
    setTravelOffices(transformedOffices);
  }, [countries, language]);

  const continents = [
    { value: 'all', label: t('travelOffices.allContinents'), labelEn: t('travelOffices.allContinents') },
    { value: 'africa', label: t('travelOffices.africa'), labelEn: t('travelOffices.africa') },
    { value: 'asia', label: t('travelOffices.asia'), labelEn: t('travelOffices.asia') },
    { value: 'europe', label: t('travelOffices.europe'), labelEn: t('travelOffices.europe') },
    { value: 'america', label: t('travelOffices.america'), labelEn: t('travelOffices.america') },
  ];

  const sortOptions = [
    { value: 'name', label: 'الاسم', labelEn: 'Name' },
    { value: 'rating', label: 'التقييم', labelEn: 'Rating' },
    { value: 'tours', label: 'عدد الجولات', labelEn: 'Tours Count' },
    { value: 'popular', label: 'الأكثر شعبية', labelEn: 'Most Popular' },
  ];

  const filteredOffices = travelOffices
    .filter(office => {
      const matchesSearch = office.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          office.capital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === 'all' || office.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'tours':
          return b.tours - a.tours;
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        default:
          return a.nameAr.localeCompare(b.nameAr);
      }
    });

  const featuredOffices = travelOffices.filter(office => office.featured);

  const toggleFavorite = (officeId: string) => {
    setFavorites(prev => 
      prev.includes(officeId) 
        ? prev.filter(id => id !== officeId)
        : [...prev, officeId]
    );
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          {headerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-tarhal-navy/90 via-tarhal-blue-dark/70 to-tarhal-orange/30"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
              {t('travelOffices.heroTitle')}
              <span className="block text-tarhal-orange text-3xl md:text-4xl font-normal mt-2">
                {t('travelOffices.heroSubtitle')}
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              {t('travelOffices.heroDescription')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-scale-in" style={{ animationDelay: '600ms' }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-tarhal-gray-dark h-5 w-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن وجهتك المفضلة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-white/95 backdrop-blur-sm border-none rounded-xl focus:ring-2 focus:ring-tarhal-orange"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="py-8 bg-white border-b border-tarhal-gray-light">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Continent Filter */}
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-tarhal-blue-dark" />
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="px-4 py-2 border border-tarhal-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-tarhal-orange"
              >
                {continents.map(continent => (
                  <option key={continent.value} value={continent.value}>
                    {continent.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <span className="text-tarhal-blue-dark font-medium">ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-tarhal-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-tarhal-orange"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-tarhal-gray-dark">
              <span className="font-semibold text-tarhal-blue-dark">{filteredOffices.length}</span> وجهة متاحة
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      {searchQuery === '' && selectedContinent === 'all' && (
        <section className="py-16 bg-gradient-to-br from-tarhal-orange/5 to-tarhal-blue/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-tarhal-blue-dark mb-4 animate-fade-in">
                الوجهات المميزة
              </h2>
              <p className="text-xl text-tarhal-gray-dark animate-slide-up">
                اكتشف أشهر وجهاتنا السياحية الأكثر طلباً
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredOffices.slice(0, 6).map((office, index) => (
                <div
                  key={office.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={office.image}
                      alt={office.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => toggleFavorite(office.id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.includes(office.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-tarhal-gray-dark hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={favorites.includes(office.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4 bg-tarhal-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                      مميز
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">{office.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-tarhal-blue-dark">{office.nameAr}</h3>
                      <button className="p-2 hover:bg-tarhal-gray-light rounded-full transition-colors">
                        <Share2 className="h-4 w-4 text-tarhal-gray-dark" />
                      </button>
                    </div>
                    
                    <p className="text-tarhal-gray-dark mb-4 line-clamp-2">{office.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div className="bg-tarhal-orange/10 rounded-lg p-2">
                        <Plane className="h-5 w-5 text-tarhal-orange mx-auto mb-1" />
                        <div className="text-sm font-semibold text-tarhal-blue-dark">{office.tours}</div>
                        <div className="text-xs text-tarhal-gray-dark">جولة</div>
                      </div>
                      <div className="bg-tarhal-blue/10 rounded-lg p-2">
                        <Hotel className="h-5 w-5 text-tarhal-blue mx-auto mb-1" />
                        <div className="text-sm font-semibold text-tarhal-blue-dark">{office.hotels}</div>
                        <div className="text-xs text-tarhal-gray-dark">فندق</div>
                      </div>
                      <div className="bg-tarhal-navy/10 rounded-lg p-2">
                        <Camera className="h-5 w-5 text-tarhal-navy mx-auto mb-1" />
                        <div className="text-sm font-semibold text-tarhal-blue-dark">{office.attractions}</div>
                        <div className="text-xs text-tarhal-gray-dark">معلم</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-tarhal-gray-dark">
                        <MapPin className="h-4 w-4" />
                        <span>{office.capital}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-tarhal-gray-dark">
                        <Calendar className="h-4 w-4" />
                        <span>{office.bestTime}</span>
                      </div>
                    </div>
                    
                    <Link to={`/offices/${office.id}`}>
                      <Button className="w-full bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                        استكشف الوجهة
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Destinations Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-tarhal-blue-dark mb-4">
              {searchQuery || selectedContinent !== 'all' ? 'نتائج البحث' : 'جميع الوجهات'}
            </h2>
            <p className="text-xl text-tarhal-gray-dark">
              {filteredOffices.length} وجهة سياحية تنتظر اكتشافك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl-grid-cols-4 gap-6">
            {filteredOffices.map((office, index) => (
              <div
                key={office.id}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-tarhal-gray-light/50 animate-scale-in"
                style={{ animationDelay: `${(index % 12) * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={office.image}
                    alt={office.nameAr}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleFavorite(office.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        favorites.includes(office.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-tarhal-gray-dark hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className="h-3 w-3" fill={favorites.includes(office.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  {office.popular && (
                    <div className="absolute top-2 left-2 bg-tarhal-blue text-white px-2 py-1 rounded-full text-xs font-semibold">
                      شائع
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold">{office.rating}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">{office.nameAr}</h3>
                  <p className="text-sm text-tarhal-gray-dark mb-3 line-clamp-2">{office.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-tarhal-gray-dark mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{office.capital}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{office.reviews} مراجعة</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-tarhal-gray-dark">
                      {office.tours} جولة • {office.hotels} فندق
                    </div>
                    <Link to={`/offices/${office.id}`}>
                      <Button size="sm" className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white">
                        تفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOffices.length === 0 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-tarhal-gray-light rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-16 w-16 text-tarhal-gray-dark" />
              </div>
              <h3 className="text-2xl font-bold text-tarhal-blue-dark mb-4">لا توجد نتائج</h3>
              <p className="text-tarhal-gray-dark mb-6">لم نجد أي وجهات تطابق معايير البحث الخاصة بك</p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedContinent('all');
                }}
                className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white"
              >
                إعادة تعيين البحث
              </Button>
            </div>
          )}
        </div>
      </section>

      <PaymentMethods
        variant="light"
        title="طرق الدفع المعتمدة"
        subtitle="خيارات دفع آمنة وسريعة لكل حجوزات المكاتب السياحية"
        className="bg-gray-50"
      />

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-white animate-scale-in">
              <div className="text-4xl md:text-5xl font-bold text-tarhal-orange mb-2">50+</div>
              <div className="text-lg">دولة</div>
            </div>
            <div className="text-white animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl md:text-5xl font-bold text-tarhal-orange mb-2">
                {travelOffices.reduce((sum, office) => sum + office.tours, 0)}+
              </div>
              <div className="text-lg">جولة سياحية</div>
            </div>
            <div className="text-white animate-scale-in" style={{ animationDelay: '400ms' }}>
              <div className="text-4xl md:text-5xl font-bold text-tarhal-orange mb-2">
                {travelOffices.reduce((sum, office) => sum + office.hotels, 0)}+
              </div>
              <div className="text-lg">فندق وشقة</div>
            </div>
            <div className="text-white animate-scale-in" style={{ animationDelay: '600ms' }}>
              <div className="text-4xl md:text-5xl font-bold text-tarhal-orange mb-2">
                {travelOffices.reduce((sum, office) => sum + office.reviews, 0).toLocaleString()}+
              </div>
              <div className="text-lg">عميل سعيد</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
