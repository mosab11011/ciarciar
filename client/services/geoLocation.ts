// Geo-location service to detect user's country from IP address
export interface GeoLocationData {
    country_code: string; // ISO 2-letter code (e.g., "SD", "SA")
    country_name: string;
    city?: string;
    ip?: string;
    latitude?: number;
    longitude?: number;
}

/**
 * Detect user's country using IP geolocation API
 * Uses ipapi.co free tier (1000 requests/day)
 */
export async function detectUserCountry(): Promise<GeoLocationData | null> {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            country_code: data.country_code || data.country,
            country_name: data.country_name,
            city: data.city,
            ip: data.ip,
            latitude: data.latitude,
            longitude: data.longitude,
        };
    } catch (error) {
        console.error('Failed to detect user location:', error);

        // Fallback: try alternative API
        try {
            const fallbackResponse = await fetch('https://api.country.is/');
            const fallbackData = await fallbackResponse.json();

            return {
                country_code: fallbackData.country,
                country_name: fallbackData.country,
                latitude: undefined,
                longitude: undefined,
            };
        } catch (fallbackError) {
            console.error('Fallback location detection also failed:', fallbackError);
            return null;
        }
    }
}

/**
 * Map country code to our supported country names
 */
export function mapCountryCodeToName(countryCode: string): string | null {
    const countryMap: Record<string, string> = {
        'SD': 'السودان',
        'SA': 'السعودية',
        'AE': 'الإمارات',
        'EG': 'مصر',
        'JO': 'الأردن',
        'LB': 'لبنان',
        'MA': 'المغرب',
        'TR': 'تركيا',
    };

    return countryMap[countryCode.toUpperCase()] || null;
}

/**
 * Get country code from country name
 */
export function getCountryCode(countryName: string): string | null {
    const reverseMap: Record<string, string> = {
        'السودان': 'SD',
        'السعودية': 'SA',
        'الإمارات': 'AE',
        'مصر': 'EG',
        'الأردن': 'JO',
        'لبنان': 'LB',
        'المغرب': 'MA',
        'تركيا': 'TR',
    };

    return reverseMap[countryName] || null;
}
