import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Validate required input fields
 */
export function validateInput(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }
    
    next();
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate rating (1-5)
 */
export function validateRating(rating: number): boolean {
  return rating >= 1 && rating <= 5;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Authenticate user with JWT token
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'tarhal_secret_key_change_in_production';
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    req.user = decoded as any;
    next();
  });
}

/**
 * Authenticate admin users only
 */
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    next();
  });
}

/**
 * Validate country data
 */
export function validateCountryData(req: Request, res: Response, next: NextFunction) {
  const { 
    name_ar, name_en, name_fr,
    capital_ar, capital_en, capital_fr,
    description_ar, description_en, description_fr,
    continent, main_image,
    currency_ar, currency_en, currency_fr,
    language_ar, language_en, language_fr,
    best_time_ar, best_time_en, best_time_fr,
    rating, gallery
  } = req.body;
  
  const errors: string[] = [];
  
  // Validate required multilingual fields
  if (!name_ar || !name_en || !name_fr) {
    errors.push('Country name is required in all languages');
  }
  
  if (!capital_ar || !capital_en || !capital_fr) {
    errors.push('Capital name is required in all languages');
  }
  
  if (!description_ar || !description_en || !description_fr) {
    errors.push('Description is required in all languages');
  }
  
  if (!currency_ar || !currency_en || !currency_fr) {
    errors.push('Currency is required in all languages');
  }
  
  if (!language_ar || !language_en || !language_fr) {
    errors.push('Language is required in all languages');
  }
  
  if (!best_time_ar || !best_time_en || !best_time_fr) {
    errors.push('Best time to visit is required in all languages');
  }
  
  // Validate continent
  const validContinents = ['africa', 'asia', 'europe', 'america', 'oceania'];
  if (!continent || !validContinents.includes(continent)) {
    errors.push('Valid continent is required');
  }
  
  // Validate main image URL
  if (!main_image || !validateURL(main_image)) {
    errors.push('Valid main image URL is required');
  }
  
  // Validate rating if provided
  if (rating !== undefined && !validateRating(rating)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  // Validate gallery URLs if provided
  if (gallery && Array.isArray(gallery)) {
    for (const imageUrl of gallery) {
      if (!validateURL(imageUrl)) {
        errors.push(`Invalid gallery image URL: ${imageUrl}`);
        break;
      }
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
}

/**
 * Validate travel office data
 */
export function validateOfficeData(req: Request, res: Response, next: NextFunction) {
  const {
    country_id, name_ar, name_en, name_fr,
    address_ar, address_en, address_fr,
    phone, email, website,
    working_hours_ar, working_hours_en, working_hours_fr,
    latitude, longitude, rating
  } = req.body;
  
  const errors: string[] = [];
  
  // Validate required fields
  if (!country_id) {
    errors.push('Country ID is required');
  }
  
  if (!name_ar || !name_en || !name_fr) {
    errors.push('Office name is required in all languages');
  }
  
  if (!address_ar || !address_en || !address_fr) {
    errors.push('Address is required in all languages');
  }
  
  if (!working_hours_ar || !working_hours_en || !working_hours_fr) {
    errors.push('Working hours are required in all languages');
  }
  
  // Validate phone
  if (!phone || !validatePhone(phone)) {
    errors.push('Valid phone number is required');
  }
  
  // Validate email
  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }
  
  // Validate website if provided
  if (website && !validateURL(website)) {
    errors.push('Valid website URL is required');
  }
  
  // Validate coordinates if provided
  if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }
  
  if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }
  
  // Validate rating if provided
  if (rating !== undefined && !validateRating(rating)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  
  next();
}

/**
 * Rate limiting middleware
 */
export function rateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowEnd = now + windowMs;
    
    const requestData = requests.get(ip);
    
    if (!requestData || now > requestData.resetTime) {
      requests.set(ip, { count: 1, resetTime: windowEnd });
      return next();
    }
    
    if (requestData.count >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }
    
    requestData.count++;
    next();
  };
}

/**
 * Error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      details: err.message
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
