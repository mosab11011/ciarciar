import { RequestHandler } from "express";
import { getDatabase, generateId } from "../database/database";
import { SiteSettingsResponse, UpdateSiteSettingsRequest, SiteSettings } from "@shared/api";

// Default site settings
const DEFAULT_SETTINGS: SiteSettings = {
  id: 'site_config',
  primaryColor: '#1e40af',
  secondaryColor: '#f97316',
  backgroundColor: '#ffffff',
  headerBackgroundColor: '#0f172a',
  headerVideoUrl: '',
  headerVideoPoster: '',
  headerBackgroundImages: [],
  discoverSectionBackgroundImage: '',
  featuresSectionBackgroundImage: '',
  componentOrder: [
    'hero',
    'travel-offices',
    'discover',
    'features',
    'about',
    'destinations',
    'testimonials',
    'payment-methods',
    'statistics',
    'newsletter',
    'services',
    'map',
    'contact',
    'gallery',
    'blog',
    'partners',
    'awards',
    'team',
    'faq',
    'pricing',
    'reviews',
    'social-media',
    'video-gallery',
    'timeline',
    'countdown',
    'promotions',
    'live-chat',
    'weather-widget',
    'currency-converter'
  ],
  settingsJson: {},
};

// GET /api/site-settings - Get site settings
export const getSiteSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    
    const settings = await db.get<any>(
      'SELECT * FROM site_settings WHERE id = ?',
      ['site_config']
    );

    if (!settings) {
      // Return default settings if none exist
      return res.json({
        success: true,
        data: DEFAULT_SETTINGS
      } as SiteSettingsResponse);
    }

    // Parse JSON fields (convert snake_case to camelCase)
    const parsedSettings: SiteSettings = {
      id: settings.id,
      primaryColor: settings.primary_color,
      secondaryColor: settings.secondary_color,
      backgroundColor: settings.background_color,
      headerBackgroundColor: settings.header_background_color,
      headerVideoUrl: settings.header_video_url,
      headerVideoPoster: settings.header_video_poster,
      headerBackgroundImages: settings.header_background_images 
        ? JSON.parse(settings.header_background_images) 
        : [],
      discoverSectionBackgroundImage: settings.discover_section_background_image,
      featuresSectionBackgroundImage: settings.features_section_background_image,
      componentOrder: settings.component_order 
        ? JSON.parse(settings.component_order) 
        : DEFAULT_SETTINGS.componentOrder,
      settingsJson: settings.settings_json 
        ? JSON.parse(settings.settings_json) 
        : {},
      updatedAt: settings.updated_at,
      updatedBy: settings.updated_by,
    };

    res.json({
      success: true,
      data: parsedSettings
    } as SiteSettingsResponse);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site settings'
    } as SiteSettingsResponse);
  }
};

