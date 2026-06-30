import { ProgramsPage } from '../pages/didaxis/programs.page';
import { trackProgram } from '../support/program-tracker';

/**
 * Creates a program via the UI and tracks its ID for teardown cleanup.
 * Intercepts the POST /api/programs response to capture the created program's UUID.
 */
export async function createProgramAndTrack(
  programs: ProgramsPage,
  name: string,
  description?: string
): Promise<string> {
  const responsePromise = programs.page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/programs') &&
      resp.request().method() === 'POST' &&
      resp.status() === 201
  );

  await programs.openNewProgramModal();
  await programs.newProgram.fill(name, description);
  await programs.newProgram.submit();

  const response = await responsePromise;
  const body = await response.json();
  const id = body?.data?.id || body?.id;

  if (id) {
    trackProgram(id);
  }

  return id ?? '';
}
