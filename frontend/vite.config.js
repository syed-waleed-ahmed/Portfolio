import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    // Fixed at build time so the prerendered HTML and the hydrating client
    // always print the same footer year. See Footer.jsx.
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  // No explicit build.target, so Vite's default applies: Chrome and Edge 111,
  // Firefox 114, Safari 16.4. The build flattens CSS nesting and adds vendor
  // prefixes for those. It cannot stand in for subgrid, :has() or color-mix(),
  // which ship as written, so the browsers that draw the page as designed are
  // newer than the target: subgrid needs Chrome 117, :has() Firefox 121.
});
