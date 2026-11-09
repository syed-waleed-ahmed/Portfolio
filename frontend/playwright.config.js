import { defineConfig, devices } from "@playwright/test";

// Browser tests against the built, prerendered site, served under its real
// CSP by e2e/serve.mjs. Build first: npm run build, then npm run test:e2e.
// Chromium only: the suite checks this site's behaviour, not browser support.
const PORT = 4174;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Capped: every page draws the WebGL globe, which headless Chromium renders
  // in software, and a dozen at once starve each other into timeouts.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: Boolean(process.env.CI),
  // One retry in CI, where a shared runner can stall a frame; none locally,
  // so a flaky test shows up where it can be fixed.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node e2e/serve.mjs",
    url: `http://127.0.0.1:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
