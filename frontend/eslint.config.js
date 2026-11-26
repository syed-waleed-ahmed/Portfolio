import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "dist-server", "playwright-report", "test-results", ".wrangler"]),
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, __BUILD_YEAR__: "readonly" },
    },
  },
  {
    files: ["src/**/*.tsx"],
    // The two entry points export render data, not components.
    ignores: ["src/main.tsx", "src/entry-server.tsx"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  },
  // Build scripts, tests and the Worker run outside the browser.
  {
    files: ["*.config.{js,ts}", "scripts/**", "test/**", "e2e/**", "worker/**"],
    languageOptions: { globals: globals.node },
  },
]);
