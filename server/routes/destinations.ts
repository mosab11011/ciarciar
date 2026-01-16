import express from 'express';
import { DestinationModel, type DestinationInput } from '../models/Destination';
import { validateInput } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/destinations
 * Get all destinations
 */
router.get('/', async (req, res) => {
  try {
    const { active, country_id, province_id, city_id, status } = req.query;
    
    const destinations = await DestinationModel.findAll(
      active !== 'false',
      country_id as string | undefined,
      province_id as string | undefined,
      city_id as string | undefined,
      status as string | undefined
    );
    
    res.json({
      success: true,
      data: destinations,
      count: destinations.length
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destinations'
    });
  }
});

/**
 * GET /api/destinations/:id
 * Get destination by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await DestinationModel.findById(id);
    
    if (!destination) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found'
      });
    }
    
    res.json({
      success: true,
      data: destination
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch destination'
    });
  }
});

/**
 * POST /api/destinations
 * Create new destination
 */
router.post('/', async (req, res) => {
  try {
    const destinationData: DestinationInput = req.body;
    const userId = (req as any).user?.id;
    
    // Validate required fields
    if (!destinationData.country_id || !destinationData.name_ar || !destinationData.name_en ||
        !destinationData.description_ar || !destinationData.description_en ||
        !destinationData.main_image || destinationData.latitude === undefined ||
        destinationData.longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, name_ar, name_en, description_ar, description_en, main_image, latitude, longitude'
      });
    }
    
    const destination = await DestinationModel.create(destinationData, userId);
    
    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (error: any) {
    console.error('Error creating destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create destination'
    });
  }
});

/**
 * PUT /api/destinations/:id
 * Update destination
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const destinationData: Partial<DestinationInput> = req.body;
    const userId = (req as any).user?.id;
    
    const destination = await DestinationModel.update(id, destinationData, userId);
    
    res.json({
      success: true,
      data: destination
    });
  } catch (error: any) {
    console.error('Error updating destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update destination'
    });
  }
});

/**
 * POST /api/destinations/:id/submit
 * Submit destination for review
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const destination = await DestinationModel.submitForReview(id, userId);
    
    res.json({
      success: true,
      data: destination
    });
  } catch (error: any) {
    console.error('Error submitting destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit destination'
    });
  }
});

/**
 * POST /api/destinations/:id/approve
 * Approve and publish destination
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const destination = await DestinationModel.approve(id, userId);
    
    res.json({
      success: true,
      data: destination
    });
  } catch (error: any) {
    console.error('Error approving destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve destination'
    });
  }
});

/**
 * POST /api/destinations/:id/reject
 * Reject destination
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const destination = await DestinationModel.reject(id, userId, reason || 'Rejected by reviewer');
    
    res.json({
      success: true,
      data: destination
    });
  } catch (error: any) {
    console.error('Error rejecting destination:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject destination'
    });
  }
});

/**
 * DELETE /api/destinations/:id
 * Delete destination (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    const deleted = await DestinationModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Destination not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete destination'
    });
  }
});

export default router;

