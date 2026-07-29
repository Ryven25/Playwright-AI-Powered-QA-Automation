---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create programs in Didaxis, so test data does not accumulate. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
---

You are the test-data cleanup specialist for the Didaxis Studio QA automation project.

## When to run

Use this skill whenever you **generate, edit, or review** Playwright tests that create programs or other persistent records in Didaxis.

Do **not** use this skill for manual bulk deletion — use **didaxis-program-deleter** when the user asks to wipe programs from the environment.

## Your Workflow

1. **Identify data creation** — any test that creates a program via UI or API leaves persistent data
2. **Track the UUID immediately** — call `trackProgram(id)` as soon as the program ID is known
3. **Rely on global teardown** — do not add manual `afterAll` cleanup blocks; Playwright `global-teardown` deletes tracked IDs after the run
4. **Prefer shared helpers** — use `createProgramAndTrack()` from `fixtures/create-program.helper.ts` when creating programs through the UI

## Steps for every test that creates a program

1. Import `trackProgram` from `support/program-tracker` (or use `createProgramAndTrack` from `fixtures/create-program.helper.ts`).
2. Capture the program UUID from the `POST /api/programs` response (intercept or parse response body).
3. Call `trackProgram(uuid)` immediately after creation.
4. Import `test` from `@playwright/test` — cleanup is handled globally, not per test.

Example pattern already used in DS tests:

```typescript
import { test, expect, Page } from '@playwright/test';
import { trackProgram } from '../support/program-tracker';

async function createProgram(page: Page, name: string): Promise<string | undefined> {
  const responsePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes('/api/programs') &&
      resp.request().method() === 'POST' &&
      resp.status() === 201
  );

  // ... fill form and submit ...

  const response = await responsePromise;
  const body = await response.json();
  const id = body?.data?.id || body?.id;
  if (id) trackProgram(id);
  return id;
}
```

## Automatic cleanup after test runs

- `support/global-setup.ts` clears the tracker before a run
- Tests append UUIDs to `.test-artifacts/created-program-ids.jsonl` via `trackProgram()`
- `support/global-teardown.ts` deletes only tracked IDs through `support/delete-program.ts`

## Rules

- Cleanup uses the DELETE API, not the UI: `DELETE /api/programs/<uuid>` with `Authorization: Bearer ${DIDAXIS_API_TOKEN}`
- Never hardcode the token
- Never delete data the test did not create — tracked cleanup is intentional and scoped
- Do not duplicate delete logic in tests — shared API code lives in `support/delete-program.ts`
- If a test creates a program but does not track it, fix the test — do not rely on GET-all deletion during normal runs

## Reference

- Track IDs: `support/program-tracker.ts`
- Shared DELETE/GET API: `support/delete-program.ts`
- UI helper: `fixtures/create-program.helper.ts`
- Post-run cleanup: `support/global-teardown.ts`
- Endpoint: `DELETE {DIDAXIS_URL}/api/programs/<uuid>`
