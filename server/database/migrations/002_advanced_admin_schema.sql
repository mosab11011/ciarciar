-- Advanced Admin Panel Schema Migration
-- Based on requirements document for comprehensive tourism management system

PRAGMA foreign_keys = ON;

-- ============================================
-- 1. PROVINCES TABLE (المحافظات)
-- ============================================
CREATE TABLE IF NOT EXISTS provinces (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    code TEXT, -- Province code
    description_ar TEXT,
    description_en TEXT,
    description_fr TEXT,
    capital_ar TEXT,
    capital_en TEXT,
    capital_fr TEXT,
    main_image TEXT,
    latitude REAL,
    longitude REAL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Update cities table to include province_id
ALTER TABLE cities ADD COLUMN province_id TEXT REFERENCES provinces(id) ON DELETE SET NULL;

-- ============================================
-- 2. DESTINATIONS TABLE (الوجهات السياحية)
-- ============================================
CREATE TABLE IF NOT EXISTS destinations (
    id TEXT PRIMARY KEY,
    city_id TEXT,
    province_id TEXT,
    country_id TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    main_image TEXT NOT NULL,
    gallery TEXT, -- JSON array of image URLs
    latitude REAL NOT NULL, -- Required for map integration
    longitude REAL NOT NULL, -- Required for map integration
    address_ar TEXT,
    address_en TEXT,
    address_fr TEXT,
    category TEXT, -- beach, mountain, historical, cultural, etc.
    rating REAL DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    best_time_ar TEXT,
    best_time_en TEXT,
    best_time_fr TEXT,
    duration_ar TEXT,
    duration_en TEXT,
    duration_fr TEXT,
    highlights_ar TEXT, -- JSON array
    highlights_en TEXT, -- JSON array
    highlights_fr TEXT, -- JSON array
    attractions_ar TEXT, -- JSON array
    attractions_en TEXT, -- JSON array
    attractions_fr TEXT, -- JSON array
    entry_fee REAL,
    currency TEXT DEFAULT 'USD',
    opening_hours_ar TEXT,
    opening_hours_en TEXT,
    opening_hours_fr TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- ============================================
-- 3. EVENTS/SEASONS TABLE (الفعاليات/المواسم)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    destination_id TEXT,
    city_id TEXT,
    province_id TEXT,
    country_id TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('festival', 'season', 'cultural', 'sports', 'religious', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    main_image TEXT,
    gallery TEXT, -- JSON array of image URLs
    location_ar TEXT,
    location_en TEXT,
    location_fr TEXT,
    latitude REAL,
    longitude REAL,
    organizer_ar TEXT,
    organizer_en TEXT,
    organizer_fr TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    ticket_price REAL,
    currency TEXT DEFAULT 'USD',
    is_recurring BOOLEAN DEFAULT 0,
    recurrence_pattern TEXT, -- yearly, monthly, etc.
    highlights_ar TEXT, -- JSON array
    highlights_en TEXT, -- JSON array
    highlights_fr TEXT, -- JSON array
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- ============================================
-- 4. ENHANCED ROLES AND PERMISSIONS
-- ============================================
-- Update users table to support new roles
-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints easily
-- We'll handle this in application code

-- Create roles table for better role management
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- global_admin, country_supervisor, province_manager, office_manager, content_editor, publisher
    description_ar TEXT,
    description_en TEXT,
    description_fr TEXT,
    is_system_role BOOLEAN DEFAULT 0, -- Cannot be deleted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g., manage_countries, manage_provinces, manage_destinations
    resource_type TEXT NOT NULL, -- country, province, city, destination, event, office
    action TEXT NOT NULL, -- create, read, update, delete, publish, approve
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User-Role mapping (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    scope_country_id TEXT, -- For country_supervisor, limit to specific country
    scope_province_id TEXT, -- For province_manager, limit to specific province
    scope_office_id TEXT, -- For office_manager, limit to specific office
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by TEXT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (scope_country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (scope_province_id) REFERENCES provinces(id) ON DELETE CASCADE,
    FOREIGN KEY (scope_office_id) REFERENCES travel_offices(id) ON DELETE CASCADE
);

-- ============================================
-- 5. CONTENT WORKFLOW (سير العمل)
-- ============================================
-- Add workflow fields to existing tables
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN for multiple columns easily
-- We'll add these via separate ALTER statements

-- Add workflow fields to destinations
ALTER TABLE destinations ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));
ALTER TABLE destinations ADD COLUMN submitted_by TEXT;
ALTER TABLE destinations ADD COLUMN reviewed_by TEXT;
ALTER TABLE destinations ADD COLUMN published_by TEXT;
ALTER TABLE destinations ADD COLUMN submitted_at DATETIME;
ALTER TABLE destinations ADD COLUMN reviewed_at DATETIME;
ALTER TABLE destinations ADD COLUMN published_at DATETIME;
ALTER TABLE destinations ADD COLUMN rejection_reason TEXT;

-- Add workflow fields to events
ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));
ALTER TABLE events ADD COLUMN submitted_by TEXT;
ALTER TABLE events ADD COLUMN reviewed_by TEXT;
ALTER TABLE events ADD COLUMN published_by TEXT;
ALTER TABLE events ADD COLUMN submitted_at DATETIME;
ALTER TABLE events ADD COLUMN reviewed_at DATETIME;
ALTER TABLE events ADD COLUMN published_at DATETIME;
ALTER TABLE events ADD COLUMN rejection_reason TEXT;

