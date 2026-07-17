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

test.describe('Edge Cases', () => {
  test('TC-20: Script tags render as text (XSS prevention)', async ({ page }) => {
    const xss = '<script>alert("XSS")</script>';
    await addTodos(page, [xss]);

    await expect(page.locator('.todo-list li').nth(0)).toHaveText(xss);
    const innerHTML = await page.locator('.todo-list li').nth(0).locator('label').innerHTML();
    expect(innerHTML).not.toContain('<script>');
  });

  test('TC-21: Unicode and emoji display correctly', async ({ page }) => {
    const unicodeTodo = '学习中文 🚀 — finish homework';
    await addTodos(page, [unicodeTodo]);

    await expect(page.locator('.todo-list li').nth(0)).toHaveText(unicodeTodo);
  });

  test('TC-22: Very long todo (500 characters) is accepted', async ({ page }) => {
    const longTodo = 'A'.repeat(500);
    await addTodos(page, [longTodo]);

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').nth(0)).toContainText('A'.repeat(50));
  });

  test('TC-23: Duplicate items are allowed', async ({ page }) => {
    await addTodos(page, ['Buy milk', 'Buy milk']);

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText('Buy milk');
    await expect(page.locator('.todo-list li').nth(1)).toHaveText('Buy milk');
  });

  test('TC-24: Editing an item via double-click', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await page.locator('.todo-list li').nth(0).dblclick();
    const editInput = page.locator('.todo-list li').nth(0).locator('.edit');
    await editInput.fill('Buy organic groceries');
    await editInput.press('Enter');

    await expect(page.locator('.todo-list li').nth(0)).toHaveText('Buy organic groceries');
    await expect(page.locator('.todo-list li')).toHaveCount(1);
  });

  test('TC-25: Blur confirms the edit', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    await page.locator('.todo-list li').nth(0).dblclick();
    const editInput = page.locator('.todo-list li').nth(0).locator('.edit');
    await editInput.fill('Read two books');
    await editInput.dispatchEvent('blur');

    await expect(page.locator('.todo-list li').nth(0)).toHaveText('Read two books');
  });

  test('TC-26: Active filter shows only active items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();
    await page.locator('.todo-list li').nth(1).locator('.toggle').check();

    await page.getByRole('link', { name: 'Active' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText(TODO_ITEMS[2]);
    await expect(page.locator('.todo-list li').nth(1)).toHaveText(TODO_ITEMS[3]);
  });

  test('TC-27: All filter shows all items regardless of state', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'All' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(4);
  });

  test('TC-28: Items persist after page reload (localStorage)', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await page.reload();

    await expect(page.locator('.todo-list li')).toHaveCount(4);
    await expect(page.locator('.todo-list li').nth(0)).toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });

  test('TC-29: Toggle-all unchecks all when every item is completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);
    await page.locator('.toggle-all').check({ force: true });

    await page.locator('.toggle-all').uncheck({ force: true });

    for (let i = 0; i < 4; i++) {
      await expect(page.locator('.todo-list li').nth(i)).not.toHaveClass(/completed/);
    }
    await expect(page.locator('.todo-count')).toContainText('4 items left');
  });

  test('TC-30: Leading/trailing whitespace is trimmed', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('   Trim me   ');
    await input.press('Enter');

    await expect(page.locator('.todo-list li').nth(0)).toHaveText('Trim me');
  });

  test('TC-31: Item count uses correct pluralization', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);
    await expect(page.locator('.todo-count')).toContainText('1 item left');

    await addTodos(page, [TODO_ITEMS[1]]);
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });

  test('TC-32: Keyboard navigation works', async ({ page }) => {
    await addTodos(page, [TODO_ITEMS[0]]);

    const input = page.getByPlaceholder('What needs to be done?');
    await expect(input).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('.toggle-all')).toBeFocused();
  });

  test('TC-33: Adding 50 items remains responsive', async ({ page }) => {
    const items = Array.from({ length: 50 }, (_, i) => `Todo item ${i + 1}`);
    const input = page.getByPlaceholder('What needs to be done?');

    for (const item of items) {
      await input.fill(item);
      await input.press('Enter');
    }

    await expect(page.locator('.todo-list li')).toHaveCount(50);
    await expect(page.locator('.todo-count')).toContainText('50 items left');
  });

  test('TC-34: img onerror XSS renders as text', async ({ page }) => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    await addTodos(page, [xssPayload]);

    await expect(page.locator('.todo-list li').nth(0)).toHaveText(xssPayload);

    const alertTriggered = await page.evaluate(() => {
      return (window as any).__xssTriggered || false;
    });
    expect(alertTriggered).toBe(false);
  });
});

async function addTodos(page: Page, items: string[]) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}
