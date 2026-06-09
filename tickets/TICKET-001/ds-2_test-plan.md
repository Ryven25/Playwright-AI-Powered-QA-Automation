# Test Plan — DS-2: Edit Existing Program Details

**Feature:** Edit existing program details
**Jira ticket:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2)
**Role under test:** Admin user
**Surface:** Web UI — Programs page (admin console)
**Source story:** *As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.*
**Status:** In Progress
**Assignee:** Kid KiddosBA

---

## Traceability Matrix (AC → Test Cases)

| AC | Scenario | Covering Test Cases |
| --- | --- | --- |
| AC1 | Open program for editing | TC-001, TC-002 |
| AC2 | Successfully edit a program name | TC-003, TC-004 |
| AC3 | Edit preserves unchanged fields | TC-005, TC-006 |
| — | Negative paths | TC-101 → TC-105 |
| — | Edge cases | TC-201 → TC-206 |
| — | Non-functional | TC-301, TC-302 |

---

## Acceptance Criteria (from Jira)

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

## 1. Positive Flows

### TC-001 — Edit icon opens a pre-populated edit form

- **AC reference:** AC1
- **Preconditions:**
  - Logged in as Admin
  - Program `Web Development 2026` exists with Name and Description set
- **Test data:** Existing program with Name = `Web Development 2026`, Description = `Full-stack web development program`
- **Steps:**
  1. Navigate to the Programs page.
  2. Locate the row for `Web Development 2026`.
  3. Click the edit icon on that row.
- **Expected result:**
  - An "Edit Program" dialog opens.
  - The Program Name field is pre-populated with `Web Development 2026`.
  - The Description field is pre-populated with `Full-stack web development program`.
- **Priority:** High

### TC-002 — Edit modal displays correct dialog heading

- **AC reference:** AC1
- **Preconditions:** As TC-001.
- **Test data:** `Web Development 2026`
- **Steps:**
  1. Click the edit icon on `Web Development 2026`.
- **Expected result:** Dialog heading reads `Edit Program`.
- **Priority:** Medium

### TC-003 — Editing program name and saving updates the list immediately

- **AC reference:** AC2
- **Preconditions:**
  - Admin logged in.
  - Program `Web Development 2026` exists.
- **Test data:** New Name = `Web Development 2026 - Updated`
- **Steps:**
  1. Click the edit icon on `Web Development 2026`.
  2. Clear the Name field and type `Web Development 2026 - Updated`.
  3. Click Save.
- **Expected result:**
  - The modal closes.
  - The program list immediately shows `Web Development 2026 - Updated`.
  - The old name `Web Development 2026` no longer appears.
- **Priority:** High

### TC-004 — Successfully edit a program description

- **AC reference:** AC2
- **Preconditions:** Program exists with a known description.
- **Test data:** New Description = `Updated full-stack program for 2026 cohort`
- **Steps:**
  1. Click the edit icon on the target program.
  2. Clear the Description field and type `Updated full-stack program for 2026 cohort`.
  3. Click Save.
- **Expected result:**
  - The modal closes.
  - The program list shows the new description.
- **Priority:** High

### TC-005 — Edit preserves unchanged Name when only Description is modified

- **AC reference:** AC3
- **Preconditions:** Program `Web Development 2026` with Description `Original`.
- **Test data:** New Description = `Changed only this field`
- **Steps:**
  1. Click the edit icon on `Web Development 2026`.
  2. Verify Name field shows `Web Development 2026` (pre-populated).
  3. Change only the Description to `Changed only this field`.
  4. Click Save.
- **Expected result:**
  - The modal closes.
  - Program Name in the list remains `Web Development 2026`.
  - Description in the list shows `Changed only this field`.
- **Priority:** High

### TC-006 — Edit preserves unchanged Description when only Name is modified

- **AC reference:** AC3
- **Preconditions:** Program with Name = `Original Program`, Description = `Keep this`.
- **Test data:** New Name = `Renamed Program`
- **Steps:**
  1. Click the edit icon on `Original Program`.
  2. Change only the Name to `Renamed Program`.
  3. Click Save.
- **Expected result:**
  - The list shows `Renamed Program` with Description `Keep this` unchanged.
- **Priority:** High

---

## 2. Negative Flows

### TC-101 — Cancel edit does not persist changes

- **AC reference:** Negative
- **Preconditions:** Edit modal open for an existing program.
- **Test data:** Temporary edit `Should Not Persist`
- **Steps:**
  1. Open the edit modal for a program.
  2. Change the Name to `Should Not Persist`.
  3. Click Cancel.
- **Expected result:**
  - The modal closes.
  - The program list still shows the original name.
  - `Should Not Persist` does not appear anywhere.
- **Priority:** High

### TC-102 — Empty name disables Save button

- **AC reference:** Negative
- **Preconditions:** Edit modal open.
- **Test data:** Clear the Name field entirely.
- **Steps:**
  1. Open the edit modal for any program.
  2. Clear the Program Name field (leave empty).
- **Expected result:**
  - Save button is disabled.
  - User cannot submit the form without a valid name.
- **Priority:** High

### TC-103 — Whitespace-only name disables Save button

- **AC reference:** Negative
- **Preconditions:** Edit modal open.
- **Test data:** Name = `   ` (spaces only)
- **Steps:**
  1. Open the edit modal for any program.
  2. Clear the Name field and enter only spaces `   `.
- **Expected result:**
  - Save button is disabled.
- **Priority:** Medium

### TC-104 — Escape key closes modal without saving

