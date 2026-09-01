import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

/**
 * DS-6: Semester panel selection (discovered via exploration, no Jira ticket).
 *
 * Selecting a program row on /programs swaps the right-hand placeholder
 * ("Select a program to manage semesters") for that program's semesters &
 * scheduling config. No existing spec exercises row selection or this panel.
 */

const unique = (label: string) => `${label} ${Date.now()}`;

test.describe('DS-6: Semester Panel - Program Selection', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Selecting a program reveals its semester panel', { tag: '@e2e' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const name = unique('Semester Panel');
    await createProgramAndTrack(programs, name, 'Panel reveal test');

    await expect(programs.semesterPanel.placeholder).toBeVisible();

    await programs.selectProgram(name);

    await expect(programs.semesterPanel.heading(name)).toBeVisible();
    await expect(programs.semesterPanel.subtitle).toBeVisible();
    await expect(programs.semesterPanel.addSemesterButton).toBeVisible();
    await expect(programs.semesterPanel.noSemestersMessage).toBeVisible();
    await expect(programs.semesterPanel.placeholder).toBeHidden();
  });

  test('TC-002: Switching selection updates the semester panel', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const stamp = Date.now();
    const alpha = `Panel Alpha ${stamp}`;
    const beta = `Panel Beta ${stamp}`;
    await createProgramAndTrack(programs, alpha, 'First selection');
    await createProgramAndTrack(programs, beta, 'Second selection');

    await programs.selectProgram(alpha);
    await expect(programs.semesterPanel.heading(alpha)).toBeVisible();

    await programs.selectProgram(beta);
    await expect(programs.semesterPanel.heading(beta)).toBeVisible();
    await expect(programs.semesterPanel.heading(alpha)).toBeHidden();
  });
});
