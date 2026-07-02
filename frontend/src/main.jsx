import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/reset.css";
import "@/styles/base.css";
import "@/styles/navbar.css";
import "@/styles/hero.css";
import "@/styles/components.css";

const Root = import.meta.env.DEV ? (
  <React.StrictMode>
    <App />
  </React.StrictMode>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById("root")).render(Root);
