import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: ".", // Root directory
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    copyPublicDir: true, // Ensure public directory is copied
    // GitHub Pages: use relative paths for assets
    assetsDir: "assets",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        // Use relative paths for assets to work on GitHub Pages
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // GitHub Pages: Use relative paths (empty string) for root domain
  // For subdirectory: base: '/repo-name/'
  base: process.env.GITHUB_PAGES_BASE || '/ciarciar/',
  publicDir: "client/public", // Explicitly set public directory
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // CRITICAL: Add Express app as middleware BEFORE Vite's SPA fallback
      // This ensures API routes are handled by Express, not Vite
      server.middlewares.use((req, res, next) => {
        // If it's an API route, handle it with Express
        if (req.url?.startsWith('/api/')) {
          return app(req, res, next);
        }
        // Otherwise, let Vite handle it (SPA routing, HMR, etc.)
        next();
      });
    },
  };
}
