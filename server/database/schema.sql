-- Tarhal Travel Website Database Schema
-- Created for managing countries, travel offices, users, and bookings

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    capital_ar TEXT NOT NULL,
    capital_en TEXT NOT NULL,
    capital_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    continent TEXT NOT NULL CHECK (continent IN ('africa', 'asia', 'europe', 'america', 'oceania')),
    main_image TEXT NOT NULL,
    gallery TEXT, -- JSON array of image URLs
    currency_ar TEXT NOT NULL,
    currency_en TEXT NOT NULL,
    currency_fr TEXT NOT NULL,
    language_ar TEXT NOT NULL,
    language_en TEXT NOT NULL,
    language_fr TEXT NOT NULL,
    best_time_ar TEXT NOT NULL,
    best_time_en TEXT NOT NULL,
    best_time_fr TEXT NOT NULL,
    rating REAL DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    total_tours INTEGER DEFAULT 0,
    highlights_ar TEXT, -- JSON array
    highlights_en TEXT, -- JSON array
    highlights_fr TEXT, -- JSON array
    culture_ar TEXT, -- JSON array
    culture_en TEXT, -- JSON array
    culture_fr TEXT, -- JSON array
    cuisine_ar TEXT, -- JSON array
    cuisine_en TEXT, -- JSON array
    cuisine_fr TEXT, -- JSON array
    transportation_ar TEXT, -- JSON array
    transportation_en TEXT, -- JSON array
    transportation_fr TEXT, -- JSON array
    safety_ar TEXT, -- JSON array
    safety_en TEXT, -- JSON array
    safety_fr TEXT, -- JSON array
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    image TEXT NOT NULL,
    attractions_ar TEXT, -- JSON array
    attractions_en TEXT, -- JSON array
    attractions_fr TEXT, -- JSON array
    best_time_ar TEXT NOT NULL,
    best_time_en TEXT NOT NULL,
    best_time_fr TEXT NOT NULL,
    duration_ar TEXT NOT NULL,
    duration_en TEXT NOT NULL,
    duration_fr TEXT NOT NULL,
    rating REAL DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Travel Offices table
CREATE TABLE IF NOT EXISTS travel_offices (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    address_ar TEXT NOT NULL,
    address_en TEXT NOT NULL,
    address_fr TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    manager_ar TEXT,
    manager_en TEXT,
    manager_fr TEXT,
    services_ar TEXT, -- JSON array
    services_en TEXT, -- JSON array
    services_fr TEXT, -- JSON array
    working_hours_ar TEXT NOT NULL,
    working_hours_en TEXT NOT NULL,
    working_hours_fr TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    rating REAL DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    language_preference TEXT DEFAULT 'ar' CHECK (language_preference IN ('ar', 'en', 'fr')),
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price_usd REAL NOT NULL,
    max_participants INTEGER DEFAULT 20,
    difficulty_level TEXT DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'moderate', 'hard')),
    includes_ar TEXT, -- JSON array
    includes_en TEXT, -- JSON array
    includes_fr TEXT, -- JSON array
    itinerary_ar TEXT, -- JSON array of daily plans
    itinerary_en TEXT, -- JSON array of daily plans
    itinerary_fr TEXT, -- JSON array of daily plans
    images TEXT, -- JSON array of image URLs
    rating REAL DEFAULT 4.5 CHECK (rating >= 1 AND rating <= 5),
    reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Travel Offers table
