# Test Plan — TodoMVC Application

**Application:** React • TodoMVC (Playwright demo)
**URL:** https://demo.playwright.dev/todomvc/#/
**Surface:** Web UI — React SPA, client-side state (localStorage)
**Browser:** Chromium (Desktop Chrome)
**Automation:** Playwright — `tests/todomvc.spec.ts`

---

## Traceability Matrix (AC → Test Cases)

| AC | Description | Covering Test Cases |
| --- | --- | --- |
| AC1 | Create a todo list | TC-001, TC-002 |
| AC2 | Add items (4) | TC-003, TC-004, TC-005, TC-006 |
| AC3 | Finish items — expect to be finished | TC-007, TC-008, TC-009, TC-010 |
| AC4 | Remove item from the list — expect to be removed | TC-011, TC-012, TC-013 |
| — | Negative paths | TC-101 → TC-106 |
| — | Edge cases | TC-201 → TC-212 |
| — | Non-functional | TC-301 → TC-305 |

---

## 1. Positive Flows

### TC-001 — TodoMVC page loads with an empty todo list

- **AC reference:** AC1
- **Preconditions:** Fresh browser session (no localStorage data).
- **Test data:** —
- **Steps:**
  1. Navigate to `https://demo.playwright.dev/todomvc/#/`.
- **Expected result:**
  - Page title contains `React • TodoMVC`.
  - An input field with placeholder `What needs to be done?` is visible.
  - No todo items are displayed.
  - The footer (filters, item count) is **not** visible (only appears when items exist).
- **Priority:** High

### TC-002 — Input field is focused and ready for typing on page load

- **AC reference:** AC1
- **Preconditions:** Fresh page load.
- **Test data:** —
- **Steps:**
  1. Navigate to the app.
  2. Observe which element has focus.
- **Expected result:** The todo input field (`What needs to be done?`) has keyboard focus — user can start typing immediately.
- **Priority:** Medium

### TC-003 — Adding the first todo item displays it in the list

- **AC reference:** AC2
- **Preconditions:** Empty todo list.
- **Test data:** `Buy groceries`
- **Steps:**
  1. Type `Buy groceries` into the input field.
  2. Press `Enter`.
- **Expected result:**
  - The input field is cleared.
  - A new item `Buy groceries` appears in the todo list.
  - The item has an unchecked checkbox to its left.
  - Footer appears showing `1 item left`.
- **Priority:** High

### TC-004 — Adding a second todo item appends it below the first

- **AC reference:** AC2
- **Preconditions:** One item `Buy groceries` already in the list.
- **Test data:** `Clean the house`
- **Steps:**
  1. Type `Clean the house` into the input field.
  2. Press `Enter`.
- **Expected result:**
  - `Clean the house` appears below `Buy groceries`.
  - Footer shows `2 items left`.
- **Priority:** High

### TC-005 — Adding a third todo item

- **AC reference:** AC2
- **Preconditions:** Two items exist.
- **Test data:** `Read a book`
- **Steps:**
  1. Type `Read a book` into the input field.
  2. Press `Enter`.
- **Expected result:**
  - `Read a book` appears as the third item.
  - Footer shows `3 items left`.
- **Priority:** High

### TC-006 — Adding a fourth todo item

- **AC reference:** AC2
- **Preconditions:** Three items exist.
- **Test data:** `Write tests`
- **Steps:**
  1. Type `Write tests` into the input field.
  2. Press `Enter`.
- **Expected result:**
  - `Write tests` appears as the fourth item.
  - Footer shows `4 items left`.
  - All four items are visible: `Buy groceries`, `Clean the house`, `Read a book`, `Write tests`.
- **Priority:** High

### TC-007 — Marking a single item as completed

- **AC reference:** AC3
- **Preconditions:** Four todo items exist, all active.
- **Test data:** Complete `Buy groceries`.
- **Steps:**
  1. Click the checkbox next to `Buy groceries`.
- **Expected result:**
  - `Buy groceries` shows a strikethrough style (completed appearance).
  - The checkbox is now checked.
  - Footer shows `3 items left` (only active items counted).
- **Priority:** High

### TC-008 — Marking all items as completed

