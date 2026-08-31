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
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
    await expect(page.getByTestId('todo-count')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Completed' })).toBeHidden();
  });

  test('TC-02: Input field is focused on page load', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await expect(input).toBeFocused();
  });

  test('TC-03: Adding the first todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[0]);
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-title').nth(0)).toHaveText(TODO_ITEMS[0]);
    await expect(page.getByTestId('todo-count')).toContainText('1 item left');
  });

  test('TC-04: Adding a second todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 1));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[1]);
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByTestId('todo-title').nth(1)).toHaveText(TODO_ITEMS[1]);
    await expect(page.getByTestId('todo-count')).toContainText('2 items left');
  });

  test('TC-05: Adding a third todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 2));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[2]);
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(3);
    await expect(page.getByTestId('todo-title').nth(2)).toHaveText(TODO_ITEMS[2]);
    await expect(page.getByTestId('todo-count')).toContainText('3 items left');
  });

  test('TC-06: Adding a fourth todo item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS.slice(0, 3));

    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill(TODO_ITEMS[3]);
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(4);
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    await expect(page.getByTestId('todo-count')).toContainText('4 items left');
  });

  test('TC-07: Marking a single item as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    const firstToggle = page.getByTestId('todo-item').nth(0).getByRole('checkbox', { name: 'Toggle Todo' });
    await firstToggle.check();

    await expect(firstToggle).toBeChecked();
    await expect(page.getByTestId('todo-count')).toContainText('3 items left');
  });

  test('TC-08: Marking all items as completed individually', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    for (let i = 0; i < 4; i++) {
      await page.getByTestId('todo-item').nth(i).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    }

    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId('todo-item').nth(i).getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    }
    await expect(page.getByTestId('todo-count')).toContainText('0 items left');
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
  });

  test('TC-09: Completed items appear in Completed filter', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-title').nth(0)).toHaveText(TODO_ITEMS[0]);
  });

  test('TC-10: Toggle-all marks every item as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.getByRole('checkbox', { name: 'Mark all as complete' }).check({ force: true });

    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId('todo-item').nth(i).getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    }
    await expect(page.getByTestId('todo-count')).toContainText('0 items left');
  });

  test('TC-11: Removing an item via destroy button', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.getByTestId('todo-item').nth(3).hover();
    await page.getByTestId('todo-item').nth(3).getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByTestId('todo-item')).toHaveCount(3);
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1], TODO_ITEMS[2]]);
  });

  test('TC-12: Removing a completed item', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByTestId('todo-item').nth(0).hover();
    await page.getByTestId('todo-item').nth(0).getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByTestId('todo-item')).toHaveCount(3);
    await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1], TODO_ITEMS[2], TODO_ITEMS[3]]);
  });

  test('TC-13: Clear completed removes all completed items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByTestId('todo-item')).toHaveCount(2);
    await expect(page.getByTestId('todo-title').nth(0)).toHaveText(TODO_ITEMS[2]);
    await expect(page.getByTestId('todo-title').nth(1)).toHaveText(TODO_ITEMS[3]);
  });
});

async function addTodos(page: Page, items: string[]) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}
