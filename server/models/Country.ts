import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface Country {
  id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  capital_ar: string;
  capital_en: string;
  capital_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  continent: 'africa' | 'asia' | 'europe' | 'america' | 'oceania';
  main_image: string;
  gallery: string[]; // JSON array
  currency_ar: string;
  currency_en: string;
  currency_fr: string;
  language_ar: string;
  language_en: string;
  language_fr: string;
  best_time_ar: string;
  best_time_en: string;
  best_time_fr: string;
  rating: number;
  total_reviews: number;
  total_tours: number;
  highlights_ar: string[]; // JSON array
  highlights_en: string[]; // JSON array
  highlights_fr: string[]; // JSON array
  culture_ar: string[]; // JSON array
  culture_en: string[]; // JSON array
  culture_fr: string[]; // JSON array
  cuisine_ar: string[]; // JSON array
  cuisine_en: string[]; // JSON array
  cuisine_fr: string[]; // JSON array
  transportation_ar: string[]; // JSON array
  transportation_en: string[]; // JSON array
  transportation_fr: string[]; // JSON array
  safety_ar: string[]; // JSON array
  safety_en: string[]; // JSON array
  safety_fr: string[]; // JSON array
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CountryInput {
  name_ar: string;
  name_en: string;
  name_fr: string;
  capital_ar: string;
  capital_en: string;
  capital_fr: string;
  description_ar: string;
  description_en: string;
  description_fr: string;
  continent: 'africa' | 'asia' | 'europe' | 'america' | 'oceania';
  main_image: string;
  gallery?: string[];
  currency_ar: string;
  currency_en: string;
  currency_fr: string;
  language_ar: string;
  language_en: string;
  language_fr: string;
  best_time_ar: string;
  best_time_en: string;
  best_time_fr: string;
  rating?: number;
  total_reviews?: number;
  total_tours?: number;
  highlights_ar?: string[];
  highlights_en?: string[];
  highlights_fr?: string[];
  culture_ar?: string[];
  culture_en?: string[];
  culture_fr?: string[];
  cuisine_ar?: string[];
  cuisine_en?: string[];
  cuisine_fr?: string[];
  transportation_ar?: string[];
  transportation_en?: string[];
  transportation_fr?: string[];
  safety_ar?: string[];
  safety_en?: string[];
  safety_fr?: string[];
  is_active?: boolean;
}

export class CountryModel {
  /**
   * Get all countries
   */
  static async findAll(activeOnly: boolean = true): Promise<Country[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? 'SELECT * FROM countries WHERE is_active = 1 ORDER BY name_ar'
      : 'SELECT * FROM countries ORDER BY name_ar';
    
    console.log('CountryModel.findAll - Query:', query);
    console.log('CountryModel.findAll - activeOnly:', activeOnly);
    
    const rows = await db.all(query);
    console.log('CountryModel.findAll - Raw rows count:', rows.length);
    
    if (rows.length > 0) {
      console.log('CountryModel.findAll - First raw row:', {
        id: rows[0].id,
        name_ar: rows[0].name_ar,
        name_en: rows[0].name_en,
        is_active: rows[0].is_active
      });
    }
    
    const formatted = rows.map(row => this.formatCountryFromDB(row));
    console.log('CountryModel.findAll - Formatted count:', formatted.length);
    
    return formatted;
  }

  /**
   * Get country by ID
   */
  static async findById(id: string): Promise<Country | null> {
    const db = await getDatabase();
    
    const row = await db.get('SELECT * FROM countries WHERE id = ?', [id]);
    
    return row ? this.formatCountryFromDB(row) : null;
  }

  /**
   * Get countries by continent
   */
  static async findByContinent(continent: string, activeOnly: boolean = true): Promise<Country[]> {
    const db = await getDatabase();
    
    const query = activeOnly 
      ? 'SELECT * FROM countries WHERE continent = ? AND is_active = 1 ORDER BY name_ar'
      : 'SELECT * FROM countries WHERE continent = ? ORDER BY name_ar';
    
    const rows = await db.all(query, [continent]);
    
    return rows.map(row => this.formatCountryFromDB(row));
  }

  /**
   * Search countries by name
   */
  static async search(query: string, language: 'ar' | 'en' | 'fr' = 'ar', activeOnly: boolean = true): Promise<Country[]> {
    const db = await getDatabase();
    
    const nameField = `name_${language}`;
    const descField = `description_${language}`;
    
    const searchQuery = activeOnly 
      ? `SELECT * FROM countries 
         WHERE (${nameField} LIKE ? OR ${descField} LIKE ?) 
         AND is_active = 1 
         ORDER BY ${nameField}`
      : `SELECT * FROM countries 
         WHERE (${nameField} LIKE ? OR ${descField} LIKE ?) 
         ORDER BY ${nameField}`;
    
    const searchTerm = `%${query}%`;
    const rows = await db.all(searchQuery, [searchTerm, searchTerm]);
    
    return rows.map(row => this.formatCountryFromDB(row));
  }

  /**
   * Create a new country
   */
  static async create(countryData: CountryInput, userId?: string): Promise<Country> {
    const db = await getDatabase();
    
    const id = generateId('country');
    const now = new Date().toISOString();
    
    const query = `
      INSERT INTO countries (
        id, name_ar, name_en, name_fr, capital_ar, capital_en, capital_fr,
        description_ar, description_en, description_fr, continent, main_image,
        gallery, currency_ar, currency_en, currency_fr, language_ar, language_en, language_fr,
        best_time_ar, best_time_en, best_time_fr, rating, total_reviews, total_tours,
        highlights_ar, highlights_en, highlights_fr, culture_ar, culture_en, culture_fr,
        cuisine_ar, cuisine_en, cuisine_fr, transportation_ar, transportation_en, transportation_fr,
        safety_ar, safety_en, safety_fr, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      id,
      countryData.name_ar,
      countryData.name_en,
      countryData.name_fr,
      countryData.capital_ar,
      countryData.capital_en,
      countryData.capital_fr,
      countryData.description_ar,
      countryData.description_en,
      countryData.description_fr,
      countryData.continent,
      countryData.main_image,
      validateAndStringifyJSON(countryData.gallery || []),
      countryData.currency_ar,
      countryData.currency_en,
      countryData.currency_fr,
      countryData.language_ar,
      countryData.language_en,
      countryData.language_fr,
      countryData.best_time_ar,
      countryData.best_time_en,
      countryData.best_time_fr,
      countryData.rating || 4.5,
      countryData.total_reviews || 0,
      countryData.total_tours || 0,
      validateAndStringifyJSON(countryData.highlights_ar || []),
      validateAndStringifyJSON(countryData.highlights_en || []),
      validateAndStringifyJSON(countryData.highlights_fr || []),
      validateAndStringifyJSON(countryData.culture_ar || []),
      validateAndStringifyJSON(countryData.culture_en || []),
      validateAndStringifyJSON(countryData.culture_fr || []),
      validateAndStringifyJSON(countryData.cuisine_ar || []),
      validateAndStringifyJSON(countryData.cuisine_en || []),
      validateAndStringifyJSON(countryData.cuisine_fr || []),
      validateAndStringifyJSON(countryData.transportation_ar || []),
      validateAndStringifyJSON(countryData.transportation_en || []),
      validateAndStringifyJSON(countryData.transportation_fr || []),
      validateAndStringifyJSON(countryData.safety_ar || []),
      validateAndStringifyJSON(countryData.safety_en || []),
      validateAndStringifyJSON(countryData.safety_fr || []),
      countryData.is_active !== false ? 1 : 0,
      now,
      now
    ];
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'CREATE', 'countries', id, null, countryData);
    }
    
    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create country');
    }
    
    return created;
  }

  /**
   * Update country
   */
  static async update(id: string, countryData: Partial<CountryInput>, userId?: string): Promise<Country | null> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return null;
    }
    
    const updateFields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    Object.entries(countryData).forEach(([key, value]) => {
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
    
    const query = `UPDATE countries SET ${updateFields.join(', ')} WHERE id = ?`;
    
    await db.run(query, values);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'UPDATE', 'countries', id, oldData, countryData);
    }
    
    return await this.findById(id);
  }

  /**
   * Delete country (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run(
      'UPDATE countries SET is_active = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'SOFT_DELETE', 'countries', id, oldData, { is_active: false });
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Permanently delete country
   */
  static async hardDelete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    
    // Get current data for audit log
    const oldData = await this.findById(id);
    if (!oldData) {
      return false;
    }
    
    const result = await db.run('DELETE FROM countries WHERE id = ?', [id]);
    
    // Log audit action
    if (userId) {
      await logAuditAction(userId, 'HARD_DELETE', 'countries', id, oldData, null);
    }
    
    return (result.changes || 0) > 0;
  }

  /**
   * Get statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    active: number;
    by_continent: Record<string, number>;
    avg_rating: number;
    total_tours: number;
    total_reviews: number;
  }> {
    const db = await getDatabase();
    
    const [totalResult, activeResult, continentResult, avgRatingResult, toursResult, reviewsResult] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM countries'),
      db.get('SELECT COUNT(*) as count FROM countries WHERE is_active = 1'),
      db.all('SELECT continent, COUNT(*) as count FROM countries WHERE is_active = 1 GROUP BY continent'),
      db.get('SELECT AVG(rating) as avg_rating FROM countries WHERE is_active = 1'),
      db.get('SELECT SUM(total_tours) as total_tours FROM countries WHERE is_active = 1'),
      db.get('SELECT SUM(total_reviews) as total_reviews FROM countries WHERE is_active = 1')
    ]);
    
    const by_continent: Record<string, number> = {};
    continentResult.forEach(row => {
      by_continent[row.continent] = row.count;
    });
    
    return {
      total: totalResult.count,
      active: activeResult.count,
      by_continent,
      avg_rating: Math.round((avgRatingResult.avg_rating || 0) * 10) / 10,
      total_tours: toursResult.total_tours || 0,
      total_reviews: reviewsResult.total_reviews || 0
    };
  }

  /**
   * Format country data from database
   */
  private static formatCountryFromDB(row: any): Country {
    return {
      id: row.id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      name_fr: row.name_fr,
      capital_ar: row.capital_ar,
      capital_en: row.capital_en,
      capital_fr: row.capital_fr,
      description_ar: row.description_ar,
      description_en: row.description_en,
      description_fr: row.description_fr,
      continent: row.continent,
      main_image: row.main_image,
      gallery: parseJSONField(row.gallery, []),
      currency_ar: row.currency_ar,
      currency_en: row.currency_en,
      currency_fr: row.currency_fr,
      language_ar: row.language_ar,
      language_en: row.language_en,
      language_fr: row.language_fr,
      best_time_ar: row.best_time_ar,
      best_time_en: row.best_time_en,
      best_time_fr: row.best_time_fr,
      rating: row.rating,
      total_reviews: row.total_reviews,
      total_tours: row.total_tours,
      highlights_ar: parseJSONField(row.highlights_ar, []),
      highlights_en: parseJSONField(row.highlights_en, []),
      highlights_fr: parseJSONField(row.highlights_fr, []),
      culture_ar: parseJSONField(row.culture_ar, []),
      culture_en: parseJSONField(row.culture_en, []),
      culture_fr: parseJSONField(row.culture_fr, []),
      cuisine_ar: parseJSONField(row.cuisine_ar, []),
      cuisine_en: parseJSONField(row.cuisine_en, []),
      cuisine_fr: parseJSONField(row.cuisine_fr, []),
      transportation_ar: parseJSONField(row.transportation_ar, []),
      transportation_en: parseJSONField(row.transportation_en, []),
      transportation_fr: parseJSONField(row.transportation_fr, []),
      safety_ar: parseJSONField(row.safety_ar, []),
      safety_en: parseJSONField(row.safety_en, []),
      safety_fr: parseJSONField(row.safety_fr, []),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
