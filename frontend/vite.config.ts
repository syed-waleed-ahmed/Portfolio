import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The contact form posts to /api/contact on its own origin. In development
  // that is the Worker run by `npm run dev:api` (wrangler dev), never the
  // production API.
  server: {
    proxy: { "/api": "http://127.0.0.1:8787" },
  },
  define: {
    // Fixed at build time so the prerendered HTML and the hydrating client
    // print the same year.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
});
