import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

const unique = (label: string) => `${label} ${Date.now()}`;

const START_DATE = '2026-09-01';
const END_DATE = '2026-12-15';

test.describe('DS-7: Add Semester - Create from Panel', () => {
  // Programs list on test.didaxis.studio is large; goto + create already take ~20s.
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('TC-001: Creating a semester with required fields adds it to the panel', { tag: '@e2e' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = unique('Add Semester Program');
    const semesterName = unique('Fall');
    await createProgramAndTrack(programs, programName, 'Add semester test');

    await expect(programs.programText(programName)).toBeVisible({ timeout: 20_000 });
    await programs.selectProgram(programName);
    await expect(programs.semesterPanel.heading(programName)).toBeVisible();
    await programs.semesterPanel.openAddSemesterModal();

    await expect(programs.newSemester.dialog).toBeVisible();
    await programs.newSemester.fill(semesterName, START_DATE, END_DATE);
    await expect(programs.newSemester.createButton).toBeEnabled();

    const created = page.waitForResponse(
      (resp) =>
        resp.url().includes('/semesters') &&
        resp.request().method() === 'POST' &&
        resp.status() === 201
    );
    await programs.newSemester.submit();
    await created;

    await expect(programs.newSemester.dialog).toBeHidden({ timeout: 20_000 });
    await expect(programs.semesterPanel.noSemestersMessage).toBeHidden();
    await expect(programs.semesterPanel.semesterName(semesterName)).toBeVisible();
  });

  test('TC-002: Create Semester stays disabled until required fields are filled', { tag: '@regression' }, async ({ page }) => {
    const programs = new ProgramsPage(page);
    const programName = unique('Add Semester Guard');
    const semesterName = unique('Fall');
    await createProgramAndTrack(programs, programName, 'Disabled create guard');

    await expect(programs.programText(programName)).toBeVisible({ timeout: 20_000 });
    await programs.selectProgram(programName);
    await expect(programs.semesterPanel.heading(programName)).toBeVisible();
    await programs.semesterPanel.openAddSemesterModal();

    await expect(programs.newSemester.dialog).toBeVisible();
    await expect(programs.newSemester.createButton).toBeDisabled();

    await programs.newSemester.semesterName.fill(semesterName);
    await expect(programs.newSemester.createButton).toBeDisabled();

    await programs.newSemester.startDate.fill(START_DATE);
    await programs.newSemester.endDate.fill(END_DATE);
    await expect(programs.newSemester.createButton).toBeEnabled();
  });
});
