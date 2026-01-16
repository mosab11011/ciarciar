import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface TravelOffice {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  address_ar: string;
  address_en: string;
  address_fr: string;
  phone: string;
  email: string;
  website?: string;
  manager_ar?: string;
  manager_en?: string;
  manager_fr?: string;
  services_ar: string[]; // JSON array
  services_en: string[]; // JSON array
  services_fr: string[]; // JSON array
  working_hours_ar: string;
  working_hours_en: string;
  working_hours_fr: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews: number;
  is_active: boolean;
  is_company_office?: boolean;
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
  submitted_by?: string;
  reviewed_by?: string;
  published_by?: string;
  submitted_at?: string;
  reviewed_at?: string;
  published_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Virtual fields (from joins)
  country_name?: string;
}

export interface TravelOfficeInput {
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  address_ar: string;
  address_en: string;
  address_fr: string;
  phone: string;
  email: string;
  website?: string;
  manager_ar?: string;
  manager_en?: string;
  manager_fr?: string;
  services_ar?: string[];
  services_en?: string[];
  services_fr?: string[];
  working_hours_ar: string;
  working_hours_en: string;
  working_hours_fr: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews?: number;
  is_active?: boolean;
  is_company_office?: boolean;
  status?: 'draft' | 'pending_review' | 'published' | 'archived';
}

export class TravelOfficeModel {
  /**
   * Get all travel offices
   */
  static async findAll(activeOnly: boolean = true): Promise<TravelOffice[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE to.is_active = 1 
         ORDER BY to.name_ar`
      : `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         ORDER BY to.name_ar`;
    
    const rows = await db.all(query);
    
    return rows.map(row => this.formatOfficeFromDB(row));
  }

  /**
   * Get travel office by ID
   */
  static async findById(id: string): Promise<TravelOffice | null> {
    const db = await getDatabase();
    
    const row = await db.get(
      `SELECT to.*, c.name_ar as country_name 
       FROM travel_offices to 
       LEFT JOIN countries c ON to.country_id = c.id 
       WHERE to.id = ?`,
      [id]
    );
    
    return row ? this.formatOfficeFromDB(row) : null;
  }

  /**
   * Get travel offices by country
   */
  static async findByCountry(countryId: string, activeOnly: boolean = true): Promise<TravelOffice[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE to.country_id = ? AND to.is_active = 1 
         ORDER BY to.name_ar`
      : `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE to.country_id = ? 
         ORDER BY to.name_ar`;
    
    const rows = await db.all(query, [countryId]);
    
    return rows.map(row => this.formatOfficeFromDB(row));
  }

  /**
   * Search travel offices
   */
  static async search(query: string, language: 'ar' | 'en' | 'fr' = 'ar', activeOnly: boolean = true): Promise<TravelOffice[]> {
    const db = await getDatabase();
    
    const nameField = `to.name_${language}`;
    const addressField = `to.address_${language}`;
    
    const searchQuery = activeOnly 
      ? `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE (${nameField} LIKE ? OR ${addressField} LIKE ? OR to.phone LIKE ? OR to.email LIKE ?) 
         AND to.is_active = 1 
         ORDER BY ${nameField}`
      : `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE (${nameField} LIKE ? OR ${addressField} LIKE ? OR to.phone LIKE ? OR to.email LIKE ?) 
         ORDER BY ${nameField}`;
    
    const searchTerm = `%${query}%`;
    const rows = await db.all(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm]);
    
