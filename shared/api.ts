// Shared API interfaces

export interface SiteSettings {
  id?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerVideoUrl?: string;
  headerVideoPoster?: string;
  headerBackgroundImages?: string[];
  discoverSectionBackgroundImage?: string;
  featuresSectionBackgroundImage?: string;
  componentOrder?: string[];
  settingsJson?: Record<string, any>;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SiteSettingsResponse {
  success: boolean;
  data?: SiteSettings;
  error?: string;
}

export interface UpdateSiteSettingsRequest {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  headerBackgroundColor?: string;
  headerVideoUrl?: string;
  headerVideoPoster?: string;
  headerBackgroundImages?: string[];
  discoverSectionBackgroundImage?: string;
  featuresSectionBackgroundImage?: string;
  componentOrder?: string[];
  settingsJson?: Record<string, any>;
}
