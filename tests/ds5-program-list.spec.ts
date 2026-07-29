import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { LoginPage } from '../pages/didaxis/login.page';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import { AUTH_ROUTES, EMPTY_STORAGE_STATE } from '../support/auth.constants';
import { deleteProgramsByIds, getAllPrograms } from '../support/delete-program';

/** Wipe all programs via API so the Programs page can show the empty state (AC2). */
async function clearAllProgramsViaApi(): Promise<void> {
  const existing = await getAllPrograms();
  if (existing.length === 0) return;

  const results = await deleteProgramsByIds(existing.map((program) => program.id));
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    throw new Error(
      `Failed to delete ${failed.length} program(s) for empty-state setup: ${failed
        .map((result) => `${result.id} (${result.status})`)
        .join(', ')}`
    );
  }

  const remaining = await getAllPrograms();
  if (remaining.length > 0) {
    throw new Error(
      `Empty-state setup incomplete: ${remaining.length} program(s) still present after delete`
    );
  }
}

test.describe('DS-5: Program List Display - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Programs page shows heading and description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await expect(programs.heading).toBeVisible();
    await expect(programs.pageDescription).toBeVisible();
  });

  test('TC-002: Program list displays as a table with Program column', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `List Table ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Ensures at least one program exists');

    await expect(programs.table).toBeVisible();
    await expect(programs.programColumnHeader).toBeVisible();
  });

  test('TC-003: Each program shows its name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `List Display ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Visible in list');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-004: Each program shows its description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Desc Check ${Date.now()}`;
    const description = `Unique desc ${Date.now()}`;
    await createProgramAndTrack(programs, name, description);
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-005: Each row has Edit and Delete; New Program always visible', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Actions Check ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.editButton(name)).toBeVisible();
    await expect(programs.deleteButton(name)).toBeVisible();
    await expect(programs.newProgramButton).toBeVisible();
  });
});

test.describe('DS-5: Program List Display - Empty State (AC2)', () => {
  test('TC-006: Empty state when no programs exist', async ({ page }) => {
    test.skip(
      !process.env.DIDAXIS_API_TOKEN,
      'DIDAXIS_API_TOKEN required to wipe programs for AC2 empty state'
    );

    await clearAllProgramsViaApi();

    const programs = new ProgramsPage(page);
    await programs.goto();

    await expect(programs.emptyStateMessage).toBeVisible();
    await expect(programs.emptyStateCreatePrompt).toBeVisible();
  });
});

test.describe('DS-5: Program List Display - Negative Flows', () => {
  test.use({ storageState: EMPTY_STORAGE_STATE });

  test('TC-007: Programs page redirects to login without auth', async ({ page }) => {
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

  test('TC-008: Program with very long name displays correctly', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const ts = Date.now();
    const longName = `LongName${ts}${'X'.repeat(80)}`;
    await createProgramAndTrack(programs, longName);
    await expect(programs.programText(`LongName${ts}`)).toBeVisible();
  });

  test('TC-009: Program without description displays name only', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `No Desc ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-010: Newly created program appears at the top of the list', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Latest ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Should be first');

    await expect(programs.firstDataRow()).toContainText(name);
  });
});
