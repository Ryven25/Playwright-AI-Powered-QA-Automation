import { test, expect } from '@playwright/test';

const programName = () => `Test Program ${Date.now()}`;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

test.describe('DS-1: Create Program - Positive Flows', () => {
  test('TC-01: Successfully create a new program with valid data', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Automated test program');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-02: Modal closes after successful creation', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Testing modal close');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByLabel('Program Name')).toBeHidden();
  });

  test('TC-03: New program appears in the programs list immediately', async ({ page }) => {
    const name = programName();
    const description = `Desc ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill(description);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test('TC-04: Create program with only the name (description optional)', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });
});

test.describe('DS-1: Create Program - Negative Flows', () => {
  test('TC-05: Empty name keeps Create button disabled', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Description').fill('No name provided');

    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  });

  test('TC-06: Whitespace-only name keeps Create button disabled', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill('   ');
    await page.getByLabel('Description').fill('Whitespace name test');

    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeDisabled();
  });

  test('TC-07: Duplicate program name is allowed (no validation)', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('First creation');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Second creation');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    const duplicates = page.getByText(name);
    await expect(duplicates.first()).toBeVisible();
    await expect(duplicates.nth(1)).toBeVisible();
  });

  test('TC-08: Cancel closes modal without creating a program', async ({ page }) => {
    const name = programName();

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Should not be created');
    await page.keyboard.press('Escape');

    await expect(page.getByText(name)).toBeHidden();
  });
});

test.describe('DS-1: Create Program - Edge Cases', () => {
  test('TC-09: Program name with special characters is accepted', async ({ page }) => {
    const name = `Informatique & IA - Niveau 2 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Special chars test');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-10: Program name with Unicode characters is accepted', async ({ page }) => {
    const name = `数据科学 ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('Unicode test');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-11: Program name with leading/trailing whitespace is trimmed', async ({ page }) => {
    const baseName = `Trimmed Program ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(`   ${baseName}   `);
    await page.getByLabel('Description').fill('Trim test');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(baseName)).toBeVisible();
  });

  test('TC-12: XSS script tag in name renders as text', async ({ page }) => {
    const name = `<script>alert("xss")</script> ${Date.now()}`;

    await page.getByRole('button', { name: '+ New Program' }).click();
    await page.getByLabel('Program Name').fill(name);
    await page.getByLabel('Description').fill('XSS test');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(name)).toBeVisible();
  });
});
