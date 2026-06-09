# Test Plan — TICKET-004: Delete Program with Confirmation

**Feature:** Delete program with confirmation
**Role under test:** Admin user
**Surface:** Web UI — Programs page (admin console) + backing API
**Source story:** *As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.*

---

## Traceability Matrix (AC → Test Cases)

| AC | Scenario | Covering Test Cases |
| --- | --- | --- |
| AC1 | Delete program with confirmation | TC-001, TC-002, TC-003, TC-004, TC-005 |
| AC2 | Cancel program deletion | TC-006, TC-007, TC-008 |
| — | Negative paths | TC-101 → TC-108 |
| — | Edge cases | TC-201 → TC-211 |
| — | Non-functional | TC-301 → TC-305 |

---

## 1. Positive Flows

### TC-001 — Delete icon opens a confirmation dialog

- **AC reference:** AC1
- **Preconditions:**
  - Admin logged in.
  - Program `Test Program` exists on the Programs page.
- **Test data:** Existing program `Test Program`.
- **Steps:**
  1. Navigate to the Programs page.
  2. Locate the row for `Test Program`.
  3. Click the delete icon for that row.
- **Expected result:**
  - A confirmation dialog appears.
  - The program is **not** yet deleted at this point.
  - The dialog includes a clear question (e.g., `Delete "Test Program"?`) and at least two buttons: `Cancel` and `Delete` (or equivalent).
- **Priority:** High

### TC-002 — Confirmation dialog identifies the program being deleted

- **AC reference:** AC1
- **Preconditions:** Same as TC-001.
- **Test data:** `Test Program`.
- **Steps:**
  1. Click the delete icon for `Test Program`.
- **Expected result:** The dialog text references the exact program name (e.g., `Are you sure you want to delete "Test Program"?`), not a generic `Are you sure?`.
- **Priority:** High

### TC-003 — Confirming deletion removes the program from the list

- **AC reference:** AC1
- **Preconditions:**
  - Program `Test Program` exists.
  - Confirmation dialog is open for that program.
- **Test data:** —
- **Steps:**
  1. Click the confirm button (`Delete`).
- **Expected result:**
  - Dialog closes.
  - `Test Program` is no longer present in the Programs list — without manual refresh.
  - Total count of programs decreases by exactly one.
  - A success toast/confirmation appears (per design — see Gaps).
- **Priority:** High

### TC-004 — Deletion persists after page reload

- **AC reference:** AC1
- **Preconditions:** TC-003 has been executed; `Test Program` has been deleted.
- **Test data:** —
- **Steps:**
  1. Refresh the Programs page (F5 / browser reload).
- **Expected result:** `Test Program` is still absent. (Verifies the deletion was persisted, not only removed from the client state.)
- **Priority:** High

### TC-005 — Direct API call to a deleted program returns 404

- **AC reference:** AC1
- **Preconditions:** `Test Program` has been deleted via the UI. Its prior ID is known.
- **Test data:** `GET /api/programs/{deleted-id}` and `PUT /api/programs/{deleted-id}`
- **Steps:**
  1. Issue an authenticated GET to the deleted program's endpoint.
  2. Issue a PUT to the deleted program's endpoint.
- **Expected result:**
  - GET returns HTTP 404 (or 410 Gone if soft-delete + tombstones — see Gaps).
  - PUT returns HTTP 404. No partial update occurs.
- **Priority:** High

### TC-006 — Clicking Cancel keeps the program intact

- **AC reference:** AC2
- **Preconditions:**
  - Program `Web Development 2026` exists.
  - Confirmation dialog open for that program.
- **Test data:** `Web Development 2026`.
- **Steps:**
  1. Click `Cancel` in the confirmation dialog.
- **Expected result:**
  - Dialog closes.
  - Programs list still contains `Web Development 2026` with all fields unchanged.
  - No DELETE request was sent to the API (verify via network panel / observability).
  - Total count of programs is unchanged.
- **Priority:** High

### TC-007 — Closing the dialog via the X / close button behaves like Cancel

- **AC reference:** AC2 (implied)
- **Preconditions:** Confirmation dialog open for `Web Development 2026`.
- **Test data:** —
- **Steps:**
  1. Click the dialog's close (X) button.
- **Expected result:** Same outcome as TC-006: dialog closes, no deletion, no API call.
- **Priority:** Medium

### TC-008 — Pressing Escape on the confirmation dialog behaves like Cancel

- **AC reference:** AC2 (implied)
- **Preconditions:** Confirmation dialog open for `Web Development 2026`.
- **Test data:** —
- **Steps:**
  1. Press the `Esc` key.
