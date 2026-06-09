# Test Plan — TICKET-003: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention
**Role under test:** Admin user
**Surface:** Web UI — Program creation form (admin console) + backing API
**Source story:** *As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.*

---

## Traceability Matrix (AC → Test Cases)

| AC | Scenario | Covering Test Cases |
| --- | --- | --- |
| AC1 | Reject program name with only whitespace | TC-001, TC-101, TC-102, TC-203 |
| AC2 | Accept program name with special characters | TC-002, TC-003, TC-204, TC-205 |
| AC3 | Reject duplicate program name | TC-004, TC-103, TC-104, TC-207, TC-208 |
| — | Negative paths | TC-101 → TC-108 |
| — | Edge cases | TC-201 → TC-211 |
| — | Non-functional | TC-301 → TC-305 |

---

## 1. Positive Flows

### TC-001 — Whitespace-only name is rejected as empty

- **AC reference:** AC1
- **Preconditions:** Admin is on the Program creation form.
- **Test data:** Name = `"   "` (3 spaces)
- **Steps:**
  1. Enter `"   "` in the Name field.
  2. Fill all other required fields with valid data.
  3. Click Create.
- **Expected result:**
  - Form is **not** submitted.
  - Inline validation error on the Name field: `Name is required` (or equivalent).
  - No network request to the create endpoint is issued (or, if issued, server returns 400 — see Gaps).
  - No new program appears in the Programs list.
- **Priority:** High

### TC-002 — Name with special characters and accents is accepted

- **AC reference:** AC2
- **Preconditions:** Admin is on the Program creation form. No program named `Informatique & IA - Niveau 2` exists.
- **Test data:** Name = `Informatique & IA - Niveau 2`, other required fields filled with valid data.
- **Steps:**
  1. Enter `Informatique & IA - Niveau 2` in the Name field.
  2. Fill all other required fields with valid data.
  3. Click Create.
- **Expected result:**
  - Program is created successfully (HTTP 201 from API).
  - Programs list immediately shows the new row with Name exactly as entered (literal `&`, `-`, accents preserved).
  - Success toast/confirmation is displayed (per design — see Gaps).
- **Priority:** High

### TC-003 — Name with French diacritics is preserved and accepted

- **AC reference:** AC2
- **Preconditions:** Same as TC-002.
- **Test data:** Name = `Développement Web — Été 2026`
- **Steps:**
  1. Enter `Développement Web — Été 2026` in Name.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:** Program created. Stored value identical to input (no mojibake, no NFC/NFD corruption visible to user).
- **Priority:** Medium

### TC-004 — Standard valid name (control case) is accepted

- **AC reference:** AC2 / baseline
- **Preconditions:** No program named `Web Development 2026` exists.
- **Test data:** Name = `Web Development 2026`
- **Steps:**
  1. Enter `Web Development 2026` in Name.
  2. Fill other required fields with valid data.
  3. Click Create.
- **Expected result:** Program created successfully and appears in the list.
- **Priority:** High

### TC-005 — Name with leading/trailing whitespace is trimmed and saved

- **AC reference:** AC1 (implied — "name is trimmed") / Edge
- **Preconditions:** No program named `Data Science 2026` exists.
- **Test data:** Name = `"  Data Science 2026  "`
- **Steps:**
  1. Enter `"  Data Science 2026  "` in Name.
  2. Fill other required fields.
  3. Click Create.
  4. Inspect the new row in the Programs list.
- **Expected result:**
  - Program is created.
  - Stored Name is `Data Science 2026` (trimmed).
  - Programs list shows the trimmed value.
- **Priority:** High

---

## 2. Negative Flows

### TC-101 — Empty Name is rejected

- **AC reference:** AC1 (extension), Negative
- **Preconditions:** Program creation form open.
- **Test data:** Name = `""` (empty)
- **Steps:**
  1. Leave Name blank.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:**
  - Submit is blocked.
  - Inline error: `Name is required`.
  - No network request to create endpoint (or 400 returned).
- **Priority:** High

### TC-102 — Name consisting only of tabs / newlines is rejected

- **AC reference:** AC1, Negative
- **Preconditions:** Form open.
- **Test data:** Name = `"\t\t\t"` (3 tabs) — and a second run with `"\n\n"`.
- **Steps:**
  1. Paste the whitespace control characters into Name.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:** Treated identically to whitespace-only — rejected as empty after trim.