- **AC reference:** Negative
- **Preconditions:** Edit modal open with unsaved changes.
- **Test data:** Modified name.
- **Steps:**
  1. Open the edit modal.
  2. Change the program name.
  3. Press Escape.
- **Expected result:**
  - Modal closes.
  - Original name is preserved in the list.
- **Priority:** Medium

### TC-105 — Close (X) button closes modal without saving

- **AC reference:** Negative
- **Preconditions:** Edit modal open with unsaved changes.
- **Test data:** Modified description.
- **Steps:**
  1. Open the edit modal.
  2. Change the description.
  3. Click the X (close) button on the modal.
- **Expected result:**
  - Modal closes.
  - Original values remain in the list.
- **Priority:** Low

---

## 3. Edge Cases

### TC-201 — Edit name with special characters

- **AC reference:** Edge
- **Preconditions:** Program exists.
- **Test data:** New Name = `Informatique & IA — Niveau 2`
- **Steps:**
  1. Open the edit modal.
  2. Change Name to `Informatique & IA — Niveau 2`.
  3. Click Save.
- **Expected result:** Program list shows `Informatique & IA — Niveau 2` correctly.
- **Priority:** Medium

### TC-202 — Edit name with Unicode characters

- **AC reference:** Edge
- **Preconditions:** Program exists.
- **Test data:** New Name = `数据科学课程`
- **Steps:**
  1. Open the edit modal.
  2. Change Name to `数据科学课程`.
  3. Click Save.
- **Expected result:** Program list shows `数据科学课程` correctly.
- **Priority:** Medium

### TC-203 — Edit name with XSS payload renders as text

- **AC reference:** Edge (Security)
- **Preconditions:** Program exists.
- **Test data:** New Name = `<script>alert("xss")</script>`
- **Steps:**
  1. Open the edit modal.
  2. Change Name to `<script>alert("xss")</script>`.
  3. Click Save.
- **Expected result:**
  - No script execution.
  - Program list shows the literal text `<script>alert("xss")</script>`.
- **Priority:** High

### TC-204 — Edit with leading/trailing whitespace trims name

- **AC reference:** Edge
- **Preconditions:** Program exists.
- **Test data:** New Name = `   Trimmed Program   `
- **Steps:**
  1. Open edit modal.
  2. Change Name to `   Trimmed Program   `.
  3. Click Save.
- **Expected result:** Program list shows `Trimmed Program` (trimmed).
- **Priority:** Low

### TC-205 — Saving without making any changes

- **AC reference:** Edge
- **Preconditions:** Edit modal open, no modifications.
- **Steps:**
  1. Open the edit modal for a program.
  2. Do not change any fields.
  3. Click Save.
- **Expected result:**
  - Modal closes without error.
  - Program data remains unchanged in the list.
- **Priority:** Low

### TC-206 — Edit name to a very long value

- **AC reference:** Edge
- **Preconditions:** Program exists.
- **Test data:** New Name = 200+ characters
- **Steps:**
  1. Open the edit modal.
  2. Enter a name with 200+ characters.
  3. Click Save.
- **Expected result:**
  - Either the name is accepted and displayed (possibly truncated in UI), or
  - A max-length validation prevents submission.
- **Priority:** Low

---

## 4. Non-functional

### TC-301 — Form fields have accessible labels

- **AC reference:** Non-functional (a11y)
- **Preconditions:** Edit modal open.
- **Steps:**
  1. Open the edit modal.
  2. Inspect that Program Name and Description fields have associated labels.
- **Expected result:**
  - `getByLabel('Program Name')` and `getByLabel('Description')` resolve correctly.
  - Screen readers can identify each field.
- **Priority:** Medium

### TC-302 — Keyboard navigation through edit form

- **AC reference:** Non-functional (a11y)
- **Preconditions:** Edit modal open.
- **Steps:**
  1. Open the edit modal.
  2. Tab through fields: Program Name → Description → Cancel → Save.
- **Expected result:**
  - Focus moves sequentially through all interactive elements.
  - Focus is trapped within the modal (does not escape to background).
- **Priority:** Low

---

## Ambiguities & Gaps

| # | Issue | Type | Question for PM/Engineering |
| --- | --- | --- | --- |
| 1 | **What other fields exist?** | Missing AC | AC3 says "other fields remain unchanged" — which fields beyond Name and Description? (Total Hours, Session Hours, Target Audience, etc.) |
| 2 | **Duplicate name on edit** | Missing AC | Can a user rename a program to a name that already exists? Is duplicate validation enforced on edit? |
| 3 | **Save button behavior** | Unclear | Is Save always enabled, or only when a change is detected (dirty state)? |
| 4 | **Confirmation on cancel** | Unclear | If the user has unsaved changes and clicks Cancel/Escape, is there a "Discard changes?" confirmation? |
| 5 | **Concurrent editing** | Missing AC | What happens if two admins edit the same program simultaneously? (Last-write-wins? Conflict warning?) |
| 6 | **Max field lengths** | Missing AC | What are the character limits for Program Name and Description? |
| 7 | **Audit trail** | Missing AC | Are edits logged or versioned? (Not testable from UI unless a history view exists.) |

### Assumptions Made

- The edit form is a modal dialog (confirmed via app inspection: `dialog "Edit Program"`).
- The Save button is disabled when the Program Name is empty or whitespace-only (same validation as Create).
- Duplicate names are allowed on edit (same behavior as creation — no server-side uniqueness check).
- No "unsaved changes" confirmation dialog exists (Escape/Cancel immediately discards).
