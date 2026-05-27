import { test, expect, type Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

const TODO_ITEMS = [
  'Buy groceries',
  'Clean the house',
  'Read a book',
  'Write tests',
];

test.beforeEach(async ({ page }) => {
  await page.goto(TODO_URL);
});

test.describe('Negative Flows', () => {
  test('TC-14: Empty input does not add an item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-15: Whitespace-only input does not add an item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('     ');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-16: Unchecking a completed item returns it to active', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await expect(page.locator('.todo-list li').nth(0)).toHaveClass(/completed/);

    await page.locator('.todo-list li').nth(0).locator('.toggle').uncheck();

    await expect(page.locator('.todo-list li').nth(0)).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });

  test('TC-17: Editing and submitting empty text deletes the item', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await page.locator('.todo-list li').nth(0).dblclick();
    const editInput = page.locator('.todo-list li').nth(0).locator('.edit');
    await editInput.fill('');
    await editInput.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-18: Escape during edit cancels and restores original text', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await page.locator('.todo-list li').nth(0).dblclick();
    const editInput = page.locator('.todo-list li').nth(0).locator('.edit');
    await editInput.fill('CHANGED TEXT');
    await editInput.press('Escape');

    await expect(page.locator('.todo-list li').nth(0)).toHaveText(TODO_ITEMS[0]);
  });

  test('TC-19: Destroying the only item returns to empty state', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await page.locator('.todo-list li').nth(0).hover();
    await page.locator('.todo-list li').nth(0).locator('.destroy').click();

    await expect(page.locator('.todo-list li')).toHaveCount(0);
    await expect(page.locator('.footer')).toBeHidden();
  });
});

async function addTodos(page: Page, items: string[]) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}
