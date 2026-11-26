// @ts-check
// Playwright test runner for the static site in dist/ (no build step).
// Run: npx playwright test            (all projects)
//      npx playwright test --project=desktop
//      SKIP_EXTERNAL=1 npx playwright test   (skip the network check of external links)
//
// Tag routing (see tests/README.md):
//   untagged     -> desktop only (logic, URL state, crawls, multi-width loops)
//   @responsive  -> desktop + tablet + mobile (axe, console/network health, CLS, deep links)
//   @motion      -> reduced-motion project only (prefers-reduced-motion: reduce)
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8408;
const BASE = `http://127.0.0.1:${PORT}/`;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata',
  },
  webServer: {
    // = `python -m http.server ${PORT} --bind 127.0.0.1 --directory dist`, with a larger
    // listen backlog (the stock server refuses connections under parallel workers).
    command: `python tests/serve.py ${PORT} dist`,
    url: BASE + 'index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: 'ignore',
    stderr: 'ignore',
  },
  projects: [
    {
      name: 'desktop',
      grepInvert: /@motion/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
    {
      name: 'tablet',
      grep: /@responsive/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, hasTouch: true },
    },
    {
      name: 'mobile',
      grep: /@responsive/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    ...['firefox', 'webkit'].map((browserName) => ({
      name: browserName,
      grep: /@engines/,
      use: { browserName, viewport: { width: 1440, height: 900 } },
    })),
    {
      name: 'reduced-motion',
      grep: /@motion/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      },
    },
  ],
});