-- Add workflow fields to cities
ALTER TABLE cities ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));
ALTER TABLE cities ADD COLUMN submitted_by TEXT;
ALTER TABLE cities ADD COLUMN reviewed_by TEXT;
ALTER TABLE cities ADD COLUMN published_by TEXT;

-- Add workflow fields to travel_offices
ALTER TABLE travel_offices ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived'));
ALTER TABLE travel_offices ADD COLUMN submitted_by TEXT;
ALTER TABLE travel_offices ADD COLUMN reviewed_by TEXT;
ALTER TABLE travel_offices ADD COLUMN published_by TEXT;

-- Add is_company_office flag to travel_offices
ALTER TABLE travel_offices ADD COLUMN is_company_office BOOLEAN DEFAULT 0;

-- ============================================
-- 6. ACTIVITY LOG (سجل النشاط)
-- ============================================
-- Enhanced audit log (already exists, but we'll add fields if needed)
ALTER TABLE audit_log ADD COLUMN action_type TEXT; -- create, update, delete, publish, approve, reject
ALTER TABLE audit_log ADD COLUMN resource_type TEXT; -- country, province, city, destination, event, office
ALTER TABLE audit_log ADD COLUMN changes_summary TEXT; -- Human-readable summary

-- ============================================
-- 7. NOTIFICATIONS TABLE (الإشعارات)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('content_submitted', 'content_approved', 'content_rejected', 'content_published', 'assignment', 'system', 'alert')),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_fr TEXT NOT NULL,
    resource_type TEXT, -- country, province, city, destination, event, office
    resource_id TEXT,
    action_url TEXT, -- URL to navigate when clicked
    is_read BOOLEAN DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 8. REPORTS TABLE (التقارير)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    report_type TEXT NOT NULL CHECK (report_type IN ('country', 'province', 'city', 'destination', 'office', 'event', 'custom')),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    filters TEXT, -- JSON object with filter criteria
    generated_by TEXT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_snapshot TEXT, -- JSON snapshot of report data
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_provinces_country_id ON provinces(country_id);
CREATE INDEX IF NOT EXISTS idx_provinces_is_active ON provinces(is_active);
CREATE INDEX IF NOT EXISTS idx_cities_province_id ON cities(province_id);
CREATE INDEX IF NOT EXISTS idx_destinations_city_id ON destinations(city_id);
CREATE INDEX IF NOT EXISTS idx_destinations_province_id ON destinations(province_id);
CREATE INDEX IF NOT EXISTS idx_destinations_country_id ON destinations(country_id);
CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_coordinates ON destinations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_destination_id ON events(destination_id);
CREATE INDEX IF NOT EXISTS idx_events_city_id ON events(city_id);
CREATE INDEX IF NOT EXISTS idx_events_country_id ON events(country_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_scope ON user_roles(scope_country_id, scope_province_id, scope_office_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_travel_offices_is_company ON travel_offices(is_company_office);
CREATE INDEX IF NOT EXISTS idx_travel_offices_status ON travel_offices(status);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_provinces_timestamp 
    AFTER UPDATE ON provinces
    BEGIN
        UPDATE provinces SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_destinations_timestamp 
    AFTER UPDATE ON destinations
    BEGIN
        UPDATE destinations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_events_timestamp 
    AFTER UPDATE ON events
    BEGIN
        UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default roles
INSERT OR IGNORE INTO roles (id, name_ar, name_en, name_fr, code, is_system_role) VALUES
('role_001', 'مدير عام', 'Global Admin', 'Administrateur Global', 'global_admin', 1),
('role_002', 'مشرف دولة', 'Country Supervisor', 'Superviseur de Pays', 'country_supervisor', 1),
('role_003', 'مدير محافظة', 'Province Manager', 'Gestionnaire de Province', 'province_manager', 1),
('role_004', 'مدير مكتب', 'Office Manager', 'Gestionnaire de Bureau', 'office_manager', 1),
('role_005', 'محرر محتوى', 'Content Editor', 'Éditeur de Contenu', 'content_editor', 1),
('role_006', 'ناشر', 'Publisher', 'Éditeur', 'publisher', 1);

-- Insert default permissions
INSERT OR IGNORE INTO permissions (id, name_ar, name_en, name_fr, code, resource_type, action) VALUES
-- Country permissions
('perm_001', 'إدارة الدول', 'Manage Countries', 'Gérer les Pays', 'manage_countries', 'country', 'all'),
('perm_002', 'عرض الدول', 'View Countries', 'Voir les Pays', 'view_countries', 'country', 'read'),
-- Province permissions
('perm_003', 'إدارة المحافظات', 'Manage Provinces', 'Gérer les Provinces', 'manage_provinces', 'province', 'all'),
('perm_004', 'عرض المحافظات', 'View Provinces', 'Voir les Provinces', 'view_provinces', 'province', 'read'),
-- City permissions
('perm_005', 'إدارة المدن', 'Manage Cities', 'Gérer les Villes', 'manage_cities', 'city', 'all'),
('perm_006', 'عرض المدن', 'View Cities', 'Voir les Villes', 'view_cities', 'city', 'read'),
-- Destination permissions
('perm_007', 'إدارة الوجهات', 'Manage Destinations', 'Gérer les Destinations', 'manage_destinations', 'destination', 'all'),
('perm_008', 'عرض الوجهات', 'View Destinations', 'Voir les Destinations', 'view_destinations', 'destination', 'read'),
-- Event permissions
('perm_009', 'إدارة الفعاليات', 'Manage Events', 'Gérer les Événements', 'manage_events', 'event', 'all'),
('perm_010', 'عرض الفعاليات', 'View Events', 'Voir les Événements', 'view_events', 'event', 'read'),
-- Office permissions
('perm_011', 'إدارة المكاتب', 'Manage Offices', 'Gérer les Bureaux', 'manage_offices', 'office', 'all'),
('perm_012', 'عرض المكاتب', 'View Offices', 'Voir les Bureaux', 'view_offices', 'office', 'read'),
-- Workflow permissions
('perm_013', 'نشر المحتوى', 'Publish Content', 'Publier le Contenu', 'publish_content', 'all', 'publish'),
('perm_014', 'الموافقة على المحتوى', 'Approve Content', 'Approuver le Contenu', 'approve_content', 'all', 'approve'),
('perm_015', 'رفض المحتوى', 'Reject Content', 'Rejeter le Contenu', 'reject_content', 'all', 'reject'),
-- Reports permissions
('perm_016', 'عرض التقارير', 'View Reports', 'Voir les Rapports', 'view_reports', 'report', 'read'),
('perm_017', 'إنشاء التقارير', 'Create Reports', 'Créer des Rapports', 'create_reports', 'report', 'create'),
-- User management
('perm_018', 'إدارة المستخدمين', 'Manage Users', 'Gérer les Utilisateurs', 'manage_users', 'user', 'all');

-- Assign permissions to Global Admin (all permissions)
INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role_001', id FROM permissions;

-- Assign basic permissions to other roles (can be customized)
-- Country Supervisor: manage their country's content
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_002', 'perm_002'), ('role_002', 'perm_004'), ('role_002', 'perm_006'),
('role_002', 'perm_008'), ('role_002', 'perm_010'), ('role_002', 'perm_012'),
('role_002', 'perm_003'), ('role_002', 'perm_005'), ('role_002', 'perm_007'),
('role_002', 'perm_009'), ('role_002', 'perm_011');

-- Province Manager: manage their province
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_003', 'perm_004'), ('role_003', 'perm_006'), ('role_003', 'perm_008'),
('role_003', 'perm_010'), ('role_003', 'perm_012'), ('role_003', 'perm_005'),
('role_003', 'perm_007'), ('role_003', 'perm_009'), ('role_003', 'perm_011');

-- Office Manager: manage their office
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_004', 'perm_012'), ('role_004', 'perm_011');

-- Content Editor: create and edit content
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_005', 'perm_006'), ('role_005', 'perm_008'), ('role_005', 'perm_010'),
('role_005', 'perm_005'), ('role_005', 'perm_007'), ('role_005', 'perm_009');

-- Publisher: approve and publish content
INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES
('role_006', 'perm_002'), ('role_006', 'perm_004'), ('role_006', 'perm_006'),
('role_006', 'perm_008'), ('role_006', 'perm_010'), ('role_006', 'perm_012'),
('role_006', 'perm_013'), ('role_006', 'perm_014'), ('role_006', 'perm_015');

