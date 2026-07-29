# Test Plan: Program list filtering and display

**Jira:** [DS-5](https://legionqaschool.atlassian.net/browse/DS-5)  
**Role:** Admin user  
**Surface:** Web UI — Programs page (`/programs`)  
**Story:** As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

### Acceptance criteria (from Jira)

1. **AC1 — Display list with key details:** Given programs exist; when navigating to Programs; then a list shows each program's name and description.
2. **AC2 — Empty state:** Given no programs exist; when navigating to Programs; then a message indicates none have been created and a prompt to create the first program is shown.

---

## Traceability (AC → Test Cases)

| AC | Scenario | Test cases |
| --- | --- | --- |
| AC1 | Display list with name + description | TC-001, TC-002, TC-003, TC-004, TC-005 |
| AC2 | Empty state when no programs | TC-006 |
| — | Auth / edge | TC-007, TC-008, TC-009, TC-010 |

**Automation:** `tests/ds5-program-list.spec.ts`  
**Gherkin:** `features/DS-5/DS-5.feature.md`

---

## 1. Positive flows (AC1)

### TC-001 — Programs page shows heading and description

- **AC reference:** AC1
- **Preconditions:** Admin logged in
- **Steps:** Open Programs page
- **Expected:** Heading `Programs` and page description visible
- **Priority:** High

### TC-002 — Program list displays as a table with Program column

- **AC reference:** AC1
- **Steps:** Open Programs page (with ≥1 program)
- **Expected:** Table and `Program` column header visible
- **Priority:** High

### TC-003 — Each program shows its name

- **AC reference:** AC1
- **Steps:** Create program `List Display {ts}`; assert name in list
- **Expected:** Name visible
- **Priority:** High

### TC-004 — Each program shows its description

- **AC reference:** AC1
- **Steps:** Create program with unique description; assert description in list
- **Expected:** Description visible
- **Priority:** High

### TC-005 — Each row has Edit and Delete; New Program always visible

- **AC reference:** AC1 (manage)
- **Steps:** Create a program; assert Edit/Delete for that row; assert `+ New Program`
- **Expected:** Action buttons and New Program visible
- **Priority:** Medium

---

## 2. Empty state (AC2)

### TC-006 — Empty state when no programs exist

- **AC reference:** AC2
- **Preconditions:** Environment has **zero** programs (delete all via API / cleanup before assertion, or use a dedicated empty fixture)
- **Steps:**
  1. Ensure no programs remain
  2. Navigate to Programs page
- **Expected result:**
  - Message indicating no programs have been created
  - Prompt to create the first program (CTA / New Program guidance)
- **Priority:** High
- **Note:** If the app shows an empty table with no empty-state message, this TC fails → triage as **real app bug**. Do not soften assertions.

---

## 3. Negative / edge

### TC-007 — Unauthenticated access redirects to login

- **Steps:** Clear storage; goto `/programs`
- **Expected:** Redirect to `/login`; Sign In visible
- **Priority:** High

### TC-008 — Very long name displays

- **Steps:** Create name with 80+ trailing chars
- **Expected:** Name (or distinctive prefix) visible
- **Priority:** Low

### TC-009 — Program without description shows name only

- **Steps:** Create with name only
- **Expected:** Name visible
- **Priority:** Medium

### TC-010 — Newly created program appears at top of list

- **Steps:** Create `Latest {ts}`; assert first data row contains name
- **Expected:** Newest at top
- **Priority:** Medium

---

## Handoff to test-writer

- Spec path: `tests/ds5-program-list.spec.ts`
- Page objects: `pages/didaxis/programs.page.ts` (+ empty-state locators if missing)
- Use `createProgramAndTrack` / api-cleanup for created data
- Follow `pom-conventions` — no inline locators
- **Must implement TC-006 (empty state)** per AC2 — existing draft may omit it
