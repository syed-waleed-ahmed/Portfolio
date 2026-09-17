import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "@/App.jsx";

// Build-time only. `vite build --ssr` compiles this for Node, and
// scripts/prerender.mjs writes its output into dist/index.html. Nothing in the
// app suspends, so renderToString returns the complete page.
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
