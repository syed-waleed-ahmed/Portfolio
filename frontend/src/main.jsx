import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ✅ requestIdleCallback polyfill (more realistic + supports {timeout})
if (typeof window !== "undefined" && !("requestIdleCallback" in window)) {
  window.requestIdleCallback = function (cb, options) {
    const start = Date.now();
    const timeout = typeof options?.timeout === "number" ? options.timeout : 1000;

    return setTimeout(() => {
      cb({
        didTimeout: Date.now() - start >= timeout,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 500); // don't fire "idle" instantly
  };

  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

// Styles first (CSS is render-blocking anyway; keep order intentional)
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

// ❗Bootstrap JS: lazy-load after idle to reduce startup JS cost
if (typeof window !== "undefined") {
  const loadBootstrapJS = async () => {
    try {
      await import("bootstrap/dist/js/bootstrap.bundle.min.js");
    } catch {
      // ignore
    }
  };

  // Also defer decorative background images until after idle
  const enableBackgrounds = () => document.body.classList.add("bg-ready");

  const id =
    "requestIdleCallback" in window
      ? window.requestIdleCallback(() => { loadBootstrapJS(); enableBackgrounds(); }, { timeout: 4000 })
      : window.setTimeout(() => { loadBootstrapJS(); enableBackgrounds(); }, 3000);

  // No cleanup needed for module import; keep it simple
  void id;
}

const Root = (
  // Enable StrictMode only in development to reduce startup work in production
  import.meta.env.DEV ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(Root);