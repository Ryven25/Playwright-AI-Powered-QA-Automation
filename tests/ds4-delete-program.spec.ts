import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const unique = (label: string) => `${label} ${Date.now()}`;

test.describe('DS-4: Delete Program - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Delete icon opens a confirmation dialog', { tag: '@smoke' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Test Program');
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();

    let dialogType = '';
    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogType = dialog.type();
      dialogMessage = dialog.message();
      return dialog.dismiss();
    });

    await programs.clickDelete(name);

    expect.soft(dialogType).toBe('confirm');
    expect.soft(dialogMessage).toContain(name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-02: Confirming deletion removes the program from the list', { tag: '@smoke' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Test Program');
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.accept());
    const deleted = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/programs/') && resp.request().method() === 'DELETE'
    );

    await programs.clickDelete(name);
    await deleted;
    await expect(programs.programRow(name)).toHaveCount(0);
  });

  test('TC-09: Deleted program does not reappear after page refresh', { tag: '@e2e' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Ephemeral Program');
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeHidden();

    await programs.goto();
    await expect(programs.programText(name)).toBeHidden();
  });

  test('TC-03: Cancel keeps the program in the list', { tag: '@smoke' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Web Development 2026');
    await createProgramAndTrack(programs, name);

    let dialogType = '';
    page.once('dialog', (dialog) => {
      dialogType = dialog.type();
      return dialog.dismiss();
    });

    await programs.clickDelete(name);

    expect.soft(dialogType).toBe('confirm');
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-4: Delete Program - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-04: Dismissing confirmation does not delete the program', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Keep Me Program');
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.dismiss());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-05: Deleting one program does not affect other programs', { tag: '@e2e' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const stamp = Date.now();
    const keepName = `Keep Program A ${stamp}`;
    const removeName = `Remove Program B ${stamp}`;
    await createProgramAndTrack(programs, keepName, 'Stays');
    await createProgramAndTrack(programs, removeName, 'Goes');

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(removeName);

    await expect(programs.programText(removeName)).toBeHidden();
    await expect(programs.programText(keepName)).toBeVisible();
  });
});

test.describe('DS-4: Delete Program - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-06: Delete a program whose name contains special characters', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Prog & "Quotes" <Tags> ${Date.now()}`;
    await createProgramAndTrack(programs, name);

    page.once('dialog', (dialog) => dialog.accept());

    await programs.clickDelete(name);
    await expect(programs.programText(name)).toBeHidden();
  });

  test('TC-07: Confirmation dialog message includes the program name', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Test Program');
    await createProgramAndTrack(programs, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      return dialog.dismiss();
    });

    await programs.clickDelete(name);

    expect(dialogMessage).toContain(name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-08: Confirmation dialog warns that deletion cannot be undone', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Test Program');
    await createProgramAndTrack(programs, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      return dialog.dismiss();
    });

    await programs.clickDelete(name);

    expect(dialogMessage).toContain('cannot be undone');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-10: Confirmation message for special-character names stays readable', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Prog & "Quotes" <Tags> ${Date.now()}`;
    await createProgramAndTrack(programs, name);

    let dialogType = '';
    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogType = dialog.type();
      dialogMessage = dialog.message();
      return dialog.dismiss();
    });

    await programs.clickDelete(name);

    expect.soft(dialogType).toBe('confirm');
    expect.soft(dialogMessage).toContain(name);
    expect.soft(dialogMessage).toContain('cannot be undone');
    await expect(programs.programText(name)).toBeVisible();
  });
});
