import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const programName = () => `Edit Test ${Date.now()}`;

test.describe('DS-2: Edit Program - Positive Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Edit icon opens a pre-populated edit form', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const description = 'Full-stack web development program';
    await createProgramAndTrack(programs, name, description);

    await programs.openEditModal(name);

    await expect(programs.editProgram.dialog).toBeVisible();
    await expect(programs.editProgram.programName).toHaveValue(name);
    await expect(programs.editProgram.description).toHaveValue(description);
  });

  test('TC-002: Edit modal displays correct dialog heading', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);

    await expect(programs.editProgram.heading).toBeVisible();
  });

  test('TC-003: Editing program name and saving updates the list immediately', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const updatedName = `${name} - Updated`;
    await programs.editProgram.fillName(updatedName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(updatedName)).toBeVisible();
    await expect(programs.programText(name, { exact: true })).toBeHidden();
  });

  test('TC-004: Successfully edit a program description', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const newDesc = `Updated full-stack program ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Original description');

    await programs.openEditModal(name);
    await programs.editProgram.fillDescription(newDesc);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(newDesc)).toBeVisible();
  });

  test('TC-005: Edit preserves unchanged Name when only Description is modified', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const newDesc = `Changed only this field ${Date.now()}`;
    await createProgramAndTrack(programs, name, 'Original');

    await programs.openEditModal(name);
    await expect(programs.editProgram.programName).toHaveValue(name);
    await programs.editProgram.fillDescription(newDesc);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(newDesc)).toBeVisible();
  });

  test('TC-006: Edit preserves unchanged Description when only Name is modified', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const description = `Keep this desc ${Date.now()}`;
    await createProgramAndTrack(programs, name, description);

    await programs.openEditModal(name);
    const renamedName = `Renamed ${Date.now()}`;
    await programs.editProgram.fillName(renamedName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(renamedName)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Negative Flows', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-101: Cancel edit does not persist changes', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name, 'Should remain');

    await programs.openEditModal(name);
    await programs.editProgram.fillName('Should Not Persist');
    await programs.editProgram.cancel();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText('Should Not Persist')).toBeHidden();
  });

  test('TC-102: Empty name disables Save button', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    await programs.editProgram.fillName('');

    await expect(programs.editProgram.saveButton).toBeDisabled();
  });

  test('TC-103: Whitespace-only name disables Save button', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    await programs.editProgram.fillName('   ');

    await expect(programs.editProgram.saveButton).toBeDisabled();
  });

  test('TC-104: Escape key closes modal without saving', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    await programs.editProgram.fillName('Escape test should not persist');
    await page.keyboard.press('Escape');

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText('Escape test should not persist')).toBeHidden();
  });

  test('TC-105: Close (X) button closes modal without saving', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    await programs.editProgram.fillDescription('X button discard test');
    await programs.editProgram.closeWithX();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(name)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-201: Edit name with special characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const specialName = `Informatique & IA — Niveau 2 ${Date.now()}`;
    await programs.editProgram.fillName(specialName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(specialName)).toBeVisible();
  });

  test('TC-202: Edit name with Unicode characters', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const unicodeName = `数据科学课程 ${Date.now()}`;
    await programs.editProgram.fillName(unicodeName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(unicodeName)).toBeVisible();
  });

  test('TC-203: Edit name with XSS payload renders as text', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const xssName = `<script>alert("xss")</script> ${Date.now()}`;
    await programs.editProgram.fillName(xssName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(xssName)).toBeVisible();
  });

  test('TC-204: Edit with leading/trailing whitespace trims name', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const baseName = `Trimmed Program ${Date.now()}`;
    await programs.editProgram.fillName(`   ${baseName}   `);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(baseName)).toBeVisible();
  });

  test('TC-205: Saving without making any changes', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    const description = `No change desc ${Date.now()}`;
    await createProgramAndTrack(programs, name, description);

    await programs.openEditModal(name);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(name)).toBeVisible();
    await expect(programs.programText(description)).toBeVisible();
  });

  test('TC-206: Edit name to a very long value', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);
    const timestamp = Date.now().toString();
    const longName = `LongName${timestamp}_${'X'.repeat(200)}`;
    await programs.editProgram.fillName(longName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    await expect(programs.programText(`LongName${timestamp}`)).toBeVisible();
  });

  test('TC-207: Rename program to duplicate existing name is allowed', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const sharedName = `Shared Edit Name ${Date.now()}`;
    const uniqueName = `Unique Before Rename ${Date.now()}`;
    await createProgramAndTrack(programs, sharedName, 'First program');
    await createProgramAndTrack(programs, uniqueName, 'Will be renamed');

    await programs.openEditModal(uniqueName);
    await programs.editProgram.fillName(sharedName);
    await programs.editProgram.save();

    await expect(programs.editProgram.dialog).toBeHidden();
    const matchingNames = programs.programText(sharedName);
    await expect(matchingNames.first()).toBeVisible();
    await expect(matchingNames.nth(1)).toBeVisible();
    await expect(programs.editButton(sharedName).first()).toBeVisible();
    await expect(programs.editButton(sharedName).nth(1)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Non-functional', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-301: Form fields have accessible labels', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);

    await expect(programs.editProgram.programName).toBeVisible();
    await expect(programs.editProgram.description).toBeVisible();
    await expect(programs.editProgram.programName).toHaveValue(name);
  });

  test('TC-302: Keyboard navigation through edit form', async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = programName();
    await createProgramAndTrack(programs, name);

    await programs.openEditModal(name);

    await programs.editProgram.programName.focus();
    await page.keyboard.press('Tab');
    await expect(programs.editProgram.description).toBeFocused();
  });
});
