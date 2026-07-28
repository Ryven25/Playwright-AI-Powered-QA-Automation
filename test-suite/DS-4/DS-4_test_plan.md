# Test Plan: Delete Program with Confirmation

**Jira:** [DS-4](https://legionqaschool.atlassian.net/browse/DS-4)  
**Role:** Admin user  
**Surface:** Web UI — Programs page (`/programs`) + native `window.confirm`  
**Story:** As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

---

## Traceability (AC → Test Cases)

| AC | Scenario | Test cases |
| --- | --- | --- |
| AC1 | Delete program with confirmation | TC-001, TC-002, TC-003, TC-006, TC-007, TC-008 |
| AC2 | Cancel program deletion | TC-004, TC-005 |
| — | Edge / isolation | TC-009, TC-010 |

**Automation:** `tests/ds4-delete-program.spec.ts`  
**Gherkin:** `test-suite/DS-4/DS-4.feature.md`

---

## 1. Positive flows

### TC-001 — Delete icon opens a confirmation dialog

- **AC reference:** AC1
- **Preconditions:** Admin logged in; program `Test Program` exists
- **Steps:**
  1. Open Programs page
  2. Click delete for `Test Program`
- **Expected result:** Native confirm dialog appears; program still in the list
- **Priority:** High
- **Automated:** Yes (`TC-01`)

### TC-002 — Confirmation message includes the program name

- **AC reference:** AC1
- **Preconditions:** Program `Test Program` exists
- **Steps:**
  1. Click delete for `Test Program`
- **Expected result:** Dialog message contains `Test Program`
- **Priority:** High
- **Automated:** Yes (`TC-07`)

### TC-003 — Confirming deletion removes the program from the list

- **AC reference:** AC1
- **Preconditions:** Program `Test Program` exists; confirm dialog will be accepted
- **Steps:**
  1. Click delete
  2. Accept confirmation
- **Expected result:** Dialog closes; list no longer shows `Test Program`
- **Priority:** High
- **Automated:** Yes (`TC-02`)

### TC-006 — Deleted program does not reappear after page refresh

- **AC reference:** AC1
- **Preconditions:** Program `Ephemeral Program` exists
- **Steps:**
  1. Delete with confirmation
  2. Reload the Programs page
- **Expected result:** Program remains absent after refresh
- **Priority:** High
- **Automated:** No (gap — add if product requires explicit persistence check)

---

## 2. Cancel / negative flows

### TC-004 — Cancel keeps the program in the list

- **AC reference:** AC2
- **Preconditions:** Program `Web Development 2026` exists
- **Steps:**
  1. Click delete
  2. Dismiss / Cancel confirmation
- **Expected result:** Dialog closes; program still listed
- **Priority:** High
- **Automated:** Yes (`TC-03`)

### TC-005 — Dismissing confirmation does not delete the program

- **AC reference:** AC2 / Negative
- **Preconditions:** Program `Keep Me Program` exists
- **Steps:**
  1. Click delete
  2. Dismiss without confirming
- **Expected result:** Program still listed
- **Priority:** High
- **Automated:** Yes (`TC-04`)

### TC-009 — Deleting one program does not affect other programs

- **AC reference:** Negative
- **Preconditions:** `Keep Program A` and `Remove Program B` exist
- **Steps:**
  1. Confirm delete for `Remove Program B`
- **Expected result:** `Remove Program B` gone; `Keep Program A` still visible
- **Priority:** High
- **Automated:** Yes (`TC-05`)

---

## 3. Edge cases

### TC-007 — Confirmation warns that deletion cannot be undone

- **AC reference:** Edge (observed copy)
- **Preconditions:** Program exists
- **Steps:**
  1. Click delete
- **Expected result:** Dialog message contains `cannot be undone`
- **Priority:** Medium
- **Automated:** Yes (`TC-08`)

### TC-008 — Delete program whose name contains special characters

- **AC reference:** Edge
- **Preconditions:** Program named `Prog & "Quotes" <Tags>` exists
- **Steps:**
  1. Confirm delete
- **Expected result:** That program is removed from the list
- **Priority:** Medium
- **Automated:** Yes (`TC-06`)

### TC-010 — Confirmation message for special-character names remains readable

- **AC reference:** Edge
- **Preconditions:** Program with `&`, quotes, or `<>` in the name exists
- **Steps:**
  1. Click delete
- **Expected result:** Dialog text includes the program name without breaking the confirm UX
- **Priority:** Low
- **Automated:** Partial (covered via TC-06 + TC-07 pattern)

---

## Ambiguities & gaps

1. Confirmation UI is a native `window.confirm` (not specified in ACs).
2. Exact copy beyond name + “cannot be undone” is not contractual.
3. Toast after delete not specified.
4. Cascade / soft-delete / non-admin not in ACs.
5. **TC-006 (reload persistence)** not yet automated — recommended follow-up.
