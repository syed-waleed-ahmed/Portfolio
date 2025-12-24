import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // ✅ Safari / older browser compatibility
    legacy({
      targets: ["defaults", "safari >= 13", "ios >= 13"],
      modernPolyfills: true,
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),

    // ✅ Keep your PWA setup
    VitePWA({
      registerType: "autoUpdate",
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
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  // ✅ Good baseline targets for Safari
  build: {
    target: "es2017",
    sourcemap: true,
  },
});
