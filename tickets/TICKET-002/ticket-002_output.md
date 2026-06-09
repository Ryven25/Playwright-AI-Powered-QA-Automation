# Test Plan — TICKET-002: Edit Existing Program Details

**Feature:** Edit existing program details
**Role under test:** Admin user
**Surface:** Web UI — Programs page (admin console)
**Source story:** *As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.*

---

## Traceability Matrix (AC → Test Cases)

| AC | Scenario | Covering Test Cases |
| --- | --- | --- |
| AC1 | Open program for editing | TC-001, TC-002, TC-003 |
| AC2 | Successfully edit a program name | TC-004, TC-005, TC-006 |
| AC3 | Edit preserves unchanged fields | TC-007, TC-008 |
| — | Negative paths | TC-101 → TC-108 |
| — | Edge cases | TC-201 → TC-211 |
| — | Non-functional | TC-301 → TC-305 |

---

## 1. Positive Flows

### TC-001 — Edit icon opens a pre-populated edit form

- **AC reference:** AC1
- **Preconditions:**
  - Logged in as Admin
  - Program `Web Development 2026` exists with Name = `Web Development 2026`, Description = `Full-stack web development bootcamp`
- **Test data:** Existing program `Web Development 2026`
- **Steps:**
  1. Navigate to the Programs page.
  2. Locate the row for `Web Development 2026`.
  3. Click the edit icon on that row.
- **Expected result:**
  - An edit modal opens.
  - The Name field shows `Web Development 2026`.
  - The Description field shows `Full-stack web development bootcamp`.
  - All other fields display their stored values.
  - Save button is enabled only when a change is made (or per design — see Gaps).
- **Priority:** High

### TC-002 — Edit modal title clearly identifies the program being edited

- **AC reference:** AC1
- **Preconditions:** As TC-001.
- **Test data:** `Web Development 2026`
- **Steps:**
  1. Open the edit modal for `Web Development 2026`.
- **Expected result:** Modal heading reads `Edit program: Web Development 2026` (or equivalent unambiguous label).
- **Priority:** Medium

### TC-003 — Cancel button closes the modal without persisting changes

- **AC reference:** AC1 (implied)
- **Preconditions:** Edit modal open for `Web Development 2026`.
- **Test data:** Temporary edit `Web Development 2026 (DRAFT)`
- **Steps:**
  1. Change Name to `Web Development 2026 (DRAFT)`.
  2. Click Cancel.
  3. Confirm discard if prompted.
  4. Re-open the edit modal for the same program.
- **Expected result:**
  - Modal closes after Cancel.
  - Programs list still shows `Web Development 2026`.
  - Re-opened edit form shows the original `Web Development 2026`, not the draft.
- **Priority:** High

### TC-004 — Editing Name and saving updates the list immediately

- **AC reference:** AC2
- **Preconditions:**
  - Admin logged in.
  - Program `Web Development 2026` exists.
- **Test data:** New Name = `Web Development 2026 - Updated`
- **Steps:**
  1. Open the edit modal for `Web Development 2026`.
  2. Change Name to `Web Development 2026 - Updated`.
  3. Click Save.
- **Expected result:**
  - Modal closes.
  - Programs list row immediately shows `Web Development 2026 - Updated` without manual refresh.
  - No duplicate row is created.
  - A success toast/confirmation appears (per design — see Gaps).
- **Priority:** High

### TC-005 — Saved changes persist after page reload

- **AC reference:** AC2
- **Preconditions:** TC-004 has been executed; program is now `Web Development 2026 - Updated`.
- **Test data:** —
- **Steps:**
  1. Refresh the Programs page (F5 / browser reload).
- **Expected result:** Row still shows `Web Development 2026 - Updated`.
- **Priority:** High

### TC-006 — Saved changes are visible to another admin in a separate session

- **AC reference:** AC2
- **Preconditions:**
  - Admin A and Admin B both logged in (separate browsers/incognito).
  - Both viewing the Programs page.
- **Test data:** Admin A edits `Web Development 2026` → `Web Development 2026 - Updated`.
- **Steps:**
  1. Admin A edits and saves the change.
  2. Admin B refreshes (or, if live updates are supported, observes without refresh).
- **Expected result:** Admin B sees `Web Development 2026 - Updated`.
- **Priority:** Medium

### TC-007 — Editing only Description preserves Name and other fields

- **AC reference:** AC3
- **Preconditions:**
  - Program `Web Development 2026` exists with Description = `Full-stack web development bootcamp`, Start Date = `2026-09-01`, Status = `Active`.
