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

test.describe('DS-2: Successfully create a program', () => {
  test('Given I am on the program creation form, when I create a program, then the modal closes and the program appears in the list', async ({ page }) => {
    const uniqueName = `Web Development 2026 ${Date.now()}`;
    const description = 'Full-stack web development program';

    // Given I am on the program creation form
    await page.getByRole('button', { name: '+ New Program' }).click();

    // When I fill in Program Name with "Web Development 2026"
    await page.getByLabel('Program Name').fill(uniqueName);

    // And I fill in Description with "Full-stack web development program"
    await page.getByLabel('Description').fill(description);

    // And I click Create
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Then the modal closes
    await expect(page.getByLabel('Program Name')).toBeHidden();

    // And the program list shows "Web Development 2026"
    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});
