import { test, expect } from '@playwright/test';
import { trackProgram } from '../support/program-tracker';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

test.describe('DS-2: Successfully create a program', () => {
  test('Given I am on the program creation form, when I create a program, then the modal closes and the program appears in the list', async ({ page }) => {
    const uniqueName = `Web Development 2026 ${Date.now()}`;
    const description = 'Full-stack web development program';

    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/api/programs') &&
        resp.request().method() === 'POST' &&
        resp.status() === 201
    );

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(uniqueName);
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const response = await responsePromise;
    const body = await response.json();
    const id = body?.data?.id || body?.id;
    if (id) trackProgram(id);

    await expect(page.getByLabel('Program Name')).toBeHidden();
    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});
