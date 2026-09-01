import { test, expect } from '@playwright/test';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const unique = (label: string) => `${label} ${Date.now()}`;

test.describe('DS-8: New Program AI Generation Config', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Expanding AI Generation Config reveals scheduling defaults', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgram;

    await programs.openNewProgramModal();
    await expect(modal.dialog).toBeVisible();
    await expect(modal.showAiConfigButton).toBeVisible();

    await modal.expandAiConfig();

    await expect(modal.hideAiConfigButton).toBeVisible();
    await expect(modal.aiConfigHelperText).toBeVisible();
    await expect(modal.defaultSessionHours).toHaveValue('4');
    await expect(modal.defaultExamHours).toHaveValue('3');
    await expect(modal.totalProgramHours).toBeVisible();
    await expect(modal.targetAudience).toBeVisible();
    await expect(modal.focusAreas).toBeVisible();
  });

  test('TC-002: AI config fields do not enable Create without a program name', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const modal = programs.newProgram;
    const programName = unique('AI Config Guard Program');

    await programs.openNewProgramModal();
    await modal.expandAiConfig();

    await expect(modal.createButton).toBeDisabled();

    await modal.fillAiConfig({
      totalProgramHours: '900',
      targetAudience: 'Career changers',
    });
    await expect(modal.createButton).toBeDisabled();

    await modal.programName.fill(programName);
    await expect(modal.createButton).toBeEnabled();
  });
});