- **Priority:** Medium

### TC-103 — Exact duplicate name is rejected

- **AC reference:** AC3
- **Preconditions:** Program `Web Development 2026` already exists.
- **Test data:** Name = `Web Development 2026`
- **Steps:**
  1. Enter `Web Development 2026` in Name.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:**
  - Form is not submitted (or API returns 409 Conflict).
  - User-visible error: `A program with this name already exists` (or equivalent, on the Name field).
  - The original `Web Development 2026` remains intact and unduplicated.
  - Programs list count does **not** increase.
- **Priority:** High

### TC-104 — Duplicate name with different casing is rejected (if case-insensitive)

- **AC reference:** AC3, Edge
- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** Name = `WEB DEVELOPMENT 2026`
- **Steps:**
  1. Enter `WEB DEVELOPMENT 2026`.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:** Duplicate error shown — assuming uniqueness is case-insensitive (most products do this; see Gaps).
- **Priority:** High *(downgrade to Medium if uniqueness is case-sensitive per spec)*

### TC-105 — Duplicate name with extra surrounding whitespace is rejected after trim

- **AC reference:** AC3, Edge
- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** Name = `"  Web Development 2026  "`
- **Steps:**
  1. Enter the value with surrounding spaces.
  2. Click Create.
- **Expected result:** Rejected as duplicate (since AC1 specifies trim).
- **Priority:** High

### TC-106 — Non-admin attempt to create a program returns 403 at the API

- **AC reference:** Negative / Authorization
- **Preconditions:** Valid auth token for a non-admin role.
- **Test data:** `POST /api/programs` with body `{ "name": "Hacked Program" }`
- **Steps:**
  1. Issue an authenticated create request using the non-admin token.
- **Expected result:** HTTP 403 Forbidden. No program is created. The error is **not** a duplicate-name leak (i.e., 403 must not depend on existence checks that could be probed).
- **Priority:** High

### TC-107 — Direct API submission of whitespace-only name is rejected by the server

- **AC reference:** AC1, Negative
- **Preconditions:** Admin auth token.
- **Test data:** `POST /api/programs` with body `{ "name": "   " }`
- **Steps:**
  1. Bypass the UI and POST directly.
- **Expected result:** HTTP 400 Bad Request with field-level error referencing `name`. No program created. This proves server-side validation, not just client-side.
- **Priority:** High

### TC-108 — Direct API submission of duplicate name is rejected by the server

- **AC reference:** AC3, Negative
- **Preconditions:** Program `Web Development 2026` exists. Admin token.
- **Test data:** `POST /api/programs` with body `{ "name": "Web Development 2026" }`
- **Steps:**
  1. POST directly to the create endpoint.
- **Expected result:** HTTP 409 Conflict (or 422) with a clear `name` error. Database invariant preserved.
- **Priority:** High

---

## 3. Edge Cases

### TC-201 — Name at maximum allowed length is accepted

- **Preconditions:** Max Name length = `N` characters (assume 100 — see Gaps).
- **Test data:** Name = `"A" × 100`
- **Steps:**
  1. Enter a 100-character Name.
  2. Click Create.
- **Expected result:** Program created successfully.
- **Priority:** Medium

### TC-202 — Name exceeding maximum length is rejected

- **Preconditions:** Max Name length = `N`.
- **Test data:** Name = `"A" × 101`
- **Steps:**
  1. Attempt to type/paste 101 characters into Name.
  2. Click Create.
- **Expected result:** Either input is hard-capped at 100 characters, OR a validation error (`Name must be 100 characters or fewer`) is shown.
- **Priority:** Medium

### TC-203 — Name of mixed whitespace characters is rejected

- **AC reference:** AC1, Edge
- **Test data:** Name = `" \t \u00A0 "` (mix of regular space, tab, non-breaking space)
- **Steps:**
  1. Paste the mixed-whitespace string into Name.
  2. Click Create.
- **Expected result:** Rejected as empty. Non-breaking spaces (`\u00A0`) should be normalized as whitespace by the trimmer (or this becomes a clear gap to call out — see Gaps).
- **Priority:** Medium

### TC-204 — Name with HTML/script characters is stored and rendered safely

