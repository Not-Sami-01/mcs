import { defineConfig, devices } from '@playwright/test'

// Keep this in step with NEXT_PUBLIC_SITE_URL so Payload's CSRF checks and
// Next's Server Action origin check accept the test browser's origin.
const baseURL = 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      SITE_ENV: 'staging',
      DATABASE_URL:
        process.env.DATABASE_URL ?? 'postgresql://mcs:mcs_dev_password@127.0.0.1:5432/mcs',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? 'playwright-local-only-secret',
    },
  },
})
