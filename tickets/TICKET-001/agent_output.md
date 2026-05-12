# Agent Output — Reviewed Prompt Template

> **Note:** The original prompt was a *template* with unfilled placeholders
> (`[FEATURE NAME]`, `[Paste from Jira]`), so no concrete test plan could be
> generated. The agent's deliverable here is a **reviewed and improved
> version of the template itself**, ready to be filled in for a real ticket.

---

## Reviewed Prompt Template

```markdown
# Prompt Template — Test Plan from a Jira Ticket

## Role
You are a senior QA engineer reviewing the feature described below.
Think rigorously about user impact, risk, and edge cases before writing test cases.

## Task
Create a detailed test plan for the **[FEATURE NAME]** feature.

## Context
- Jira ticket: [KEY-123 / link]
- Surface area: [web UI / mobile / API / backend job / etc.]
- Roles / permissions: [e.g., admin, end user, guest]
- Environments: [browsers, devices, locales, OS versions]
- Dependencies / feature flags: [auth, third-party services, flags]
- Related tickets / designs: [links]

## Acceptance Criteria
[Paste verbatim from Jira]

## Requirements for the Test Plan
- Cover **every AC** with at least one positive test case.
- Add **edge cases** the ACs don't mention:
  boundary values, empty inputs, null/undefined, whitespace-only,
  special characters, Unicode/emoji, duplicates, max-length,
  off-by-one, timezone/DST, concurrency, slow network, offline.
- Add **negative test cases** (what must NOT happen): invalid input,
  unauthorized access, expired sessions, malformed payloads, etc.
- Include **non-functional checks** where relevant: accessibility (a11y),
  performance, security (XSS, SQLi, IDOR), i18n/l10n, responsive layout.
- Structure each test case as:
  - **ID** (TC-001, TC-002, …)
  - **Title** — expected behavior, not the action (e.g., "User sees error when email is missing")
  - **AC reference** — which AC(s) this covers, or "Edge" / "Negative"
  - **Preconditions** — state, data, roles, feature flags
  - **Test data** — concrete values used in the steps
  - **Steps** — numbered, action-oriented, one action per step
  - **Expected result** — observable outcome, including UI text / API status / DB state
  - **Priority** — High / Medium / Low
- **Priority rubric:**
  - **High** — blocks core flow, affects all users, security/data integrity
  - **Medium** — degrades UX or affects a subset of users
  - **Low** — cosmetic, rare paths, nice-to-have
- Group test cases under:
  1. **Positive flows**
  2. **Negative flows**
  3. **Edge cases**
  4. **Non-functional** (only if applicable)

## Output
- A structured test plan in **Markdown**.
- Use **real field names and values**, not placeholders.
- Include a **traceability table** at the top mapping each AC → TC IDs.
- End with an **"Ambiguities & Gaps"** section listing:
  - Unclear or contradictory ACs
  - Missing acceptance criteria
  - Open questions for PM / Engineering / Design
  - Assumptions you made while writing the plan
```

---

## Review Notes — What Changed and Why

| Change | Rationale |
| --- | --- |
| **Encoding fix on the title em-dash** | Original had `â€"` (mojibake) instead of `—`. |
| **Added a `Context` block** | Without surface area, roles, and environment, the model invents platform details. Forcing this up front prevents generic output. |
| **Expanded edge-case list** | Added null/whitespace, Unicode/emoji, off-by-one, timezone, concurrency, network conditions — the categories most often missed by junior QA prompts. |
| **Added a `Non-functional` bucket** | a11y, performance, security, i18n — kept optional so it doesn't pad small tickets. |
| **Added `AC reference` and `Test data` fields per test case** | Makes the plan reviewable and executable instead of abstract. |
| **Defined a priority rubric** | Without it, High / Medium / Low gets assigned inconsistently across runs. |
| **Required a traceability table (AC → TC)** | Makes coverage gaps obvious at a glance during review. |
| **Strengthened the "Ambiguities & Gaps" section** | Explicitly asks for open questions and assumptions, not just gaps. |

---

## Status

- **Prompt template:** ✅ reviewed and improved
- **Concrete test plan:** ⏸ not generated — awaiting `[FEATURE NAME]` and real ACs from Jira

## Next Step for the User

Replace the placeholders in `prompt_input.md` with:
1. The real feature name
2. The actual acceptance criteria pasted from Jira
3. The `Context` fields (surface area, roles, environments, etc.)

Then re-run the agent. The generated test plan will replace this file.
