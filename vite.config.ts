import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: ".", // Root directory

  // =========================
  // Development server config
  // =========================
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },

  // =========================
  // Build config (GitHub Pages)
  // =========================
  build: {
    outDir: "dist", // 👈 مهم جدًا لـ GitHub Pages
    emptyOutDir: true,
    copyPublicDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  // =========================
  // GitHub Pages base path
  // =========================
  base: "/ciarciar/",

  // =========================
  // Public assets
  // =========================
  publicDir: "client/public",

  // =========================
  // Plugins
  // =========================
  plugins: [
    react(),
    expressPlugin(), // يعمل فقط أثناء development
  ],

  // =========================
  // Aliases
  // =========================
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

// ===================================
// Express middleware (DEV only)
// ===================================
function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // ✔️ يعمل فقط في npm run dev
    configureServer(server) {
      const app = createServer();

      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/api/")) {
          return app(req, res, next);
        }
        next();
      });
    },
  };
}
