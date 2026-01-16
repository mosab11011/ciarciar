import express from 'express';
import { TravelOfficeModel, type TravelOfficeInput } from '../models/TravelOffice';
import { validateInput, authenticateAdmin } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/travel-offices
 * Get all travel offices
 */
router.get('/', async (req, res) => {
  try {
    const { active, country, search, language, with_location, is_company_office, status } = req.query;
    
    let offices;
    
    if (with_location === 'true') {
      offices = await TravelOfficeModel.findWithLocation(active !== 'false');
    } else if (search && typeof search === 'string') {
      const lang = (language as 'ar' | 'en' | 'fr') || 'ar';
      offices = await TravelOfficeModel.search(search, lang, active !== 'false');
    } else if (country && typeof country === 'string') {
      offices = await TravelOfficeModel.findByCountry(country, active !== 'false');
    } else {
      offices = await TravelOfficeModel.findAll(
        active !== 'false',
        country as string | undefined,
        is_company_office === 'true' ? true : is_company_office === 'false' ? false : undefined,
        status as string | undefined
      );
    }
    
    res.json({
      success: true,
      data: offices,
      count: offices.length
    });
  } catch (error) {
    console.error('Error fetching travel offices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel offices'
    });
  }
});

/**
 * GET /api/travel-offices/statistics
 * Get travel offices statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await TravelOfficeModel.getStatistics();
    
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
 * GET /api/travel-offices/:id
 * Get travel office by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const office = await TravelOfficeModel.findById(id);
    
    if (!office) {
      return res.status(404).json({
        success: false,
        error: 'Travel office not found'
      });
    }
    
    res.json({
      success: true,
      data: office
    });
  } catch (error) {
    console.error('Error fetching travel office:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel office'
    });
  }
});

/**
 * POST /api/travel-offices
 * Create new travel office (Admin only)
 */
router.post('/', authenticateAdmin, validateInput([
  'country_id', 'name_ar', 'name_en', 'name_fr',
  'address_ar', 'address_en', 'address_fr',
  'phone', 'email',
  'working_hours_ar', 'working_hours_en', 'working_hours_fr'
]), async (req, res) => {
  try {
    const officeData: TravelOfficeInput = req.body;
    const userId = req.user?.id;
    
    const office = await TravelOfficeModel.create(officeData, userId);
    
    res.status(201).json({
      success: true,
      data: office,
      message: 'Travel office created successfully'
    });
  } catch (error) {
    console.error('Error creating travel office:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create travel office'
    });
  }
});

/**
 * PUT /api/travel-offices/:id
 * Update travel office (Admin only)
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const officeData: Partial<TravelOfficeInput> = req.body;
    const userId = req.user?.id;
    
    const office = await TravelOfficeModel.update(id, officeData, userId);
    
    if (!office) {
      return res.status(404).json({
        success: false,
        error: 'Travel office not found'
      });
    }
    
    res.json({
      success: true,
      data: office,
      message: 'Travel office updated successfully'
    });
  } catch (error) {
    console.error('Error updating travel office:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update travel office'
    });
  }
});

/**
 * DELETE /api/travel-offices/:id
 * Delete travel office (Admin only) - Soft delete
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const deleted = await TravelOfficeModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Travel office not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Travel office deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting travel office:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete travel office'
    });
  }
});

/**
 * DELETE /api/travel-offices/:id/permanent
 * Permanently delete travel office (Admin only)
 */
router.delete('/:id/permanent', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const deleted = await TravelOfficeModel.hardDelete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Travel office not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Travel office permanently deleted'
    });
  } catch (error) {
    console.error('Error permanently deleting travel office:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to permanently delete travel office'
    });
  }
});

/**
 * GET /api/travel-offices/country/:countryId
 * Get travel offices by country ID
 */
router.get('/country/:countryId', async (req, res) => {
  try {
    const { countryId } = req.params;
    const { active } = req.query;
    
    const offices = await TravelOfficeModel.findByCountry(countryId, active !== 'false');
    
    res.json({
      success: true,
      data: offices,
      count: offices.length
    });
  } catch (error) {
    console.error('Error fetching travel offices by country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel offices by country'
    });
  }
});

/**
 * POST /api/travel-offices/:id/submit
 * Submit travel office for review
 */
router.post('/:id/submit', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const office = await TravelOfficeModel.submitForReview(id, userId);
    
    res.json({
      success: true,
      data: office
    });
  } catch (error: any) {
    console.error('Error submitting travel office:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit travel office'
    });
  }
});

/**
 * POST /api/travel-offices/:id/approve
 * Approve and publish travel office
 */
router.post('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const office = await TravelOfficeModel.approve(id, userId);
    
    res.json({
      success: true,
      data: office
    });
  } catch (error: any) {
    console.error('Error approving travel office:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve travel office'
    });
  }
});

/**
 * POST /api/travel-offices/:id/reject
 * Reject travel office
 */
router.post('/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const office = await TravelOfficeModel.reject(id, userId, reason || 'Rejected by reviewer');
    
    res.json({
      success: true,
      data: office
    });
  } catch (error: any) {
    console.error('Error rejecting travel office:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject travel office'
    });
  }
});

export default router;
