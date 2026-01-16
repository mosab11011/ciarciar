import express from 'express';
import { EventModel, type EventInput } from '../models/Event';
import { validateInput } from '../middleware/validation';

const router = express.Router();

/**
 * GET /api/events
 * Get all events
 */
router.get('/', async (req, res) => {
  try {
    const { active, country_id, province_id, city_id, destination_id, status, event_type, start_date, end_date } = req.query;
    
    const events = await EventModel.findAll(
      active !== 'false',
      country_id as string | undefined,
      province_id as string | undefined,
      city_id as string | undefined,
      destination_id as string | undefined,
      status as string | undefined,
      event_type as string | undefined,
      start_date as string | undefined,
      end_date as string | undefined
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

/**
 * GET /api/events/:id
 * Get event by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await EventModel.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    });
  }
});

/**
 * POST /api/events
 * Create new event
 */
router.post('/', async (req, res) => {
  try {
    const eventData: EventInput = req.body;
    const userId = (req as any).user?.id;
    
    // Validate required fields
    if (!eventData.country_id || !eventData.title_ar || !eventData.title_en ||
        !eventData.description_ar || !eventData.description_en ||
        !eventData.event_type || !eventData.start_date || !eventData.end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, title_ar, title_en, description_ar, description_en, event_type, start_date, end_date'
      });
    }
    
    const event = await EventModel.create(eventData, userId);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create event'
    });
  }
});

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const eventData: Partial<EventInput> = req.body;
    const userId = (req as any).user?.id;
    
    const event = await EventModel.update(id, eventData, userId);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update event'
    });
  }
});

/**
 * POST /api/events/:id/submit
 * Submit event for review
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
    
    const event = await EventModel.submitForReview(id, userId);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Error submitting event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit event'
    });
  }
});

/**
 * POST /api/events/:id/approve
 * Approve and publish event
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
    
    const event = await EventModel.approve(id, userId);
    
    res.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Error approving event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve event'
    });
  }
});

/**
 * POST /api/events/:id/reject
 * Reject event
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
    
    const event = await EventModel.reject(id, userId, reason || 'Rejected by reviewer');
    
    res.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error('Error rejecting event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject event'
    });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    
    const deleted = await EventModel.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    });
  }
});

export default router;

