import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Globe, Phone, Mail, Settings, ChevronDown, User, Calendar, Sun, Moon, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import SearchModal from './SearchModal';
import { useLanguage, Language } from '../contexts/LanguageContext';
import Logo from './Logo';

// Declare global function for Google Translate
declare global {
  interface Window {
    doGTranslate: (lang_pair: string) => void;
  }
}

// Constants
const NAV_LINKS = [
  { href: '/', key: 'nav.home' },
  { href: '/offices', key: 'nav.offices' },
  { href: '/offers', key: 'nav.offers' },
  { href: '/about', key: 'nav.about' },
  // { href: '/contact', key: 'nav.contact' },
];

const LANGUAGES = [
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
  { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
];

// Currency list with 15 currencies including Sudanese Pound
const CURRENCIES = [
  { code: 'USD', name: { ar: 'دولار أمريكي', en: 'US Dollar', fr: 'Dollar Américain' }, symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: { ar: 'يورو', en: 'Euro', fr: 'Euro' }, symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: { ar: 'جنيه إسترليني', en: 'British Pound', fr: 'Livre Sterling' }, symbol: '£', flag: '🇬🇧' },
  { code: 'SAR', name: { ar: 'ريال سعودي', en: 'Saudi Riyal', fr: 'Riyal Saoudien' }, symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AED', name: { ar: 'درهم إماراتي', en: 'UAE Dirham', fr: 'Dirham Émirati' }, symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'EGP', name: { ar: 'جنيه مصري', en: 'Egyptian Pound', fr: 'Livre Égyptienne' }, symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'SDG', name: { ar: 'جنيه سوداني', en: 'Sudanese Pound', fr: 'Livre Soudanaise' }, symbol: 'ج.س', flag: '🇸🇩' },
  { code: 'JPY', name: { ar: 'ين ياباني', en: 'Japanese Yen', fr: 'Yen Japonais' }, symbol: '¥', flag: '🇯🇵' },
  { code: 'CNY', name: { ar: 'يوان صيني', en: 'Chinese Yuan', fr: 'Yuan Chinois' }, symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: { ar: 'روبية هندية', en: 'Indian Rupee', fr: 'Roupie Indienne' }, symbol: '₹', flag: '🇮🇳' },
  { code: 'TRY', name: { ar: 'ليرة تركية', en: 'Turkish Lira', fr: 'Livre Turque' }, symbol: '₺', flag: '🇹🇷' },
  { code: 'CAD', name: { ar: 'دولار كندي', en: 'Canadian Dollar', fr: 'Dollar Canadien' }, symbol: '$', flag: '🇨🇦' },
  { code: 'AUD', name: { ar: 'دولار أسترالي', en: 'Australian Dollar', fr: 'Dollar Australien' }, symbol: '$', flag: '🇦🇺' },
  { code: 'CHF', name: { ar: 'فرنك سويسري', en: 'Swiss Franc', fr: 'Franc Suisse' }, symbol: 'Fr', flag: '🇨🇭' },
  { code: 'KWD', name: { ar: 'دينار كويتي', en: 'Kuwaiti Dinar', fr: 'Dinar Koweïtien' }, symbol: 'د.ك', flag: '🇰🇼' }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load selected currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && CURRENCIES.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close language and currency menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setShowCurrencyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger Google Translate when language changes
  useEffect(() => {
    const triggerTranslation = () => {
      // Wait for Google Translate widget to be ready
      const checkAndTranslate = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select && select.value !== language) {
          select.value = language;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Also use force translate
          if ((window as any).forceTranslatePage) {
            (window as any).forceTranslatePage(language);
          }
          return true;
        }
        return false;
      };

      // Try multiple times with delays
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(() => {
        attempts++;
        if (checkAndTranslate() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 200);
      
      // Use force translate as backup
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(language);
        }
      }, 500);
      
      // Final retry for dynamic elements
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(language);
        }
      }, 2000);
    };

    // Small delay to ensure Google Translate is loaded
    const timeout = setTimeout(triggerTranslation, 300);
    return () => clearTimeout(timeout);
  }, [language]);

  const navLinks = NAV_LINKS;

  const languages = [
    { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' },
    { code: 'en' as Language, name: 'English', flag: '🇬🇧' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  ];

  const getCurrencyName = (currency: typeof CURRENCIES[0]) => {
    return currency.name[language] || currency.name.en;
  };

  const selectedCurrencyData = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);

    // Trigger Google Translate to translate the entire page
    const triggerGoogleTranslate = () => {
      // Method 1: Try using the global function
      if (window.doGTranslate) {
        const langMap: { [key in Language]: string } = { 
          ar: 'ar', 
          en: 'en', 
          fr: 'fr', 
          es: 'es' 
        };
        window.doGTranslate(langMap[newLanguage]);
      }
      
      // Method 2: Direct DOM manipulation (more reliable)
      setTimeout(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          select.value = newLanguage;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Also try the alternative selector
        const altSelect = document.querySelector('#\\:0\\.target\\.lang') as HTMLSelectElement;
        if (altSelect) {
          altSelect.value = newLanguage;
          altSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Try using the helper function if available
        if ((window as any).changeGoogleTranslateLanguage) {
          (window as any).changeGoogleTranslateLanguage(newLanguage);
        }
        
        // Use force translate to ensure all elements are translated
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(newLanguage);
        }
      }, 100);
      
      // Retry after longer delay for dynamic elements
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(newLanguage);
        }
      }, 500);
      
      // Final retry for very late-loading elements
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(newLanguage);
        }
      }, 1500);
    };

    // Wait a bit for React to update, then trigger translation
    setTimeout(triggerGoogleTranslate, 50);
  };

  const isHomePage = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 dark:bg-tarhal-navy/95 backdrop-blur-xl shadow-xl border-b border-tarhal-gray-light/20'
          : isHomePage
          ? 'bg-transparent'
          : 'bg-white/90 dark:bg-tarhal-navy/90 backdrop-blur-md shadow-md border-b border-tarhal-gray-light/10'
      }`}
    >
      {/* Top utility bar */}
      {/* <div className="bg-tarhal-navy text-white text-xs py-2 px-4 hidden md:block">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">تابعنا</span>
            <span className="opacity-80">فيسبوك</span>
            <span className="opacity-80">X</span>
            <span className="opacity-80">انستقرام</span>
            <span className="opacity-80">تيلغرام</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+249123456789" className="flex items-center gap-2 hover:text-tarhal-orange transition-colors duration-300">
              <Phone size={14} />
              <span>+249 123 456 789</span>
            </a>
            <a href="mailto:info@tarhal.com" className="flex items-center gap-2 hover:text-tarhal-orange transition-colors duration-300">
              <Mail size={14} />
              <span>info@tarhal.com</span>
            </a>
            <div className="hidden lg:flex items-center gap-2 opacity-80">
              <Calendar size={12} />
              <span>متاح 24/7</span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1 hover:text-tarhal-orange transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div> */}

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo - Integrated in header */}
          <div className="flex items-center justify-center h-full overflow-hidden">
            <Logo showText={false} size="sm" variant="minimal" className="flex-shrink-0" />
          </div>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative font-semibold transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg group ${
                    active
                      ? 'text-tarhal-orange bg-tarhal-orange/10'
                      : 'text-tarhal-blue-dark hover:text-tarhal-orange hover:bg-tarhal-orange/5'
                  }`}
                >
                  <span className="relative z-10">{t(link.key)}</span>
                  {active && (
                    <>
                      <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-tarhal-orange rounded-full animate-scale-in"></span>
                      <span className="absolute inset-0 bg-tarhal-orange/5 rounded-lg"></span>
                    </>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-tarhal-orange/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className={`p-2.5 rounded-lg ${
                isScrolled || !isHomePage
                  ? 'text-tarhal-blue-dark hover:text-tarhal-orange hover:bg-tarhal-orange/10'
                  : 'text-tarhal-blue-dark hover:text-tarhal-orange hover:bg-tarhal-orange/10'
              } transition-all duration-300 hover:scale-110`}
              aria-label="Search"
            >
              <Search size={20} />
            </Button>

            {/* Currency Selector */}
            <div className="relative hidden sm:block" ref={currencyMenuRef}>
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-2 text-sm font-semibold text-tarhal-blue-dark hover:text-tarhal-orange transition-colors duration-300"
              >
                <DollarSign size={16} />
                <span>{selectedCurrencyData.flag} {selectedCurrencyData.code}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${showCurrencyMenu ? 'rotate-180' : ''}`} />
              </button>
              {showCurrencyMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-tarhal-navy rounded-lg shadow-xl border border-tarhal-gray-light/20 min-w-[220px] max-h-[400px] overflow-y-auto animate-scale-in z-50">
                  {CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => {
                        setSelectedCurrency(currency.code);
                        setShowCurrencyMenu(false);
                        // Save to localStorage
                        localStorage.setItem('selectedCurrency', currency.code);
                      }}
                      className={`w-full px-4 py-3 text-right flex items-center justify-between gap-3 hover:bg-tarhal-orange/10 transition-colors duration-200 ${
                        selectedCurrency === currency.code
                          ? 'bg-tarhal-orange/20 text-tarhal-orange font-semibold'
                          : 'text-tarhal-blue-dark dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currency.flag}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold">{currency.code}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{getCurrencyName(currency)}</span>
                        </div>
                      </div>
                      {selectedCurrency === currency.code && <div className="w-2 h-2 bg-tarhal-orange rounded-full"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative hidden sm:block" ref={languageMenuRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 text-sm font-semibold text-tarhal-blue-dark hover:text-tarhal-orange transition-colors duration-300"
              >
                <Globe size={16} />
                <span>{languages.find(l => l.code === language)?.flag} {languages.find(l => l.code === language)?.name}</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>
              {showLanguageMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-tarhal-navy rounded-lg shadow-xl border border-tarhal-gray-light/20 min-w-[180px] overflow-hidden animate-scale-in z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-right flex items-center justify-between gap-3 hover:bg-tarhal-orange/10 transition-colors duration-200 ${
                        language === lang.code
                          ? 'bg-tarhal-orange/20 text-tarhal-orange font-semibold'
                          : 'text-tarhal-blue-dark dark:text-white'
                      }`}
                    >
                      <span className="text-sm">{lang.flag} {lang.name}</span>
                      {language === lang.code && <div className="w-2 h-2 bg-tarhal-orange rounded-full"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/contact">
              <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-5 py-2.5 text-sm font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg hidden lg:flex items-center gap-2">
                {t('nav.contact')}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2.5 rounded-lg text-tarhal-blue-dark hover:bg-tarhal-orange/10 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-tarhal-navy backdrop-blur-xl border-b border-tarhal-gray-light/20 shadow-2xl transition-all duration-500 overflow-hidden ${
            isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => {
                const active = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-tarhal-blue-dark dark:text-white hover:text-tarhal-orange font-semibold py-3 px-4 rounded-lg border-b border-tarhal-gray-light/20 hover:bg-tarhal-orange/10 transition-all duration-300 animate-slide-in-left flex items-center justify-between ${
                      active ? 'bg-tarhal-orange/10 text-tarhal-orange border-l-4 border-l-tarhal-orange' : ''
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span>{t(link.key)}</span>
                    {active && <div className="w-2 h-2 bg-tarhal-orange rounded-full"></div>}
                  </Link>
                );
              })}

              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full mt-4 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white py-3 font-semibold hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                  {t('nav.contact')}
                </Button>
              </Link>

              <div className="pt-4 mt-4 border-t border-tarhal-gray-light/30">
                <div className="flex items-center gap-2 text-tarhal-blue-dark dark:text-white mb-3">
                  <Globe size={16} />
                  <span className="text-sm font-semibold">اللغة</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setShowLanguageMenu(false);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-3 rounded-lg border text-sm ${
                        language === lang.code
                          ? 'bg-tarhal-orange/15 text-tarhal-orange border-tarhal-orange/30'
                          : 'border-tarhal-gray-light/40 text-tarhal-blue-dark dark:text-white hover:border-tarhal-orange/40'
                      } transition-colors duration-200`}
                    >
                      <span>{lang.flag} {lang.name}</span>
                      {language === lang.code && <div className="w-2 h-2 bg-tarhal-orange rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-tarhal-gray-light/30 space-y-2">
                <a href="tel:+249123456789" className="flex items-center gap-3 text-tarhal-blue-dark dark:text-white hover:text-tarhal-orange transition-colors duration-300 py-2">
                  <Phone size={16} />
                  <span className="text-sm">+249 123 456 789</span>
                </a>
                <a href="mailto:info@tarhal.com" className="flex items-center gap-3 text-tarhal-blue-dark dark:text-white hover:text-tarhal-orange transition-colors duration-300 py-2">
                  <Mail size={16} />
                  <span className="text-sm">info@tarhal.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
