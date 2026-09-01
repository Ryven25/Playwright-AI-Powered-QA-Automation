# DS-134 Test Plan

**Jira:** [DS-134](https://legionqaschool.atlassian.net/browse/DS-134)

| AC / Bug | TC ID | Spec |
|----------|-------|------|
| 100-char name accepted | TC-13 | `tests/ds1-create-program.spec.ts` |
| >100-char name rejected | TC-14 | `tests/ds1-create-program.spec.ts` (`test.fail` while DS-134 open) |

## TC-13 — Accept exactly 100 characters

- **Preconditions:** Authenticated admin on `/programs`
- **Steps:** Open New Program → fill name `'A'.repeat(100)` → Create
- **Expected:** Modal closes; program visible in list
- **Priority:** High | **Tag:** `@regression`

## TC-14 — Reject over 100 characters

- **Preconditions:** Authenticated admin on `/programs`
- **Steps:** Open New Program → fill name `'A'.repeat(101)` → attempt Create
- **Expected:** Create disabled **or** inline validation error **or** submit blocked; program not in list
- **Known bug:** DS-134 — marked `test.fail` until product fix
- **Priority:** High | **Tag:** `@regression`