- **AC reference:** AC3
- **Preconditions:** Four items exist; `Buy groceries` is already completed.
- **Test data:** Complete remaining three items.
- **Steps:**
  1. Click the checkbox next to `Clean the house`.
  2. Click the checkbox next to `Read a book`.
  3. Click the checkbox next to `Write tests`.
- **Expected result:**
  - All four items display with strikethrough styling.
  - Footer shows `0 items left`.
  - `Clear completed` button appears in the footer.
- **Priority:** High

### TC-009 — Completed items appear in the "Completed" filter view

- **AC reference:** AC3
- **Preconditions:** At least one completed item exists.
- **Test data:** `Buy groceries` is completed.
- **Steps:**
  1. Click the `Completed` filter link in the footer.
- **Expected result:**
  - Only completed items are visible (e.g., `Buy groceries`).
  - Active items are hidden from view.
  - The `Completed` filter link is highlighted/selected.
- **Priority:** High

### TC-010 — Toggle-all marks every item as completed in one click

- **AC reference:** AC3
- **Preconditions:** Four items exist, all active.
- **Test data:** —
- **Steps:**
  1. Click the toggle-all chevron (❯) to the left of the input field.
- **Expected result:**
  - All four items become completed (strikethrough styling, checkboxes checked).
  - Footer shows `0 items left`.
  - `Clear completed` button appears.
- **Priority:** High

### TC-011 — Removing an item by clicking the destroy (X) button

- **AC reference:** AC4
- **Preconditions:** Four items exist.
- **Test data:** Remove `Write tests`.
- **Steps:**
  1. Hover over the `Write tests` item.
  2. Click the `X` (destroy) button that appears on hover.
- **Expected result:**
  - `Write tests` is immediately removed from the list.
  - Only three items remain: `Buy groceries`, `Clean the house`, `Read a book`.
  - Footer count updates accordingly.
- **Priority:** High

### TC-012 — Removing a completed item reduces the list

- **AC reference:** AC4
- **Preconditions:** `Buy groceries` is marked as completed.
- **Test data:** Remove `Buy groceries`.
- **Steps:**
  1. Hover over `Buy groceries`.
  2. Click the `X` button.
- **Expected result:**
  - `Buy groceries` is removed from the list.
  - The item count in the footer reflects only the remaining active items.
- **Priority:** High

### TC-013 — "Clear completed" removes all completed items at once

- **AC reference:** AC4
- **Preconditions:** At least one completed item exists. Active items also exist.
- **Test data:** Two items completed, two items active.
- **Steps:**
  1. Click the `Clear completed` button in the footer.
- **Expected result:**
  - All completed items are removed.
  - Active items remain untouched.
  - The `Clear completed` button disappears (no more completed items).
  - Footer count reflects only active items remaining.
- **Priority:** High

---

## 2. Negative Flows

### TC-101 — Empty input (pressing Enter with no text) does not add an item

- **AC reference:** Negative
- **Preconditions:** Input field is empty.
- **Test data:** `""` (empty string)
- **Steps:**
  1. Leave the input field blank.
  2. Press `Enter`.
- **Expected result:** No item is added to the list. Item count does not change. No empty bullet point appears.
- **Priority:** High

### TC-102 — Whitespace-only input does not add an item

- **AC reference:** Negative
- **Preconditions:** Input field contains only spaces.
- **Test data:** `"     "` (5 spaces)
- **Steps:**
  1. Type 5 spaces into the input field.
  2. Press `Enter`.
- **Expected result:** No item is added. The whitespace is trimmed and treated as empty.
- **Priority:** High

### TC-103 — Unchecking a completed item returns it to active state

- **AC reference:** Negative (must NOT stay completed)
- **Preconditions:** `Buy groceries` is completed.
- **Test data:** —
- **Steps:**
  1. Click the checked checkbox next to `Buy groceries`.
- **Expected result:**
  - `Buy groceries` loses the strikethrough styling.
  - Checkbox becomes unchecked.
  - Footer active count increments by 1.
  - Item disappears from the `Completed` filter view.
- **Priority:** High

### TC-104 — Pressing Enter during edit with empty text deletes the item

