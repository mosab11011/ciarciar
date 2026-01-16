import express from 'express';
import { CityModel, type CityInput } from '../models/City';
import { validateInput } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/cities
 * Get all cities
 */
router.get('/', async (req, res) => {
  try {
    const { active, country_id } = req.query;
    
    let cities;
    
    if (country_id && typeof country_id === 'string') {
      cities = await CityModel.findByCountry(country_id, active !== 'false');
    } else {
      cities = await CityModel.findAll(active !== 'false');
    }
    
    res.json({
      success: true,
      data: cities,
      count: cities.length
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    });
  }
});

/**
 * GET /api/cities/:id
 * Get city by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const city = await CityModel.findById(id);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }
    
    res.json({
      success: true,
      data: city
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city'
    });
  }
});

/**
 * POST /api/cities
 * Create new city
 */
router.post('/', validateInput([
  'country_id', 'name_ar', 'description_ar', 'image',
  'best_time_ar', 'duration_ar'
]), async (req, res) => {
  try {
    const cityData: CityInput = req.body;
    const userId = (req as any).user?.id; // For future authentication
    
    const city = await CityModel.create(cityData, userId);
    
    res.status(201).json({
      success: true,
      data: city,
      message: 'City created successfully'
    });
  } catch (error: any) {
    console.error('Error creating city:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create city'
    });
  }
});

/**
 * PUT /api/cities/:id
 * Update city
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cityData: Partial<CityInput> = req.body;
    const userId = (req as any).user?.id; // For future authentication
    
    const city = await CityModel.update(id, cityData, userId);
    
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }
    
    res.json({
      success: true,
      data: city,
      message: 'City updated successfully'
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update city'
    });
  }
});

/**
 * DELETE /api/cities/:id
 * Delete city (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id; // For future authentication
    
    const deleted = await CityModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }
    
    res.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete city'
    });
  }
});

export default router;

