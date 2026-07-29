import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

test.describe('DS-3: Program Name Validation - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Reject empty program name (Create button disabled)', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-002: Reject whitespace-only program name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.openNewProgramModal();
    await programs.newProgram.fill('   ');
    await expect(programs.newProgram.createButton).toBeDisabled();
  });

  test('TC-006: Reject duplicate program name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Web Development 2026 ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.editButton(name)).toHaveCount(1);

    await programs.openNewProgramModal();
    await programs.newProgram.fill(name, 'Duplicate entry');
    await programs.newProgram.submit();

    await expect(programs.newProgram.duplicateNameError).toBeVisible();
    // Second program with the same name must not be created
    await expect(programs.editButton(name)).toHaveCount(1);
  });
});

test.describe('DS-3: Program Name Validation - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-003: Accept program name with special characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Special chars validation');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-004: Accept program name with Unicode characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `データサイエンス ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Unicode validation');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-005: Accept program name with numbers and hyphens', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `Program-101-Advanced ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-3: Program Name Validation - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-007: Leading/trailing whitespace is trimmed on save', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const baseName = `Trimmed ${Date.now()}`;
    await createProgramAndTrack(programs, `   ${baseName}   `);
    await expect(programs.programText(baseName)).toBeVisible();
  });

  test('TC-008: XSS script tag in name is rendered as text', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `<script>alert("xss")</script> ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'XSS validation test');
    await expect(programs.programText(name)).toBeVisible();
  });

  test('TC-009: Emoji in name is accepted', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = `🎓 Program ${Date.now()}`;
    await createProgramAndTrack(programs, name);
    await expect(programs.programText(name)).toBeVisible();
  });
});
