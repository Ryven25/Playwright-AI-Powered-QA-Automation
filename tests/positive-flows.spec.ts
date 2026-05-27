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

test.describe('Positive Flows', () => {
  test('TC-01: Page loads with an empty todo list', async ({ page }) => {
    await expect(page).toHaveTitle(/TodoMVC/);
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.locator('.todo-list li')).toHaveCount(0);
    await expect(page.locator('.footer')).toBeHidden();
  });

  test('TC-02: Input field is focused on page load', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await expect(input).toBeFocused();
  });

  test('TC-03: Adding the first todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[0]);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText(TODO_ITEMS[0]);
    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });

  test('TC-04: Adding a second todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 1));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[1]);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(1)).toHaveText(TODO_ITEMS[1]);
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });

  test('TC-05: Adding a third todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 2));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[2]);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(page.locator('.todo-list li').nth(2)).toHaveText(TODO_ITEMS[2]);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });

  test('TC-06: Adding a fourth todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 3));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[3]);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(page.locator('.todo-list li').nth(i)).toHaveText(TODO_ITEMS[i]);
    }
    await expect(page.locator('.todo-count')).toContainText('4 items left');
  });

  test('TC-07: Marking a single item as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await expect(page.locator('.todo-list li').nth(0)).toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });

  test('TC-08: Marking all items as completed individually', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    for (let i = 0; i < 4; i++) {
      await page.locator('.todo-list li').nth(i).locator('.toggle').check();
    }

    for (let i = 0; i < 4; i++) {
      await expect(page.locator('.todo-list li').nth(i)).toHaveClass(/completed/);
    }
    await expect(page.locator('.todo-count')).toContainText('0 items left');
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-09: Completed items appear in Completed filter', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText(TODO_ITEMS[0]);
  });

  test('TC-10: Toggle-all marks every item as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.locator('.toggle-all').check({ force: true });

    for (let i = 0; i < 4; i++) {
      await expect(page.locator('.todo-list li').nth(i)).toHaveClass(/completed/);
    }
    await expect(page.locator('.todo-count')).toContainText('0 items left');
  });

  test('TC-11: Removing an item via destroy button', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.locator('.todo-list li').nth(3).hover();
    await page.locator('.todo-list li').nth(3).locator('.destroy').click();

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(page.locator('.todo-list li')).not.toContainText([TODO_ITEMS[3]]);
  });

  test('TC-12: Removing a completed item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await page.locator('.todo-list li').nth(0).hover();
    await page.locator('.todo-list li').nth(0).locator('.destroy').click();

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(page.locator('.todo-list li')).not.toContainText([TODO_ITEMS[0]]);
  });

  test('TC-13: Clear completed removes all completed items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();
    await page.locator('.todo-list li').nth(1).locator('.toggle').check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText(TODO_ITEMS[2]);
    await expect(page.locator('.todo-list li').nth(1)).toHaveText(TODO_ITEMS[3]);
  });
});

async function addTodos(page: Page, items: string[]) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}
