import express from 'express';
import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface TravelOffer {
  id: string;
  country_id: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  original_price: number;
  discount_price: number;
  discount_percentage: number;
  duration_days?: number;
  duration_text_ar?: string;
  duration_text_en?: string;
  duration_text_fr?: string;
  start_date?: string;
  end_date?: string;
  valid_until?: string;
  max_participants: number;
  includes_ar?: string;
  includes_en?: string;
  includes_fr?: string;
  highlights_ar?: string;
  highlights_en?: string;
  highlights_fr?: string;
  images?: string;
  main_image?: string;
  currency: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/travel-offers - Get all travel offers
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { country_id, is_active, is_featured } = req.query;
    
    let query = 'SELECT * FROM travel_offers WHERE 1=1';
    const params: any[] = [];
    
    if (country_id) {
      query += ' AND country_id = ?';
      params.push(country_id);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    if (is_featured !== undefined) {
      query += ' AND is_featured = ?';
      params.push(is_featured === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const offers = await db.all<TravelOffer>(query, params);
    
    // Parse JSON fields
    const parsedOffers = offers.map(offer => ({
      ...offer,
      includes_ar: offer.includes_ar ? JSON.parse(offer.includes_ar) : [],
      includes_en: offer.includes_en ? JSON.parse(offer.includes_en) : [],
      includes_fr: offer.includes_fr ? JSON.parse(offer.includes_fr) : [],
      highlights_ar: offer.highlights_ar ? JSON.parse(offer.highlights_ar) : [],
      highlights_en: offer.highlights_en ? JSON.parse(offer.highlights_en) : [],
      highlights_fr: offer.highlights_fr ? JSON.parse(offer.highlights_fr) : [],
      images: offer.images ? JSON.parse(offer.images) : [],
      is_featured: Boolean(offer.is_featured),
      is_active: Boolean(offer.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedOffers,
      count: parsedOffers.length
    });
  } catch (error) {
    console.error('Error fetching travel offers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel offers'
    });
  }
});

// GET /api/travel-offers/:id - Get travel offer by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const offer = await db.get<TravelOffer>('SELECT * FROM travel_offers WHERE id = ?', [id]);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: 'Travel offer not found'
      });
    }
    
    // Parse JSON fields
    const parsedOffer = {
      ...offer,
      includes_ar: offer.includes_ar ? JSON.parse(offer.includes_ar) : [],
      includes_en: offer.includes_en ? JSON.parse(offer.includes_en) : [],
      includes_fr: offer.includes_fr ? JSON.parse(offer.includes_fr) : [],
      highlights_ar: offer.highlights_ar ? JSON.parse(offer.highlights_ar) : [],
      highlights_en: offer.highlights_en ? JSON.parse(offer.highlights_en) : [],
      highlights_fr: offer.highlights_fr ? JSON.parse(offer.highlights_fr) : [],
      images: offer.images ? JSON.parse(offer.images) : [],
      is_featured: Boolean(offer.is_featured),
      is_active: Boolean(offer.is_active)
    };
    
    res.json({
      success: true,
      data: parsedOffer
    });
  } catch (error) {
    console.error('Error fetching travel offer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel offer'
    });
  }
});

