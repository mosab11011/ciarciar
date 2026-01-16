import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { LocationProvider } from "./contexts/LocationContext";
import { useEffect, Suspense, lazy } from "react";
import './services/supervisorInitialData';

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const TravelOffices = lazy(() => import("./pages/TravelOffices"));
const TravelOffers = lazy(() => import("./pages/TravelOffers"));
const TravelOfferDetail = lazy(() => import("./pages/TravelOfferDetail"));
const CountryDetail = lazy(() => import("./pages/CountryDetail"));
const CityDetail = lazy(() => import("./pages/CityDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProtectedRoute = lazy(() => import("./pages/AdminProtectedRoute"));
const SupervisorLogin = lazy(() => import("./pages/SupervisorLogin"));
const SupervisorDashboard = lazy(() => import("./pages/SupervisorDashboard"));
const SupervisorCityManager = lazy(() => import("./pages/SupervisorCityManager"));
const SupervisorOfficeManager = lazy(() => import("./pages/SupervisorOfficeManager"));
const AdminSupervisorManagement = lazy(() => import("./pages/AdminSupervisorManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutDemo = lazy(() => import("./pages/CheckoutDemo"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-12 w-12 border-4 border-tarhal-orange border-t-transparent rounded-full"></div>
  </div>
);

const queryClient = new QueryClient();

// Component to handle route changes and trigger translation
function TranslationHandler() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    // Trigger translation when route changes
    const triggerTranslation = () => {
      if ((window as any).forceTranslatePage) {
        (window as any).forceTranslatePage(language);
      }
    };

    // Small delay to allow page to render
    const timeout = setTimeout(triggerTranslation, 300);

    // Retry after longer delay for dynamic content
    const timeout2 = setTimeout(triggerTranslation, 1000);

    // Final retry for very late-loading elements
    const timeout3 = setTimeout(triggerTranslation, 2000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [location.pathname, language]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TranslationHandler />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/offices" element={<TravelOffices />} />
                <Route path="/offers" element={<TravelOffers />} />
                <Route path="/offers/:id" element={<TravelOfferDetail />} />
                <Route path="/offices/:countryId" element={<CountryDetail />} />
                <Route path="/offices/:countryId/cities/:cityId" element={<CityDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<CheckoutDemo />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/supervisors" element={<AdminProtectedRoute><AdminSupervisorManagement /></AdminProtectedRoute>} />
                <Route path="/supervisor/login" element={<SupervisorLogin />} />
                <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
                <Route path="/supervisor/cities/:mode" element={<SupervisorCityManager />} />
                <Route path="/supervisor/cities/:mode/:cityId" element={<SupervisorCityManager />} />
                <Route path="/supervisor/offices/:mode" element={<SupervisorOfficeManager />} />
                <Route path="/supervisor/offices/:mode/:officeId" element={<SupervisorOfficeManager />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LocationProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