- **Expected result:** Same outcome as TC-006: dialog closes, no deletion, no API call.
- **Priority:** Medium

---

## 2. Negative Flows

### TC-101 — Non-admin user cannot see or use the delete icon

- **AC reference:** Negative / Authorization
- **Preconditions:** Logged in as a non-admin (e.g., instructor / student / read-only).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Either the page is inaccessible OR the delete icon is not rendered on program rows.
- **Priority:** High

### TC-102 — Non-admin direct API call to delete endpoint returns 403

- **AC reference:** Negative / Authorization
- **Preconditions:** Valid auth token for a non-admin user. A program exists.
- **Test data:** `DELETE /api/programs/{id}` with the non-admin token.
- **Steps:**
  1. Issue the authenticated DELETE request.
- **Expected result:** HTTP 403 Forbidden. The program is **not** deleted. The 403 must not leak existence information (i.e., behaves the same for valid and invalid IDs from a non-admin).
- **Priority:** High

### TC-103 — Network failure during delete surfaces an error and program remains

- **AC reference:** Negative
- **Preconditions:** Confirmation dialog open for `Test Program`. Network throttled to "Offline" or backend killed.
- **Test data:** —
- **Steps:**
  1. With the network disabled, click `Delete` in the dialog.
- **Expected result:**
  - A user-visible error appears (`Could not delete program — please try again`).
  - The program **remains** in the list.
  - The dialog either stays open with a retry option, or closes with the error toast — but no inconsistency between UI and server state.
  - On retry with network restored, deletion succeeds.
- **Priority:** High

### TC-104 — Server-side conflict (program has dependents) is surfaced clearly

- **AC reference:** Negative
- **Preconditions:**
  - Program `Web Development 2026` exists.
  - It has dependent records (e.g., active cohorts / enrolled students). *(Conditional on the system having such dependencies — see Gaps.)*
- **Test data:** —
- **Steps:**
  1. Click the delete icon for `Web Development 2026`.
  2. Confirm deletion.
- **Expected result:**
  - API responds with HTTP 409 (or 422) — `Program cannot be deleted because it has X enrolled students` (or equivalent).
  - The program is **not** deleted.
  - The user sees a clear, actionable error in the UI.
- **Priority:** High *(depends on dependency model — see Gaps)*

### TC-105 — Delete request for a program that was just deleted by another admin

- **AC reference:** Negative / Concurrency
- **Preconditions:** Admin A and Admin B both viewing the Programs list. Both with confirmation dialog open for `Test Program`.
- **Test data:** —
- **Steps:**
  1. Admin A confirms deletion.
  2. Admin B confirms deletion shortly after.
- **Expected result:**
  - Admin A's delete succeeds.
  - Admin B sees a friendly error (`This program no longer exists`) — not a generic 500.
  - Admin B's list refreshes; `Test Program` is gone.
- **Priority:** Medium

### TC-106 — Deleting the same program twice is idempotent or returns a clear "not found"

- **AC reference:** Negative
- **Preconditions:** Program `Test Program` has just been deleted.
- **Test data:** `DELETE /api/programs/{deleted-id}` second time.
- **Steps:**
  1. Issue a second DELETE for the same ID.
- **Expected result:** Either HTTP 404 (typical) or HTTP 204 (idempotent) — whichever, the response is deterministic and does not corrupt other data.
- **Priority:** Medium

### TC-107 — Confirmation dialog does not auto-confirm on Enter when Cancel is the default

- **AC reference:** Negative / Safety
- **Preconditions:** Confirmation dialog open. The default-focused button is `Cancel` (recommended — see Gaps).
- **Test data:** —
- **Steps:**
  1. Press `Enter` immediately after the dialog opens.
- **Expected result:** The default button (Cancel) is activated. The program is **not** deleted. (This prevents accidental "muscle-memory" deletion.)
- **Priority:** High

### TC-108 — Confirmation cannot be bypassed by triggering the API after only the icon click

- **AC reference:** Negative
- **Preconditions:** Admin observes the network traffic.
- **Test data:** —
- **Steps:**
  1. Click the delete icon for a program.
  2. Inspect the network panel before clicking confirm.
- **Expected result:** Clicking the icon alone issues **no** DELETE request. The DELETE is sent only after the user clicks the confirm button.
- **Priority:** High

---

## 3. Edge Cases

### TC-201 — Delete a program whose name contains special characters

- **Preconditions:** Program `Informatique & IA - Niveau 2` exists.
- **Test data:** —
- **Steps:**
  1. Click the delete icon for that program.
  2. Verify the dialog text.
  3. Confirm deletion.