- **Test data:** New Description = `Full-stack web development bootcamp (updated curriculum 2026)`
- **Steps:**
  1. Open the edit modal for `Web Development 2026`.
  2. Change only the Description field.
  3. Click Save.
  4. Re-open the edit modal.
- **Expected result:**
  - Name = `Web Development 2026` (unchanged).
  - Description = the new value.
  - Start Date = `2026-09-01` (unchanged).
  - Status = `Active` (unchanged).
- **Priority:** High

### TC-008 — Editing multiple fields at once saves all changes atomically

- **AC reference:** AC2, AC3
- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** Name = `Web Dev 2026`, Description = `Updated description`
- **Steps:**
  1. Open the edit modal.
  2. Change Name and Description in the same edit.
  3. Click Save.
- **Expected result:**
  - Both fields update.
  - No partial update occurs (list reflects either both new values or neither — never mixed).
- **Priority:** High

---

## 2. Negative Flows

### TC-101 — Empty Name is rejected

- **AC reference:** Negative
- **Preconditions:** Edit modal open for `Web Development 2026`.
- **Test data:** Name = `` (empty)
- **Steps:**
  1. Clear the Name field.
  2. Click Save.
- **Expected result:**
  - Save is blocked.
  - Inline error displayed (e.g., `Name is required`).
  - Modal stays open.
  - Program list still shows `Web Development 2026` unchanged.
- **Priority:** High

### TC-102 — Whitespace-only Name is rejected

- **AC reference:** Negative / Edge
- **Preconditions:** Edit modal open.
- **Test data:** Name = `"   "` (three spaces)
- **Steps:**
  1. Replace Name with three spaces.
  2. Click Save.
- **Expected result:** Save blocked with validation error (`Name cannot be empty`). Whitespace is not accepted as a valid name.
- **Priority:** High

### TC-103 — Duplicate Name (case-sensitive) is rejected

- **AC reference:** Negative
- **Preconditions:**
  - Programs `Web Development 2026` and `Data Science 2026` both exist.
- **Test data:** Edit `Web Development 2026` → set Name to `Data Science 2026`
- **Steps:**
  1. Open edit modal for `Web Development 2026`.
  2. Change Name to `Data Science 2026`.
  3. Click Save.
- **Expected result:** Save rejected with `A program with this name already exists` (or equivalent). Original record unchanged.
- **Priority:** High *(if uniqueness is enforced — see Gaps)*

### TC-104 — Duplicate Name with different casing is rejected (if uniqueness is case-insensitive)

- **AC reference:** Negative / Edge
- **Preconditions:** Programs `Web Development 2026` and `Data Science 2026` exist.
- **Test data:** New Name = `DATA SCIENCE 2026`
- **Steps:**
  1. Edit `Web Development 2026`.
  2. Change Name to `DATA SCIENCE 2026`.
  3. Click Save.
- **Expected result:** Either rejected (if case-insensitive uniqueness) or accepted (if case-sensitive). Behavior matches the documented uniqueness rule.
- **Priority:** Medium *(see Gaps)*

### TC-105 — Non-admin user cannot see or use the edit icon

- **AC reference:** Negative / Authorization
- **Preconditions:** Logged in as a non-admin (e.g., student/instructor).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Either Programs page is inaccessible OR the edit icon is not rendered on program rows.
- **Priority:** High

### TC-106 — Non-admin direct API call to edit endpoint returns 403

- **AC reference:** Negative / Authorization
- **Preconditions:** Valid auth token for a non-admin user.
- **Test data:** `PUT /api/programs/{id}` with body `{ "name": "Hacked" }`
- **Steps:**
  1. Issue an authenticated edit request to the program endpoint using the non-admin token.
- **Expected result:** HTTP 403 Forbidden. Program in DB remains unchanged.
- **Priority:** High

### TC-107 — Network failure during Save surfaces an error and preserves user input

- **AC reference:** Negative
- **Preconditions:** Edit modal open with changes made.
- **Test data:** Simulate offline / kill backend mid-save.
- **Steps:**
  1. Edit Name and Description.
  2. Disable network.
  3. Click Save.
- **Expected result:**
  - User-friendly error toast/banner (`Could not save changes — please try again`).
  - Modal stays open with user's edits intact.
  - On network restore + retry, Save succeeds.
- **Priority:** High

### TC-108 — Server validation error is displayed clearly

- **AC reference:** Negative
- **Preconditions:** Backend returns 400 with field-level error, e.g., `{ "name": "Reserved name" }`.
- **Test data:** Name = `Admin` (mocked as reserved)
- **Steps:**
  1. Edit Name to `Admin`.
  2. Click Save.
