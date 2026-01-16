import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCountryDataWithDynamic, getCountryName } from '@/data/countries';
import type { CountryData, City } from '@/data/countries';
import { ArrowLeft, MapPin, Calendar, Clock, Star, Camera, Hotel, Map, Sun, Info, Share2, Heart, Award } from 'lucide-react';

export default function CityDetail() {
    const { countryId, cityId } = useParams<{ countryId: string; cityId: string }>();
    const { language, t } = useLanguage();
    const [country, setCountry] = useState<CountryData | null>(null);
    const [city, setCity] = useState<City | null>(null);
    const [activeTab, setActiveTab] = useState('attractions');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    useEffect(() => {
        if (countryId && cityId) {
            const countryData = getCountryDataWithDynamic(countryId);
            if (countryData) {
                setCountry(countryData);
                const cityData = countryData.cities.find(c => c.id === cityId);
                if (cityData) {
                    setCity(cityData);
                }
            }
        }
        // Scroll to top
        window.scrollTo(0, 0);
    }, [countryId, cityId]);

    if (!country || !city) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin h-12 w-12 border-4 border-tarhal-orange border-t-transparent rounded-full"></div>
                </div>
            </Layout>
        );
    }

    const cityName = city.name[language] || city.name.en;
    const countryName = getCountryName(country, language);

    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: `url(${city.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy via-tarhal-blue-dark/60 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4 pt-20">
                        <Link
                            to={`/offices/${countryId}`}
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>عودة إلى {countryName}</span>
                        </Link>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-slide-up">
                            {cityName}
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
                            {city.description[language] || city.description.en}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="font-bold">{city.rating}</span>
                                <span className="text-sm opacity-80">({city.reviews} تقييم)</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white">
                                <Calendar className="h-5 w-5" />
                                <span>أفضل وقت: {city.bestTime[language]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Tabs */}
                        <div className="flex items-center gap-4 border-b border-gray-200 pb-1 overflow-x-auto">
                            {['attractions', 'gallery', 'guide'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-tarhal-blue-dark' : 'text-gray-500 hover:text-tarhal-blue'
                                        }`}
                                >
                                    {tab === 'attractions' && 'أهم المعالم'}
                                    {tab === 'gallery' && 'معرض الصور'}
                                    {tab === 'guide' && 'دليل الزائر'}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-tarhal-orange rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Attractions Tab */}
                        {activeTab === 'attractions' && (
                            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                                {city.attractions[language].map((place, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 group">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{place}</h3>
                                        <p className="text-gray-500 text-sm">
                                            استكشف واحدة من أجمل الوجهات السياحية في {cityName}. تجربة فريدة تنتظرك.
                                        </p>
                                    </div>
                                ))}
                                {city.highlights[language].map((highlight, idx) => (
                                    <div key={`h-${idx}`} className="bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy rounded-2xl p-6 shadow-lg text-white group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                                        <div className="relative z-10">
                                            <Award className="h-8 w-8 text-yellow-400 mb-4" />
                                            <h3 className="text-xl font-bold mb-2">{highlight}</h3>
                                            <p className="text-white/70 text-sm">تجربة لا تُفوت ينصح بها خبراء CIAR.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gallery Tab */}
                        {activeTab === 'gallery' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                                {[city.image, ...(city.gallery || [])].map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer group">
                                        <img
                                            src={img}
                                            alt={`${cityName} ${idx}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Guide Tab */}
                        {activeTab === 'guide' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4">
                                    <Clock className="h-6 w-6 text-tarhal-blue shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-tarhal-blue-dark mb-1">المدة المقترحة</h3>
                                        <p className="text-gray-600">ينصح بقضاء {city.duration[language]} لاستكشاف المدينة بتمهل واستمتاع.</p>
                                    </div>
                                </div>
                                <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex gap-4">
                                    <Sun className="h-6 w-6 text-orange-500 shrink-0" />
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">أفضل وقت للزيارة</h3>
                                        <p className="text-gray-600">{city.bestTime[language]} هو الوقت المثالي للأجواء اللطيفة.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">احجز رحلتك للمدينة</h3>

                            <div className="space-y-3 mb-6">
                                <Link to={`/checkout?desc=${encodeURIComponent('حجز فندق في ' + cityName)}`} className="block">
                                    <Button className="w-full h-12 justify-start gap-3 bg-white text-gray-900 border hover:bg-gray-50">
                                        <Hotel className="h-5 w-5 text-tarhal-orange" />
                                        فنادق في {cityName}
                                    </Button>
                                </Link>
                                <Link to={`/checkout?desc=${encodeURIComponent('حجز جولة سياحية في ' + cityName)}`} className="block">
                                    <Button className="w-full h-12 justify-start gap-3 bg-white text-gray-900 border hover:bg-gray-50">
                                        <Map className="h-5 w-5 text-tarhal-blue" />
                                        جولات سياحية
                                    </Button>
                                </Link>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                                    <Info className="h-4 w-4" />
                                    <span>هل تعلم؟</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {city.description[language] || city.description.en}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