- **Expected result:**
  - Dialog displays the name literally — including `&`, `-`, and accents — with no HTML interpretation.
  - Deletion succeeds.
- **Priority:** Medium

### TC-202 — Delete a program whose name contains script characters (XSS check)

- **Preconditions:** Program `<script>alert('x')</script>` exists (created via TICKET-003 path).
- **Test data:** —
- **Steps:**
  1. Click delete icon.
- **Expected result:** Dialog shows the name as literal text; no script execution; no DOM injection in the dialog body or any toast.
- **Priority:** High *(security-relevant)*

### TC-203 — Delete a program with a very long name (≥ max length)

- **Preconditions:** Program with a 100-character name exists.
- **Test data:** —
- **Steps:**
  1. Click delete icon.
- **Expected result:** Dialog text either wraps cleanly or truncates with an ellipsis while keeping the dialog readable and the action buttons reachable. The full name is still recoverable (e.g., via `title` attribute or full display).
- **Priority:** Low

### TC-204 — Double-clicking the delete icon opens only one dialog

- **Preconditions:** Admin on the Programs page.
- **Test data:** —
- **Steps:**
  1. Rapidly double-click the delete icon for any program.
- **Expected result:** Only one confirmation dialog is visible. No duplicated overlays, no stuck backdrop.
- **Priority:** Medium

### TC-205 — Spam-clicking the confirm button issues only one DELETE

- **Preconditions:** Confirmation dialog open. Slow network (throttle).
- **Test data:** —
- **Steps:**
  1. Click `Delete` 5 times rapidly.
- **Expected result:** Exactly one DELETE request is sent (button disables on first click OR client-side de-dupe). No 404 follow-ups, no duplicate toasts.
- **Priority:** Medium

### TC-206 — Deleting the last remaining program shows the empty state

- **Preconditions:** Exactly one program exists.
- **Test data:** —
- **Steps:**
  1. Delete the only program.
- **Expected result:** Programs list shows the documented empty state (e.g., `No programs yet. Create your first program.`) — not a broken-looking blank page.
- **Priority:** Medium

### TC-207 — Deleting a program in the middle of paginated results updates pagination correctly

- **Preconditions:** Programs list has > 1 page (e.g., 25 per page, 30 programs).
- **Test data:** Delete the program at position 20 (visible on page 1).
- **Steps:**
  1. Delete the program at row 20.
- **Expected result:** Row removed; remaining rows shift up; pagination total decremented (e.g., `Showing 1–25 of 29`). If the deleted row was the last on a page, the user is not stranded on an empty page.
- **Priority:** Medium

### TC-208 — Deleted program's name becomes available for reuse (cross-reference TICKET-003)

- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** —
- **Steps:**
  1. Delete `Web Development 2026`.
  2. Open the Create form.
  3. Try to create a new program with Name `Web Development 2026`.
- **Expected result:** Creation succeeds — assuming hard delete or that soft-deleted records release their name. If soft-delete keeps the name reserved, this is a *documented* difference (see Gaps).
- **Priority:** Medium

### TC-209 — Browser back navigation after deletion does not restore the program in the UI

- **Preconditions:** Deletion just performed.
- **Test data:** —
- **Steps:**
  1. Click the browser back button.
  2. Then forward again.
- **Expected result:** The deleted program does **not** reappear in the list from a cached state. Either the page revalidates, or the cached list excludes the deletion.
- **Priority:** Low

### TC-210 — Restoring a soft-deleted program (if supported)

- **Preconditions:** *(Only if soft-delete is in scope — see Gaps.)* Program `Test Program` has been deleted; an "Archived" view exists.
- **Test data:** —
- **Steps:**
  1. Navigate to Archived/Deleted programs.
  2. Click `Restore` on `Test Program`.
- **Expected result:** `Test Program` reappears in the active list with its prior fields intact. Audit log records the restore.
- **Priority:** Low *(out of scope if soft-delete is not implemented)*

### TC-211 — Bulk-deleting multiple programs (if a bulk-action affordance exists)

- **Preconditions:** *(Conditional — see Gaps.)* Multiple programs selected.
- **Test data:** —
- **Steps:**
  1. Select 3 programs.
  2. Trigger bulk delete.
  3. Confirm.
- **Expected result:** All 3 programs deleted atomically — either all succeed or none do; partial-failure results are reported with row-level errors.
- **Priority:** Low *(out of scope if not implemented)*

---

## 4. Non-functional

### TC-301 — Confirmation dialog is keyboard accessible

- **Steps:**
  1. Navigate to the Programs page using only the keyboard.
  2. Tab to a program row's delete icon and press Enter.
  3. Tab between the dialog buttons.
  4. Press Escape.
