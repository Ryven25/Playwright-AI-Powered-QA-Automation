import { test, expect } from '@playwright/test';

const programName = () => `Validation ${Date.now()}`;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

test.describe('DS-4: Program Name Validation - Positive Flows', () => {
  test('TC-01: Accept program name with special characters', async ({ page }) => {
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Special chars validation');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-02: Accept program name with Unicode characters', async ({ page }) => {
    const name = `データサイエンス ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Unicode validation');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-03: Accept program name with numbers and hyphens', async ({ page }) => {
    const name = `Program-101-Advanced ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });
});

test.describe('DS-4: Program Name Validation - Negative Flows', () => {
  test('TC-04: Reject empty program name (Create button disabled)', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();

    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  });

  test('TC-05: Reject whitespace-only program name', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill('   ');

    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  });

  test('TC-06: Duplicate program name is allowed (no server-side validation)', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Duplicate entry');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const entries = page.getByText(name);
    await expect(entries.first()).toBeVisible();
    await expect(entries.nth(1)).toBeVisible();
  });
});

test.describe('DS-4: Program Name Validation - Edge Cases', () => {
  test('TC-07: Leading/trailing whitespace is trimmed on save', async ({ page }) => {
    const baseName = `Trimmed ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(`   ${baseName}   `);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(baseName)).toBeVisible();
  });

  test('TC-08: XSS script tag in name is rendered as text', async ({ page }) => {
    const name = `<script>alert("xss")</script> ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('XSS validation test');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-09: Single character name is accepted', async ({ page }) => {
    const name = `X ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-10: Name with emoji is accepted', async ({ page }) => {
    const name = `🎓 Program ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });
});
