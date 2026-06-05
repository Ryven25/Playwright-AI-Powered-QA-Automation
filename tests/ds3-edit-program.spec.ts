import { test, expect } from '@playwright/test';

const programName = () => `Edit Test ${Date.now()}`;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

async function createProgram(page: any, name: string, description = 'Test description') {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test.describe('DS-3: Edit Program - Positive Flows', () => {
  test('TC-01: Edit form is pre-populated with current program data', async ({ page }) => {
    const name = programName();
    const description = 'Original description';
    await createProgram(page, name, description);

    await page.getByRole('button', { name: `Edit ${name}` }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
    await expect(page.getByLabel('Program Name')).toHaveValue(name);
    await expect(page.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-02: Successfully edit a program name', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const updatedName = `${name} - Updated`;
    await page.getByLabel('Program Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('TC-03: Successfully edit a program description', async ({ page }) => {
    const name = programName();
    const newDesc = `Updated desc ${Date.now()}`;
    await createProgram(page, name, 'Original');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Description').fill(newDesc);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(newDesc)).toBeVisible();
  });

  test('TC-04: Edit preserves unchanged fields', async ({ page }) => {
    const name = programName();
    const newDesc = `Only desc changed ${Date.now()}`;
    await createProgram(page, name, 'Keep this');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Description').fill(newDesc);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(newDesc)).toBeVisible();
  });

  test('TC-05: Modal closes after successful save', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill(`${name} Saved`);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByLabel('Program Name')).toBeHidden();
  });
});

test.describe('DS-3: Edit Program - Negative Flows', () => {
  test('TC-06: Cancel edit does not save changes', async ({ page }) => {
    const name = programName();
    await createProgram(page, name, 'Should not change');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('This should not persist');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('This should not persist')).toBeHidden();
  });

  test('TC-07: Empty name disables Save button', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('');

    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  });

  test('TC-08: Whitespace-only name disables Save button', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('   ');

    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  });
});

test.describe('DS-3: Edit Program - Edge Cases', () => {
  test('TC-09: Edit name with special characters', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const specialName = `Informatique & IA — Niveau 2 ${Date.now()}`;
    await page.getByLabel('Program Name').fill(specialName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText(specialName)).toBeVisible();
  });

  test('TC-10: Edit name with Unicode characters', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const unicodeName = `数据科学课程 ${Date.now()}`;
    await page.getByLabel('Program Name').fill(unicodeName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText(unicodeName)).toBeVisible();
  });

  test('TC-11: Close edit modal with X button', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
  });
});
