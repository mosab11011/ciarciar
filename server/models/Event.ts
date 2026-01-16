import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface Event {
  id: string;
  destination_id?: string;
  city_id?: string;
  province_id?: string;
  country_id: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  event_type: 'festival' | 'season' | 'cultural' | 'sports' | 'religious' | 'other';
  start_date: string;
  end_date: string;
  main_image?: string;
  gallery?: string[];
  location_ar?: string;
  location_en?: string;
  location_fr?: string;
  latitude?: number;
  longitude?: number;
  organizer_ar?: string;
  organizer_en?: string;
  organizer_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  ticket_price?: number;
  currency: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
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
  destination_name?: string;
  city_name?: string;
  province_name?: string;
  country_name?: string;
}

export interface EventInput {
  destination_id?: string;
  city_id?: string;
  province_id?: string;
  country_id: string;
  title_ar: string;
  title_en: string;
  title_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  event_type: 'festival' | 'season' | 'cultural' | 'sports' | 'religious' | 'other';
  start_date: string;
  end_date: string;
  main_image?: string;
  gallery?: string[];
  location_ar?: string;
  location_en?: string;
  location_fr?: string;
  latitude?: number;
  longitude?: number;
  organizer_ar?: string;
  organizer_en?: string;
  organizer_fr?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  ticket_price?: number;
  currency?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
  is_active?: boolean;
}

export class EventModel {
  /**
   * Format event from database row
   */
  static formatEventFromDB(row: any): Event {
    return {
      id: row.id,
      destination_id: row.destination_id,
      city_id: row.city_id,
      province_id: row.province_id,
      country_id: row.country_id,
      title_ar: row.title_ar,
      title_en: row.title_en,
      title_fr: row.title_fr,
      description_ar: row.description_ar,
      description_en: row.description_en,
      description_fr: row.description_fr,
      event_type: row.event_type,
      start_date: row.start_date,
      end_date: row.end_date,
      main_image: row.main_image,
      gallery: parseJSONField<string[]>(row.gallery, []),
      location_ar: row.location_ar,
      location_en: row.location_en,
      location_fr: row.location_fr,
      latitude: row.latitude,
      longitude: row.longitude,
      organizer_ar: row.organizer_ar,
      organizer_en: row.organizer_en,
      organizer_fr: row.organizer_fr,
      contact_phone: row.contact_phone,
      contact_email: row.contact_email,
      website: row.website,
      ticket_price: row.ticket_price,
      currency: row.currency || 'USD',
      is_recurring: Boolean(row.is_recurring),
      recurrence_pattern: row.recurrence_pattern,
      highlights_ar: parseJSONField<string[]>(row.highlights_ar, []),
      highlights_en: parseJSONField<string[]>(row.highlights_en, []),
      highlights_fr: parseJSONField<string[]>(row.highlights_fr, []),
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
      destination_name: row.destination_name,
      city_name: row.city_name,
      province_name: row.province_name,
      country_name: row.country_name
    };
  }

