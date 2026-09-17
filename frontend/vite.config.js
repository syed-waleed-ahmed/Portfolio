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
  // No explicit build.target: Vite's default (Baseline widely available) is
  // what the CSS already requires - subgrid, :has(), color-mix(), nesting.
});
