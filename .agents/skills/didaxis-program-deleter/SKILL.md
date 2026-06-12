---
name: didaxis-program-deleter
description: Deletes Didaxis programs via the REST API on user request. Fetches all program UUIDs with GET /api/programs, then deletes each one in a loop. Use when the user asks to delete programs, clean up test data, or remove all programs from Didaxis Studio.
---

You are the Didaxis program cleanup specialist for the QA automation project.

## When to run

Use this skill when the user **explicitly** asks to delete programs or wipe test data from Didaxis Studio, for example:

- "Delete all programs"
- "Clean up Didaxis"
- "Remove program `<uuid>`"

Do **not** run this for automatic post-test cleanup — that is handled by `global-teardown` and tracked IDs.

## Your Workflow

1. **Confirm deletion intent** — the user wants to remove programs from Didaxis Studio
2. **Verify environment** — ensure `.env` contains:
   - `DIDAXIS_URL` (e.g. `https://test.didaxis.studio`)
   - `DIDAXIS_API_TOKEN` (Bearer token for the programs API)
3. **Preview when helpful** — run `--dry-run` first if the user did not explicitly confirm deletion
4. **Fetch all program UUIDs** — call `GET {DIDAXIS_URL}/api/programs` and read each `data[].id`
5. **Delete in a loop** — for each UUID, call `DELETE {DIDAXIS_URL}/api/programs/<uuid>` via the shared module `support/delete-program.ts`
6. **Report results** — summarize how many programs were found, deleted, and failed

## Commands

Delete all programs (default — GET all IDs, then DELETE each):

```bash
npm run delete-all-programs
```

Preview all targets without deleting:

```bash
npm run delete-all-programs -- --all --dry-run
```

Delete specific program UUID(s) only:

```bash
npm run delete-all-programs -- --id <PROGRAM_UUID>
```

## API Reference

**GET** `{DIDAXIS_URL}/api/programs`

- Authorization: `Bearer {DIDAXIS_API_TOKEN}`
- Response shape:

```json
{
  "data": [
    { "id": "<uuid>", "name": "Program name" }
  ]
}
```

**DELETE** `{DIDAXIS_URL}/api/programs/<PROGRAM_UUID>`

- Authorization: `Bearer {DIDAXIS_API_TOKEN}`
- Successful delete response: `200` with `{"message":"Program deleted"}`

## Result Template

```
**Scope:** [all programs | specific UUID(s)]
**Found via GET:** [count]
**Deleted:** [uuid list]
**Failed:** [uuid + status + message, or "none"]
**Tracker reset:** [yes/no]
```

## Rules

- Always run from the project root so `.env` resolves correctly
- Default behavior is GET all programs, then DELETE every returned UUID in a loop
- Prefer `--dry-run` first when the user did not explicitly confirm deletion
- Do not delete programs unless the user asked for cleanup
- If GET fails with 401, verify `DIDAXIS_API_TOKEN` in `.env`
- If DELETE fails with 404, report that the program was already removed
- Reuse `support/delete-program.ts` — do not duplicate API logic inline
- After deleting all programs, the script resets `.test-artifacts/` via `initTracker()`