- **AC reference:** Negative
- **Preconditions:** Item `Clean the house` exists.
- **Test data:** Clear all text during edit.
- **Steps:**
  1. Double-click `Clean the house` to enter edit mode.
  2. Select all text and delete it.
  3. Press `Enter`.
- **Expected result:** The item is removed from the list (same as destroy). It must NOT remain as an empty bullet.
- **Priority:** Medium

### TC-105 — Escape key during edit cancels the edit and restores original text

- **AC reference:** Negative
- **Preconditions:** Item `Read a book` exists.
- **Test data:** Type `CHANGED TEXT` during edit, then cancel.
- **Steps:**
  1. Double-click `Read a book` to enter edit mode.
  2. Clear the text and type `CHANGED TEXT`.
  3. Press `Escape`.
- **Expected result:** The edit is cancelled. The item still reads `Read a book`. The original text is preserved.
- **Priority:** Medium

### TC-106 — Destroying the only item in the list returns to empty state

- **AC reference:** Negative / AC4
- **Preconditions:** Exactly one item exists: `Last item`.
- **Test data:** —
- **Steps:**
  1. Hover over `Last item`.
  2. Click the `X` button.
- **Expected result:**
  - The item is removed.
  - The list returns to the initial empty state.
  - The footer (filters, count) disappears.
  - Only the input field remains.
- **Priority:** High

---

## 3. Edge Cases

### TC-201 — Adding a todo with special characters (XSS prevention)

- **Test data:** `<script>alert("XSS")</script>`
- **Steps:**
  1. Type the script tag string into the input.
  2. Press `Enter`.
- **Expected result:** The item is added with the literal text `<script>alert("XSS")</script>`. No JavaScript executes. No HTML is interpreted.
- **Priority:** High *(security-relevant)*

### TC-202 — Adding a todo with Unicode and emoji

- **Test data:** `学习中文 🚀 — finish homework`
- **Steps:**
  1. Type the Unicode/emoji string.
  2. Press `Enter`.
- **Expected result:** Item displays all characters correctly — Chinese characters, emoji, and em-dash. No mojibake or truncation.
- **Priority:** Medium

### TC-203 — Adding a very long todo (500+ characters)

- **Test data:** `A` repeated 500 times.
- **Steps:**
  1. Paste a 500-character string.
  2. Press `Enter`.
- **Expected result:** Item is added successfully. Text either wraps or truncates with ellipsis. No layout breakage.
- **Priority:** Low

### TC-204 — Adding duplicate items (same text)

- **Test data:** `Buy milk` added twice.
- **Steps:**
  1. Add `Buy milk`.
  2. Add `Buy milk` again.
- **Expected result:** Both items appear in the list independently. They can be completed and deleted independently. Duplicates are allowed.
- **Priority:** Medium

### TC-205 — Editing an item via double-click

- **Preconditions:** Item `Buy groceries` exists.
- **Test data:** Change to `Buy organic groceries`.
- **Steps:**
  1. Double-click `Buy groceries`.
  2. An edit input field appears with the current text.
  3. Clear and type `Buy organic groceries`.
  4. Press `Enter`.
- **Expected result:** The item updates to `Buy organic groceries`. No new item is created. Position in the list remains the same.
- **Priority:** High

### TC-206 — Editing and clicking outside (blur) confirms the change

- **Preconditions:** Item `Read a book` exists, edit mode active.
- **Test data:** Change to `Read two books`.
- **Steps:**
  1. Double-click `Read a book`.
  2. Clear and type `Read two books`.
  3. Click outside the editing field (blur).
- **Expected result:** Edit is confirmed on blur. Item updates to `Read two books`.
- **Priority:** Medium

### TC-207 — Filter: "Active" shows only active items

- **Preconditions:** 2 active items, 2 completed items.
- **Test data:** —
- **Steps:**
  1. Click the `Active` filter link in the footer.
- **Expected result:** Only the 2 active items are visible. Completed items are hidden.
- **Priority:** High

### TC-208 — Filter: "All" shows all items regardless of state

- **Preconditions:** Items exist in both active and completed states. A filter other than "All" is currently active.
- **Test data:** —
- **Steps:**
  1. Click the `All` filter link.
- **Expected result:** All items (active + completed) are visible. Completed ones still show strikethrough.
- **Priority:** High

