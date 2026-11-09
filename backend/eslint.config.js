import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

// The same base as frontend/eslint.config.js, for Node instead of the browser.
// Correctness rules only: the backend is small, and its style is held by
// review and .editorconfig rather than a formatter.
export default defineConfig([
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
]);
