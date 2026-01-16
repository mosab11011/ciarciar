import { getDatabase, generateId, validateAndStringifyJSON, parseJSONField, logAuditAction } from '../database/database';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';

export interface Payment {
  id: string;
  provider: 'stripe';
  provider_session_id: string | null;
  provider_payment_intent_id: string | null;
  amount: number; // in smallest currency unit
  currency: string; // ISO currency code
  description: string | null;
  customer_email: string | null;
  metadata: Record<string, any>;
  status: PaymentStatus;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentInput {
  provider: 'stripe';
  amount: number; // in smallest currency unit
  currency: string;
  description?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, any>;
  booking_id?: string | null;
  provider_session_id?: string | null;
  provider_payment_intent_id?: string | null;
}

export class PaymentModel {
  private static ensured = false;

  private static async ensureTable() {
    if (this.ensured) return;
    const db = await getDatabase();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        provider_session_id TEXT,
        provider_payment_intent_id TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL,
        description TEXT,
        customer_email TEXT,
        metadata TEXT,
        status TEXT NOT NULL CHECK (status IN ('pending','paid','failed','refunded','canceled')),
        booking_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_payments_provider_session ON payments(provider_session_id);
      CREATE INDEX IF NOT EXISTS idx_payments_provider_intent ON payments(provider_payment_intent_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);
    this.ensured = true;
  }

  static async create(input: CreatePaymentInput, userId?: string): Promise<Payment> {
    await this.ensureTable();
    const db = await getDatabase();
    const id = generateId('pay');
    const now = new Date().toISOString();

    const query = `
      INSERT INTO payments (
        id, provider, provider_session_id, provider_payment_intent_id,
        amount, currency, description, customer_email, metadata, status,
        booking_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      input.provider,
      input.provider_session_id || null,
      input.provider_payment_intent_id || null,
      input.amount,
      input.currency.toUpperCase(),
      input.description ?? null,
      input.customer_email ?? null,
      validateAndStringifyJSON(input.metadata || {}),
      'pending',
      input.booking_id ?? null,
      now,
      now
    ];

    await db.run(query, values);

    if (userId) {
      await logAuditAction(userId, 'CREATE', 'payments', id, null, input);
    }

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to create payment');
    return created;
  }

  static async updateByProviderRefs(update: {
    provider_session_id?: string | null;
    provider_payment_intent_id?: string | null;
    status?: PaymentStatus;
    description?: string | null;
    customer_email?: string | null;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<number> {
    await this.ensureTable();
    const db = await getDatabase();

    const sets: string[] = [];
    const vals: any[] = [];

    if (update.status) { sets.push('status = ?'); vals.push(update.status); }
    if (update.description !== undefined) { sets.push('description = ?'); vals.push(update.description); }
    if (update.customer_email !== undefined) { sets.push('customer_email = ?'); vals.push(update.customer_email); }
    if (update.amount !== undefined) { sets.push('amount = ?'); vals.push(update.amount); }
    if (update.currency !== undefined) { sets.push('currency = ?'); vals.push(update.currency.toUpperCase()); }
    if (update.metadata !== undefined) { sets.push('metadata = ?'); vals.push(validateAndStringifyJSON(update.metadata)); }

    sets.push('updated_at = ?');
    vals.push(new Date().toISOString());

    const where: string[] = [];
    if (update.provider_session_id) { where.push('provider_session_id = ?'); vals.push(update.provider_session_id); }
    if (update.provider_payment_intent_id) { where.push('provider_payment_intent_id = ?'); vals.push(update.provider_payment_intent_id); }

    if (where.length === 0) return 0;

    const sql = `UPDATE payments SET ${sets.join(', ')} WHERE ${where.join(' OR ')}`;
    const result = await db.run(sql, vals);
    return result.changes || 0;
  }

  static async attachProviderRefs(id: string, refs: { sessionId?: string | null; intentId?: string | null; }): Promise<boolean> {
    await this.ensureTable();
    const db = await getDatabase();
    const sets: string[] = [];
    const vals: any[] = [];
    if (refs.sessionId !== undefined) { sets.push('provider_session_id = ?'); vals.push(refs.sessionId); }
    if (refs.intentId !== undefined) { sets.push('provider_payment_intent_id = ?'); vals.push(refs.intentId); }
    sets.push('updated_at = ?');
    vals.push(new Date().toISOString());
    vals.push(id);
    const sql = `UPDATE payments SET ${sets.join(', ')} WHERE id = ?`;
    const res = await db.run(sql, vals);
    return (res.changes || 0) > 0;
  }

  static async updateStatus(id: string, status: PaymentStatus): Promise<boolean> {
    await this.ensureTable();
    const db = await getDatabase();
    const res = await db.run('UPDATE payments SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);
    return (res.changes || 0) > 0;
  }

  static async list(options?: { status?: PaymentStatus; limit?: number; offset?: number }): Promise<Payment[]> {
    await this.ensureTable();
    const db = await getDatabase();
    const where: string[] = [];
    const vals: any[] = [];
    if (options?.status) { where.push('status = ?'); vals.push(options.status); }
    const sql = `SELECT * FROM payments ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    vals.push(options?.limit ?? 100);
    vals.push(options?.offset ?? 0);
    const rows = await db.all(sql, vals);
    return rows.map(this.fromRow);
  }

  static async stats(): Promise<{ total: number; paid: number; failed: number; refunded: number; pending: number; }> {
    await this.ensureTable();
    const db = await getDatabase();
    const total = await db.get('SELECT COUNT(*) as c FROM payments');
    const paid = await db.get("SELECT COUNT(*) as c FROM payments WHERE status = 'paid'");
    const failed = await db.get("SELECT COUNT(*) as c FROM payments WHERE status = 'failed'");
    const refunded = await db.get("SELECT COUNT(*) as c FROM payments WHERE status = 'refunded'");
    const pending = await db.get("SELECT COUNT(*) as c FROM payments WHERE status = 'pending'");
    return { total: total.c || 0, paid: paid.c || 0, failed: failed.c || 0, refunded: refunded.c || 0, pending: pending.c || 0 };
  }

  static async findById(id: string): Promise<Payment | null> {
    await this.ensureTable();
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM payments WHERE id = ?', [id]);
    return row ? this.fromRow(row) : null;
  }

  static async findBySession(sessionId: string): Promise<Payment | null> {
    await this.ensureTable();
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM payments WHERE provider_session_id = ?', [sessionId]);
    return row ? this.fromRow(row) : null;
  }

  static async findByIntent(intentId: string): Promise<Payment | null> {
    await this.ensureTable();
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM payments WHERE provider_payment_intent_id = ?', [intentId]);
    return row ? this.fromRow(row) : null;
  }

  private static fromRow(row: any): Payment {
    return {
      id: row.id,
      provider: row.provider,
      provider_session_id: row.provider_session_id,
      provider_payment_intent_id: row.provider_payment_intent_id,
      amount: Number(row.amount),
      currency: row.currency,
      description: row.description,
      customer_email: row.customer_email,
      metadata: parseJSONField(row.metadata, {} as Record<string, any>),
      status: row.status,
      booking_id: row.booking_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