  /**
   * Get all events
   */
  static async findAll(
    activeOnly: boolean = true,
    countryId?: string,
    provinceId?: string,
    cityId?: string,
    destinationId?: string,
    status?: string,
    eventType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Event[]> {
    const db = await getDatabase();
    
    let query = `
      SELECT e.*,
        d.name_ar as destination_name,
        c.name_ar as city_name,
        p.name_ar as province_name,
        co.name_ar as country_name
      FROM events e
      LEFT JOIN destinations d ON e.destination_id = d.id
      LEFT JOIN cities c ON e.city_id = c.id
      LEFT JOIN provinces p ON e.province_id = p.id
      LEFT JOIN countries co ON e.country_id = co.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (activeOnly) {
      query += ' AND e.is_active = 1';
    }
    
    if (countryId) {
      query += ' AND e.country_id = ?';
      params.push(countryId);
    }
    
    if (provinceId) {
      query += ' AND e.province_id = ?';
      params.push(provinceId);
    }
    
    if (cityId) {
      query += ' AND e.city_id = ?';
      params.push(cityId);
    }
    
    if (destinationId) {
      query += ' AND e.destination_id = ?';
      params.push(destinationId);
    }
    
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    
    if (eventType) {
      query += ' AND e.event_type = ?';
      params.push(eventType);
    }
    
    if (startDate) {
      query += ' AND e.start_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND e.end_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY e.start_date DESC, e.title_ar';
    
    const rows = await db.all(query, params);
    return rows.map(row => this.formatEventFromDB(row));
  }

  /**
   * Get event by ID
   */
  static async findById(id: string): Promise<Event | null> {
    const db = await getDatabase();
    const row = await db.get(
      `SELECT e.*,
        d.name_ar as destination_name,
        c.name_ar as city_name,
        p.name_ar as province_name,
        co.name_ar as country_name
      FROM events e
      LEFT JOIN destinations d ON e.destination_id = d.id
      LEFT JOIN cities c ON e.city_id = c.id
      LEFT JOIN provinces p ON e.province_id = p.id
      LEFT JOIN countries co ON e.country_id = co.id
      WHERE e.id = ?`,
      [id]
    );
    
    return row ? this.formatEventFromDB(row) : null;
  }

  /**
   * Create a new event
   */
  static async create(eventData: EventInput, userId?: string): Promise<Event> {
    const db = await getDatabase();
    const id = generateId('event');
    
    await db.run(
      `INSERT INTO events (
        id, destination_id, city_id, province_id, country_id,
        title_ar, title_en, title_fr,
        description_ar, description_en, description_fr,
        event_type, start_date, end_date,
        main_image, gallery,
        location_ar, location_en, location_fr,
        latitude, longitude,
        organizer_ar, organizer_en, organizer_fr,
        contact_phone, contact_email, website,
        ticket_price, currency,
        is_recurring, recurrence_pattern,
        highlights_ar, highlights_en, highlights_fr,
        status, submitted_by, submitted_at,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        eventData.destination_id || null,
        eventData.city_id || null,
        eventData.province_id || null,
        eventData.country_id,
        eventData.title_ar,
        eventData.title_en,
        eventData.title_fr,
        eventData.description_ar,
        eventData.description_en,
        eventData.description_fr,
        eventData.event_type,
        eventData.start_date,
        eventData.end_date,
        eventData.main_image || null,
        validateAndStringifyJSON(eventData.gallery),
        eventData.location_ar || null,
        eventData.location_en || null,
        eventData.location_fr || null,
        eventData.latitude || null,
        eventData.longitude || null,
        eventData.organizer_ar || null,
        eventData.organizer_en || null,
        eventData.organizer_fr || null,
        eventData.contact_phone || null,
        eventData.contact_email || null,
        eventData.website || null,
        eventData.ticket_price || null,
        eventData.currency || 'USD',
        eventData.is_recurring ? 1 : 0,
        eventData.recurrence_pattern || null,
        validateAndStringifyJSON(eventData.highlights_ar),
        validateAndStringifyJSON(eventData.highlights_en),
        validateAndStringifyJSON(eventData.highlights_fr),
        eventData.status || 'draft',
        userId || null,
        eventData.status === 'pending_review' ? new Date().toISOString() : null,
        eventData.is_active !== undefined ? (eventData.is_active ? 1 : 0) : 1
      ]
    );

    if (userId) {
      await logAuditAction(userId, 'create', 'events', id, null, eventData);
    }

    const event = await this.findById(id);
    if (!event) {
      throw new Error('Failed to create event');
    }
    
    return event;
  }

