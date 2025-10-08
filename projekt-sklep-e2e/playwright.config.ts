import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Full-Stack E2E Testing
 *
 * This is a standalone e2e test project that tests the entire application:
 * - Frontend (React + Vite)
 * - Backend (NestJS API)
 * - Database (SQLite)
 *
 * Educational concepts:
 * - Separation of e2e tests from application code
 * - Multi-server coordination
 * - Test isolation and database management
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of workers (parallel test execution)
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for page.goto('/')
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time for each action
    actionTimeout: 10 * 1000,

    // Maximum time for each navigation
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run both frontend and backend servers before starting tests
  webServer: [
    {
      // Backend API server (NestJS)
      command: 'cd ../projekt-sklep-api && npm run start:dev',
      url: 'http://localhost:9000/api/products',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Frontend dev server (Vite)
      command: 'cd ../projekt-sklep-ui && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});