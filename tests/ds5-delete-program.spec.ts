import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const programName = () => `Delete Test ${Date.now()}`;

test.describe('DS-5: Delete Program - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Confirmation dialog appears when clicking delete', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();

    page.once('dialog', (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain(name);
      dialog.dismiss();
    });

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-02: Program is removed after confirming deletion', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeHidden();
  });

  test('TC-03: Program persists after cancelling deletion', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.dismiss());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-5: Delete Program - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-04: Dismissing dialog keeps program in list', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.dismiss());

    await programs.clickDelete(name);

    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-05: Other programs unaffected by deletion', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name1 = `Keep ${Date.now()}`;
    const name2 = `Remove ${Date.now()}`;
    await createProgramAndTrack(programs, name1, 'Stays');
    await createProgramAndTrack(programs, name2, 'Goes');

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(name2);

    await expect(programs.programText(name2)).toBeHidden();
    await expect(programs.programText(name1)).toBeVisible();
  });
});

test.describe('DS-5: Delete Program - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-06: Delete program with special characters in name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Prog & "Quotes" <Tags> ${Date.now()}`;
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeHidden();
  });

  test('TC-07: Confirmation message includes program name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });

    await programs.clickDelete(name);
    expect(dialogMessage).toContain(name);
  });

  test('TC-08: Confirmation message warns about data loss', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });

    await programs.clickDelete(name);
    expect(dialogMessage).toContain('cannot be undone');
  });
});
