import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.DEPLOYMENT_URL || "http://localhost:3000";

// Vercel deployment protection bypass for CI
// Set VERCEL_AUTOMATION_BYPASS_SECRET in GitHub Actions secrets
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHTTPHeaders: Record<string, string> = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: { timeout: process.env.CI ? 15_000 : 5_000 },
  reporter: process.env.CI
    ? [["github"], ["json", { outputFile: "test-results/results.json" }], ["html", { open: "never" }]]
    : [["html", { open: "on-failure" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: process.env.CI ? 30_000 : 15_000,
    actionTimeout: process.env.CI ? 15_000 : 10_000,
    extraHTTPHeaders,
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: /responsive\.spec\.ts/,
    },
    {
      name: "dark-mode",
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
      },
      testMatch: /dark-mode\.spec\.ts/,
    },
  ],

  /* Start local server if no DEPLOYMENT_URL.
     Use production build (npm start) to avoid Turbopack dev-mode crashes.
     The build step is separate — run `npm run build` before `npx playwright test`. */
  ...(process.env.DEPLOYMENT_URL
    ? {}
    : {
        webServer: {
          command: "npm start",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 15_000,
        },
      }),
});
