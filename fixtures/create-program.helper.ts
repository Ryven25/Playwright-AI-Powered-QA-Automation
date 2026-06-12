import { expect, Page } from '@playwright/test';
import { trackProgram } from '../support/program-tracker';

/**
 * Creates a program via the UI and tracks its ID for teardown cleanup.
 * Intercepts the POST /api/programs response to capture the created program's UUID.
 */
export async function createProgramAndTrack(
  page: Page,
  name: string,
  description = 'Test description'
): Promise<string> {
  const responsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/programs') &&
      resp.request().method() === 'POST' &&
      resp.status() === 201
  );

  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  const response = await responsePromise;
  const body = await response.json();
  const id = body?.data?.id || body?.id;

  if (id) {
    trackProgram(id);
  }

  await expect(page.getByText(name)).toBeVisible();
  return id;
}
