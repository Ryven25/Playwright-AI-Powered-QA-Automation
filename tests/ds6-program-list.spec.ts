import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

test.describe('DS-6: Program List Display - Positive Flows', () => {
  test('TC-01: Programs page shows heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
    await expect(page.getByText('Manage academic programs and semesters')).toBeVisible();
  });

  test('TC-02: Program list displays as a table with Program column', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Program' })).toBeVisible();
  });

  test('TC-03: Each program shows its name', async ({ page }) => {
    const name = `List Display ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Visible in list');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-04: Each program shows its description', async ({ page }) => {
    const name = `Desc Check ${Date.now()}`;
    const description = `Unique desc ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(description)).toBeVisible();
  });

  test('TC-05: Each program row has Edit and Delete action buttons', async ({ page }) => {
    const name = `Actions Check ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText(name)).toBeVisible();

    await expect(page.getByRole('button', { name: `Edit ${name}` })).toBeVisible();
    await expect(page.getByRole('button', { name: `Delete ${name}` })).toBeVisible();
  });

  test('TC-06: New Program button is always visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: '+ New Program' })).toBeVisible();
  });
});

test.describe('DS-6: Program List Display - Negative Flows', () => {
  test('TC-07: Programs page redirects to login without auth', async ({ browser }) => {
    const context = await browser.newContext();
    const newPage = await context.newPage();
    await newPage.goto('/programs');

    await newPage.waitForURL(/\/login/, { timeout: 10000 });
    await expect(newPage.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await context.close();
  });
});

test.describe('DS-6: Program List Display - Edge Cases', () => {
  test('TC-08: Program with very long name displays correctly', async ({ page }) => {
    const ts = Date.now();
    const longName = `LongName${ts}${'X'.repeat(80)}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(longName);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(`LongName${ts}`)).toBeVisible();
  });

  test('TC-09: Program without description displays name only', async ({ page }) => {
    const name = `No Desc ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-10: Newly created program appears at the top of the list', async ({ page }) => {
    const name = `Latest ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Should be first');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const firstRow = page.getByRole('row').nth(1);
    await expect(firstRow).toContainText(name);
  });
});
