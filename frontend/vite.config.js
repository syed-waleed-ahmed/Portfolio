import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // Keep your PWA setup
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Syed Waleed Ahmed",
        short_name: "SWA",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#020617",
        theme_color: "#0b1220",
        icons: [
          { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  build: {
    target: "es2018",
  },
});
