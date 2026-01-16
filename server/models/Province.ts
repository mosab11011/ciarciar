import { getDatabase, generateId, logAuditAction, validateAndStringifyJSON, parseJSONField } from '../database/database';

export interface Province {
  id: string;
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  code?: string;
  description_ar?: string;
  description_en?: string;
  description_fr?: string;
  capital_ar?: string;
  capital_en?: string;
  capital_fr?: string;
  main_image?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  country_name?: string;
}

export interface ProvinceInput {
  country_id: string;
  name_ar: string;
  name_en: string;
  name_fr: string;
  code?: string;
  description_ar?: string;
  description_en?: string;
  description_fr?: string;
  capital_ar?: string;
  capital_en?: string;
  capital_fr?: string;
  main_image?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}

export class ProvinceModel {
  /**
   * Format province from database row
   */
  static formatProvinceFromDB(row: any): Province {
    return {
      id: row.id,
      country_id: row.country_id,
      name_ar: row.name_ar,
      name_en: row.name_en,
      name_fr: row.name_fr,
      code: row.code,
      description_ar: row.description_ar,
      description_en: row.description_en,
      description_fr: row.description_fr,
      capital_ar: row.capital_ar,
      capital_en: row.capital_en,
      capital_fr: row.capital_fr,
      main_image: row.main_image,
      latitude: row.latitude,
      longitude: row.longitude,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
      country_name: row.country_name
    };
  }

  /**
   * Get all provinces
   */
  static async findAll(activeOnly: boolean = true, countryId?: string): Promise<Province[]> {
    const db = await getDatabase();
    
    let query = activeOnly 
      ? 'SELECT p.*, c.name_ar as country_name FROM provinces p LEFT JOIN countries c ON p.country_id = c.id WHERE p.is_active = 1'
      : 'SELECT p.*, c.name_ar as country_name FROM provinces p LEFT JOIN countries c ON p.country_id = c.id';
    
    if (countryId) {
      query += activeOnly ? ' AND p.country_id = ?' : ' WHERE p.country_id = ?';
    }
    
    query += ' ORDER BY p.name_ar';
    
    const rows = countryId 
      ? await db.all(query, [countryId])
      : await db.all(query);
    
    return rows.map(row => this.formatProvinceFromDB(row));
  }

  /**
   * Get province by ID
   */
  static async findById(id: string): Promise<Province | null> {
    const db = await getDatabase();
    const row = await db.get(
      'SELECT p.*, c.name_ar as country_name FROM provinces p LEFT JOIN countries c ON p.country_id = c.id WHERE p.id = ?',
      [id]
    );
    
    return row ? this.formatProvinceFromDB(row) : null;
  }

  /**
   * Create a new province
   */
  static async create(provinceData: ProvinceInput, userId?: string): Promise<Province> {
    const db = await getDatabase();
    const id = generateId('province');
    
    await db.run(
      `INSERT INTO provinces (
        id, country_id, name_ar, name_en, name_fr, code,
        description_ar, description_en, description_fr,
        capital_ar, capital_en, capital_fr,
        main_image, latitude, longitude, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        provinceData.country_id,
        provinceData.name_ar,
        provinceData.name_en,
        provinceData.name_fr,
        provinceData.code || null,
        provinceData.description_ar || null,
        provinceData.description_en || null,
        provinceData.description_fr || null,
        provinceData.capital_ar || null,
        provinceData.capital_en || null,
        provinceData.capital_fr || null,
        provinceData.main_image || null,
        provinceData.latitude || null,
        provinceData.longitude || null,
        provinceData.is_active !== undefined ? (provinceData.is_active ? 1 : 0) : 1
      ]
    );

    if (userId) {
      await logAuditAction(userId, 'create', 'provinces', id, null, provinceData);
    }

    const province = await this.findById(id);
    if (!province) {
      throw new Error('Failed to create province');
    }
    
    return province;
  }

  /**
   * Update province
   */
  static async update(id: string, provinceData: Partial<ProvinceInput>, userId?: string): Promise<Province> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error('Province not found');
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (provinceData.name_ar !== undefined) {
      updates.push('name_ar = ?');
      values.push(provinceData.name_ar);
    }
    if (provinceData.name_en !== undefined) {
      updates.push('name_en = ?');
      values.push(provinceData.name_en);
    }
    if (provinceData.name_fr !== undefined) {
      updates.push('name_fr = ?');
      values.push(provinceData.name_fr);
    }
    if (provinceData.code !== undefined) {
      updates.push('code = ?');
      values.push(provinceData.code);
    }
    if (provinceData.description_ar !== undefined) {
      updates.push('description_ar = ?');
      values.push(provinceData.description_ar);
    }
    if (provinceData.description_en !== undefined) {
      updates.push('description_en = ?');
      values.push(provinceData.description_en);
    }
    if (provinceData.description_fr !== undefined) {
      updates.push('description_fr = ?');
      values.push(provinceData.description_fr);
    }
    if (provinceData.capital_ar !== undefined) {
      updates.push('capital_ar = ?');
      values.push(provinceData.capital_ar);
    }
    if (provinceData.capital_en !== undefined) {
      updates.push('capital_en = ?');
      values.push(provinceData.capital_en);
    }
    if (provinceData.capital_fr !== undefined) {
      updates.push('capital_fr = ?');
      values.push(provinceData.capital_fr);
    }
    if (provinceData.main_image !== undefined) {
      updates.push('main_image = ?');
      values.push(provinceData.main_image);
    }
    if (provinceData.latitude !== undefined) {
      updates.push('latitude = ?');
      values.push(provinceData.latitude);
    }
    if (provinceData.longitude !== undefined) {
      updates.push('longitude = ?');
      values.push(provinceData.longitude);
    }
    if (provinceData.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(provinceData.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return existing;
    }

    values.push(id);
    await db.run(
      `UPDATE provinces SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    if (userId) {
      await logAuditAction(userId, 'update', 'provinces', id, existing, provinceData);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to update province');
    }
    
    return updated;
  }

  /**
   * Delete province (soft delete)
   */
  static async delete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      return false;
    }

    await db.run('UPDATE provinces SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    if (userId) {
      await logAuditAction(userId, 'delete', 'provinces', id, existing, null);
    }

    return true;
  }

  /**
   * Hard delete province
   */
  static async hardDelete(id: string, userId?: string): Promise<boolean> {
    const db = await getDatabase();
    const existing = await this.findById(id);
    
    if (!existing) {
      return false;
    }

    await db.run('DELETE FROM provinces WHERE id = ?', [id]);

    if (userId) {
      await logAuditAction(userId, 'hard_delete', 'provinces', id, existing, null);
    }

    return true;
  }
}