// PUT /api/site-settings - Update site settings
export const updateSiteSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const updates: UpdateSiteSettingsRequest = req.body;

    // Check if settings exist
    const existing = await db.get<any>(
      'SELECT * FROM site_settings WHERE id = ?',
      ['site_config']
    );

    const userId = (req as any).user?.id || 'system';

    if (!existing) {
      // Insert new settings
      await db.run(
        `INSERT INTO site_settings (
          id, primary_color, secondary_color, background_color, header_background_color,
          header_video_url, header_video_poster, header_background_images,
          discover_section_background_image, features_section_background_image,
          component_order, settings_json, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'site_config',
          updates.primaryColor || DEFAULT_SETTINGS.primaryColor,
          updates.secondaryColor || DEFAULT_SETTINGS.secondaryColor,
          updates.backgroundColor || DEFAULT_SETTINGS.backgroundColor,
          updates.headerBackgroundColor || DEFAULT_SETTINGS.headerBackgroundColor,
          updates.headerVideoUrl || DEFAULT_SETTINGS.headerVideoUrl || null,
          updates.headerVideoPoster || DEFAULT_SETTINGS.headerVideoPoster || null,
          updates.headerBackgroundImages 
            ? JSON.stringify(updates.headerBackgroundImages) 
            : JSON.stringify(DEFAULT_SETTINGS.headerBackgroundImages),
          updates.discoverSectionBackgroundImage || null,
          updates.featuresSectionBackgroundImage || null,
          updates.componentOrder 
            ? JSON.stringify(updates.componentOrder) 
            : JSON.stringify(DEFAULT_SETTINGS.componentOrder),
          updates.settingsJson 
            ? JSON.stringify(updates.settingsJson) 
            : JSON.stringify(DEFAULT_SETTINGS.settingsJson),
          userId
        ]
      );
    } else {
      // Update existing settings (merge with existing) - convert snake_case to camelCase
      const mergedSettings: SiteSettings = {
        id: existing.id,
        primaryColor: updates.primaryColor ?? (existing.primary_color || DEFAULT_SETTINGS.primaryColor),
        secondaryColor: updates.secondaryColor ?? (existing.secondary_color || DEFAULT_SETTINGS.secondaryColor),
        backgroundColor: updates.backgroundColor ?? (existing.background_color || DEFAULT_SETTINGS.backgroundColor),
        headerBackgroundColor: updates.headerBackgroundColor ?? (existing.header_background_color || DEFAULT_SETTINGS.headerBackgroundColor),
        headerVideoUrl: updates.headerVideoUrl ?? existing.header_video_url,
        headerVideoPoster: updates.headerVideoPoster ?? existing.header_video_poster,
        headerBackgroundImages: updates.headerBackgroundImages ?? (existing.header_background_images ? JSON.parse(existing.header_background_images) : []),
        discoverSectionBackgroundImage: updates.discoverSectionBackgroundImage ?? existing.discover_section_background_image,
        featuresSectionBackgroundImage: updates.featuresSectionBackgroundImage ?? existing.features_section_background_image,
        componentOrder: updates.componentOrder ?? (existing.component_order ? JSON.parse(existing.component_order) : DEFAULT_SETTINGS.componentOrder),
        settingsJson: updates.settingsJson ?? (existing.settings_json ? JSON.parse(existing.settings_json) : {}),
      };

      await db.run(
        `UPDATE site_settings SET
          primary_color = ?,
          secondary_color = ?,
          background_color = ?,
          header_background_color = ?,
          header_video_url = ?,
          header_video_poster = ?,
          header_background_images = ?,
          discover_section_background_image = ?,
          features_section_background_image = ?,
          component_order = ?,
          settings_json = ?,
          updated_by = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          mergedSettings.primaryColor,
          mergedSettings.secondaryColor,
          mergedSettings.backgroundColor,
          mergedSettings.headerBackgroundColor,
          mergedSettings.headerVideoUrl || null,
          mergedSettings.headerVideoPoster || null,
          JSON.stringify(mergedSettings.headerBackgroundImages),
          mergedSettings.discoverSectionBackgroundImage || null,
          mergedSettings.featuresSectionBackgroundImage || null,
          JSON.stringify(mergedSettings.componentOrder),
          JSON.stringify(mergedSettings.settingsJson),
          userId,
          'site_config'
        ]
      );
    }

    // Fetch and return updated settings
    const updated = await db.get<any>(
      'SELECT * FROM site_settings WHERE id = ?',
      ['site_config']
    );

    const parsedSettings: SiteSettings = {
      id: updated!.id,
      primaryColor: updated!.primary_color,
      secondaryColor: updated!.secondary_color,
      backgroundColor: updated!.background_color,
      headerBackgroundColor: updated!.header_background_color,
      headerVideoUrl: updated!.header_video_url,
      headerVideoPoster: updated!.header_video_poster,
      headerBackgroundImages: updated!.header_background_images 
        ? JSON.parse(updated!.header_background_images) 
        : [],
      discoverSectionBackgroundImage: updated!.discover_section_background_image,
      featuresSectionBackgroundImage: updated!.features_section_background_image,
      componentOrder: updated!.component_order 
        ? JSON.parse(updated!.component_order) 
        : DEFAULT_SETTINGS.componentOrder,
      settingsJson: updated!.settings_json 
        ? JSON.parse(updated!.settings_json) 
        : {},
      updatedAt: updated!.updated_at,
      updatedBy: updated!.updated_by,
    };

    res.json({
      success: true,
      data: parsedSettings
    } as SiteSettingsResponse);
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update site settings'
    } as SiteSettingsResponse);
  }
};

// POST /api/site-settings/reset - Reset to default settings
export const resetSiteSettings: RequestHandler = async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = (req as any).user?.id || 'system';

    await db.run(
      `UPDATE site_settings SET
        primary_color = ?,
        secondary_color = ?,
        background_color = ?,
        header_background_color = ?,
        header_video_url = ?,
        header_video_poster = ?,
        header_background_images = ?,
        discover_section_background_image = ?,
        features_section_background_image = ?,
        component_order = ?,
        settings_json = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        DEFAULT_SETTINGS.primaryColor,
        DEFAULT_SETTINGS.secondaryColor,
        DEFAULT_SETTINGS.backgroundColor,
        DEFAULT_SETTINGS.headerBackgroundColor,
        DEFAULT_SETTINGS.headerVideoUrl || null,
        DEFAULT_SETTINGS.headerVideoPoster || null,
        JSON.stringify(DEFAULT_SETTINGS.headerBackgroundImages),
        null,
        null,
        JSON.stringify(DEFAULT_SETTINGS.componentOrder),
        JSON.stringify(DEFAULT_SETTINGS.settingsJson),
        userId,
        'site_config'
      ]
    );

    res.json({
      success: true,
      data: DEFAULT_SETTINGS
    } as SiteSettingsResponse);
  } catch (error) {
    console.error('Error resetting site settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset site settings'
    } as SiteSettingsResponse);
  }
};

