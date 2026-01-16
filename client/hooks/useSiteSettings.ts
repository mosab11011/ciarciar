import { useState, useEffect } from 'react';
import { SiteSettings } from '@shared/api';

// Convert hex to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Apply dynamic colors to CSS variables
const applyDynamicColors = (settings: SiteSettings) => {
  if (!settings) return;
  
  const root = document.documentElement;
  if (settings.primaryColor) {
    const hsl = hexToHsl(settings.primaryColor);
    if (hsl) {
      root.style.setProperty('--tarhal-blue', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty('--tarhal-blue-dark', `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 15, 20)}%`);
    }
  }
  if (settings.secondaryColor) {
    const hsl = hexToHsl(settings.secondaryColor);
    if (hsl) {
      root.style.setProperty('--tarhal-orange', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty('--tarhal-orange-dark', `${hsl.h} ${hsl.s}% ${Math.max(hsl.l - 15, 20)}%`);
    }
  }
  if (settings.backgroundColor) {
    root.style.setProperty('--background', settings.backgroundColor);
  }
  if (settings.headerBackgroundColor) {
    const hsl = hexToHsl(settings.headerBackgroundColor);
    if (hsl) {
      root.style.setProperty('--tarhal-navy', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      applyDynamicColors(settings);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/site-settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
        applyDynamicColors(data.data);
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, reload: loadSettings };
}

