import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';

test.describe('DS-2: Successfully create a program', () => {
  test.beforeEach(async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
  });

  test('Given I am on the program creation form, when I create a program, then the modal closes and the program appears in the list', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);
    const uniqueName = `Web Development 2026 ${Date.now()}`;
    const description = 'Full-stack web development program';

    await createProgramAndTrack(programs, uniqueName, description);

    await expect(programs.newProgram.programName).toBeHidden();
    await expect(programs.programText(uniqueName)).toBeVisible();
  });
});
