import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, Camera, Users, Plane, Hotel, Car, Shield, Clock, Sun, Cloud, Droplets, Wind, Heart, Share2, Download, Play, MessageCircle, HelpCircle, Map as MapIcon, Utensils, ShoppingBag, PhoneCall } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { getCountryDataWithDynamic, getCountryName, getCountryDescription, getCityName } from '@/data/countries';
import type { CountryData } from '@/data/countries';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CountryDetail() {
  const { countryId } = useParams<{ countryId: string }>();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (countryId) {
      const data = getCountryDataWithDynamic(countryId);
      setCountryData(data);
    }
  }, [countryId]);

  useEffect(() => {
    if (countryData?.gallery?.length) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % countryData.gallery.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [countryData?.gallery?.length]);

  // Show error message if country not found after loading
  if (countryId && countryData === null) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-4xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-tarhal-blue-dark mb-4">الدولة غير موجودة</h1>
            <p className="text-tarhal-gray-dark mb-6">عذراً، لم نتمكن من العثور على بيانات هذه الدولة</p>
            <Link to="/offices">
              <Button className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white">
                العودة للمكاتب السياحية
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Loading state
  if (!countryData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 border-4 border-tarhal-orange border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-tarhal-blue-dark mb-4">جاري تحميل بيانات الدولة...</h1>
            <Link to="/offices">
              <Button className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white">
                العودة للمكاتب السياحية
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const ensureCities = (data: CountryData) => {
    // عرض المدن الحقيقية فقط بدون توليد مدن وهمية مرقمة
    return data.cities || [];
  };

  const displayedCities = ensureCities(countryData);

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          {countryData.gallery.map((image, index) => (
            <div
              key={image || index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-tarhal-navy/90 via-tarhal-blue-dark/70 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6 animate-slide-in-left">
                <Link to="/offices" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span>العودة للمكاتب</span>
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-6 animate-fade-in">
                <span className="text-6xl">{countryData.flag}</span>
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                    {getCountryName(countryData, language)}
                  </h1>
                  <p className="text-xl text-tarhal-orange font-medium">{countryData.name.en}</p>
                </div>
              </div>

              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl animate-slide-up" style={{ animationDelay: '300ms' }}>
                {getCountryDescription(countryData, language)}
              </p>

              <div className="flex flex-wrap gap-4 mb-8 animate-scale-in" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Star className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-white font-semibold">{countryData.rating}</span>
                  <span className="text-white/80">({countryData.totalReviews} {t('common.reviews')})</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Plane className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-white">{countryData.totalTours} {t('common.tours')}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Hotel className="h-5 w-5 text-tarhal-orange" />
                  <span className="text-white">{countryData.totalHotels} {t('common.hotels')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '800ms' }}>
                <Link to={`/checkout?amount=99&currency=USD&desc=${encodeURIComponent('حجز ' + countryData.name.ar)}`}>
                  <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    {t('common.bookNow')}
                    <Calendar className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-tarhal-blue-dark px-8 py-3 text-lg font-semibold transition-all duration-300">
                  {t('common.gallery')}
                  <Camera className="mr-2 h-5 w-5" />
                </Button>
                <button
                  onClick={() => toggleFavorite(countryData.id)}
                  className={`p-3 rounded-lg transition-colors ${favorites.includes(countryData.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-red-500'
                    }`}
                >
                  <Heart className="h-5 w-5" fill={favorites.includes(countryData.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="py-6 bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
            <div className="p-3">
              <MapPin className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.capital')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.capital[language]}</div>
            </div>
            <div className="p-3">
              <Calendar className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.bestTime')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.bestTime[language]}</div>
            </div>
            <div className="p-3">
              <Sun className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.climate')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.climate[language]}</div>
            </div>
            <div className="p-3">
              <Clock className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.timezone')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.timeZone}</div>
            </div>
            <div className="p-3">
              <Users className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.language')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.language[language]}</div>
            </div>
            <div className="p-3">
              <div className="text-2xl mx-auto mb-2">💰</div>
              <div className="text-sm font-semibold text-tarhal-blue-dark">{t('common.currency')}</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.currency[language]}</div>
            </div>
            <div className="p-3">
              <Shield className="h-6 w-6 text-tarhal-orange mx-auto mb-2" />
              <div className="text-sm font-semibold text-tarhal-blue-dark">التأشيرة</div>
              <div className="text-xs text-tarhal-gray-dark">{countryData.visaRequired ? t('common.visaRequired') : t('common.noVisaRequired')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-20 z-40 bg-white border-b border-tarhal-gray-light">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: <MapPin className="h-4 w-4" /> },
              { id: 'cities', label: 'المدن السياحية', icon: <Camera className="h-4 w-4" /> },
              { id: 'culture', label: 'الثقافة والتراث', icon: <Users className="h-4 w-4" /> },
              { id: 'practical', label: 'معلومات عملية', icon: <Car className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-tarhal-orange text-tarhal-orange'
                    : 'border-transparent text-tarhal-gray-dark hover:text-tarhal-blue-dark'
                  }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-white min-h-screen">
        <div className="container mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="space-y-16">
              {/* Highlights */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">{t('common.highlights')}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countryData.highlights[language].map((highlight, index) => (
                    <div
                      key={highlight || index}
                      className="flex items-center gap-4 p-6 bg-gradient-to-br from-tarhal-orange/5 to-tarhal-blue/5 rounded-xl hover:shadow-lg transition-shadow duration-300 animate-scale-in"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="w-12 h-12 bg-tarhal-orange rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-tarhal-blue-dark font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Info (Component 1) */}
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">معلومات الطقس</h2>
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center group hover:-translate-y-2 transition-transform">
                      <Sun className="h-12 w-12 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">الصيف</h3>
                      <p className="text-tarhal-gray-dark text-sm">حار وجاف<br />35-45°م</p>
                    </div>
                    <div className="text-center group hover:-translate-y-2 transition-transform">
                      <Cloud className="h-12 w-12 text-gray-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">الخريف</h3>
                      <p className="text-tarhal-gray-dark text-sm">معتدل<br />25-35°م</p>
                    </div>
                    <div className="text-center group hover:-translate-y-2 transition-transform">
                      <Wind className="h-12 w-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">الشتاء</h3>
                      <p className="text-tarhal-gray-dark text-sm">بارد وجاف<br />15-25°م</p>
                    </div>
                    <div className="text-center group hover:-translate-y-2 transition-transform">
                      <Droplets className="h-12 w-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">الربيع</h3>
                      <p className="text-tarhal-gray-dark text-sm">معتدل<br />20-30°م</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Gallery (Component 2) */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">جولات بالفيديو</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer">
                    <img src={countryData.mainImage} alt="Video Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-tarhal-orange transition-colors">
                        <Play className="h-6 w-6 text-white fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-white">
                      <h3 className="font-bold">أجمل معالم {getCountryName(countryData, language)}</h3>
                      <p className="text-sm opacity-80">جولة 4K</p>
                    </div>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer">
                    <img src={countryData.gallery[1] || countryData.mainImage} alt="Video Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-tarhal-orange transition-colors">
                        <Play className="h-6 w-6 text-white fill-current ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-white">
                      <h3 className="font-bold">الثقافة والمجتمع</h3>
                      <p className="text-sm opacity-80">وثائقي قصير</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cities' && (
            <div className="space-y-12">
              <div className="text-center mb-12 animate-fade-in">
                <h2 className="text-4xl font-bold text-tarhal-blue-dark mb-4">
                  {t('common.cities')} في {getCountryName(countryData, language)}
                </h2>
                <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto">
                  اكتشف جمال وتنوع المدن من الشمال إلى الجنوب
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCities.map((city, index) => (
                  <Link
                    to={`/offices/${countryId}/cities/${city.id}`}
                    key={city.id}
                    className="group block h-full"
                  >
                    <div
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-scale-in h-full flex flex-col"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={city.image}
                          alt={getCityName(city, language)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(city.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${favorites.includes(city.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/80 text-tarhal-gray-dark hover:bg-red-500 hover:text-white'
                              }`}
                          >
                            <Heart className="h-4 w-4" fill={favorites.includes(city.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-white">{getCityName(city, language)}</h3>
                              <p className="text-sm text-white/80">{city.name.en}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-white text-sm font-semibold">{city.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-tarhal-gray-dark mb-4 line-clamp-2">{city.description[language]}</p>

                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex items-center gap-2 text-sm text-tarhal-gray-dark">
                            <Calendar className="h-4 w-4 text-tarhal-orange" />
                            <span>{t('common.bestTime')}: {city.bestTime[language]}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-tarhal-gray-dark">
                            <Clock className="h-4 w-4 text-tarhal-orange" />
                            <span>مدة الزيارة: {city.duration[language]}</span>
                          </div>
                        </div>

                        <Button className="w-full bg-tarhal-orange hover:bg-tarhal-orange-dark text-white group-hover:shadow-lg transition-all">
                          استكشف المدينة
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Map Section (Component 3) */}
              <div className="mt-16 bg-gray-50 rounded-2xl p-8 border border-gray-100 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <MapIcon className="h-8 w-8 text-tarhal-blue-dark" />
                  <h2 className="text-2xl font-bold text-tarhal-blue-dark">خريطة الوجهات السياحية</h2>
                </div>
                <div className="aspect-[21/9] bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover opacity-20"></div>
                  <p className="text-gray-500 font-medium z-10 bg-white/80 px-4 py-2 rounded-full absolute">خريطة تفاعلية (قريباً)</p>

                  {/* Mock Pins */}
                  <div className="absolute top-1/2 left-1/3 text-tarhal-orange animate-bounce"><MapPin className="h-8 w-8 fill-current" /></div>
                  <div className="absolute top-1/3 left-1/2 text-tarhal-blue animate-bounce" style={{ animationDelay: '0.5s' }}><MapPin className="h-8 w-8 fill-current" /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'culture' && (
            <div className="space-y-16">
              {/* Culture */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">الثقافة والتراث</h2>
                <div className="bg-gradient-to-br from-tarhal-blue/5 to-tarhal-orange/5 rounded-2xl p-8 icon-pattern-bg">
                  <p className="text-lg text-tarhal-gray-dark leading-relaxed mb-6">
                    {countryData.culture[language]}
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">🎭</div>
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">الفنون الشعبية</h3>
                      <p className="text-sm text-tarhal-gray-dark">الرقص والموسيقى التقليدية</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">🏛️</div>
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">التاريخ العريق</h3>
                      <p className="text-sm text-tarhal-gray-dark">حضارات قديمة وآثار</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="font-bold text-tarhal-blue-dark mb-2">التنوع الثقافي</h3>
                      <p className="text-sm text-tarhal-gray-dark">قبائل وثقافات متعددة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuisine (Component 4: Enhanced) */}
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">المأكولات التقليدية</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countryData.cuisine[language].map((dish, index) => (
                    <div
                      key={dish || index}
                      className="group flex flex-col gap-4 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-scale-in border-t-4 border-tarhal-orange"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full text-orange-600 group-hover:bg-tarhal-orange group-hover:text-white transition-colors">
                          <Utensils className="h-6 w-6" />
                        </div>
                        <span className="text-tarhal-blue-dark font-bold text-lg">{dish}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        طبق تقليدي شهير يتميز بنكهات وبهارات محلية فريدة. تجربة تذوق لا بد منها.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Souvenirs (Component 5) */}
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">هدايا تذكارية</h2>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
                  <div className="flex items-start gap-6">
                    <ShoppingBag className="h-12 w-12 text-purple-500 shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-purple-900 mb-4">أفضل ما يمكن شراؤه</h3>
                      <div className="flex flex-wrap gap-3">
                        {['الحرف اليدوية', 'البهارات', 'المنسوجات', 'الفخار', 'الزي التقليدي'].map((item, idx) => (
                          <span key={idx} className="px-4 py-2 bg-white rounded-full text-purple-700 text-sm font-medium shadow-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'practical' && (
            <div className="space-y-16">
              {/* Transportation */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">وسائل المواصلات</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {countryData.transportation[language].map((transport, index) => (
                    <div
                      key={transport || index}
                      className="flex items-center gap-4 p-6 bg-gradient-to-br from-tarhal-blue/5 to-tarhal-orange/5 rounded-xl animate-scale-in"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <Car className="h-8 w-8 text-tarhal-orange" />
                      <span className="text-tarhal-blue-dark font-medium">{transport}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety */}
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">الأمان والسلامة</h2>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 text-green-500 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-tarhal-blue-dark mb-4">معلومات الأمان</h3>
                      <p className="text-tarhal-gray-dark leading-relaxed">{countryData.safety[language]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section (Component 6) */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">أسئلة شائعة</h2>
                <div className="space-y-4">
                  {[
                    { q: 'ما هي تكلفة التأشيرة؟', a: 'تختلف التكلفة حسب الجنسية ونوع التأشيرة، يرجى مراجعة السفارة أو الموقع الرسمي.' },
                    { q: 'هل يمكن استخدام بطاقات الائتمان؟', a: 'نعم، تقبل معظم الفنادق والمطاعم الكبرى بطاقات الائتمان، لكن يفضل حمل السيولة النقدية.' },
                    { q: 'هل مياه الصنبور صالحة للشرب؟', a: 'ينصح بشراء المياه المعبأة للشرب في معظم المناطق.' },
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                      <div className="flex gap-3 mb-2">
                        <HelpCircle className="h-5 w-5 text-tarhal-orange shrink-0" />
                        <h3 className="font-bold text-gray-900">{faq.q}</h3>
                      </div>
                      <p className="text-gray-600 mr-8">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts (Component 7) */}
              <div className="animate-slide-up">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">أرقام الطوارئ</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'الشرطة', num: '999' },
                    { label: 'الإسعاف', num: '998' },
                    { label: 'الإطفاء', num: '997' },
                    { label: 'سفارتك', num: 'راجع الدليل' },
                  ].map((contact, idx) => (
                    <div key={idx} className="bg-red-50 text-red-900 rounded-xl p-4 text-center border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
                      <PhoneCall className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <div className="font-bold text-lg">{contact.num}</div>
                      <div className="text-sm opacity-80">{contact.label}</div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Download Resources */}
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-8">موارد مفيدة</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Button variant="outline" className="p-6 h-auto flex-col gap-3">
                    <Download className="h-8 w-8 text-tarhal-orange" />
                    <span className="font-semibold">دليل السفر PDF</span>
                    <span className="text-sm text-tarhal-gray-dark">معلومات شاملة</span>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col gap-3">
                    <MapPin className="h-8 w-8 text-tarhal-orange" />
                    <span className="font-semibold">خريطة تفاعلية</span>
                    <span className="text-sm text-tarhal-gray-dark">مواقع المعالم</span>
                  </Button>
                  <Button variant="outline" className="p-6 h-auto flex-col gap-3">
                    <Play className="h-8 w-8 text-tarhal-orange" />
                    <span className="font-semibold">فيديو تعريفي</span>
                    <span className="text-sm text-tarhal-gray-dark">جولة افتراضية</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">
            جاهز لاستكشاف {getCountryName(countryData, language)}؟
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto animate-slide-up">
            دع خبراءنا يساعدونك في تخطيط رحلة لا تُنسى إلى هذه الوجهة الرائعة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              احجز رحلتك الآن
              <Calendar className="mr-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-tarhal-blue-dark px-8 py-3 text-lg font-semibold transition-all duration-300">
              تواصل مع خبير
              <Users className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
