import type { CountryData, City } from '@/data/countries';

export interface AdminCountryData extends CountryData {
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TravelOffice {
  id: string;
  countryId: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  address: {
    ar: string;
    en: string;
    fr: string;
  };
  phone: string;
  email: string;
  website?: string;
  manager: {
    ar: string;
    en: string;
    fr: string;
  };
  services: {
    ar: string[];
    en: string[];
    fr: string[];
  };
  workingHours: {
    ar: string;
    en: string;
    fr: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class DataManager {
  private readonly COUNTRIES_KEY = 'admin_countries_data';
  private readonly OFFICES_KEY = 'admin_travel_offices';
  private readonly BACKUP_KEY = 'admin_data_backup';

  // Get all countries
  getCountries(): AdminCountryData[] {
    try {
      const data = localStorage.getItem(this.COUNTRIES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return this.getDefaultCountries();
    } catch (error) {
      console.error('Error loading countries:', error);
      return this.getDefaultCountries();
    }
  }

  // Save countries
  saveCountries(countries: AdminCountryData[]): boolean {
    try {
      // Create backup before saving
      this.createBackup();
      localStorage.setItem(this.COUNTRIES_KEY, JSON.stringify(countries));
      return true;
    } catch (error) {
      console.error('Error saving countries:', error);
      return false;
    }
  }

  // Add new country
  addCountry(country: Omit<AdminCountryData, 'id' | 'createdAt' | 'updatedAt'>): AdminCountryData | null {
    try {
      const countries = this.getCountries();
      const newCountry: AdminCountryData = {
        ...country,
        id: `country_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      countries.push(newCountry);
      if (this.saveCountries(countries)) {
        return newCountry;
      }
      return null;
    } catch (error) {
      console.error('Error adding country:', error);
      return null;
    }
  }

  // Update country
  updateCountry(id: string, updates: Partial<AdminCountryData>): boolean {
    try {
      const countries = this.getCountries();
      const index = countries.findIndex(c => c.id === id);
      
      if (index === -1) return false;
      
      countries[index] = {
        ...countries[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return this.saveCountries(countries);
    } catch (error) {
      console.error('Error updating country:', error);
      return false;
    }
  }

  // Delete country
  deleteCountry(id: string): boolean {
    try {
      const countries = this.getCountries();
      const filteredCountries = countries.filter(c => c.id !== id);
      
      if (filteredCountries.length === countries.length) return false;
      
      // Also delete related offices
      this.deleteOfficesByCountry(id);
      
      return this.saveCountries(filteredCountries);
    } catch (error) {
      console.error('Error deleting country:', error);
      return false;
    }
  }

  // Get country by ID
  getCountryById(id: string): AdminCountryData | null {
    const countries = this.getCountries();
    return countries.find(c => c.id === id) || null;
  }

  // Travel Offices Management
  getOffices(): TravelOffice[] {
    try {
      const data = localStorage.getItem(this.OFFICES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading offices:', error);
      return [];
    }
  }

  // Save offices
  saveOffices(offices: TravelOffice[]): boolean {
    try {
      localStorage.setItem(this.OFFICES_KEY, JSON.stringify(offices));
      return true;
    } catch (error) {
      console.error('Error saving offices:', error);
      return false;
    }
  }

  // Add new office
  addOffice(office: Omit<TravelOffice, 'id' | 'createdAt' | 'updatedAt'>): TravelOffice | null {
    try {
      const offices = this.getOffices();
      const newOffice: TravelOffice = {
        ...office,
        id: `office_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      offices.push(newOffice);
      if (this.saveOffices(offices)) {
        return newOffice;
      }
      return null;
    } catch (error) {
      console.error('Error adding office:', error);
      return null;
    }
  }

  // Update office
  updateOffice(id: string, updates: Partial<TravelOffice>): boolean {
    try {
      const offices = this.getOffices();
      const index = offices.findIndex(o => o.id === id);
      
      if (index === -1) return false;
      
      offices[index] = {
        ...offices[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return this.saveOffices(offices);
    } catch (error) {
      console.error('Error updating office:', error);
      return false;
    }
  }

  // Delete office
  deleteOffice(id: string): boolean {
    try {
      const offices = this.getOffices();
      const filteredOffices = offices.filter(o => o.id !== id);
      
      if (filteredOffices.length === offices.length) return false;
      
      return this.saveOffices(filteredOffices);
    } catch (error) {
      console.error('Error deleting office:', error);
      return false;
    }
  }

  // Get offices by country
  getOfficesByCountry(countryId: string): TravelOffice[] {
    const offices = this.getOffices();
    return offices.filter(o => o.countryId === countryId);
  }

  // Delete offices by country
  deleteOfficesByCountry(countryId: string): boolean {
    try {
      const offices = this.getOffices();
      const filteredOffices = offices.filter(o => o.countryId !== countryId);
      return this.saveOffices(filteredOffices);
    } catch (error) {
      console.error('Error deleting offices by country:', error);
      return false;
    }
  }

  // Backup and restore
  createBackup(): boolean {
    try {
      const backup = {
        countries: this.getCountries(),
        offices: this.getOffices(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      return true;
    } catch (error) {
      console.error('Error creating backup:', error);
      return false;
    }
  }

  restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (!backup) return false;
      
      const data = JSON.parse(backup);
      localStorage.setItem(this.COUNTRIES_KEY, JSON.stringify(data.countries));
      localStorage.setItem(this.OFFICES_KEY, JSON.stringify(data.offices));
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // Export data
  exportData(): string {
    const data = {
      countries: this.getCountries(),
      offices: this.getOffices(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.countries && Array.isArray(data.countries)) {
        this.saveCountries(data.countries);
      }
      if (data.offices && Array.isArray(data.offices)) {
        this.saveOffices(data.offices);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): boolean {
    try {
      localStorage.removeItem(this.COUNTRIES_KEY);
      localStorage.removeItem(this.OFFICES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Get statistics
  getStatistics() {
    const countries = this.getCountries();
    const offices = this.getOffices();
    
    const totalCountries = countries.length;
    const activeCountries = countries.filter(c => c.isActive).length;
    const totalOffices = offices.length;
    const activeOffices = offices.filter(o => o.isActive).length;
    
    const totalTours = countries.reduce((sum, country) => sum + (country.totalTours || 0), 0);
    const totalReviews = countries.reduce((sum, country) => sum + (country.totalReviews || 0), 0);
    const avgRating = countries.length > 0 
      ? countries.reduce((sum, country) => sum + (country.rating || 0), 0) / countries.length 
      : 0;

    return {
      totalCountries,
      activeCountries,
      totalOffices,
      activeOffices,
      totalTours,
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      officesPerCountry: totalCountries > 0 ? Math.round(totalOffices / totalCountries * 10) / 10 : 0
    };
  }

  // Default countries data (fallback)
  private getDefaultCountries(): AdminCountryData[] {
    return [
      {
        id: 'sudan',
        name: { ar: 'السودان', en: 'Sudan', fr: 'Soudan' },
        description: {
          ar: 'أرض الحضارات القديمة والطبيعة الخلابة، حيث التقاء النيلين الأزرق والأبيض',
          en: 'Land of ancient civilizations and stunning nature, where the Blue and White Niles meet',
          fr: 'Terre des civilisations anciennes et de la nature époustouflante, où se rencontrent les Nils Bleu et Blanc'
        },
        continent: 'africa',
        capital: { ar: 'الخرطوم', en: 'Khartoum', fr: 'Khartoum' },
        currency: { ar: 'جن��ه سوداني', en: 'Sudanese Pound', fr: 'Livre Soudanaise' },
        language: { ar: 'العربية', en: 'Arabic', fr: 'Arabe' },
        bestTimeToVisit: { ar: 'نوفمبر - مارس', en: 'November - March', fr: 'Novembre - Mars' },
        mainImage: 'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
        gallery: [
          'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
          'https://images.pexels.com/photos/2869066/pexels-photo-2869066.jpeg'
        ],
        rating: 4.9,
        totalReviews: 2847,
        totalTours: 25,
        highlights: {
          ar: ['ملتقى النيلين', 'أهرامات مروي', 'جزيرة مقرن', 'النيل الأزرق', 'السوق الشعبي'],
          en: ['Blue and White Nile Confluence', 'Meroe Pyramids', 'Mogran Island', 'Blue Nile', 'Traditional Souq'],
          fr: ['Confluence des Nils Bleu et Blanc', 'Pyramides de Méroé', 'Île de Mogran', 'Nil Bleu', 'Souk Traditionnel']
        },
        culture: {
          ar: ['الضيافة السودانية', 'الموسيقى التراثية', 'الحرف اليدوية', 'المأكولات الشعبية'],
          en: ['Sudanese Hospitality', 'Traditional Music', 'Handicrafts', 'Local Cuisine'],
          fr: ['Hospitalité Soudanaise', 'Musique Traditionnelle', 'Artisanat', 'Cuisine Locale']
        },
        cuisine: {
          ar: ['الملاح', 'الكسرة', 'المولح', 'عصيدة الذرة'],
          en: ['Mullah', 'Kisra', 'Mulah', 'Asida'],
          fr: ['Mullah', 'Kisra', 'Mulah', 'Asida']
        },
        transportation: {
          ar: ['الطيران المحلي', 'الحافلات', 'القطارات', 'التاكسي'],
          en: ['Domestic Flights', 'Buses', 'Trains', 'Taxis'],
          fr: ['Vols Domestiques', 'Bus', 'Trains', 'Taxis']
        },
        safety: {
          ar: ['آمن للسياح', 'مرشدين محليين متاحين', 'خدمات طوارئ 24/7'],
          en: ['Safe for Tourists', 'Local Guides Available', '24/7 Emergency Services'],
          fr: ['Sûr pour les Touristes', 'Guides Locaux Disponibles', 'Services d\'Urgence 24/7']
        },
        cities: [
          {
            name: { ar: 'الخرطوم', en: 'Khartoum', fr: 'Khartoum' },
            description: {
              ar: 'عاصمة السودان وأكبر مدنه',
              en: 'Capital and largest city of Sudan',
              fr: 'Capitale et plus grande ville du Soudan'
            },
            attractions: {
              ar: ['ملتقى النيلين', 'المتحف القومي', 'جسر النيل الأزرق'],
              en: ['Blue and White Nile Confluence', 'National Museum', 'Blue Nile Bridge'],
              fr: ['Confluence des Nils', 'Musée National', 'Pont du Nil Bleu']
            },
            bestTime: { ar: 'طوال العام', en: 'Year Round', fr: 'Toute l\'Année' },
            duration: { ar: '3-4 أيام', en: '3-4 Days', fr: '3-4 Jours' }
          }
        ],
        isActive: true,
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }
    ];
  }
}

// Create singleton instance
export const dataManager = new DataManager();
export default dataManager;