- **AC reference:** AC2, Edge / Security
- **Test data:** Name = `<script>alert('xss')</script> & "Cohort"`
- **Steps:**
  1. Enter the script-like string.
  2. Fill other required fields.
  3. Click Create.
- **Expected result:**
  - Program is created.
  - Programs list and any detail view render the name as **literal text** (no script execution, no DOM injection).
  - Stored value matches input verbatim.
- **Priority:** High *(security-relevant)*

### TC-205 — Name with Unicode and emoji is accepted

- **AC reference:** AC2, Edge
- **Test data:** Name = `数据科学 2026 🚀`
- **Steps:**
  1. Enter the Unicode/emoji string.
  2. Click Create.
- **Expected result:** Program created. Display preserves all codepoints; no truncation mid-surrogate.
- **Priority:** Low

### TC-206 — Name with internal multiple spaces is preserved (or documented if collapsed)

- **Test data:** Name = `"Web   Development 2026"` (3 spaces between "Web" and "Development")
- **Steps:**
  1. Enter the value.
  2. Click Create.
  3. Re-read the stored name.
- **Expected result:** Internal whitespace is preserved (typical behavior) — OR collapsed per documented rule. Whichever is chosen, behavior is consistent and matches duplicate-detection logic.
- **Priority:** Low *(see Gaps)*

### TC-207 — Duplicate name allowed after the original is deleted (hard delete)

- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** Same Name reused after deletion.
- **Steps:**
  1. Delete `Web Development 2026`.
  2. Open the creation form.
  3. Enter Name `Web Development 2026`.
  4. Click Create.
- **Expected result:** Creation succeeds. The name is no longer "taken." *(Confirms soft-delete behavior — see Gaps; if programs are soft-deleted, this may legitimately stay reserved.)*
- **Priority:** Medium

### TC-208 — Concurrent creation of identical names — only one succeeds

- **Preconditions:** No program named `Cybersecurity 2026` exists. Two admin sessions ready.
- **Test data:** Both sessions submit Name = `Cybersecurity 2026` simultaneously.
- **Steps:**
  1. Admin A and Admin B prepare the form with the same Name.
  2. Submit at the same time (within a few hundred ms).
- **Expected result:** Exactly one creation succeeds (HTTP 201). The other receives the duplicate error (HTTP 409). No two rows with the same name exist in the database. This depends on a DB unique constraint, not just an application-level check.
- **Priority:** High

### TC-209 — Name composed only of punctuation/special characters is accepted

- **AC reference:** AC2, Edge
- **Test data:** Name = `&&& -- !!!`
- **Steps:**
  1. Enter the special-character string.
  2. Click Create.
- **Expected result:** Either accepted (if no character-class rule) — OR rejected with a specific rule (e.g., "must contain at least one alphanumeric character"). Behavior must match the documented rule (see Gaps).
- **Priority:** Low

### TC-210 — Name with zero-width / control characters is rejected or sanitized

- **Test data:** Name = `"Hidden\u200B\u200CName"` (zero-width space + zero-width non-joiner)
- **Steps:**
  1. Paste the string into Name.
  2. Click Create.
- **Expected result:** Either the invisible characters are stripped before validation (and duplicate detection uses the cleaned form), OR submission is rejected. The behavior must not allow two visually-identical names to coexist.
- **Priority:** Medium *(homograph / look-alike risk)*

### TC-211 — Duplicate detection ignores diacritic-equivalent strings? (decision needed)

- **Test data:** Existing program `Developpement Web`. New attempt: `Développement Web`.
- **Steps:**
  1. Create `Developpement Web`.
  2. Attempt to create `Développement Web`.
- **Expected result:** Whichever the team decides (most apps treat these as **different** — accent matters), the behavior is consistent and documented. *(This is more a Gap than an assertion — see Gaps.)*
- **Priority:** Low

---

## 4. Non-functional

### TC-301 — Validation errors are announced to assistive tech

- **Steps:**
  1. With a screen reader running (NVDA / VoiceOver), submit the form with whitespace-only Name.
  2. Listen for the announcement.
- **Expected result:**
  - Error message has `role="alert"` or is in an `aria-live="polite"` region.
  - The Name input is associated with the error via `aria-describedby` and marked `aria-invalid="true"`.
  - Focus moves to the first invalid field, or the error is announced without focus loss (per design).
