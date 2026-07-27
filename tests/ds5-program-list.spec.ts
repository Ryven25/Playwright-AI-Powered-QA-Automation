import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { LoginPage } from '../pages/didaxis/login.page';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import { AUTH_ROUTES, EMPTY_STORAGE_STATE } from '../support/auth.constants';

test.describe('DS-5: Program list filtering and display - Happy paths', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Display program list with key details', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `List Display ${Date.now()}`;
    const description = `Key details ${Date.now()}`;

    await createProgramAndTrack(programs, name, description);

    await expect(programs.heading).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
    await expect(programs.table).toBeVisible();
    await expect(programs.programColumnHeader).toBeVisible();
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-02: Newly created program appears in the list with name and description', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Web Development ${Date.now()}`;
    const description = `Full-stack web development program ${Date.now()}`;

    await createProgramAndTrack(programs, name, description);

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-03: Empty state when no programs exist', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.mockEmptyProgramsList();
    await programs.goto();

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.emptyStateCreateButton).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });
});

test.describe('DS-5: Program list filtering and display - Negative', () => {
  test('TC-04: Empty state does not show a data table of programs', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.mockEmptyProgramsList();
    await programs.goto();

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.table).toHaveCount(0);
  });

  test('TC-05: Deleted program no longer appears in the list', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();

    const name = `Temp List Program ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'To be deleted from list');
    await expect(programs.programText(name)).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await programs.clickDelete(name);

    await expect(programs.programText(name)).toHaveCount(0);
  });
});

test.describe('DS-5: Program list filtering and display - Unauthenticated', () => {
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test('TC-06: Programs page redirects to login without auth', async ({ page }) => {
    await page.goto(AUTH_ROUTES.programs);
    await page.waitForURL(/\/login/, { timeout: 10000 });

    const login = new LoginPage(page);
    await expect(login.signInButton).toBeVisible();
  });
});

test.describe('DS-5: Program list filtering and display - Edge cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-07: Program with special characters displays correctly in the list', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    const description = `Special chars display ${Date.now()}`;

    await createProgramAndTrack(programs, name, description);

    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-08: Program with only a name and empty description still appears', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const name = `Name Only List Program ${Date.now()}`;

    await createProgramAndTrack(programs, name);

    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-09: Multiple programs are all visible in the list', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const ts = Date.now();
    const alpha = `List Alpha ${ts}`;
    const beta = `List Beta ${ts}`;

    await createProgramAndTrack(programs, alpha, `Alpha desc ${ts}`);
    await createProgramAndTrack(programs, beta, `Beta desc ${ts}`);

    await expect(programs.programText(alpha)).toBeVisible();
    await expect(programs.programText(beta)).toBeVisible();
  });
});
