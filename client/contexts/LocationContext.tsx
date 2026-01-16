import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectUserCountry, mapCountryCodeToName, GeoLocationData } from '../services/geoLocation';
import { getAllCountriesWithDynamic } from '@/data/countries';

interface LocationContextType {
    userCountry: string | null; // User's actual country from IP
    selectedCountry: string | null; // User's manually selected country (overrides userCountry)
    detectedCountryCode: string | null;
    isDetecting: boolean;
    userLatLng: { lat: number; lng: number } | null;
    setSelectedCountry: (country: string | null) => void;
    resetToDetected: () => void;
    showAllCountries: boolean;
    setShowAllCountries: (show: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'tarhal_selected_country';
const SHOW_ALL_KEY = 'tarhal_show_all_countries';

export function LocationProvider({ children }: { children: ReactNode }) {
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountryState] = useState<string | null>(null);
    const [detectedCountryCode, setDetectedCountryCode] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(true);
    const [showAllCountries, setShowAllCountriesState] = useState(false);
    const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);
    const countriesList = getAllCountriesWithDynamic();

    const findCountryDisplayName = (code?: string | null, name?: string | null): string | null => {
        const mapByCode = code ? mapCountryCodeToName(code) : null;
        if (mapByCode) return mapByCode;
        const normalized = (name || '').toLowerCase().trim();
        if (!normalized) return null;

        const match = countriesList.find((c) => {
            const ar = c.name.ar.toLowerCase();
            const en = c.name.en.toLowerCase();
            const fr = c.name.fr.toLowerCase();
            return ar === normalized || en === normalized || fr === normalized;
        });

        return match ? match.name.ar : null; // default to Arabic label for better matching with UI
    };

    // Detect user's location on mount
    useEffect(() => {
        const detectLocation = async () => {
            setIsDetecting(true);

            // Check if we have a saved preference
            const savedCountry = localStorage.getItem(STORAGE_KEY);
            const savedShowAll = localStorage.getItem(SHOW_ALL_KEY);

            if (savedShowAll === 'true') {
                setShowAllCountriesState(true);
            }

            if (savedCountry) {
                setSelectedCountryState(savedCountry);
            }

            // Detect user's actual location
            const geoData = await detectUserCountry();

            if (geoData && geoData.country_code) {
                setDetectedCountryCode(geoData.country_code);
                const countryName = findCountryDisplayName(geoData.country_code, geoData.country_name);

                if (countryName) {
                    setUserCountry(countryName);

                    // If no saved preference, use detected country
                    if (!savedCountry) {
                        setSelectedCountryState(countryName);
                    }
                }

                if (geoData.latitude && geoData.longitude) {
                    setUserLatLng({ lat: geoData.latitude, lng: geoData.longitude });
                }
            }

            setIsDetecting(false);
        };

        detectLocation();
    }, []);

    const setSelectedCountry = (country: string | null) => {
        setSelectedCountryState(country);
        if (country) {
            localStorage.setItem(STORAGE_KEY, country);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const resetToDetected = () => {
        setSelectedCountryState(userCountry);
        if (userCountry) {
            localStorage.setItem(STORAGE_KEY, userCountry);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const setShowAllCountries = (show: boolean) => {
        setShowAllCountriesState(show);
        localStorage.setItem(SHOW_ALL_KEY, show.toString());
    };

    return (
        <LocationContext.Provider
            value={{
                userCountry,
                selectedCountry,
                detectedCountryCode,
                isDetecting,
                userLatLng,
                setSelectedCountry,
                resetToDetected,
                showAllCountries,
                setShowAllCountries,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