- **Expected result:** Inline error mapped to the Name field showing the server message. Modal stays open.
- **Priority:** Medium

---

## 3. Edge Cases

### TC-201 — Editing a Name at the maximum allowed length succeeds

- **Preconditions:** Max Name length is `N` characters (see Gaps — assume 100 for now).
- **Test data:** Name = exactly 100 characters (`A` × 100).
- **Steps:**
  1. Replace Name with 100-character string.
  2. Click Save.
- **Expected result:** Saved successfully; list reflects new value.
- **Priority:** Medium

### TC-202 — Editing a Name at max length + 1 is rejected

- **Preconditions:** Max Name length is `N`.
- **Test data:** Name = `A` × 101.
- **Steps:**
  1. Attempt to enter 101 characters into Name.
  2. Click Save.
- **Expected result:** Either the input is hard-capped at 100 characters, OR a validation error (`Name must be 100 characters or fewer`) is shown on save.
- **Priority:** Medium

### TC-203 — Name with leading/trailing whitespace is trimmed before save

- **Preconditions:** Edit modal open.
- **Test data:** Name = `"  Web Dev 2026  "`
- **Steps:**
  1. Set Name with surrounding spaces.
  2. Click Save.
  3. Re-open the edit modal.
- **Expected result:** Stored Name = `Web Dev 2026` (trimmed). List row shows trimmed value.
- **Priority:** Medium *(confirm trim policy — see Gaps)*

### TC-204 — Name with special characters is stored and rendered safely

- **Preconditions:** Edit modal open.
- **Test data:** Name = `Web Dev 2026 & <Beta> "Cohort" — #1`
- **Steps:**
  1. Set Name to the special-character string.
  2. Click Save.
- **Expected result:** Saved as-is. List displays the literal text (no HTML interpretation). Re-opened edit form shows the same string.
- **Priority:** Medium

### TC-205 — Name with Unicode / emoji is supported

- **Test data:** Name = `Веб-разработка 2026 🚀`
- **Steps:**
  1. Edit Name to the Unicode string.
  2. Click Save.
- **Expected result:** Saved and displayed correctly; no mojibake; no truncation mid-codepoint.
- **Priority:** Low

### TC-206 — Saving without making any change is a no-op (or explicit confirmation)

- **Test data:** —
- **Steps:**
  1. Open the edit modal.
  2. Click Save without changing any field.
- **Expected result:** Either Save button is disabled when form is pristine, OR Save closes the modal without an unnecessary write. List reflects no change. No spurious "updated" timestamp.
- **Priority:** Low

### TC-207 — Double-clicking Save submits only once

- **Test data:** Name = `Web Dev 2026 - Updated`
- **Steps:**
  1. Edit Name.
  2. Double-click Save rapidly.
- **Expected result:** Only one PUT request is issued (or duplicates are idempotent). No duplicate toasts. No "stuck" loading state.
- **Priority:** Medium

### TC-208 — Closing the modal with unsaved changes prompts a discard confirmation

- **Test data:** Any dirty edit.
- **Steps:**
  1. Make a change.
  2. Press Escape (or click outside / X).
- **Expected result:** A confirmation prompt asks `Discard unsaved changes?`. Choosing Cancel keeps the modal open; choosing Discard closes it without saving.
- **Priority:** Medium *(confirm with design — see Gaps)*

### TC-209 — Editing a program that another admin just deleted

- **Test data:** Admin A opens edit modal; Admin B deletes the same program; Admin A clicks Save.
- **Steps:**
  1. Admin A opens edit modal for `Web Development 2026`.
  2. Admin B deletes that program.
  3. Admin A clicks Save.
- **Expected result:** Save fails with a friendly message (`This program no longer exists`). Modal closes, list refreshes.
- **Priority:** Medium

### TC-210 — Optimistic concurrency: two admins edit the same program

- **Test data:** Both admins open `Web Development 2026`. Admin A changes Description; Admin B changes Name. Admin A saves first; Admin B saves second.
- **Steps:**
  1. Admin A saves Description change.
  2. Admin B saves Name change.
- **Expected result:** Either:
  - Admin B is warned of a conflict and asked to reload, OR
  - Both edits merge cleanly because they touch different fields.

  The behavior should be deterministic and documented (see Gaps).
- **Priority:** Medium

### TC-211 — Editing a program that does not exist (URL-tampered or stale link)

- **Test data:** Direct navigation to `/programs/{nonexistent-id}/edit`.
- **Steps:**
  1. Visit the edit URL directly.
- **Expected result:** Friendly `Program not found` page; no crash, no blank modal.
- **Priority:** Medium

---

## 4. Non-functional

