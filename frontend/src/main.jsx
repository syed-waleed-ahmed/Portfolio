import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// ✅ Safari polyfill: requestIdleCallback
if (typeof window !== "undefined" && !("requestIdleCallback" in window)) {
  window.requestIdleCallback = function (cb) {
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50),
      });
    }, 1);
  };

  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

// Bootstrap first
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Then your custom styles (overrides bootstrap)
import "./index.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
