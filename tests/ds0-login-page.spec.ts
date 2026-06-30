import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/didaxis/login.page';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import { AUTH_ROUTES, EMPTY_STORAGE_STATE } from '../support/auth.constants';

test.describe('Login page', () => {
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test('TC-01: Login page displays the sign-in form', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await expect(login.tagline).toBeVisible();
    await expect(login.email).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(login.signInButton).toBeVisible();
  });

  test('TC-02: Unauthenticated visit to programs redirects to login', async ({ page }) => {
    await page.goto(AUTH_ROUTES.programs);

    await page.waitForURL(/\/login/, { timeout: 10000 });

    const login = new LoginPage(page);
    await expect(login.signInButton).toBeVisible();
  });

  test('TC-03: Valid credentials sign in and reach programs', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn(process.env.DIDAXIS_EMAIL!, process.env.DIDAXIS_PASSWORD!);

    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible({ timeout: 15000 });
  });
});