### TC-209 — Items persist after page reload (localStorage)

- **Preconditions:** 4 items added; 2 completed.
- **Test data:** —
- **Steps:**
  1. Reload the page (F5 / browser refresh).
- **Expected result:**
  - All 4 items are still present.
  - The 2 completed items still show as completed.
  - The footer count matches (`2 items left`).
- **Priority:** High

### TC-210 — Toggle-all unchecks all when every item is completed

- **Preconditions:** All 4 items are completed.
- **Test data:** —
- **Steps:**
  1. Click the toggle-all chevron.
- **Expected result:** All items become active again (strikethrough removed, checkboxes unchecked). Footer shows `4 items left`.
- **Priority:** Medium

### TC-211 — Leading/trailing whitespace in input is trimmed

- **Test data:** `"   Trim me   "` (leading/trailing spaces)
- **Steps:**
  1. Type `   Trim me   ` into the input.
  2. Press `Enter`.
- **Expected result:** Item is added with the trimmed text `Trim me`. No leading/trailing whitespace displayed.
- **Priority:** Medium

### TC-212 — Item count uses correct pluralization

- **Preconditions:** Exactly 1 active item.
- **Test data:** —
- **Steps:**
  1. Ensure only 1 active item exists.
  2. Read the footer counter.
- **Expected result:** Footer displays `1 item left` (singular). With 2+ items it displays `X items left` (plural).
- **Priority:** Low

---

## 4. Non-functional

### TC-301 — All interactive elements are keyboard navigable

- **Steps:**
  1. Use `Tab` to navigate between the input, todo items, checkboxes, and filter links.
  2. Use `Enter` to add items, `Space` to toggle checkboxes.
- **Expected result:** Every action achievable by mouse is also achievable by keyboard. Focus is visible on each element.
- **Priority:** High

### TC-304 — Performance: adding 50 items does not degrade interaction

- **Steps:**
  1. Programmatically add 50 todo items.
  2. Toggle, edit, and delete items.
- **Expected result:** No perceptible lag (< 100ms per interaction). Scrolling is smooth.
- **Priority:** Low

### TC-305 — XSS: img onerror renders as text, not executable HTML

- **Test data:** `<img src=x onerror=alert(1)>`
- **Steps:**
  1. Add the above string as a todo item.
  2. Inspect the rendered DOM.
- **Expected result:** String renders as literal text. No DOM injection. No script execution.
- **Priority:** High

---

## AC Revalidation Checklist

| AC | Validated By | Pass Criteria |
| --- | --- | --- |
| AC1: Create a todo list | TC-001, TC-002 | Page loads with empty list, input ready |
| AC2: Add items (4) | TC-003, TC-004, TC-005, TC-006 | Four distinct items added sequentially; all visible; count = 4 |
| AC3: Finish items — expect to be finished | TC-007, TC-008, TC-009, TC-010 | Items show completed styling; count decrements; appear in Completed filter |
| AC4: Remove item — expect to be removed | TC-011, TC-012, TC-013 | Items disappear from list; count updates; not recoverable from UI |

---

## Ambiguities & Gaps

1. **"Create a todo list" (AC1)** — The list exists by default on page load. Assumed: navigating to the page IS creating the list.
2. **"Add items (4)" (AC2)** — Does the number 4 mean "at least 4" or "exactly 4"? Assumed: demonstrate with 4 items; no upper bound.
3. **"Finish items" (AC3)** — Does this mean complete ONE item or ALL items? Test plan covers both.
4. **"Remove item" (AC4)** — Remove by X button only, or also via "Clear completed"? Test plan covers both.
5. **Edit functionality** — Not mentioned in ACs but exists in the app. Covered in edge cases (TC-205, TC-206).
6. **Filters (All / Active / Completed)** — Not mentioned in ACs but integral to the app UX. Covered in TC-207, TC-208.
7. **Persistence (localStorage)** — Not mentioned but critical for UX. Covered in TC-209.
8. **Clear completed button** — Not mentioned but part of the "remove" workflow. Covered in TC-013.
9. **Toggle-all** — Not mentioned in ACs but exists in the app. Covered in TC-010, TC-210.
10. **Browser scope** — Chromium only per current config.
