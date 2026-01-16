import express from 'express';
import { CountryModel, type CountryInput } from '../models/Country';
import { validateInput, authenticateAdmin } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/countries
 * Get all countries
 */
router.get('/', async (req, res) => {
  try {
    const { active, continent, search, language } = req.query;
    
    // Determine if we should filter by active status
    // When active='false' is passed as query param, it's a string 'false'
    // We want to get ALL countries (active and inactive) when active=false
    let onlyActive = true; // Default: only active countries
    if (active === 'false' || active === false) {
      onlyActive = false; // Get all countries
    }
    
    console.log('🌍 [Countries API] GET /api/countries - Query params:', { 
      active, 
      continent, 
      search, 
      language,
      onlyActive 
    });
    
    let countries;
    
    try {
      if (search && typeof search === 'string') {
        const lang = (language as 'ar' | 'en' | 'fr') || 'ar';
        countries = await CountryModel.search(search, lang, onlyActive);
      } else if (continent && typeof continent === 'string') {
        countries = await CountryModel.findByContinent(continent, onlyActive);
      } else {
        countries = await CountryModel.findAll(onlyActive);
      }
    } catch (modelError: any) {
      console.error('❌ [Countries API] Model error:', modelError);
      throw modelError;
    }
    
    // Ensure countries is always an array
    if (!Array.isArray(countries)) {
      console.error('❌ [Countries API] Countries is not an array!', typeof countries, countries);
      countries = [];
    }
    
    console.log(`✅ [Countries API] Found ${countries.length} countries (onlyActive: ${onlyActive})`);
    
    if (countries.length > 0) {
      console.log('✅ [Countries API] Sample countries:', countries.slice(0, 3).map(c => ({
        id: c.id,
        name_ar: c.name_ar,
        name_en: c.name_en,
        name_fr: c.name_fr,
        is_active: c.is_active
      })));
    } else {
      console.warn('⚠️ [Countries API] No countries found! Checking database directly...');
      try {
        // Direct database check for debugging
        const { getDatabase } = await import('../database/database');
        const db = await getDatabase();
        const directQuery = onlyActive 
          ? 'SELECT COUNT(*) as count FROM countries WHERE is_active = 1'
          : 'SELECT COUNT(*) as count FROM countries';
        const countResult = await db.get(directQuery);
        console.log('📊 [Countries API] Direct DB count:', countResult);
        
        // Also check for countries without names
        const countriesWithNames = onlyActive
          ? await db.all('SELECT id, name_ar, name_en, name_fr, is_active FROM countries WHERE is_active = 1 LIMIT 5')
          : await db.all('SELECT id, name_ar, name_en, name_fr, is_active FROM countries LIMIT 5');
        console.log('📊 [Countries API] Sample raw DB rows:', countriesWithNames);
      } catch (dbError: any) {
        console.error('❌ [Countries API] Database check error:', dbError);
      }
    }
    
    // Always return success with data array (even if empty)
    res.json({
      success: true,
      data: countries || [],
      count: countries?.length || 0,
      onlyActive
    });
  } catch (error: any) {
    console.error('❌ [Countries API] Error fetching countries:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response but still with success: false and empty data array
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch countries',
      data: [], // Always include data array
      count: 0
    });
  }
});

/**
 * GET /api/countries/statistics
 * Get countries statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await CountryModel.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/countries/:id
 * Get country by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const country = await CountryModel.findById(id);
    
    if (!country) {
      return res.status(404).json({
        success: false,
        error: 'Country not found'
      });
    }
    
    res.json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country'
    });
  }
});

/**
 * POST /api/countries
 * Create new country (Admin only)
 */
router.post('/', authenticateAdmin, validateInput([
  'name_ar', 'name_en', 'name_fr',
  'capital_ar', 'capital_en', 'capital_fr',
  'description_ar', 'description_en', 'description_fr',
  'continent', 'main_image',
  'currency_ar', 'currency_en', 'currency_fr',
  'language_ar', 'language_en', 'language_fr',
  'best_time_ar', 'best_time_en', 'best_time_fr'
]), async (req, res) => {
  try {
    const countryData: CountryInput = req.body;
    const userId = req.user?.id;
    
    const country = await CountryModel.create(countryData, userId);
    
    res.status(201).json({
      success: true,
      data: country,
      message: 'Country created successfully'
    });
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create country'
    });
  }
});

/**
 * PUT /api/countries/:id
 * Update country (Admin only)
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const countryData: Partial<CountryInput> = req.body;
    const userId = req.user?.id;
    
    const country = await CountryModel.update(id, countryData, userId);
    
    if (!country) {
      return res.status(404).json({
        success: false,
        error: 'Country not found'
      });
    }
    
    res.json({
      success: true,
      data: country,
      message: 'Country updated successfully'
    });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update country'
    });
  }
});

/**
 * DELETE /api/countries/:id
 * Delete country (Admin only) - Soft delete
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const deleted = await CountryModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Country not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Country deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete country'
    });
  }
});

/**
 * DELETE /api/countries/:id/permanent
 * Permanently delete country (Admin only)
 */
router.delete('/:id/permanent', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const deleted = await CountryModel.hardDelete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Country not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Country permanently deleted'
    });
  } catch (error) {
    console.error('Error permanently deleting country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to permanently delete country'
    });
  }
});

export default router;
