import { test, expect } from '@playwright/test';

const programName = () => `Edit Test ${Date.now()}`;

async function createProgram(page: any, name: string, description = 'Test description') {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

test.describe('DS-2: Edit Program - Positive Flows', () => {
  test('TC-001: Edit icon opens a pre-populated edit form', async ({ page }) => {
    const name = programName();
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    await page.getByRole('button', { name: `Edit ${name}` }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeVisible();
    await expect(page.getByLabel('Program Name')).toHaveValue(name);
    await expect(page.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-002: Edit modal displays correct dialog heading', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();

    await expect(page.getByRole('heading', { name: 'Edit Program' })).toBeVisible();
  });

  test('TC-003: Editing program name and saving updates the list immediately', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const updatedName = `${name} - Updated`;
    await page.getByLabel('Program Name').fill(updatedName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(name, { exact: true })).toBeHidden();
  });

  test('TC-004: Successfully edit a program description', async ({ page }) => {
    const name = programName();
    const newDesc = `Updated full-stack program ${Date.now()}`;
    await createProgram(page, name, 'Original description');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Description').fill(newDesc);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(newDesc)).toBeVisible();
  });

  test('TC-005: Edit preserves unchanged Name when only Description is modified', async ({ page }) => {
    const name = programName();
    const newDesc = `Changed only this field ${Date.now()}`;
    await createProgram(page, name, 'Original');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await expect(page.getByLabel('Program Name')).toHaveValue(name);
    await page.getByLabel('Description').fill(newDesc);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(newDesc)).toBeVisible();
  });

  test('TC-006: Edit preserves unchanged Description when only Name is modified', async ({ page }) => {
    const name = programName();
    const description = `Keep this desc ${Date.now()}`;
    await createProgram(page, name, description);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const renamedName = `Renamed ${Date.now()}`;
    await page.getByLabel('Program Name').fill(renamedName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(renamedName)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Negative Flows', () => {
  test('TC-101: Cancel edit does not persist changes', async ({ page }) => {
    const name = programName();
    await createProgram(page, name, 'Should remain');

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('Should Not Persist');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Should Not Persist')).toBeHidden();
  });

  test('TC-102: Empty name disables Save button', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('');

    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  });

  test('TC-103: Whitespace-only name disables Save button', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('   ');

    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  });

  test('TC-104: Escape key closes modal without saving', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Program Name').fill('Escape test should not persist');
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('Escape test should not persist')).toBeHidden();
  });

  test('TC-105: Close (X) button closes modal without saving', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByLabel('Description').fill('X button discard test');

    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await dialog.getByRole('banner').getByRole('button').click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Edge Cases', () => {
  test('TC-201: Edit name with special characters', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const specialName = `Informatique & IA — Niveau 2 ${Date.now()}`;
    await page.getByLabel('Program Name').fill(specialName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(specialName)).toBeVisible();
  });

  test('TC-202: Edit name with Unicode characters', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const unicodeName = `数据科学课程 ${Date.now()}`;
    await page.getByLabel('Program Name').fill(unicodeName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(unicodeName)).toBeVisible();
  });

  test('TC-203: Edit name with XSS payload renders as text', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const xssName = `<script>alert("xss")</script> ${Date.now()}`;
    await page.getByLabel('Program Name').fill(xssName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(xssName)).toBeVisible();
  });

  test('TC-204: Edit with leading/trailing whitespace trims name', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const baseName = `Trimmed Program ${Date.now()}`;
    await page.getByLabel('Program Name').fill(`   ${baseName}   `);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(baseName)).toBeVisible();
  });

  test('TC-205: Saving without making any changes', async ({ page }) => {
    const name = programName();
    const description = `No change desc ${Date.now()}`;
    await createProgram(page, name, description);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
  });

  test('TC-206: Edit name to a very long value', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const timestamp = Date.now().toString();
    const longName = `LongName${timestamp}_${'X'.repeat(200)}`;
    await page.getByLabel('Program Name').fill(longName);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByText(`LongName${timestamp}`)).toBeVisible();
  });
});

test.describe('DS-2: Edit Program - Non-functional', () => {
  test('TC-301: Form fields have accessible labels', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();

    const nameField = page.getByLabel('Program Name');
    const descField = page.getByLabel('Description');

    await expect(nameField).toBeVisible();
    await expect(descField).toBeVisible();
    await expect(nameField).toHaveValue(name);
  });

  test('TC-302: Keyboard navigation through edit form', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    await page.getByRole('button', { name: `Edit ${name}` }).click();

    await page.getByLabel('Program Name').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Description')).toBeFocused();
  });
});
