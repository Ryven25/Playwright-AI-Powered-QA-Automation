Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: getByLabel('Email')
  - Password field: getByLabel('Password')
  - Sign In button: getByRole('button', { name: 'Sign In' })
- Programs page: /programs
  - "New Program" button: getByRole('button', { name: 'New Program' })
  - Modal form:
    - Program Name: getByLabel('Program Name')
    - Description: getByLabel('Description')
    - Create button: getByRole('button', { name: 'Create' })

## Credentials

Use dotenv. Read email and password from process.env:

- process.env.DIDAXIS_EMAIL
- process.env.DIDAXIS_PASSWORD
Do NOT hardcode credentials in the test file.

## Test plan

[Paste your Block 2 test plan for DS-1]

## Requirements

- TypeScript
- Use Playwright locators (getByRole, getByLabel, getByText)
- Login as the first step in each test (or use beforeEach)
- Each test is independent
- Use unique test data with Date.now() suffix
- Save as tests/ds1-create-program.spec.ts



# Prompt Template — Test Plan from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.
Think rigorously about user impact, risk, and edge cases before writing test cases.

## Task

Create a detailed test plan for the TODO MVC application.


## Acceptance Criteria
 All features should be covered
 1. create a todo list
 2. add items (4)
 3. finish items. Expect to be finished
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

  Revalidate your output agains the AC's.