  /**
   * Update event
   */
  static async update(id: string, eventData: Partial<EventInput>, userId?: string): Promise<Event> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error('Event not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    // Build update query dynamically
    const fields: Array<[keyof EventInput, string]> = [
      ['destination_id', 'destination_id'],
      ['city_id', 'city_id'],
      ['province_id', 'province_id'],
      ['country_id', 'country_id'],
      ['title_ar', 'title_ar'],
      ['title_en', 'title_en'],
      ['title_fr', 'title_fr'],
      ['description_ar', 'description_ar'],
      ['description_en', 'description_en'],
      ['description_fr', 'description_fr'],
      ['event_type', 'event_type'],
      ['start_date', 'start_date'],
      ['end_date', 'end_date'],
      ['main_image', 'main_image'],
      ['location_ar', 'location_ar'],
      ['location_en', 'location_en'],
      ['location_fr', 'location_fr'],
      ['latitude', 'latitude'],
      ['longitude', 'longitude'],
      ['organizer_ar', 'organizer_ar'],
      ['organizer_en', 'organizer_en'],
      ['organizer_fr', 'organizer_fr'],
      ['contact_phone', 'contact_phone'],
      ['contact_email', 'contact_email'],
      ['website', 'website'],
      ['ticket_price', 'ticket_price'],
      ['currency', 'currency'],
      ['is_recurring', 'is_recurring'],
      ['recurrence_pattern', 'recurrence_pattern'],
      ['status', 'status']
    ];

    for (const [key, dbField] of fields) {
      if (eventData[key] !== undefined) {
        if (dbField === 'is_recurring') {
          updates.push(`${dbField} = ?`);
          values.push(eventData[key] ? 1 : 0);
        } else {
          updates.push(`${dbField} = ?`);
          values.push(eventData[key]);
        }
      }
    }

    // Handle JSON fields
    if (eventData.gallery !== undefined) {
      updates.push('gallery = ?');
      values.push(validateAndStringifyJSON(eventData.gallery));
    }
    if (eventData.highlights_ar !== undefined) {
      updates.push('highlights_ar = ?');
      values.push(validateAndStringifyJSON(eventData.highlights_ar));
    }
    if (eventData.highlights_en !== undefined) {
      updates.push('highlights_en = ?');
      values.push(validateAndStringifyJSON(eventData.highlights_en));
    }
    if (eventData.highlights_fr !== undefined) {
      updates.push('highlights_fr = ?');
      values.push(validateAndStringifyJSON(eventData.highlights_fr));
    }

    // Handle workflow fields
    if (eventData.status === 'pending_review' && existing.status === 'draft') {
      updates.push('submitted_at = CURRENT_TIMESTAMP');
      if (userId) {
        updates.push('submitted_by = ?');
        values.push(userId);
      }
    }
    if (eventData.status === 'published' && existing.status !== 'published') {
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
      `UPDATE events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    if (userId) {
      await logAuditAction(userId, 'update', 'events', id, existing, eventData);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to update event');
    }
    
    return updated;
  }

  /**
   * Submit for review
   */
  static async submitForReview(id: string, userId: string): Promise<Event> {
    return this.update(id, { status: 'pending_review' }, userId);
  }

  /**
   * Approve and publish
   */
  static async approve(id: string, userId: string): Promise<Event> {
    const db = await getDatabase();
    await db.run(
      'UPDATE events SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, published_by = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['published', userId, userId, id]
    );
    
    const event = await this.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'approve', 'events', id, null, { status: 'published' });
    }
    
    return event;
  }

  /**
   * Reject
   */
  static async reject(id: string, userId: string, reason: string): Promise<Event> {
    const db = await getDatabase();
    await db.run(
      'UPDATE events SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
      ['draft', userId, reason, id]
    );
    
    const event = await this.findById(id);
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'reject', 'events', id, null, { rejection_reason: reason });
    }
    
    return event;
  }

  /**
   * Delete event (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      return false;
    }

    await db.run('UPDATE events SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    if (userId) {
      await logAuditAction(userId, 'delete', 'events', id, existing, null);
    }

    return true;
  }
}

