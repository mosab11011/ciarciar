import express from 'express';
import { ProvinceModel, type ProvinceInput } from '../models/Province';
import { validateInput } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/provinces
 * Get all provinces
 */
router.get('/', async (req, res) => {
  try {
    const { active, country_id } = req.query;
    
    const provinces = await ProvinceModel.findAll(
      active !== 'false',
      country_id as string | undefined
    );
    
    res.json({
      success: true,
      data: provinces,
      count: provinces.length
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch provinces'
    });
  }
});

/**
 * GET /api/provinces/:id
 * Get province by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const province = await ProvinceModel.findById(id);
    
    if (!province) {
      return res.status(404).json({
        success: false,
        error: 'Province not found'
      });
    }
    
    res.json({
      success: true,
      data: province
    });
  } catch (error) {
    console.error('Error fetching province:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch province'
    });
  }
});

/**
 * POST /api/provinces
 * Create new province
 */
router.post('/', async (req, res) => {
  try {
    const provinceData: ProvinceInput = req.body;
    const userId = (req as any).user?.id; // Assuming auth middleware sets user
    
    // Validate required fields
    if (!provinceData.country_id || !provinceData.name_ar || !provinceData.name_en) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, name_ar, name_en'
      });
    }
    
    const province = await ProvinceModel.create(provinceData, userId);
    
    res.status(201).json({
      success: true,
      data: province
    });
  } catch (error: any) {
    console.error('Error creating province:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create province'
    });
  }
});

/**
 * PUT /api/provinces/:id
 * Update province
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const provinceData: Partial<ProvinceInput> = req.body;
    const userId = (req as any).user?.id;
    
    const province = await ProvinceModel.update(id, provinceData, userId);
    
    res.json({
      success: true,
      data: province
    });
  } catch (error: any) {
    console.error('Error updating province:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update province'
    });
  }
});

/**
 * DELETE /api/provinces/:id
 * Delete province (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    const deleted = await ProvinceModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Province not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Province deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting province:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete province'
    });
  }
});

export default router;

