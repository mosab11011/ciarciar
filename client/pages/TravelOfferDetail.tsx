import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  CheckCircle,
  Tag,
  Globe,
  Image as ImageIcon,
  Share2,
  Heart,
  Phone,
  Mail,
  X
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
  capital_ar: string;
  capital_en: string;
  capital_fr: string;
}

export default function TravelOfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [offer, setOffer] = useState<TravelOffer | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/travel-offers/${id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setOffer(data.data);
        
        // Load country info
        if (data.data.country_id) {
          const countryResponse = await fetch(`/api/countries/${data.data.country_id}`);
          const countryData = await countryResponse.json();
          if (countryData.success) {
            setCountry(countryData.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading offer:', error);
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
    if (country) {
      return country[`name_${language}` as keyof Country] || country.name_ar;
    }
    return countryId;
  };

  const getCountryCapital = () => {
    if (country) {
      return country[`capital_${language}` as keyof Country] || country.capital_ar || '';
    }
    return '';
  };

  const allImages = offer ? [
    offer.main_image,
    ...(offer.images || [])
  ].filter(Boolean) as string[] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex justify-center items-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <Tag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            {getLocalizedText(
              'العرض غير موجود',
              'Offer not found',
              'Offre introuvable'
            )}
          </h2>
          <Button onClick={() => navigate('/offers')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getLocalizedText('العودة للعروض', 'Back to Offers', 'Retour aux Offres')}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const title = offer[`title_${language}` as keyof TravelOffer] || offer.title_ar;
  const description = offer[`description_${language}` as keyof TravelOffer] || offer.description_ar;
  const includes = offer[`includes_${language}` as keyof TravelOffer] as string[] || [];
  const highlights = offer[`highlights_${language}` as keyof TravelOffer] as string[] || [];
  const durationText = offer[`duration_text_${language}` as keyof TravelOffer] || offer.duration_text_ar || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/offers')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {getLocalizedText('العودة للعروض', 'Back to Offers', 'Retour aux Offres')}
            </Button>
          </div>
        </div>

        {/* Hero Section with Images */}
        <div className="relative">
          {allImages.length > 0 ? (
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <img
                src={allImages[selectedImageIndex]}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1239162/pexels-photo-1239162.jpeg';
                }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Discount Badge */}
              {offer.discount_percentage > 0 && (
                <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                  {offer.discount_percentage}% {getLocalizedText('خصم', 'OFF', 'RÉDUCTION')}
                </div>
              )}
              
              {/* Featured Badge */}
              {offer.is_featured && (
                <div className="absolute top-6 left-6 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  {getLocalizedText('عرض مميز', 'Featured Offer', 'Offre en vedette')}
                </div>
              )}

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all"
                  >
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === selectedImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* View Gallery Button */}
              {allImages.length > 1 && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
                >
                  <ImageIcon className="h-4 w-4" />
                  {getLocalizedText('عرض المعرض', 'View Gallery', 'Voir la Galerie')}
                </button>
              )}
            </div>
          ) : (
            <div className="h-96 md:h-[500px] bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Tag className="h-24 w-24 text-white opacity-50" />
            </div>
          )}

          {/* Title and Price Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
            <div className="container mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {getCountryName(offer.country_id)}
                  {getCountryCapital() && (
                    <>
                      <span className="mx-2 opacity-75">•</span>
                      <span className="opacity-90">{getCountryCapital()}</span>
                    </>
                  )}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
              <div className="flex items-center gap-4">
                {offer.original_price > offer.discount_price && (
                  <span className="text-xl line-through opacity-75">
                    {offer.original_price} {offer.currency}
                  </span>
                )}
                <span className="text-4xl md:text-5xl font-bold">
                  {offer.discount_price} {offer.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {getLocalizedText('الوصف', 'Description', 'Description')}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {getLocalizedText('المميزات', 'Highlights', 'Points Forts')}
                  </h2>
                  <ul className="space-y-3">
                    {highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Includes */}
              {includes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {getLocalizedText('يشمل', 'Includes', 'Comprend')}
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {includes.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {getLocalizedText('احجز الآن', 'Book Now', 'Réserver Maintenant')}
                </h3>
                
                {/* Price */}
                <div className="mb-6">
                  {offer.original_price > offer.discount_price && (
                    <div className="text-sm text-gray-500 line-through mb-1">
                      {offer.original_price} {offer.currency}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-red-600">
                    {offer.discount_price} {offer.currency}
                  </div>
                  {offer.discount_percentage > 0 && (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      {getLocalizedText(
                        `وفر ${offer.discount_percentage}%`,
                        `Save ${offer.discount_percentage}%`,
                        `Économisez ${offer.discount_percentage}%`
                      )}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  {durationText && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>{durationText}</span>
                    </div>
                  )}
                  {offer.duration_days && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {offer.duration_days} {getLocalizedText('يوم', 'days', 'jours')}
                      </span>
                    </div>
                  )}
                  {offer.start_date && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {getLocalizedText('من', 'From', 'Du')} {new Date(offer.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {offer.end_date && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {getLocalizedText('إلى', 'To', 'Au')} {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {offer.max_participants && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span>
                        {getLocalizedText('حد أقصى', 'Max', 'Max')} {offer.max_participants} {getLocalizedText('مشارك', 'participants', 'participants')}
                      </span>
                    </div>
                  )}
                  {offer.valid_until && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <span>
                        {getLocalizedText('صالح حتى', 'Valid until', 'Valable jusqu\'au')} {new Date(offer.valid_until).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(`/checkout?offer=${offer.id}`)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
                  >
                    {getLocalizedText('احجز الآن', 'Book Now', 'Réserver Maintenant')}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="flex-1"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {getLocalizedText('مفضلة', 'Favorite', 'Favori')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: title,
                            text: description,
                            url: window.location.href
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {getLocalizedText('مشاركة', 'Share', 'Partager')}
                    </Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    {getLocalizedText('للاستفسارات', 'For inquiries', 'Pour les demandes')}
                  </p>
                  <div className="space-y-2">
                    <a href="tel:+249123456789" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
                      <Phone className="h-4 w-4" />
                      <span>+249 123 456 789</span>
                    </a>
                    <a href="mailto:info@tarhal.com" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
                      <Mail className="h-4 w-4" />
                      <span>info@tarhal.com</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Country Info */}
              {country && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {getLocalizedText('عن البلد', 'About Country', 'À Propos du Pays')}
                  </h3>
                  <Link
                    to={`/offices/${country.id}`}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                  >
                    <Globe className="h-5 w-5" />
                    <span>{getCountryName(country.id)}</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && allImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative max-w-6xl w-full">
            <img
              src={allImages[selectedImageIndex]}
              alt={title}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all"
                >
                  <ArrowLeft className="h-6 w-6 rotate-180" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === selectedImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

