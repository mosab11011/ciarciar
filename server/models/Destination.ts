import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface Destination {
  id: string;
  city_id?: string;
  province_id?: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  main_image: string;
  gallery?: string[];
  latitude: number;
  longitude: number;
  address_ar?: string;
  address_en?: string;
  address_fr?: string;
  category?: string;
  rating: number;
  reviews: number;
  best_time_ar?: string;
  best_time_en?: string;
  best_time_fr?: string;
  duration_ar?: string;
  duration_en?: string;
  duration_fr?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  attractions_ar?: string[];
  attractions_en?: string[];
  attractions_fr?: string[];
  entry_fee?: number;
  currency: string;
  opening_hours_ar?: string;
  opening_hours_en?: string;
  opening_hours_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  submitted_by?: string;
  reviewed_by?: string;
  published_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  published_at?: string;
  rejection_reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

export interface DestinationInput {
  city_id?: string;
  province_id?: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  main_image: string;
  gallery?: string[];
  latitude: number;
  longitude: number;
  address_ar?: string;
  address_en?: string;
  address_fr?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  best_time_ar?: string;
  best_time_en?: string;
  best_time_fr?: string;
  duration_ar?: string;
  duration_en?: string;
  duration_fr?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  attractions_ar?: string[];
  attractions_en?: string[];
  attractions_fr?: string[];
  entry_fee?: number;
  currency?: string;
  opening_hours_ar?: string;
  opening_hours_en?: string;
  opening_hours_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
  is_active?: boolean;
}

export class DestinationModel {
  /**
   * Format destination from database row
   */
  static formatDestinationFromDB(row: any): Destination {
    return {
      id: row.id,
      city_id: row.city_id,
      province_id: row.province_id,
      country_id: row.country_id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      name_fr: row.name_fr,
      description_ar: row.description_ar,
      description_en: row.description_en,
      description_fr: row.description_fr,
      main_image: row.main_image,
      gallery: parseJSONField<string[]>(row.gallery, []),
      latitude: row.latitude,
      longitude: row.longitude,
      address_ar: row.address_ar,
      address_en: row.address_en,
      address_fr: row.address_fr,
      category: row.category,
      rating: row.rating || 4.5,
      reviews: row.reviews || 0,
      best_time_ar: row.best_time_ar,
      best_time_en: row.best_time_en,
      best_time_fr: row.best_time_fr,
      duration_ar: row.duration_ar,
      duration_en: row.duration_en,
      duration_fr: row.duration_fr,
      highlights_ar: parseJSONField<string[]>(row.highlights_ar, []),
      highlights_en: parseJSONField<string[]>(row.highlights_en, []),
      highlights_fr: parseJSONField<string[]>(row.highlights_fr, []),
      attractions_ar: parseJSONField<string[]>(row.attractions_ar, []),
      attractions_en: parseJSONField<string[]>(row.attractions_en, []),
      attractions_fr: parseJSONField<string[]>(row.attractions_fr, []),
      entry_fee: row.entry_fee,
      currency: row.currency || 'USD',
      opening_hours_ar: row.opening_hours_ar,
      opening_hours_en: row.opening_hours_en,
      opening_hours_fr: row.opening_hours_fr,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      website: row.website,
      status: row.status || 'draft',
      submitted_by: row.submitted_by,
      reviewed_by: row.reviewed_by,
      published_by: row.published_by,
      submitted_at: row.submitted_at,
      reviewed_at: row.reviewed_at,
      published_at: row.published_at,
      rejection_reason: row.rejection_reason,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      city_name: row.city_name,
      province_name: row.province_name,
      country_name: row.country_name
    };
  }

  /**
   * Get all destinations
   */
  static async findAll(
    activeOnly: boolean = true,
    countryId?: string,
    provinceId?: string,
    cityId?: string,
    status?: string
  ): Promise<Destination[]> {
    const db = await getDatabase();
    
    let query = `
      SELECT d.*, 
        c.name_ar as city_name,
        p.name_ar as province_name,
        co.name_ar as country_name
      FROM destinations d
      LEFT JOIN cities c ON d.city_id = c.id
      LEFT JOIN provinces p ON d.province_id = p.id
      LEFT JOIN countries co ON d.country_id = co.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (activeOnly) {
      query += ' AND d.is_active = 1';
    }
    
    if (countryId) {
      query += ' AND d.country_id = ?';
      params.push(countryId);
    }
    
    if (provinceId) {
      query += ' AND d.province_id = ?';
      params.push(provinceId);
    }
    
    if (cityId) {
      query += ' AND d.city_id = ?';
      params.push(cityId);
    }
    
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY d.name_ar';
    
    const rows = await db.all(query, params);
    return rows.map(row => this.formatDestinationFromDB(row));
  }

  /**
   * Get destination by ID
   */
  static async findById(id: string): Promise<Destination | null> {
    const db = await getDatabase();
    const row = await db.get(
      `SELECT d.*, 
        c.name_ar as city_name,
        p.name_ar as province_name,
        co.name_ar as country_name
      FROM destinations d
      LEFT JOIN cities c ON d.city_id = c.id
      LEFT JOIN provinces p ON d.province_id = p.id
      LEFT JOIN countries co ON d.country_id = co.id
      WHERE d.id = ?`,
      [id]
    );
    
    return row ? this.formatDestinationFromDB(row) : null;
  }

  /**
   * Create a new destination
   */
  static async create(destinationData: DestinationInput, userId?: string): Promise<Destination> {
    const db = await getDatabase();
    const id = generateId('destination');
    
    await db.run(
      `INSERT INTO destinations (
        id, city_id, province_id, country_id,
        name_ar, name_en, name_fr,
        description_ar, description_en, description_fr,
        main_image, gallery, latitude, longitude,
        address_ar, address_en, address_fr, category,
        rating, reviews,
        best_time_ar, best_time_en, best_time_fr,
        duration_ar, duration_en, duration_fr,
        highlights_ar, highlights_en, highlights_fr,
        attractions_ar, attractions_en, attractions_fr,
        entry_fee, currency,
        opening_hours_ar, opening_hours_en, opening_hours_fr,
        contact_phone, contact_email, website,
        status, submitted_by, submitted_at,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        destinationData.city_id || null,
        destinationData.province_id || null,
        destinationData.country_id,
        destinationData.name_ar,
        destinationData.name_en,
        destinationData.name_fr,
        destinationData.description_ar,
        destinationData.description_en,
        destinationData.description_fr,
        destinationData.main_image,
        validateAndStringifyJSON(destinationData.gallery),
        destinationData.latitude,
        destinationData.longitude,
        destinationData.address_ar || null,
        destinationData.address_en || null,
        destinationData.address_fr || null,
        destinationData.category || null,
        destinationData.rating || 4.5,
        destinationData.reviews || 0,
        destinationData.best_time_ar || null,
        destinationData.best_time_en || null,
        destinationData.best_time_fr || null,
        destinationData.duration_ar || null,
        destinationData.duration_en || null,
        destinationData.duration_fr || null,
        validateAndStringifyJSON(destinationData.highlights_ar),
        validateAndStringifyJSON(destinationData.highlights_en),
        validateAndStringifyJSON(destinationData.highlights_fr),
        validateAndStringifyJSON(destinationData.attractions_ar),
        validateAndStringifyJSON(destinationData.attractions_en),
        validateAndStringifyJSON(destinationData.attractions_fr),
        destinationData.entry_fee || null,
        destinationData.currency || 'USD',
        destinationData.opening_hours_ar || null,
        destinationData.opening_hours_en || null,
        destinationData.opening_hours_fr || null,
        destinationData.contact_phone || null,
        destinationData.contact_email || null,
        destinationData.website || null,
        destinationData.status || 'draft',
        userId || null,
        destinationData.status === 'pending_review' ? new Date().toISOString() : null,
        destinationData.is_active !== undefined ? (destinationData.is_active ? 1 : 0) : 1
      ]
    );

    if (userId) {
      await logAuditAction(userId, 'create', 'destinations', id, null, destinationData);
    }

    const destination = await this.findById(id);
    if (!destination) {
      throw new Error('Failed to create destination');
    }
    
    return destination;
  }

  /**
   * Update destination
   */
  static async update(id: string, destinationData: Partial<DestinationInput>, userId?: string): Promise<Destination> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error('Destination not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    // Build update query dynamically
    const fields: Array<[keyof DestinationInput, string]> = [
      ['city_id', 'city_id'],
      ['province_id', 'province_id'],
      ['country_id', 'country_id'],
      ['name_ar', 'name_ar'],
      ['name_en', 'name_en'],
      ['name_fr', 'name_fr'],
      ['description_ar', 'description_ar'],
      ['description_en', 'description_en'],
      ['description_fr', 'description_fr'],
      ['main_image', 'main_image'],
      ['latitude', 'latitude'],
      ['longitude', 'longitude'],
      ['address_ar', 'address_ar'],
      ['address_en', 'address_en'],
      ['address_fr', 'address_fr'],
      ['category', 'category'],
      ['rating', 'rating'],
      ['reviews', 'reviews'],
      ['best_time_ar', 'best_time_ar'],
      ['best_time_en', 'best_time_en'],
      ['best_time_fr', 'best_time_fr'],
      ['duration_ar', 'duration_ar'],
      ['duration_en', 'duration_en'],
      ['duration_fr', 'duration_fr'],
      ['entry_fee', 'entry_fee'],
      ['currency', 'currency'],
      ['opening_hours_ar', 'opening_hours_ar'],
      ['opening_hours_en', 'opening_hours_en'],
      ['opening_hours_fr', 'opening_hours_fr'],
      ['contact_phone', 'contact_phone'],
      ['contact_email', 'contact_email'],
      ['website', 'website'],
      ['status', 'status'],
      ['is_active', 'is_active']
    ];

    for (const [key, dbField] of fields) {
      if (destinationData[key] !== undefined) {
        updates.push(`${dbField} = ?`);
        values.push(destinationData[key]);
      }
    }

    // Handle JSON fields
    if (destinationData.gallery !== undefined) {
      updates.push('gallery = ?');
      values.push(validateAndStringifyJSON(destinationData.gallery));
    }
    if (destinationData.highlights_ar !== undefined) {
      updates.push('highlights_ar = ?');
      values.push(validateAndStringifyJSON(destinationData.highlights_ar));
    }
    if (destinationData.highlights_en !== undefined) {
      updates.push('highlights_en = ?');
      values.push(validateAndStringifyJSON(destinationData.highlights_en));
    }
    if (destinationData.highlights_fr !== undefined) {
      updates.push('highlights_fr = ?');
      values.push(validateAndStringifyJSON(destinationData.highlights_fr));
    }
    if (destinationData.attractions_ar !== undefined) {
      updates.push('attractions_ar = ?');
      values.push(validateAndStringifyJSON(destinationData.attractions_ar));
    }
    if (destinationData.attractions_en !== undefined) {
      updates.push('attractions_en = ?');
      values.push(validateAndStringifyJSON(destinationData.attractions_en));
    }
    if (destinationData.attractions_fr !== undefined) {
      updates.push('attractions_fr = ?');
      values.push(validateAndStringifyJSON(destinationData.attractions_fr));
    }

    // Handle workflow fields
    if (destinationData.status === 'pending_review' && existing.status === 'draft') {
      updates.push('submitted_at = CURRENT_TIMESTAMP');
      if (userId) {
        updates.push('submitted_by = ?');
        values.push(userId);
      }
    }
    if (destinationData.status === 'published' && existing.status !== 'published') {
      updates.push('published_at = CURRENT_TIMESTAMP');
      if (userId) {
        updates.push('published_by = ?');
        values.push(userId);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    values.push(id);
    await db.run(
      `UPDATE destinations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    if (userId) {
      await logAuditAction(userId, 'update', 'destinations', id, existing, destinationData);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to update destination');
    }
    
    return updated;
  }

  /**
   * Submit for review
   */
  static async submitForReview(id: string, userId: string): Promise<Destination> {
    return this.update(id, { status: 'pending_review' }, userId);
  }

  /**
   * Approve and publish
   */
  static async approve(id: string, userId: string): Promise<Destination> {
    const db = await getDatabase();
    await db.run(
      'UPDATE destinations SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, published_by = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['published', userId, userId, id]
    );
    
    const destination = await this.findById(id);
    if (!destination) {
      throw new Error('Destination not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'approve', 'destinations', id, null, { status: 'published' });
    }
    
    return destination;
  }

  /**
   * Reject
   */
  static async reject(id: string, userId: string, reason: string): Promise<Destination> {
    const db = await getDatabase();
    await db.run(
      'UPDATE destinations SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
      ['draft', userId, reason, id]
    );
    
    const destination = await this.findById(id);
    if (!destination) {
      throw new Error('Destination not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'reject', 'destinations', id, null, { rejection_reason: reason });
    }
    
    return destination;
  }

  /**
   * Delete destination (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      return false;
    }

    await db.run('UPDATE destinations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    if (userId) {
      await logAuditAction(userId, 'delete', 'destinations', id, existing, null);
    }

    return true;
  }
}

