import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface City {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  image: string;
  attractions_ar: string[]; // JSON array
  attractions_en: string[]; // JSON array
  attractions_fr: string[]; // JSON array
  best_time_ar: string;
  best_time_en: string;
  best_time_fr: string;
  duration_ar: string;
  duration_en: string;
  duration_fr: string;
  rating: number;
  reviews: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields (from joins)
  country_name?: string;
}

export interface CityInput {
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  image: string;
  attractions_ar?: string[];
  attractions_en?: string[];
  attractions_fr?: string[];
  best_time_ar: string;
  best_time_en: string;
  best_time_fr: string;
  duration_ar: string;
  duration_en: string;
  duration_fr: string;
  rating?: number;
  reviews?: number;
  is_active?: boolean;
}

export class CityModel {
  /**
   * Get all cities
   */
  static async findAll(activeOnly: boolean = true): Promise<City[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? `SELECT c.*, co.name_ar as country_name 
         FROM cities c 
         LEFT JOIN countries co ON c.country_id = co.id 
         WHERE c.is_active = 1 
         ORDER BY c.name_ar`
      : `SELECT c.*, co.name_ar as country_name 
         FROM cities c 
         LEFT JOIN countries co ON c.country_id = co.id 
         ORDER BY c.name_ar`;
    
    const rows = await db.all(query);
    
    return rows.map(row => this.formatCityFromDB(row));
  }

  /**
   * Get city by ID
   */
  static async findById(id: string): Promise<City | null> {
    const db = await getDatabase();
    
    const row = await db.get(
      `SELECT c.*, co.name_ar as country_name 
       FROM cities c 
       LEFT JOIN countries co ON c.country_id = co.id 
       WHERE c.id = ?`,
      [id]
    );
    
    return row ? this.formatCityFromDB(row) : null;
  }

  /**
   * Get cities by country
   */
  static async findByCountry(countryId: string, activeOnly: boolean = true): Promise<City[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? `SELECT c.*, co.name_ar as country_name 
         FROM cities c 
         LEFT JOIN countries co ON c.country_id = co.id 
         WHERE c.country_id = ? AND c.is_active = 1 
         ORDER BY c.name_ar`
      : `SELECT c.*, co.name_ar as country_name 
         FROM cities c 
         LEFT JOIN countries co ON c.country_id = co.id 
         WHERE c.country_id = ? 
         ORDER BY c.name_ar`;
    
    const rows = await db.all(query, [countryId]);
    
    return rows.map(row => this.formatCityFromDB(row));
  }

  /**
   * Create a new city
   */
  static async create(cityData: CityInput, userId?: string): Promise<City> {
    const db = await getDatabase();
    
    // Verify country exists
    const countryExists = await db.get('SELECT id FROM countries WHERE id = ?', [cityData.country_id]);
    if (!countryExists) {
      throw new Error('Country not found');
    }
    
    const id = generateId('city');
    const now = new Date().toISOString();
    
    const query = `
      INSERT INTO cities (
        id, country_id, name_ar, name_en, name_fr,
        description_ar, description_en, description_fr, image,
        attractions_ar, attractions_en, attractions_fr,
        best_time_ar, best_time_en, best_time_fr,
        duration_ar, duration_en, duration_fr,
        rating, reviews, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      id,
      cityData.country_id,
      cityData.name_ar,
      cityData.name_en || cityData.name_ar,
      cityData.name_fr || cityData.name_ar,
      cityData.description_ar,
      cityData.description_en || cityData.description_ar,
      cityData.description_fr || cityData.description_ar,
      cityData.image,
      validateAndStringifyJSON(cityData.attractions_ar || []),
      validateAndStringifyJSON(cityData.attractions_en || []),
      validateAndStringifyJSON(cityData.attractions_fr || []),
      cityData.best_time_ar,
      cityData.best_time_en || cityData.best_time_ar,
      cityData.best_time_fr || cityData.best_time_ar,
      cityData.duration_ar,
      cityData.duration_en || cityData.duration_ar,
      cityData.duration_fr || cityData.duration_ar,
      cityData.rating || 4.5,
      cityData.reviews || 0,
      cityData.is_active !== undefined ? (cityData.is_active ? 1 : 0) : 1,
      now,
      now
    ];
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'CREATE', 'cities', id, null, cityData);
    }
    
    return await this.findById(id) as City;
  }

  /**
   * Update city
   */
  static async update(id: string, cityData: Partial<CityInput>, userId?: string): Promise<City | null> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return null;
    }
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    Object.entries(cityData).forEach(([key, value]) => {
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
    
    const query = `UPDATE cities SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'UPDATE', 'cities', id, oldData, cityData);
    }
    
    return await this.findById(id);
  }

  /**
   * Delete city (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run(
      'UPDATE cities SET is_active = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'SOFT_DELETE', 'cities', id, oldData, { is_active: false });
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Permanently delete city
   */
  static async hardDelete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run('DELETE FROM cities WHERE id = ?', [id]);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'HARD_DELETE', 'cities', id, oldData, null);
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Format city data from database
   */
  private static formatCityFromDB(row: any): City {
    return {
      id: row.id,
      country_id: row.country_id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      name_fr: row.name_fr,
      description_ar: row.description_ar,
      description_en: row.description_en,
      description_fr: row.description_fr,
      image: row.image,
      attractions_ar: parseJSONField(row.attractions_ar, []),
      attractions_en: parseJSONField(row.attractions_en, []),
      attractions_fr: parseJSONField(row.attractions_fr, []),
      best_time_ar: row.best_time_ar,
      best_time_en: row.best_time_en,
      best_time_fr: row.best_time_fr,
      duration_ar: row.duration_ar,
      duration_en: row.duration_en,
      duration_fr: row.duration_fr,
      rating: row.rating,
      reviews: row.reviews,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      country_name: row.country_name
    };
  }
}

