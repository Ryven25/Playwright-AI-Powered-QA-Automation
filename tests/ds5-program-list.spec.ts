import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { LoginPage } from '../pages/didaxis/login.page';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import { AUTH_ROUTES, EMPTY_STORAGE_STATE } from '../support/auth.constants';

test.describe('DS-5: Program List Display - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Programs page shows heading and description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await expect(programs.heading).toBeVisible();
    await expect(programs.pageDescription).toBeVisible();
  });

  test('TC-02: Program list displays as a table with Program column', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await expect(programs.table).toBeVisible();
    await expect(programs.programColumnHeader).toBeVisible();
  });

  test('TC-03: Each program shows its name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `List Display ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Visible in list');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-04: Each program shows its description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Desc Check ${Date.now()}`;
    const description = `Unique desc ${Date.now()}`;
    await createProgramAndTrack(programs, name, description);
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-05: Each program row has Edit and Delete action buttons', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Actions Check ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.editButton(name)).toBeVisible();
    await expect(programs.deleteButton(name)).toBeVisible();
  });

  test('TC-06: New Program button is always visible', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await expect(programs.newProgramButton).toBeVisible();
  });
});

test.describe('DS-5: Program List Display - Negative Flows', () => {
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test('TC-07: Programs page redirects to login without auth', async ({ page }) => {
    await page.goto(AUTH_ROUTES.programs);

    await page.waitForURL(/\/login/, { timeout: 10000 });

    const login = new LoginPage(page);
    await expect(login.signInButton).toBeVisible();
  });
});

test.describe('DS-5: Program List Display - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-08: Program with very long name displays correctly', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const ts = Date.now();
    const longName = `LongName${ts}${'X'.repeat(80)}`;
    await createProgramAndTrack(programs, longName);
    await expect(programs.programText(`LongName${ts}`)).toBeVisible();
  });

  test('TC-09: Program without description displays name only', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `No Desc ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-10: Newly created program appears at the top of the list', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Latest ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Should be first');

    await expect(programs.firstDataRow()).toContainText(name);
  });
});
