import { defineConfig } from "@playwright/test";

const baseURL = process.env.CRAWL_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const shouldAutoStartLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseURL)
  && (process.env.CRAWL_AUTOSTART_LOCAL ?? "true").toLowerCase() !== "false";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: shouldAutoStartLocal
    ? {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180000,
      }
    : undefined,
});
