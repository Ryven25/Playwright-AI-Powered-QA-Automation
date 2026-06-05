import { test, expect } from '@playwright/test';

const programName = () => `Delete Test ${Date.now()}`;

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.DIDAXIS_EMAIL!);
  await page.getByLabel('Password').fill(process.env.DIDAXIS_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.goto('/programs');
  await page.waitForLoadState('networkidle');
});

async function createProgram(page: any, name: string, description = 'To be deleted') {
  await page.getByRole('button', { name: '+ New Program' }).click();
  await page.getByLabel('Program Name').fill(name);
  await page.getByLabel('Description').fill(description);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test.describe('DS-5: Delete Program - Positive Flows', () => {
  test('TC-01: Confirmation dialog appears when clicking delete', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    page.once('dialog', (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain(name);
      dialog.dismiss();
    });

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-02: Program is removed after confirming deletion', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    page.once('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeHidden();
  });

  test('TC-03: Program persists after cancelling deletion', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    page.once('dialog', (dialog) => dialog.dismiss());

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeVisible();
  });
});

test.describe('DS-5: Delete Program - Negative Flows', () => {
  test('TC-04: Dismissing dialog keeps program in list', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    page.once('dialog', (dialog) => dialog.dismiss());

    await page.getByRole('button', { name: `Delete ${name}` }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('TC-05: Other programs unaffected by deletion', async ({ page }) => {
    const name1 = `Keep ${Date.now()}`;
    const name2 = `Remove ${Date.now()}`;
    await createProgram(page, name1, 'Stays');
    await createProgram(page, name2, 'Goes');

    page.once('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: `Delete ${name2}` }).click();

    await expect(page.getByText(name2)).toBeHidden();
    await expect(page.getByText(name1)).toBeVisible();
  });
});

test.describe('DS-5: Delete Program - Edge Cases', () => {
  test('TC-06: Delete program with special characters in name', async ({ page }) => {
    const name = `Prog & "Quotes" <Tags> ${Date.now()}`;
    await createProgram(page, name);

    page.once('dialog', (dialog) => dialog.accept());

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    await expect(page.getByText(name)).toBeHidden();
  });

  test('TC-07: Confirmation message includes program name', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    expect(dialogMessage).toContain(name);
  });

  test('TC-08: Confirmation message warns about data loss', async ({ page }) => {
    const name = programName();
    await createProgram(page, name);

    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.dismiss();
    });

    await page.getByRole('button', { name: `Delete ${name}` }).click();
    expect(dialogMessage).toContain('cannot be undone');
  });
});