// POST /api/travel-offers - Create new travel offer
router.post('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      country_id,
      title_ar,
      title_en,
      title_fr,
      description_ar,
      description_en,
      description_fr,
      original_price,
      discount_price,
      discount_percentage,
      duration_days,
      duration_text_ar,
      duration_text_en,
      duration_text_fr,
      start_date,
      end_date,
      valid_until,
      max_participants = 20,
      includes_ar = [],
      includes_en = [],
      includes_fr = [],
      highlights_ar = [],
      highlights_en = [],
      highlights_fr = [],
      images = [],
      main_image,
      currency = 'USD',
      is_featured = false,
      is_active = true
    } = req.body;
    
    // Validation
    if (!country_id || !title_ar || !description_ar) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, title_ar, description_ar'
      });
    }
    
    if (!original_price || original_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Original price must be greater than zero'
      });
    }
    
    if (!discount_price || discount_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Discount price must be greater than zero'
      });
    }
    
    if (discount_price >= original_price) {
      return res.status(400).json({
        success: false,
        error: 'Discount price must be less than original price'
      });
    }
    
    // Verify country exists
    const countryExists = await db.get('SELECT id FROM countries WHERE id = ?', [country_id]);
    if (!countryExists) {
      return res.status(400).json({
        success: false,
        error: 'Country not found'
      });
    }
    
    const id = uuidv4();
    
    await db.run(
      `INSERT INTO travel_offers (
        id, country_id, title_ar, title_en, title_fr,
        description_ar, description_en, description_fr,
        original_price, discount_price, discount_percentage,
        duration_days, duration_text_ar, duration_text_en, duration_text_fr,
        start_date, end_date, valid_until,
        max_participants,
        includes_ar, includes_en, includes_fr,
        highlights_ar, highlights_en, highlights_fr,
        images, main_image,
        currency, is_featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        country_id,
        title_ar,
        title_en || title_ar,
        title_fr || title_ar,
        description_ar,
        description_en || description_ar,
        description_fr || description_ar,
        original_price,
        discount_price,
        discount_percentage || Math.round(((original_price - discount_price) / original_price) * 100),
        duration_days || null,
        duration_text_ar || null,
        duration_text_en || null,
        duration_text_fr || null,
        start_date || null,
        end_date || null,
        valid_until || null,
        max_participants,
        JSON.stringify(includes_ar),
        JSON.stringify(includes_en),
        JSON.stringify(includes_fr),
        JSON.stringify(highlights_ar),
        JSON.stringify(highlights_en),
        JSON.stringify(highlights_fr),
        JSON.stringify(images),
        main_image || (images.length > 0 ? images[0] : null),
        currency,
        is_featured ? 1 : 0,
        is_active ? 1 : 0
      ]
    );
    
    const newOffer = await db.get<TravelOffer>('SELECT * FROM travel_offers WHERE id = ?', [id]);
    
    res.status(201).json({
      success: true,
      data: newOffer
    });
  } catch (error) {
    console.error('Error creating travel offer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create travel offer'
    });
  }
});

// PUT /api/travel-offers/:id - Update travel offer
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updateData = req.body;
    
    const existing = await db.get<TravelOffer>('SELECT * FROM travel_offers WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Travel offer not found'
      });
    }
    
    const {
      country_id = existing.country_id,
      title_ar = existing.title_ar,
      title_en = existing.title_en,
      title_fr = existing.title_fr,
      description_ar = existing.description_ar,
      description_en = existing.description_en,
      description_fr = existing.description_fr,
      original_price = existing.original_price,
      discount_price = existing.discount_price,
      discount_percentage = existing.discount_percentage,
      duration_days = existing.duration_days,
      duration_text_ar = existing.duration_text_ar,
      duration_text_en = existing.duration_text_en,
      duration_text_fr = existing.duration_text_fr,
      start_date = existing.start_date,
      end_date = existing.end_date,
      valid_until = existing.valid_until,
      max_participants = existing.max_participants,
      includes_ar = existing.includes_ar ? JSON.parse(existing.includes_ar) : [],
      includes_en = existing.includes_en ? JSON.parse(existing.includes_en) : [],
      includes_fr = existing.includes_fr ? JSON.parse(existing.includes_fr) : [],
      highlights_ar = existing.highlights_ar ? JSON.parse(existing.highlights_ar) : [],
      highlights_en = existing.highlights_en ? JSON.parse(existing.highlights_en) : [],
      highlights_fr = existing.highlights_fr ? JSON.parse(existing.highlights_fr) : [],
      images = existing.images ? JSON.parse(existing.images) : [],
      main_image = existing.main_image,
      currency = existing.currency,
      is_featured = existing.is_featured,
      is_active = existing.is_active
    } = updateData;
    
    const calculatedDiscount = discount_percentage !== undefined 
      ? discount_percentage 
      : Math.round(((original_price - discount_price) / original_price) * 100);
    
    await db.run(
      `UPDATE travel_offers SET
        country_id = ?,
        title_ar = ?, title_en = ?, title_fr = ?,
        description_ar = ?, description_en = ?, description_fr = ?,
        original_price = ?, discount_price = ?, discount_percentage = ?,
        duration_days = ?, duration_text_ar = ?, duration_text_en = ?, duration_text_fr = ?,
        start_date = ?, end_date = ?, valid_until = ?,
        max_participants = ?,
        includes_ar = ?, includes_en = ?, includes_fr = ?,
        highlights_ar = ?, highlights_en = ?, highlights_fr = ?,
        images = ?, main_image = ?,
        currency = ?, is_featured = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        country_id,
        title_ar, title_en, title_fr,
        description_ar, description_en, description_fr,
        original_price, discount_price, calculatedDiscount,
        duration_days || null, duration_text_ar || null, duration_text_en || null, duration_text_fr || null,
        start_date || null, end_date || null, valid_until || null,
        max_participants,
        JSON.stringify(includes_ar), JSON.stringify(includes_en), JSON.stringify(includes_fr),
        JSON.stringify(highlights_ar), JSON.stringify(highlights_en), JSON.stringify(highlights_fr),
        JSON.stringify(images), main_image || (images.length > 0 ? images[0] : null),
        currency, is_featured ? 1 : 0, is_active ? 1 : 0,
        id
      ]
    );
    
    const updated = await db.get<TravelOffer>('SELECT * FROM travel_offers WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating travel offer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update travel offer'
    });
  }
});

// DELETE /api/travel-offers/:id - Delete travel offer
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const existing = await db.get<TravelOffer>('SELECT * FROM travel_offers WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Travel offer not found'
      });
    }
    
    await db.run('DELETE FROM travel_offers WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Travel offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting travel offer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete travel offer'
    });
  }
});

export default router;

