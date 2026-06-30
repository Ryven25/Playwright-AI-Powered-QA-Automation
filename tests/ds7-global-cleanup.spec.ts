import { test, expect } from '@playwright/test';
import { createProgramAndTrack } from '../fixtures/create-program.helper';
import { ProgramsPage } from '../pages/didaxis/programs.page';
import { deleteProgramsByIds, getAllPrograms } from '../support/delete-program';
import { readTrackedIds } from '../support/program-tracker';

const PROGRAM_PREFIX = 'Global Cleanup Test';

test.describe.configure({ mode: 'serial' });

test.describe('DS-7: Global program cleanup', () => {
  test('TC-01: Previous run left no stale Global Cleanup Test programs', async () => {
    test.skip(!process.env.DIDAXIS_API_TOKEN, 'DIDAXIS_API_TOKEN required for API verification');

    const programs = await getAllPrograms();
    const stale = programs.filter((program) => program.name.includes(PROGRAM_PREFIX));

    expect(stale).toHaveLength(0);
  });

  test.describe('UI and API verification', () => {
    test.beforeEach(async ({ page }) => {
      const programs = new ProgramsPage(page);
      await programs.goto();
    });

    test('TC-02: Created program is tracked for global teardown', async ({ page }) => {
      const programs = new ProgramsPage(page);
      const name = `${PROGRAM_PREFIX} ${Date.now()}`;
      const id = await createProgramAndTrack(programs, name, 'Registered for global teardown');

      expect(id).toBeTruthy();
      expect(readTrackedIds()).toContain(id);

      if (process.env.DIDAXIS_API_TOKEN) {
        const allPrograms = await getAllPrograms();
        expect(allPrograms.some((program) => program.id === id)).toBe(true);
      }
    });

    test('TC-03: Tracked programs are deleted via the same API used by global teardown', async ({
      page,
    }) => {
      test.skip(!process.env.DIDAXIS_API_TOKEN, 'DIDAXIS_API_TOKEN required for API verification');

      const programs = new ProgramsPage(page);
      const name = `${PROGRAM_PREFIX} Verify ${Date.now()}`;
      const id = await createProgramAndTrack(programs, name, 'Deleted after test run');

      expect(readTrackedIds()).toContain(id);

      const beforeCleanup = await getAllPrograms();
      expect(beforeCleanup.some((program) => program.id === id)).toBe(true);

      const results = await deleteProgramsByIds([id]);
      expect(results).toHaveLength(1);
      expect(results[0].ok).toBe(true);

      const afterCleanup = await getAllPrograms();
      expect(afterCleanup.some((program) => program.id === id)).toBe(false);
    });
  });
});