CREATE TABLE IF NOT EXISTS travel_offers (
    id TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_fr TEXT NOT NULL,
    original_price REAL NOT NULL,
    discount_price REAL NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    duration_days INTEGER,
    duration_text_ar TEXT,
    duration_text_en TEXT,
    duration_text_fr TEXT,
    start_date DATE,
    end_date DATE,
    valid_until DATE,
    max_participants INTEGER DEFAULT 20,
    includes_ar TEXT, -- JSON array
    includes_en TEXT, -- JSON array
    includes_fr TEXT, -- JSON array
    highlights_ar TEXT, -- JSON array
    highlights_en TEXT, -- JSON array
    highlights_fr TEXT, -- JSON array
    images TEXT, -- JSON array of image URLs
    main_image TEXT,
    currency TEXT DEFAULT 'USD',
    is_featured BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    tour_id TEXT,
    office_id TEXT,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('tour', 'consultation', 'custom')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_amount REAL,
    currency TEXT DEFAULT 'USD',
    participants INTEGER DEFAULT 1,
    travel_date DATE,
    special_requests TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE SET NULL,
    FOREIGN KEY (office_id) REFERENCES travel_offices(id) ON DELETE SET NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    country_id TEXT,
    tour_id TEXT,
    office_id TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title_ar TEXT,
    title_en TEXT,
    title_fr TEXT,
    comment_ar TEXT,
    comment_en TEXT,
    comment_fr TEXT,
    is_verified BOOLEAN DEFAULT 0,
    is_approved BOOLEAN DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (office_id) REFERENCES travel_offices(id) ON DELETE CASCADE
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    replied_at DATETIME,
    replied_by TEXT,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter Subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    language_preference TEXT DEFAULT 'ar' CHECK (language_preference IN ('ar', 'en', 'fr')),
    is_active BOOLEAN DEFAULT 1,
    unsubscribe_token TEXT UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings table (for website customization)
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'site_config',
    -- Colors
    primary_color TEXT DEFAULT '#1e40af',
    secondary_color TEXT DEFAULT '#f97316',
    background_color TEXT DEFAULT '#ffffff',
    header_background_color TEXT DEFAULT '#0f172a',
    -- Header Video
    header_video_url TEXT,
    header_video_poster TEXT,
    -- Background Images
    header_background_images TEXT, -- JSON array
    discover_section_background_image TEXT,
    features_section_background_image TEXT,
    -- Component Order (JSON array of component IDs in order)
           component_order TEXT DEFAULT '["hero","travel-offices","discover","features","about","destinations","testimonials","payment-methods","statistics","newsletter","services","map","contact","gallery","blog","partners","awards","team","faq","pricing","reviews","social-media","video-gallery","timeline","countdown","promotions","live-chat","weather-widget","currency-converter"]',
    -- Other settings
    settings_json TEXT, -- JSON for additional flexible settings
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_countries_continent ON countries(continent);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_is_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_travel_offices_country_id ON travel_offices(country_id);
CREATE INDEX IF NOT EXISTS idx_travel_offices_is_active ON travel_offices(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tours_country_id ON tours(country_id);
CREATE INDEX IF NOT EXISTS idx_tours_is_active ON tours(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_country_id ON reviews(country_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_office_id ON reviews(office_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_countries_timestamp 
    AFTER UPDATE ON countries
    BEGIN
        UPDATE countries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_cities_timestamp 
    AFTER UPDATE ON cities
    BEGIN
        UPDATE cities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_travel_offices_timestamp 
    AFTER UPDATE ON travel_offices
    BEGIN
        UPDATE travel_offices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_tours_timestamp 
    AFTER UPDATE ON tours
    BEGIN
        UPDATE tours SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_bookings_timestamp 
    AFTER UPDATE ON bookings
    BEGIN
        UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_reviews_timestamp 
    AFTER UPDATE ON reviews
    BEGIN
        UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_contact_messages_timestamp 
    AFTER UPDATE ON contact_messages
    BEGIN
        UPDATE contact_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name, role, language_preference
) VALUES (
    'admin_001',
    'admin',
    'admin@tarhal.com',
    '$2b$10$K7LXK7LX7LXK7LXK7LXK7u', -- This should be properly hashed in production
    'System',
    'Administrator',
    'admin',
    'ar'
);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (key, value, description, is_public) VALUES
('site_name', 'CIAR', 'Website name', 1),
('site_description', 'شركة CIAR للخدمات العقارية', 'Website description', 1),
('contact_email', 'info@tarhal.com', 'Main contact email', 1),
('contact_phone', '+249 123 456 789', 'Main contact phone', 1),
('max_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 0),
('default_language', 'ar', 'Default website language', 1),
('maintenance_mode', 'false', 'Website maintenance mode', 0),
('registration_enabled', 'true', 'User registration enabled', 0),
('email_verification_required', 'false', 'Email verification required for new users', 0);
