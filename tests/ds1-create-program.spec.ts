import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const programName = () => `Test Program ${Date.now()}`;

test.describe('DS-1: Create Program - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Successfully create a new program with valid data', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name, 'Automated test program');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-02: Modal closes after successful creation', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name, 'Testing modal close');
    await expect(programs.newProgram.programName).toBeHidden();
  });

  test('TC-03: New program appears in the programs list immediately', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const description = `Desc ${Date.now()}`;
    await createProgramAndTrack(programs, name, description);
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-04: Create program with only the name (description optional)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-1: Create Program - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-05: Empty name keeps Create button disabled', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await programs.newProgram.description.fill('No name provided');
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-06: Whitespace-only name keeps Create button disabled', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await programs.newProgram.fill('   ', 'Whitespace name test');
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-07: Duplicate program name is allowed (no validation)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name, 'First creation');
    await expect(programs.programText(name)).toBeVisible();

    await createProgramAndTrack(programs, name, 'Second creation');
    const duplicates = programs.programText(name);
    await expect(duplicates.first()).toBeVisible();
    await expect(duplicates.nth(1)).toBeVisible();
  });

  test('TC-08: Cancel closes modal without creating a program', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await programs.openNewProgramModal();
    await programs.newProgram.fill(name, 'Should not be created');
    await page.keyboard.press('Escape');
    await expect(programs.programText(name)).toBeHidden();
  });
});

test.describe('DS-1: Create Program - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-09: Program name with special characters is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Special chars test');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-10: Program name with Unicode characters is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `数据科学 ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Unicode test');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-11: Program name with leading/trailing whitespace is trimmed', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const baseName = `Trimmed Program ${Date.now()}`;
    await createProgramAndTrack(programs, `   ${baseName}   `, 'Trim test');
    await expect(programs.programText(baseName)).toBeVisible();
  });

  test('TC-12: XSS script tag in name renders as text', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `<script>alert("xss")</script> ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'XSS test');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-13: Program name at exactly 100 characters is accepted', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = 'A'.repeat(100);
    await createProgramAndTrack(programs, name, 'Max length boundary');
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-1: Create Program - Max Length (DS-134)', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  // Known product bug — https://legionqaschool.atlassian.net/browse/DS-134
  test('TC-14: Reject program name over 100 characters', { tag: '@regression' }, async ({ page }) => {
    test.fail(true, 'DS-134: app accepts program names over 100 characters');
    const programs = new ProgramsPage(page);
    const overMax = 'B'.repeat(101);

    await programs.openNewProgramModal();
    await programs.newProgram.fill(overMax, 'Over max length test');

    if (await programs.newProgram.createButton.isDisabled()) {
      await expect(programs.programText(overMax)).toBeHidden();
      return;
    }

    await programs.newProgram.submit();
    await expect(programs.newProgram.nameLengthError).toBeVisible();
    await expect(programs.newProgram.dialog).toBeVisible();
    await expect(programs.programText(overMax)).toBeHidden();
  });
});
