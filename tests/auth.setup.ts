import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { LoginPage } from '../pages/didaxis/login.page';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import {
  AUTH_DIR,
  AUTH_FILE,
  AUTH_ROUTES,
  AUTH_SETUP_TEST,
} from '../support/auth.constants';

setup(AUTH_SETUP_TEST, async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.signIn(process.env.DIDAXIS_EMAIL!, process.env.DIDAXIS_PASSWORD!);

  const programs = new ProgramsPage(page);
  await page.goto(AUTH_ROUTES.programs);
  await page.waitForLoadState('networkidle');
  await expect(programs.heading).toBeVisible({ timeout: 15000 });

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
