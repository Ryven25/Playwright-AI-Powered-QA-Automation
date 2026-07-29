---
name: pom-conventions
description: POM conventions for Playwright tests. Apply whenever generating, refactoring, or reviewing tests — even if not asked. Tests should never contain inline locators.
---

# POM Conventions

Page Object Model rules for Didaxis Studio Playwright tests. Every locator
lives in a page or component class; test files orchestrate actions and hold
all assertions.

## Steps

1. One Page Object per page/component
2. Locators in constructor, getByRole/Label
3. Methods for actions, never assertions
4. All expect(...) lives in test files
5. Compose: ProgramsPage holds NewProgramModal

## Didaxis app map (from live inspection)

Explore the app with Playwright MCP (`browser_navigate`, `browser_snapshot`)
before adding or refactoring page objects. Current authenticated shell:

| Layer | Route / trigger | Page object | Notes |
|-------|-----------------|-------------|-------|
| Login | `/login` | `LoginPage` | Email, Password, Sign In |
| App shell | all authenticated routes | `AppShell` (optional) | Sidebar nav: Dashboard, Programs, Calendar, Validation, Scheduler, Export, Settings; Sign out |
| Programs list | `/programs` | `ProgramsPage` | Heading, table, `+ New Program`, row Edit/Delete |
| Create modal | `+ New Program` click | `NewProgramModal` | Dialog `"New Program"`; Create disabled until name filled |
| Edit modal | `Edit {name}` click | `EditProgramModal` | Dialog `"Edit Program"`; Save / Cancel |
| Delete confirm | `Delete {name}` click | method on `ProgramsPage` | Native `window.confirm` — use `page.once('dialog', …)` in **tests**, wrap click in page object |

### Locator pitfalls (Didaxis-specific)

- Row actions use accessible names: `Edit {programName}`, `Delete {programName}`.
- **Never** use bare `getByLabel('Description')` on `/programs`. Programs whose
  names contain `"Description"` (e.g. `No Description Program-…`) expose Edit/Delete
  buttons whose `aria-label` also contains `"Description"`, causing strict-mode
  violations. Scope modal fields to the dialog:

```typescript
this.dialog.getByRole('textbox', { name: 'Description' });
// or
page.getByRole('dialog', { name: 'New Program' }).getByLabel('Program Name');
```

- Prefer `getByRole('dialog', { name: '…' })` as the modal root.
- Table: `getByRole('table')`, `getByRole('columnheader', { name: 'Program' })`.
- Program name/description in a row: `getByText(name)` after creation; row cells
  use `paragraph` elements inside `cell`.

## Folder layout

```
features/
  DS-{N}/
    DS-{N}.feature.md
    DS-{N}_test_plan.md
tests/
  ds{N}-{slug}.spec.ts   # filename N must match Jira DS-N
pages/
  didaxis/
    login.page.ts
    programs.page.ts
    components/
      new-program.modal.ts
      edit-program.modal.ts
      app-shell.component.ts   # optional — sidebar nav only
```

- Specs: `tests/ds{N}-{slug}.spec.ts` and `describe('DS-{N}: …')` use the **same** Jira number.
- One class per file; filename matches class (`programs.page.ts` → `ProgramsPage`).
- Modals and reusable widgets go under `components/`.
- Shared constants (routes, auth paths) stay in `support/` — not in page objects.

## Class rules

### Constructor

- Accept `Page` (or `Locator` for components rooted in a dialog).
- Declare locators as `readonly` fields initialized in the constructor.
- Use `getByRole` first, then `getByLabel`, then `getByText` only for dynamic content.

### Methods

- Name methods after user actions: `openNewProgramModal()`, `fillProgramName(name)`,
  `clickCreate()`, `editProgram(name)`, `confirmDelete(name)`.
- Return `this`, another page object, or void — never `expect`.
- API tracking (`trackProgram`) belongs in test helpers/fixtures, not page objects.

### Composition

`ProgramsPage` owns modal instances:

```typescript
export class ProgramsPage {
  readonly newProgram: NewProgramModal;
  readonly editProgram: EditProgramModal;

  constructor(readonly page: Page) {
    this.newProgram = new NewProgramModal(page);
    this.editProgram = new EditProgramModal(page);
    // page-level locators …
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
    await this.page.waitForLoadState('networkidle');
  }
}
```

Modal class example:

```typescript
export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
  }

  async fill(name: string, description?: string): Promise<void> {
    await this.programName.fill(name);
    if (description) await this.description.fill(description);
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }
}
```

## Test file rules

- Import page classes; **no** `page.getByRole(…)` / `page.getByLabel(…)` in tests.
- `beforeEach`: navigate via page object (`await programsPage.goto()`).
- Auth: reuse `storageState` from `auth.setup.ts` — do not log in per test.
- All `expect(…)` stays in the spec; page objects expose locators or small getters
  when assertions need them (e.g. `programsPage.programRow(name)`).

```typescript
test('TC-01: Successfully create a new program', async ({ page }) => {
  const programs = new ProgramsPage(page);
  await programs.goto();

  await programs.openNewProgramModal();
  await programs.newProgram.fill(name, 'Automated test program');
  await programs.newProgram.submit();

  await expect(page.getByText(name)).toBeVisible();
});
```

## Refactor checklist

When touching existing specs:

1. Extract duplicated inline locators into the correct page/component class.
2. Replace bare `getByLabel('Description')` with dialog-scoped locators.
3. Move helper functions that mix actions + assertions into page object methods
   (actions) + test assertions (expects).
4. Keep `fixtures/` for cross-cutting test utilities (API tracking, cleanup) — not UI locators.

## Output

- New pages: `pages/didaxis/<name>.page.ts` or `pages/didaxis/components/<name>.ts`
- Refactored specs: same `tests/*.spec.ts` paths; imports updated to page objects
- No inline locators left in test files
