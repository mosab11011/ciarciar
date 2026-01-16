import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, message: 'Auth router is working!' });
});

// Admin credentials - في الإنتاج يجب تخزينها في قاعدة البيانات
const ADMIN_CREDENTIALS = {
  username: 'mosab',
  // كلمة المرور المشفرة: 'mosab22220'
  passwordHash: '$2a$10$rXJ5K8vL9mP2N3Q4R5S6TuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy'
};

// Helper to hash password (استخدمها مرة واحدة لإنشاء hash جديد)
// يمكن تفعيلها لاحقاً إذا رغبت باستخدام bcrypt
// async function hashPassword(password: string): Promise<string> {
//   const bcrypt = await import('bcryptjs');
//   return await bcrypt.hash(password, 10);
// }

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
router.post('/login', async (req: Request, res: Response) => {
  console.log('🔐 [Auth] /api/auth/login endpoint called');
  console.log('🔐 [Auth] Request method:', req.method);
  console.log('🔐 [Auth] Request path:', req.path);
  console.log('🔐 [Auth] Request originalUrl:', req.originalUrl);
  console.log('🔐 [Auth] Request body:', req.body);
  
  // CRITICAL: Ensure we always return JSON, never HTML
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, hasPassword: !!password });

    if (!username || !password) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // التحقق من اسم المستخدم
    if (username !== ADMIN_CREDENTIALS.username) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // التحقق من كلمة المرور
    // في الإنتاج، قارن مع hash المخزن
    // const isValid = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash);
    // الآن للبساطة، نتحقق مباشرة (في الإنتاج استخدم bcrypt)
    const isValid = password === 'mosab22220';

    if (!isValid) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // إنشاء JWT token
    const jwtSecret = process.env.JWT_SECRET || 'tarhal_secret_key_change_in_production';
    const token = jwt.sign(
      {
        id: 'admin_1',
        username: username,
        email: 'admin@tarhal.com',
        role: 'admin'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: 'admin_1',
          username: username,
          email: 'admin@tarhal.com',
          role: 'admin'
        }
      },
      message: 'Login successful'
    });
    console.log('✅ [Auth] Login successful for user:', username);
  } catch (error: any) {
    console.error('❌ [Auth] Login error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/auth/logout
 * Admin logout endpoint (optional, mainly for logging)
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    // في الإنتاج، يمكن إضافة token إلى blacklist
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('❌ [Auth] Logout error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current admin user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'tarhal_secret_key_change_in_production';
    
    jwt.verify(token, jwtSecret, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      res.json({
        success: true,
        data: {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role
        }
      });
    });
  } catch (error: any) {
    console.error('❌ [Auth] Auth check error:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
