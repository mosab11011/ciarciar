import React, { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface MapPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-tarhal-orange" />
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          Error loading Google Maps. Please check your API key.
        </div>
      );
    case Status.SUCCESS:
      return null; // Will be handled by MapComponent
  }
};

function MapComponent({ 
  latitude, 
  longitude, 
  onLocationChange 
}: { 
  latitude: number | undefined; 
  longitude: number | undefined; 
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [marker, setMarker] = useState<google.maps.Marker>();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      const initialCenter = latitude && longitude 
        ? { lat: latitude, lng: longitude }
        : { lat: 24.7136, lng: 46.6753 }; // Default: Riyadh

      const newMap = new window.google.maps.Map(ref.current, {
        center: initialCenter,
        zoom: latitude && longitude ? 15 : 6,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);

      // Add click listener
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setCurrentLocation({ lat, lng });
          onLocationChange(lat, lng);
        }
      });
    }
  }, [ref, map, latitude, longitude, onLocationChange]);

  // Update marker position
  useEffect(() => {
    if (map && (latitude !== undefined && longitude !== undefined)) {
      const position = { lat: latitude, lng: longitude };
      
      if (marker) {
        marker.setPosition(position);
        map.setCenter(position);
        map.setZoom(15);
      } else {
        const newMarker = new window.google.maps.Marker({
          position,
          map,
          draggable: true,
          title: 'Destination Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });

        newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setCurrentLocation({ lat, lng });
            onLocationChange(lat, lng);
          }
        });

        setMarker(newMarker);
        map.setCenter(position);
        map.setZoom(15);
      }
    }
  }, [map, latitude, longitude, marker, onLocationChange]);

  // Get current location button
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          onLocationChange(lat, lng);
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={ref} className="w-full h-full rounded-lg" />
      <div className="absolute top-4 right-4 z-10">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGetCurrentLocation}
          className="bg-white shadow-md"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>
      {currentLocation && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-sm">
          <div className="font-semibold">Selected Location:</div>
          <div className="text-xs text-gray-600">
            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MapPicker({ 
  latitude, 
  longitude, 
  onLocationChange,
  height = '400px',
  className = ''
}: MapPickerProps) {
  const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const apiKey = rawKey && rawKey.trim().length > 0 ? rawKey.trim() : undefined;
  const hasValidKey = Boolean(apiKey && !apiKey.toLowerCase().includes('your_api_key'));

  if (!hasValidKey) {
    // Fallback: Manual coordinate input
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Google Maps API key not configured. Please enter coordinates manually.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                if (!isNaN(lat) && longitude !== undefined) {
                  onLocationChange(lat, longitude);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="24.7136"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value);
                if (!isNaN(lng) && latitude !== undefined) {
                  onLocationChange(latitude, lng);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="46.6753"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent 
          latitude={latitude} 
          longitude={longitude} 
          onLocationChange={onLocationChange}
        />
      </Wrapper>
    </div>
  );
}

