---
name: self-heal
description: Repairs Playwright locator drift after triage classifies a red run as a test issue — never for a real app bug. Use ONLY when the build is red because a locator broke, fix the drifted selector, the test broke after a UI change, or heal the suite — and triage already says test issue (drift). If triage says real app bug or is ambiguous, stop and route to jira-bug-reporter instead.
---

# Self-Heal (Locator Drift)

Repairs **test issue (drift)** failures by re-discovering the element and patching the POM. Assertions stay untouched.

## Prerequisites

- **Triage complete** — `ci-failure-triage` (or `triage` agent) must classify the failure as **test issue (drift)** with root cause, failing test, trace path, and affected file.
- **Not eligible:** real app bug, ambiguous classification, or behavior is wrong (not the selector). → Stop and route to `jira-bug-reporter`.

## Steps

### 1. Require drift classification

Confirm triage output explicitly says **test issue (drift)**.

- Missing, ambiguous, or **real app bug** → **stop**. Do not heal. Route to `jira-bug-reporter`.
- Do not proceed on guesswork.

### 2. Find the failing locator and POM

From the Playwright trace and triage diagnosis:

- Identify the **failing locator** (strict-mode violation, timeout, element not found).
- Locate its definition in `pages/` (or component POM). The spec must not contain inline locators — see `pom-conventions`.

### 3. Re-discover via Playwright MCP a11y tree

Use Playwright MCP against the live app (`DIDAXIS_URL` from `.env`):

1. Navigate to the page/state where the test fails (login if needed).
2. `browser_snapshot` — read the **accessibility tree**.
3. Find the element by **role + current accessible name** (never guess from screenshots or stale copy).
4. Record the correct `getByRole` / scoped locator pattern.

### 4. Patch the POM — minimal role-based diff

- Edit **POM only** (`pages/**/*.ts`). **Never** edit `tests/**/*.spec.ts`.
- **Never** weaken, delete, or comment out assertions. Green via a weakened assertion is a bug — **stop and escalate**.
- Prefer `getByRole`, `getByLabel`, dialog scoping per `pom-conventions`.
- One locator fix per heal run.

### 5. Re-run and prove green

```bash
npx playwright test <failing-spec-path>
```

- Assertions must be **unchanged** from before the heal.
- Suite must pass with the patched locator only.
- If green requires touching assertions → **stop and escalate** (do not ship a fake heal).
- If the same locator error persists after re-discovery → stop and escalate.

### 6. Report and open a repair PR

Post a structured summary:

| Field | Content |
| --- | --- |
| Classification | test issue (drift) (from triage) |
| Failing test | spec + test name |
| Locator diff | old → new (file + line) |
| Re-discovery evidence | role + accessible name from a11y snapshot |
| Re-run result | green, N passed; failed run id/URL |
| PR | branch `heal/<short-description>` — **do not merge**; human approves |

Every heal becomes a PR linked to the failed CI run. **One repair per run.**

## Hard stops

- **Never heal a real app bug** — triage must say drift.
- **Never heal assertions** — `.cursor/hooks/guard-test-assertions` enforces this; bypass attempts are escalation, not success.
- **Never merge** a repair PR without explicit human approval.
- **Never** patch the spec to make red green.

## Related skills

- `ci-failure-triage` — must run first; supplies drift classification.
- `pom-conventions` — locator patterns and Didaxis pitfalls.
- `jira-bug-reporter` — route here when classification is not drift.
