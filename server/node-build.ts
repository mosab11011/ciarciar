import path from "path";
import fs from "fs";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

console.log('🔧 [Production] Starting server...');
console.log('🔧 [Production] Environment:', process.env.NODE_ENV);
console.log('🔧 [Production] Port:', port);

// CRITICAL: Add early middleware to catch ALL API requests
// This must be the FIRST middleware to ensure API routes are never served as static files
app.use((req, res, next) => {
  // Check both req.path and req.originalUrl to catch all variations
  const isApiRoute = req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/');
  
  if (isApiRoute) {
    // Only log in debug mode
    if (process.env.DEBUG === 'true') {
      console.log(`🔍 [Production] Early API detection: ${req.method} ${req.path} (original: ${req.originalUrl})`);
    }
    // Set JSON content type immediately
    res.setHeader('Content-Type', 'application/json');
    // Don't serve static files for API routes
    return next();
  }
  next();
});

// Add a direct test route to verify API is working
app.get('/api/health', (req, res) => {
  if (process.env.DEBUG === 'true') {
    console.log('✅ [Production] Health check endpoint hit');
  }
  res.json({ 
    success: true, 
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 3000
  });
});

// Paths for static files
const __filename = import.meta.url.replace('file://', '').replace(/\\/g, '/');
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../spa");
const distPathCwd = path.join(process.cwd(), "dist", "spa");
const actualDistPath = fs.existsSync(distPath) ? distPath : distPathCwd;

// CRITICAL: Ensure API routes are handled BEFORE static files
// Add middleware to catch API routes early and ensure JSON response
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    // Only log in debug mode
    if (process.env.DEBUG === 'true') {
      console.log(`🔍 [Production] API request detected: ${req.method} ${req.path}`);
    }
    // Ensure API routes always return JSON
    res.setHeader('Content-Type', 'application/json');
    // Let Express handle the API route (don't serve static files)
    return next();
  }
  next();
});

// Serve static files ONLY for non-API routes
if (fs.existsSync(actualDistPath)) {
  // Custom static middleware that skips API routes
  app.use((req, res, next) => {
    // Skip static files for API routes (double check)
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Use express.static for non-API routes
    express.static(actualDistPath, {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      index: false
    })(req, res, next);
  });
  console.log('✅ [Production] Static files from:', actualDistPath);
}

// Serve /yes directory
const yesPath = path.join(actualDistPath, 'yes');
if (fs.existsSync(yesPath)) {
  app.use('/yes', express.static(yesPath, { maxAge: '1y' }));
}

// Serve React app for all non-API routes (SPA fallback)
// CRITICAL: This must be LAST and must check for API routes
app.use((req, res, next) => {
  // API routes should never reach here - they should be handled by Express routes
  if (req.path.startsWith("/api/")) {
    console.error(`❌ [Production] API route not found: ${req.method} ${req.path}`);
    console.error(`❌ [Production] This means the route is not registered in server/index.ts`);
    // If we reach here, the API route doesn't exist
    res.status(404).json({ 
      success: false, 
      error: "API endpoint not found",
      path: req.path,
      method: req.method,
      message: "The API route is not registered. Please check server/index.ts"
    });
    return;
  }
  next();
});

app.get("*", (req, res) => {
  // Serve index.html for SPA routing
  const indexPath = path.join(actualDistPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('index.html not found. Run: npm run build');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
