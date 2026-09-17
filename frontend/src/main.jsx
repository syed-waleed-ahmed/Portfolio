import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// Styles first: this file declares the cascade-layer order, and it has to
// reach the bundle ahead of the CSS each component imports.
import "@/styles/index.css";
import App from "@/App.jsx";

const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered by scripts/prerender.mjs, so React attaches
// to markup that is already on screen. The dev server serves an empty root.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