- **Priority:** High

### TC-302 — Duplicate name error is shown inline near the Name field, not only as a banner

- **Steps:**
  1. Submit a duplicate Name.
- **Expected result:** Inline error appears directly under (or beside) the Name input. The user does not need to scroll to find the cause.
- **Priority:** Medium

### TC-303 — Name with special characters renders safely throughout the UI (XSS)

- **Test data:** `<img src=x onerror=alert(1)>` as Name.
- **Steps:**
  1. Create the program.
  2. View the Programs list, detail view, dashboard widgets, and any search/autocomplete that surfaces program names.
- **Expected result:** The string is rendered as literal text everywhere. No JavaScript executes. CSP (if present) is not violated.
- **Priority:** High

### TC-304 — Duplicate-check responsiveness

- **Steps:**
  1. Submit a duplicate Name.
  2. Measure the time from click → error displayed.
- **Expected result:** Error surfaces within 2 seconds under typical network conditions. If the form does *live* duplicate checking on blur or as-you-type (see Gaps), the request is debounced (≥ 300 ms) and cancelled on input change.
- **Priority:** Medium

### TC-305 — Error message localization

- **Preconditions:** User's UI locale is set to French (`fr`).
- **Steps:**
  1. Submit a whitespace-only Name.
- **Expected result:** Error message is in French (e.g., `Le nom est requis`), matching the user's locale. Same for the duplicate error.
- **Priority:** Medium *(only if i18n is in scope — see Gaps)*

---

## Ambiguities & Gaps in the Acceptance Criteria

The ACs cover the three core behaviors but leave several decisions undocumented. Before sign-off, the team should clarify:

1. **Case sensitivity of duplicate detection** — Is `Web Development 2026` equal to `WEB DEVELOPMENT 2026` for uniqueness purposes? (TC-104 assumes case-insensitive.)
2. **Whitespace normalization** — AC1 says the name is *trimmed*. Does "trim" only strip leading/trailing whitespace, or also collapse internal whitespace? Are non-breaking spaces (`\u00A0`) included? Tabs and newlines?
3. **Maximum name length** — Not specified. (TC-201/TC-202 assume 100.)
4. **Minimum name length** — Is a single character allowed?
5. **Allowed character classes** — Must the name contain at least one alphanumeric character, or are punctuation-only names valid? (TC-209 covers this once decided.)
6. **Other required fields on creation** — AC2 says "fill other required fields" but doesn't name them. What else is mandatory (Description? Start Date? Status?)?
7. **Soft-delete vs. hard-delete and name reuse** — If a program is deleted, is its name freed for reuse? (TC-207 assumes yes.)
8. **Uniqueness scope** — Globally unique across all programs, or scoped (e.g., per cohort year, per organization, per category)?
9. **Inline / live validation behavior** — Does duplicate detection happen on blur or as-the-user-types, or only on submit? (TC-304 covers both options.)
10. **Exact error message copy** — Spec for both the empty-name and duplicate-name messages? Will they be localized?
11. **Server-side enforcement** — Must the database have a `UNIQUE` constraint on `name` (case-insensitive, after trim) so that TC-208 (concurrent creation) is safe? (Assumed yes; please confirm.)
12. **API contract** — What status code for duplicate (409 vs. 422) and what shape for field-level errors?
13. **Diacritic equivalence** — Are `Developpement Web` and `Développement Web` considered the same name? (TC-211.)
14. **Zero-width / control characters** — Are they stripped before validation, allowed, or rejected? (TC-210.)
15. **Form-state preservation on error** — When validation fails, are user inputs in other fields preserved?
16. **Cross-feature impact** — Do the same validation rules apply on *edit* (TICKET-002)? If admin renames program A to match program B's name, does the same duplicate check fire?
17. **Reserved names** — Are any names disallowed (e.g., `Admin`, `Untitled`, `null`)?
18. **Telemetry / audit** — Are rejected create attempts (especially duplicates) logged for analytics or security monitoring?
19. **Accessibility** — Is there a documented WCAG bar (e.g., 2.1 AA)? (TC-301 assumes yes.)
20. **Edit icon discoverability and form layout** — Not strictly in scope for this ticket but worth confirming with TICKET-002.
