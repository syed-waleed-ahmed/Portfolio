import { defineConfig, devices } from "@playwright/test";

// Browser tests against the built, prerendered site, served under its real
// headers by e2e/serve.mjs. Build first: npm run build, then npm run test:e2e.
//
// E2E_BASE_URL points the same suite at a deployed origin instead:
//   E2E_BASE_URL=https://syedwaleedahmed.me npm run test:e2e
// That is safe against production: the suite answers the contact API itself
// and never sends a real message.
const PORT = 4174;
const REMOTE = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: REMOTE || `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // CI runs all three. WebKit needs E2E_NO_UPGRADE=1 (see e2e/serve.mjs).
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: REMOTE
    ? undefined
    : {
        command: "node e2e/serve.mjs",
        url: `http://127.0.0.1:${PORT}`,
        env: { PORT: String(PORT) },
        reuseExistingServer: !process.env.CI,
      },
});