    return rows.map(row => this.formatOfficeFromDB(row));
  }

  /**
   * Create a new travel office
   */
  static async create(officeData: TravelOfficeInput, userId?: string): Promise<TravelOffice> {
    const db = await getDatabase();
    
    const id = generateId('office');
    const now = new Date().toISOString();
    
    const query = `
      INSERT INTO travel_offices (
        id, country_id, name_ar, name_en, name_fr, address_ar, address_en, address_fr,
        phone, email, website, manager_ar, manager_en, manager_fr,
        services_ar, services_en, services_fr, working_hours_ar, working_hours_en, working_hours_fr,
        latitude, longitude, rating, reviews, is_active, is_company_office, status,
        submitted_by, submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      id,
      officeData.country_id,
      officeData.name_ar,
      officeData.name_en,
      officeData.name_fr,
      officeData.address_ar,
      officeData.address_en,
      officeData.address_fr,
      officeData.phone,
      officeData.email,
      officeData.website || null,
      officeData.manager_ar || null,
      officeData.manager_en || null,
      officeData.manager_fr || null,
      validateAndStringifyJSON(officeData.services_ar || []),
      validateAndStringifyJSON(officeData.services_en || []),
      validateAndStringifyJSON(officeData.services_fr || []),
      officeData.working_hours_ar,
      officeData.working_hours_en,
      officeData.working_hours_fr,
      officeData.latitude || null,
      officeData.longitude || null,
      officeData.rating || 4.5,
      officeData.reviews || 0,
      officeData.is_active !== false ? 1 : 0,
      officeData.is_company_office ? 1 : 0,
      officeData.status || 'draft',
      officeData.status === 'pending_review' && userId ? userId : null,
      officeData.status === 'pending_review' ? now : null,
      now,
      now
    ];
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'CREATE', 'travel_offices', id, null, officeData);
    }
    
    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create travel office');
    }
    
    return created;
  }

  /**
   * Update travel office
   */
  static async update(id: string, officeData: Partial<TravelOfficeInput>, userId?: string): Promise<TravelOffice | null> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return null;
    }
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    Object.entries(officeData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          updateFields.push(`${key} = ?`);
          values.push(validateAndStringifyJSON(value));
        } else {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return oldData;
    }
    
    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const query = `UPDATE travel_offices SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'UPDATE', 'travel_offices', id, oldData, officeData);
    }
    
    return await this.findById(id);
  }

  /**
   * Submit for review
   */
  static async submitForReview(id: string, userId: string): Promise<TravelOffice> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error('Travel office not found');
    }

    await db.run(
      'UPDATE travel_offices SET status = ?, submitted_by = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['pending_review', userId, id]
    );

    if (userId) {
      await logAuditAction(userId, 'SUBMIT_FOR_REVIEW', 'travel_offices', id, existing, { status: 'pending_review' });
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to submit travel office');
    }
    
    return updated;
  }

  /**
   * Approve and publish
   */
  static async approve(id: string, userId: string): Promise<TravelOffice> {
    const db = await getDatabase();
    await db.run(
      'UPDATE travel_offices SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, published_by = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['published', userId, userId, id]
    );
    
    const office = await this.findById(id);
    if (!office) {
      throw new Error('Travel office not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'APPROVE', 'travel_offices', id, null, { status: 'published' });
    }
    
    return office;
  }

  /**
   * Reject
   */
  static async reject(id: string, userId: string, reason: string): Promise<TravelOffice> {
    const db = await getDatabase();
    await db.run(
      'UPDATE travel_offices SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?',
      ['draft', userId, reason, id]
    );
    
    const office = await this.findById(id);
    if (!office) {
      throw new Error('Travel office not found');
    }
    
    if (userId) {
      await logAuditAction(userId, 'REJECT', 'travel_offices', id, null, { rejection_reason: reason });
    }
    
    return office;
  }

  /**
   * Delete travel office (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run(
      'UPDATE travel_offices SET is_active = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'SOFT_DELETE', 'travel_offices', id, oldData, { is_active: false });
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Permanently delete travel office
   */
  static async hardDelete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run('DELETE FROM travel_offices WHERE id = ?', [id]);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'HARD_DELETE', 'travel_offices', id, oldData, null);
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Get statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    by_country: Record<string, number>;
    avg_rating: number;
    total_reviews: number;
  }> {
    const db = await getDatabase();
    
    const [totalResult, activeResult, countryResult, avgRatingResult, reviewsResult] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM travel_offices'),
      db.get('SELECT COUNT(*) as count FROM travel_offices WHERE is_active = 1'),
      db.all(`SELECT c.name_ar as country_name, COUNT(*) as count 
              FROM travel_offices to 
              LEFT JOIN countries c ON to.country_id = c.id 
              WHERE to.is_active = 1 
              GROUP BY to.country_id, c.name_ar`),
      db.get('SELECT AVG(rating) as avg_rating FROM travel_offices WHERE is_active = 1'),
      db.get('SELECT SUM(reviews) as total_reviews FROM travel_offices WHERE is_active = 1')
    ]);
    
    const by_country: Record<string, number> = {};
    countryResult.forEach(row => {
      by_country[row.country_name || 'Unknown'] = row.count;
    });
    
    return {
      total: totalResult.count,
      active: activeResult.count,
      by_country,
      avg_rating: Math.round((avgRatingResult.avg_rating || 0) * 10) / 10,
      total_reviews: reviewsResult.total_reviews || 0
    };
  }

  /**
   * Get offices with location data for map display
   */
  static async findWithLocation(activeOnly: boolean = true): Promise<TravelOffice[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE to.is_active = 1 AND to.latitude IS NOT NULL AND to.longitude IS NOT NULL 
         ORDER BY to.name_ar`
      : `SELECT to.*, c.name_ar as country_name 
         FROM travel_offices to 
         LEFT JOIN countries c ON to.country_id = c.id 
         WHERE to.latitude IS NOT NULL AND to.longitude IS NOT NULL 
         ORDER BY to.name_ar`;
    
    const rows = await db.all(query);
    
    return rows.map(row => this.formatOfficeFromDB(row));
  }

  /**
   * Format office data from database
   */
  private static formatOfficeFromDB(row: any): TravelOffice {
    return {
      id: row.id,
      country_id: row.country_id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      name_fr: row.name_fr,
      address_ar: row.address_ar,
      address_en: row.address_en,
      address_fr: row.address_fr,
      phone: row.phone,
      email: row.email,
      website: row.website,
      manager_ar: row.manager_ar,
      manager_en: row.manager_en,
      manager_fr: row.manager_fr,
      services_ar: parseJSONField(row.services_ar, []),
      services_en: parseJSONField(row.services_en, []),
      services_fr: parseJSONField(row.services_fr, []),
      working_hours_ar: row.working_hours_ar,
      working_hours_en: row.working_hours_en,
      working_hours_fr: row.working_hours_fr,
      latitude: row.latitude,
      longitude: row.longitude,
      rating: row.rating,
      reviews: row.reviews,
      is_active: Boolean(row.is_active),
      is_company_office: Boolean(row.is_company_office),
      status: row.status || 'draft',
      submitted_by: row.submitted_by,
      reviewed_by: row.reviewed_by,
      published_by: row.published_by,
      submitted_at: row.submitted_at,
      reviewed_at: row.reviewed_at,
      published_at: row.published_at,
      rejection_reason: row.rejection_reason,
      created_at: row.created_at,
      updated_at: row.updated_at,
      country_name: row.country_name
    };
  }
}
