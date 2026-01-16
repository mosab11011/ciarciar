import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Database connection interface
export interface DatabaseConnection {
  db: Database<sqlite3.Database, sqlite3.Statement>;
  close: () => Promise<void>;
}

// Database configuration
// In production, use absolute path from env or default relative path
const DB_PATH = process.env.DATABASE_PATH 
  ? (process.env.DATABASE_PATH.startsWith('/') 
      ? process.env.DATABASE_PATH 
      : join(process.cwd(), process.env.DATABASE_PATH))
  : join(process.cwd(), 'server/database/tarhal.db');

const SCHEMA_PATH = join(process.cwd(), 'server/database/schema.sql');
const MIGRATIONS_DIR = join(process.cwd(), 'server/database/migrations');

// Ensure database directory exists
import { mkdirSync } from 'fs';
const dbDir = DB_PATH.includes('/') ? DB_PATH.substring(0, DB_PATH.lastIndexOf('/')) : process.cwd();
try {
  if (dbDir !== process.cwd() && !dbDir.includes('node_modules')) {
    mkdirSync(dbDir, { recursive: true });
  }
} catch (e) {
  // Directory might already exist, ignore error
}

// Global database instance
let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

/**
 * Initialize the database connection and create tables
 */
export async function initializeDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  try {
    console.log('🗄️  Initializing database...');
    
    // Open database connection
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Enable foreign key constraints
    await db.exec('PRAGMA foreign_keys = ON');
    await db.exec('PRAGMA journal_mode = WAL');
    await db.exec('PRAGMA synchronous = NORMAL');
    await db.exec('PRAGMA cache_size = 1000');
    await db.exec('PRAGMA temp_store = MEMORY');

    // Load and execute schema
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    await db.exec(schema);

    // Apply migrations
    await applyMigrations(db);

    console.log('✅ Database initialized successfully');
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('🔒 Database connection closed');
  }
}

/**
 * Generate a unique ID for database records
 */
export function generateId(prefix: string = ''): string {
  const id = uuidv4();
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Execute a transaction with automatic rollback on error
 */
export async function executeTransaction<T>(
  operations: (db: Database<sqlite3.Database, sqlite3.Statement>) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  
  try {
    await db.exec('BEGIN TRANSACTION');
    const result = await operations(db);
    await db.exec('COMMIT');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Log database operations for audit trail
 */
export async function logAuditAction(
  userId: string | null,
  action: string,
  tableName: string,
  recordId: string | null,
  oldValues: any = null,
  newValues: any = null,
  ipAddress: string | null = null,
  userAgent: string | null = null
): Promise<void> {
  const db = await getDatabase();
  
  try {
    await db.run(
      `INSERT INTO audit_log (
        id, user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId('audit'),
        userId,
        action,
        tableName,
        recordId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw error as audit logging should not break main operations
  }
}

/**
 * Validate JSON field before saving to database
 */
export function validateAndStringifyJSON(data: any): string | null {
  if (data === null || data === undefined) {
    return null;
  }
  
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to stringify JSON data:', error);
    return null;
  }
}

/**
 * Parse JSON field from database
 */
export function parseJSONField<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON field:', error);
    return defaultValue;
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  recordCounts: Record<string, number>;
}> {
  try {
    const db = await getDatabase();
    
    // Check connection
    await db.get('SELECT 1');
    
    // Check if main tables exist
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    const expectedTables = [
      'countries', 'cities', 'travel_offices', 'users', 
      'tours', 'bookings', 'reviews', 'contact_messages',
      'newsletter_subscriptions', 'system_settings', 'audit_log'
    ];
    
    const existingTableNames = tables.map(t => t.name);
    const tablesExist = expectedTables.every(table => existingTableNames.includes(table));
    
    // Get record counts
    const recordCounts: Record<string, number> = {};
    for (const table of expectedTables) {
      if (existingTableNames.includes(table)) {
        const result = await db.get(`SELECT COUNT(*) as count FROM ${table}`);
        recordCounts[table] = result.count;
      }
    }
    
    return {
      connected: true,
      tablesExist,
      recordCounts
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      connected: false,
      tablesExist: false,
      recordCounts: {}
    };
  }
}

/**
 * Apply database migrations
 */
async function applyMigrations(db: Database<sqlite3.Database, sqlite3.Statement>): Promise<void> {
  try {
    // Create migrations tracking table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationFiles = readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Apply in order

    // Get already applied migrations
    const appliedMigrations = await db.all<{ filename: string }>(
      'SELECT filename FROM migrations'
    );
    const appliedFilenames = new Set(appliedMigrations.map(m => m.filename));

    // Apply pending migrations
    for (const file of migrationFiles) {
      if (!appliedFilenames.has(file)) {
        console.log(`📦 Applying migration: ${file}`);
        const migrationPath = join(MIGRATIONS_DIR, file);
        const migrationSQL = readFileSync(migrationPath, 'utf-8');
        
        // Split by semicolons and execute each statement
        // SQLite doesn't support multiple statements in exec() easily
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await db.exec(statement);
            } catch (err: any) {
              // Ignore "duplicate column" errors (for ALTER TABLE ADD COLUMN)
              if (!err.message?.includes('duplicate column') && 
                  !err.message?.includes('already exists')) {
                console.warn(`⚠️  Migration statement warning in ${file}:`, err.message);
              }
            }
          }
        }

        // Record migration as applied
        await db.run(
          'INSERT INTO migrations (id, filename) VALUES (?, ?)',
          [generateId('migration'), file]
        );
        console.log(`✅ Migration applied: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Error applying migrations:', error);
    // Don't throw - allow app to continue even if migrations fail
  }
}

/**
 * Backup database to a file
 */
export async function backupDatabase(backupPath?: string): Promise<string> {
  const db = await getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const finalBackupPath = backupPath || join(process.cwd(), `backup_${timestamp}.db`);
  
  try {
    await db.exec(`VACUUM INTO '${finalBackupPath}'`);
    console.log(`✅ Database backed up to: ${finalBackupPath}`);
    return finalBackupPath;
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  }
}

/**
 * Clean up old audit logs (keep last 30 days)
 */
export async function cleanupAuditLogs(daysToKeep: number = 30): Promise<number> {
  const db = await getDatabase();
  
  try {
    const result = await db.run(
      `DELETE FROM audit_log 
       WHERE created_at < datetime('now', '-${daysToKeep} days')`
    );
    
    const deletedCount = result.changes || 0;
    console.log(`🧹 Cleaned up ${deletedCount} old audit log entries`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup audit logs:', error);
    throw error;
  }
}

// Export database connection for direct access if needed
export { dbInstance };
