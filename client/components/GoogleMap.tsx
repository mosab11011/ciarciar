import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader2 } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-tarhal-orange" /></div>;
    case Status.FAILURE:
      return <div className="flex items-center justify-center h-full text-tarhal-gray-dark">Error loading Google Maps</div>;
    case Status.SUCCESS:
      return <MyMapComponent />;
  }
};

function getCenterByCountry(name?: string | null) {
  if (!name) return null;
  const map: Record<string, { lat: number; lng: number }> = {
    'السودان': { lat: 15.5007, lng: 32.5599 },
    'السعودية': { lat: 24.7136, lng: 46.6753 },
    'الإمارات': { lat: 25.2048, lng: 55.2708 },
    'مصر': { lat: 30.0444, lng: 31.2357 },
    'الأردن': { lat: 31.9539, lng: 35.9106 },
    'لبنان': { lat: 33.8938, lng: 35.5018 },
    'المغرب': { lat: 33.9716, lng: -6.8498 },
    'تركيا': { lat: 39.9334, lng: 32.8597 },
  };
  return map[name] || null;
}

function MyMapComponent() {
  const { userCountry, selectedCountry, userLatLng } = useLocation();
  const activeCountry = selectedCountry || userCountry;
  const countryCenter = getCenterByCountry(activeCountry);
  const center = userLatLng || countryCenter || { lat: 15.5007, lng: 32.5599 }; // default Khartoum

  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {
        center,
        zoom: 7,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ weight: '2.00' }]
          },
          {
            featureType: 'all',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#9c9c9c' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f2f2f2' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'landscape.man_made',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#eeeeee' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#7b7b7b' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8d7d4' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#070707' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      }));
    }
  }, [ref, map]);

  // Add markers for major cities/offices
  React.useEffect(() => {
    if (map) {
      // User location marker (if available)
      if (userLatLng) {
        new google.maps.Marker({
          position: userLatLng,
          map,
          title: 'موقعك الحالي',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                <circle cx="19" cy="19" r="17" fill="#2563eb" stroke="white" stroke-width="3"/>
                <text x="19" y="23" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">YOU</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(38, 38)
          }
        });
      }

      // Khartoum (Headquarters)
      new google.maps.Marker({
        position: { lat: 15.5007, lng: 32.5599 },
        map,
        title: 'CIAR - المقر الرئيسي',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#ff6b35" stroke="white" stroke-width="3"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">C</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40)
        }
      });

      // Riyadh (Saudi Arabia office)
      new google.maps.Marker({
        position: { lat: 24.7136, lng: 46.6753 },
        map,
        title: 'مكتب الرياض',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="14" fill="#10b981" stroke="white" stroke-width="2"/>
              <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">R</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30)
        }
      });

      // Dubai (UAE office)
      new google.maps.Marker({
        position: { lat: 25.2048, lng: 55.2708 },
        map,
        title: 'مكتب دبي',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="14" fill="#3b82f6" stroke="white" stroke-width="2"/>
              <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">D</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30)
        }
      });

      // Istanbul (Turkey office)
      new google.maps.Marker({
        position: { lat: 41.0082, lng: 28.9784 },
        map,
        title: 'مكتب اسطنبول',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="14" fill="#8b5cf6" stroke="white" stroke-width="2"/>
              <text x="15" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">I</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30)
        }
      });
    }
  }, [map]);

  return <div ref={ref} className="w-full h-full" />;
}

interface GoogleMapProps {
  className?: string;
}

export default function GoogleMap({ className = '' }: GoogleMapProps) {
  const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const apiKey = rawKey && rawKey.trim().length > 0 ? rawKey.trim() : undefined;
  const hasValidKey = Boolean(apiKey && !apiKey.toLowerCase().includes('your_api_key'));
  const { userCountry, selectedCountry, userLatLng } = useLocation();
  const activeCountry = selectedCountry || userCountry;
  const countryCenter = getCenterByCountry(activeCountry);
  const center = userLatLng || countryCenter || { lat: 25.2048, lng: 55.2708 };

  if (!hasValidKey) {
    const fallbackLat = center.lat;
    const fallbackLng = center.lng;
    const bbox = `${fallbackLng - 1},${fallbackLat - 1},${fallbackLng + 1},${fallbackLat + 1}`;

    return (
      <div className={`w-full h-full ${className}`}>
        <div className="w-full h-full rounded-2xl overflow-hidden border border-tarhal-gray-light/70 shadow-lg bg-white">
          <iframe
            title="map-fallback"
            className="w-full h-full"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${fallbackLat}%2C${fallbackLng}`}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
}
