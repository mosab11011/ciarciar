import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguage();

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    if (language === 'ar') return ar;
    if (language === 'fr') return fr;
    return en;
  };

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-tarhal-blue/10 to-tarhal-orange/10">
        <div className="text-center space-y-8 p-8 max-w-2xl">
          {/* 404 Animation */}
          <div className="relative">
            <div className="text-9xl font-bold text-tarhal-orange/20 animate-pulse-slow">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center animate-bounce-slow">
                <span className="text-white text-5xl">🧭</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark">
              {getLocalizedText('عذراً، الصفحة غير موجودة', 'Sorry, Page Not Found', 'Désolé, Page Introuvable')}
            </h1>
            <p className="text-xl text-tarhal-gray-dark leading-relaxed">
              {getLocalizedText(
                'يبدو أنك قد تُهت في رحلتك! الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لا تقلق، دعنا نعيدك إلى المسار الصحيح.',
                'It seems you got lost on your journey! The page you are looking for does not exist or has been moved. Don\'t worry, let\'s get you back on track.',
                'Il semble que vous vous soyez perdu dans votre voyage! La page que vous recherchez n\'existe pas ou a été déplacée. Ne vous inquiétez pas, remettons-vous sur la bonne voie.'
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '400ms' }}>
            <Link to="/">
              <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                {getLocalizedText('العودة للرئيسية', 'Back to Home', 'Retour à l\'Accueil')}
                <Home className="mr-2 h-5 w-5" />
              </Button>
            </Link>

            <Link to="/offices">
              <Button variant="outline" className="border-tarhal-blue text-tarhal-blue hover:bg-tarhal-blue hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300">
                {getLocalizedText('استكشف المكاتب', 'Explore Offices', 'Explorer les Bureaux')}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-8 pt-8 animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="w-16 h-16 bg-tarhal-blue/20 rounded-full flex items-center justify-center animate-float">
              <span className="text-2xl">🌍</span>
            </div>
            <div className="w-16 h-16 bg-tarhal-orange/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
              <span className="text-2xl">✈️</span>
            </div>
            <div className="w-16 h-16 bg-tarhal-navy/20 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
              <span className="text-2xl">🗺️</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

