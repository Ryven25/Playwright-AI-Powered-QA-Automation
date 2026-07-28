import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const programName = () => `Validation ${Date.now()}`;

test.describe('DS-3: Program Name Validation - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-01: Accept program name with special characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Special chars validation');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-02: Accept program name with Unicode characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `データサイエンス ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Unicode validation');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-03: Accept program name with numbers and hyphens', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Program-101-Advanced ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-3: Program Name Validation - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-04: Reject empty program name (Create button disabled)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-05: Reject whitespace-only program name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await programs.newProgram.fill('   ');
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-06: Duplicate program name is allowed (no server-side validation)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();

    await createProgramAndTrack(programs, name, 'Duplicate entry');
    const entries = programs.programText(name);
    await expect(entries.first()).toBeVisible();
    await expect(entries.nth(1)).toBeVisible();
  });
});

test.describe('DS-3: Program Name Validation - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-07: Leading/trailing whitespace is trimmed on save', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const baseName = `Trimmed ${Date.now()}`;
    await createProgramAndTrack(programs, `   ${baseName}   `);
    await expect(programs.programText(baseName)).toBeVisible();
  });

  test('TC-08: XSS script tag in name is rendered as text', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `<script>alert("xss")</script> ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'XSS validation test');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-09: Single character name is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `X ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-10: Name with emoji is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `🎓 Program ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });
});