- **Expected result:**
  - Focus moves into the dialog when it opens.
  - Tab order cycles only between dialog elements (focus trap).
  - Escape closes the dialog (acts as Cancel).
  - On close, focus returns to the originating delete icon.
- **Priority:** High

### TC-302 — Confirmation dialog is announced to screen readers

- **Steps:**
  1. With a screen reader running (NVDA / VoiceOver), open the confirmation dialog.
- **Expected result:**
  - Dialog has `role="alertdialog"` (preferred for destructive confirmations) with an accessible name and description.
  - The destructive button is announced (e.g., `Delete, button`).
  - The default focused button is announced first.
- **Priority:** High

### TC-303 — Destructive button is visually distinct

- **Steps:**
  1. Open the confirmation dialog.
- **Expected result:**
  - The confirm button is styled as destructive (typically red / danger color).
  - The Cancel button is styled as neutral / secondary.
  - Contrast ratios meet WCAG 2.1 AA (≥ 4.5:1 for text, ≥ 3:1 for non-text UI components). *(See Gaps for accessibility bar.)*
- **Priority:** Medium

### TC-304 — Deletion is recorded in the audit log

- **Steps:**
  1. Delete a program.
  2. Inspect the audit log.
- **Expected result:** Audit entry records: actor (admin user ID + email), action (`program.delete`), target program ID and name snapshot, timestamp, source IP / user-agent. *(Conditional on audit logging being in scope — see Gaps.)*
- **Priority:** Medium

### TC-305 — Confirmation text and buttons are localized

- **Preconditions:** UI locale is set to French (`fr`).
- **Steps:**
  1. Open the confirmation dialog.
- **Expected result:** Dialog text, button labels, success/error toasts are all in French. Program name itself is not translated.
- **Priority:** Medium *(only if i18n is in scope — see Gaps)*

---

## Ambiguities & Gaps in the Acceptance Criteria

The ACs are clear on the happy path and the cancel path, but leave many operational details undefined. Before sign-off, the team should clarify:

1. **Hard delete vs. soft delete** — Is the program physically removed, or marked as deleted/archived with retention? Major impact on TC-005, TC-208, TC-210.
2. **Recoverability / undo** — Is there an "Undo" toast within N seconds, or a separate Archived view? (TC-210 assumes archive-and-restore.)
3. **Dependent records** — What happens when a program has cohorts / enrollments / instructors assigned? Block with 409, cascade-delete, or detach? (TC-104.)
4. **Confirmation copy** — Exact wording for the question, button labels (`Delete` vs `Confirm`, `Cancel`), and any warning sub-text.
5. **Default focused button** — Should `Cancel` or `Delete` be the default focus when the dialog opens? Safer-by-default is `Cancel`. (TC-107.)
6. **Typed confirmation** — For destructive actions, some products require typing the program name to confirm. Is that required here?
7. **Success feedback** — Toast / banner / inline message after successful deletion? Exact copy? Undo affordance?
8. **Authorization model** — AC mentions "admin user." Are there sub-roles that can delete vs. cannot? Can a program "owner" delete?
9. **Audit logging** — Are deletions logged? Who can view the log? (TC-304.)
10. **Concurrency model** — What happens when two admins delete simultaneously? (TC-105.) Idempotency of repeated DELETE? (TC-106.)
11. **Bulk delete** — Is multi-select delete in scope? (TC-211.)
12. **Empty state** — What does the Programs page look like when no programs exist? (TC-206.)
13. **Pagination behavior on delete** — Does the deletion keep the user on the same page even if it becomes empty? (TC-207.)
14. **Live updates** — When Admin A deletes, does Admin B's open list update in real-time or only on refresh? (Currently TC-105 assumes refresh.)
15. **Name reuse after deletion** — Does deleting `Web Development 2026` free that name for reuse immediately? (TC-208; cross-reference TICKET-003 question 7.)
16. **API contract** — What status code on success (200 vs. 204)? On not-found-after-delete (404 vs. 410)? On dependency conflict (409 vs. 422)?
17. **Accessibility bar** — Is WCAG 2.1 AA the target? Are `role="alertdialog"` and focus-return contractual? (TC-301–303.)
18. **Internationalization** — Is the dialog localized? (TC-305.)
19. **Mobile / small-screen behavior** — Does the confirmation dialog render correctly on ≤ 375 px? Is the destructive button reachable without scrolling?
20. **Rate limiting / abuse protection** — Should rapid repeated deletions from one admin be throttled? Should the API rate-limit DELETE per user/IP?