### TC-301 — Edit form is fully keyboard navigable

- **Steps:**
  1. Open edit modal via keyboard (Tab to edit icon, press Enter).
  2. Tab through all form fields, Save, and Cancel.
  3. Submit with Enter from inside any text input (where appropriate).
- **Expected result:** Logical tab order; focus visible on every interactive element; Escape closes the modal; focus returns to the originating edit icon on close.
- **Priority:** High

### TC-302 — Modal traps focus and is announced to screen readers

- **Steps:**
  1. Open the edit modal with a screen reader running (e.g., NVDA / VoiceOver).
- **Expected result:**
  - Modal has `role="dialog"` and an accessible name (e.g., `Edit program: Web Development 2026`).
  - Focus is trapped inside the modal until it is closed.
  - Field labels are programmatically associated with inputs.
- **Priority:** High

### TC-303 — Form is responsive on mobile widths (≤ 375 px)

- **Steps:**
  1. Open the Programs page at 375 px width.
  2. Open the edit modal.
- **Expected result:** Modal fits the viewport; no horizontal scroll; all fields and buttons are reachable; Save/Cancel remain visible without scrolling away.
- **Priority:** Medium

### TC-304 — XSS in Name field is escaped on render

- **Test data:** Name = `<script>alert('xss')</script>`
- **Steps:**
  1. Edit Name to the script string.
  2. Click Save.
  3. Observe the Programs list and the re-opened edit modal.
- **Expected result:** String is rendered literally; no script execution; no DOM injection. Stored value matches input verbatim.
- **Priority:** High

### TC-305 — Edit is logged in the audit trail (if audit logging exists)

- **Steps:**
  1. Edit a program.
  2. Inspect the audit log.
- **Expected result:** A record is written including: actor (admin user), program ID, fields changed (with old → new values), and timestamp.
- **Priority:** Medium *(only if audit logging is in scope — see Gaps)*

---

## Ambiguities & Gaps in the Acceptance Criteria

The ACs are clear on the happy path but leave several decisions undefined. Before sign-off, the team should clarify:

1. **Field inventory** — AC3 mentions "Name and other fields remain unchanged" but never enumerates "other fields." What fields does a Program have? (Likely candidates: Start Date, End Date, Status, Capacity, Category, Instructors, Cohort — please confirm.)
2. **Required vs. optional fields** — Which fields are required on edit? Specifically, is Name required? Is Description required?
3. **Validation rules and limits** — Max length for Name and Description? Allowed character sets? Any reserved names?
4. **Name uniqueness** — Must program names be unique? If so, is the comparison case-sensitive or case-insensitive? Trimmed or raw?
5. **Whitespace handling** — Are leading/trailing spaces trimmed automatically, or stored as-is?
6. **Empty/whitespace input** — Should empty or whitespace-only Name be rejected? (Assumed yes in TC-101/TC-102.)
7. **"Modal closes" wording in AC2** — Confirms a modal pattern, but the form-rendering location (modal vs. drawer vs. inline) should be documented.
8. **Save button enablement** — Should Save be disabled when the form is pristine (no changes)?
9. **Unsaved-changes warning** — When the user closes the modal with dirty changes, is there a discard confirmation? (TC-208 assumes yes.)
10. **Success feedback** — Toast? Banner? Inline message? What's the exact copy? (TC-004 assumes a success toast.)
11. **Concurrency model** — What happens when two admins edit the same program simultaneously? Last-write-wins, optimistic locking with conflict warning, or field-level merge? (TC-210 covers this once decided.)
12. **Deleted-while-editing** — If the target program is deleted mid-edit, what does the user see? (TC-209 assumes a friendly error.)
13. **Permission model** — AC mentions "admin user," but is there a finer-grained role (e.g., Program Manager) that also has edit rights?
14. **Audit logging** — Are edits recorded? Who can view the audit log? (TC-305 is conditional on this being in scope.)
15. **Live updates** — When Admin A saves, does Admin B's open Programs page update in real time, or only on refresh? (TC-006 currently assumes refresh.)
16. **Accessibility expectations** — Is there a documented a11y bar (WCAG 2.1 AA)? (TC-301/TC-302 assume yes.)
17. **Internationalization** — Will the field labels and error messages be localized? Is Unicode/emoji fully supported in Name/Description? (TC-205 covers Unicode.)
18. **Date/time fields, if present** — How are timezones handled when editing date fields?
19. **Undo / version history** — Can an admin revert a change? Out of scope for this story?
20. **Edit icon discoverability and label** — Is it a pencil icon with a tooltip? Does it have an `aria-label="Edit program {name}"`?
