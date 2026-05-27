# Prompt — Test Plan for TodoMVC Application

## Role

You are a senior QA engineer reviewing the feature described below.
Think rigorously about user impact, risk, and edge cases before writing test cases.

## Task

Create a detailed test plan for the **TodoMVC** application.

## Context

- **Application URL:** https://demo.playwright.dev/todomvc/#/
- **Surface area:** Web UI — React-based single-page application
- **Framework:** React • TodoMVC (Playwright demo)
- **Users:** Any user (no auth required)
- **Environments:** Chromium, Firefox, WebKit
- **State management:** Client-side (localStorage)

## Acceptance Criteria

All features should be covered:

1. Create a todo list
2. Add items (4)
3. Finish items. Expect to be finished
4. Remove item from the list. Expect to be removed

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
  - **Title** — expected behavior, not the action
  - **AC reference** — which AC(s) this covers, or "Edge" / "Negative"
  - **Preconditions** — state, data, roles, feature flags
  - **Test data** — concrete values used in the steps
  - **Steps** — numbered, action-oriented, one action per step
  - **Expected result** — observable outcome
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
- End with an **"Ambiguities & Gaps"** section.
- Revalidate output against the ACs.
