import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { AUTH_SETUP_PROJECT, AUTH_STORAGE_STATE } from './support/auth.constants';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalSetup: './support/global-setup.ts',
  globalTeardown: './support/global-teardown.ts',
  reporter: [
    ['html'],
    ['./reporters/failure-summary-reporter.ts'],
  ],
  use: {
    baseURL: process.env.DIDAXIS_URL,
    trace: 'on',
  },
  projects: [
    {
      name: AUTH_SETUP_PROJECT,
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'didaxis',
      testMatch: /ds.*\.spec\.ts/,
      testIgnore: /auth\.setup\.ts/,
      dependencies: [AUTH_SETUP_PROJECT],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STORAGE_STATE,
      },
    },
    {
      name: 'chromium',
      testMatch: /(positive|negative|edge)-(flows|cases)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
