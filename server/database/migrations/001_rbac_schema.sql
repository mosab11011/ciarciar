-- RBAC-ready schema for tourism/admin platform
-- Compatible with SQLite; for PostgreSQL replace CURRENT_TIMESTAMP with NOW() as needed.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS countries (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  main_image TEXT,
  flag TEXT,
  currency TEXT,
  language TEXT,
  timezone TEXT,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  rating REAL DEFAULT 4.5 CHECK (rating BETWEEN 0 AND 5),
  total_reviews INTEGER DEFAULT 0,
  total_tours INTEGER DEFAULT 0,
  total_hotels INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  image TEXT,
  best_time_ar TEXT,
  best_time_en TEXT,
  best_time_fr TEXT,
  rating REAL DEFAULT 4.3 CHECK (rating BETWEEN 0 AND 5),
  attractions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offices (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  latitude REAL,
  longitude REAL,
  rating REAL DEFAULT 4.3 CHECK (rating BETWEEN 0 AND 5),
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS office_services (
  office_id TEXT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (office_id, service_id)
);

CREATE TABLE IF NOT EXISTS attractions (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  image TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT DEFAULT 'image',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_offices_city ON offices(city_id);
CREATE INDEX IF NOT EXISTS idx_attractions_city ON attractions(city_id);

