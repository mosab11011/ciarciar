import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import paymentsRouter from "./routes/payments";
import countriesRouter from "./routes/countries";
import countriesSeedRouter from "./routes/countries-seed";
import travelOfficesRouter from "./routes/travel-offices";
import citiesRouter from "./routes/cities";
import travelOffersRouter from "./routes/travel-offers";
import travelOffersSeedRouter from "./routes/travel-offers-seed";
import provincesRouter from "./routes/provinces";
import destinationsRouter from "./routes/destinations";
import eventsRouter from "./routes/events";
import { getSiteSettings, updateSiteSettings, resetSiteSettings } from "./routes/site-settings";
import authRouter from "./routes/auth";

export function createServer() {
  const app = express();

  // Determine environment
  const isProduction = process.env.NODE_ENV === 'production';

  // CORS configuration - more permissive in production (behind reverse proxy)
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // In production behind reverse proxy, allow all origins
      // The reverse proxy handles security
      if (isProduction) {
        callback(null, true);
        return;
      }
      // In development, allow localhost
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
        return;
      }
      // Optional: Check against allowed origins from env
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, true); // Allow by default
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  app.use(cors(corsOptions));
  
  // Request logging - only in development or when DEBUG env is set
  if (!isProduction || process.env.DEBUG === 'true') {
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      }
      next();
    });
  }
  
  // Ensure API routes always return JSON, never HTML
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      // Set JSON content type for all API routes
      res.setHeader('Content-Type', 'application/json');
    }
    next();
  });
  
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });
  app.use(express.urlencoded({ extended: true }));
  
  // API routes - MUST be registered BEFORE static files to avoid conflicts

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // Auth routes - register before other routes
  app.use("/api/auth", authRouter);
  
  // Test route to verify auth endpoint is accessible
  app.post("/api/auth/login-test", (req, res) => {
    console.log("Login test endpoint hit");
    res.json({ success: true, message: "Auth endpoint is accessible" });
  });
  app.use("/api/payments", paymentsRouter);
  app.use("/api/countries", countriesRouter);
  app.use("/api/countries", countriesSeedRouter); // Seed endpoint
  app.use("/api/travel-offices", travelOfficesRouter);
  app.use("/api/travel-offers", travelOffersRouter);
  app.use("/api/travel-offers", travelOffersSeedRouter); // Seed endpoint
  app.use("/api/cities", citiesRouter);
  app.use("/api/provinces", provincesRouter);
  app.use("/api/destinations", destinationsRouter);
  app.use("/api/events", eventsRouter);
  
  // Site Settings routes
  app.get("/api/site-settings", getSiteSettings);
  app.put("/api/site-settings", updateSiteSettings);
  app.post("/api/site-settings/reset", resetSiteSettings);

  // Serve static files from public folder (images, etc.)
  // MUST be after all API routes to avoid conflicts
  
  // In production, static files are handled in node-build.ts
  // Only serve static files here in development
  
  if (!isProduction) {
    // In development: serve from client/public
    const publicPath = path.join(process.cwd(), 'client', 'public');
    app.use(express.static(publicPath));
    console.log('📁 [Dev] Serving static files from:', publicPath);
  } else {
    // In production: static files will be handled in node-build.ts
    console.log('📁 [Prod] Static files will be served from node-build.ts');
  }

  return app;
}
