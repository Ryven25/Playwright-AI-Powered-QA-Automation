# Test Plan — TICKET-005: Program List Filtering and Display

**Feature:** Program list filtering and display
**Role under test:** Admin user
**Surface:** Web UI — Programs page (admin console) + backing API (list endpoint)
**Source story:** *As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.*

> ⚠️ **Scope mismatch flagged early:** the feature title contains the word
> **"filtering"** but neither AC defines any filtering behavior (no filter UI,
> no filter criteria, no expected results when filters are applied). This plan
> covers display + empty state in depth and adds a conditional **Filtering**
> section (TC-401+) so that QA is ready the moment the filter requirements are
> clarified. See *Ambiguities & Gaps* for the open questions.

---

## Traceability Matrix (AC → Test Cases)

| AC | Scenario | Covering Test Cases |
| --- | --- | --- |
| AC1 | Display program list with key details | TC-001, TC-002, TC-003, TC-004 |
| AC2 | Empty state when no programs exist | TC-005, TC-006, TC-007 |
| — | Negative paths | TC-101 → TC-106 |
| — | Edge cases | TC-201 → TC-211 |
| — | Non-functional | TC-301 → TC-306 |
| — *(implicit by title)* | Filtering | TC-401 → TC-405 *(conditional — see Gaps)* |

---

## 1. Positive Flows

### TC-001 — Program list shows every existing program

- **AC reference:** AC1
- **Preconditions:**
  - Admin logged in.
  - Exactly 3 programs exist: `Web Development 2026`, `Data Science 2026`, `Cybersecurity 2026`.
- **Test data:** The 3 programs above.
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - Three rows appear in the list.
  - The rows correspond 1-to-1 to the three programs (no duplicates, no extras).
  - Total count indicator (e.g., `3 programs`) — if present — matches.
- **Priority:** High

### TC-002 — Each row shows the program's Name and Description

- **AC reference:** AC1
- **Preconditions:** Program `Web Development 2026` exists with Description = `Full-stack web development bootcamp`.
- **Test data:** Same program.
- **Steps:**
  1. Navigate to the Programs page.
  2. Locate the row for `Web Development 2026`.
- **Expected result:**
  - The Name cell displays `Web Development 2026` exactly.
  - The Description cell displays `Full-stack web development bootcamp` exactly.
  - Both fields are visible without horizontal scroll on a 1280 × 720 viewport.
- **Priority:** High

### TC-003 — A newly created program appears in the list immediately

- **AC reference:** AC1
- **Preconditions:** Admin on the Programs page. Program `New Cohort 2026` does not yet exist.
- **Test data:** Name = `New Cohort 2026`, Description = `Pilot cohort`.
- **Steps:**
  1. Open the Create form, create `New Cohort 2026` with the description above.
  2. Return to the Programs page (or rely on the post-create redirect).
- **Expected result:** `New Cohort 2026` is visible in the list without manual refresh. *(Cross-reference TICKET-003.)*
- **Priority:** High

### TC-004 — An edited program's updated values are reflected in the list

- **AC reference:** AC1
- **Preconditions:** Program `Web Development 2026` exists.
- **Test data:** Edit Description to `Updated curriculum 2026`.
- **Steps:**
  1. Edit `Web Development 2026`, change Description, save.
  2. Observe the list row for `Web Development 2026`.
- **Expected result:** The Description cell shows `Updated curriculum 2026` without manual refresh. *(Cross-reference TICKET-002.)*
- **Priority:** High

### TC-005 — Empty state shows a "no programs" message

- **AC reference:** AC2
- **Preconditions:** No programs exist (clean DB / fresh tenant).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - A clear empty-state message is shown (e.g., `No programs yet`).
  - The list area does **not** render an empty/blank table or skeleton rows forever.
  - The empty state is centered/readable, not buried below page chrome.
- **Priority:** High

### TC-006 — Empty state includes a CTA to create the first program

- **AC reference:** AC2
- **Preconditions:** No programs exist.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - A primary call-to-action (e.g., `Create your first program`) is visible.
  - Clicking it opens the Program creation form.
  - The CTA is keyboard-focusable and has an accessible name.
- **Priority:** High

### TC-007 — Transitioning from empty state to populated list updates the view immediately

- **AC reference:** AC2 (transitional)
- **Preconditions:** No programs exist; admin is on the Programs page with the empty state visible.
- **Test data:** Name = `First Program`, Description = `Pilot`.
- **Steps:**
  1. Click the empty-state CTA.
  2. Create `First Program`.
  3. Return to the Programs page.
- **Expected result:** The empty state is replaced by a list containing exactly one row: `First Program` with Description `Pilot`.
- **Priority:** High

---

## 2. Negative Flows

### TC-101 — Non-authenticated user cannot view the Programs page

- **AC reference:** Negative / Authorization
- **Preconditions:** No active session.
- **Test data:** Direct URL `/programs`.
- **Steps:**
  1. Visit `/programs` without authenticating.
- **Expected result:** Redirected to login (or shown an authorization-required page). No program data leaks via the HTML or any pre-rendered payload.
- **Priority:** High

### TC-102 — Non-admin role sees a restricted view (or is blocked)

- **AC reference:** Negative / Authorization
- **Preconditions:** Logged in as a non-admin (e.g., instructor / student).
- **Test data:** —
- **Steps:**
  1. Navigate to `/programs`.
- **Expected result:** Either a `403 Forbidden` view, OR a read-only list with edit/delete affordances hidden. The behavior must match the documented role model (see Gaps).
- **Priority:** High

### TC-103 — Network failure on initial load shows an error state with retry

- **AC reference:** Negative
- **Preconditions:** Admin logged in. Network throttled to "Offline" before navigation.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - An error state appears (e.g., `Could not load programs — try again`).
  - A retry control is present.
  - The page is **not** blank or stuck on the loading skeleton.
  - On retry with network restored, the list loads normally.
- **Priority:** High

### TC-104 — Backend 500 returns a graceful error, not a stack trace

- **AC reference:** Negative
- **Preconditions:** API forced to return HTTP 500 (test fixture / feature flag).
- **Test data:** `GET /api/programs` → 500.
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Friendly error UI is shown. No raw stack traces, no internal error messages, no PII leaked into the DOM.
- **Priority:** High

### TC-105 — Backend returns HTTP 401 mid-session

- **AC reference:** Negative
- **Preconditions:** Admin session has just expired.
- **Test data:** `GET /api/programs` → 401.
- **Steps:**
  1. Navigate to the Programs page (or trigger a list refresh).
- **Expected result:** User is redirected to login (or prompted to re-authenticate). No partial / stale program data is shown after the 401.
- **Priority:** Medium

### TC-106 — Empty list does not silently render as "0 programs created"-looking blank screen

- **AC reference:** AC2 / Negative
- **Preconditions:** Zero programs exist.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Empty state is rendered as per TC-005/TC-006 — not a confused blank table with column headers and no rows.
- **Priority:** Medium

---

## 3. Edge Cases

### TC-201 — Large dataset (100+ programs) loads and renders without freezing

- **Preconditions:** 150 programs exist.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - Page renders without UI freeze.
  - Either pagination, infinite scroll, or virtualization is used (see Gaps).
  - First contentful paint of the list is under 2 seconds at the median.
- **Priority:** Medium

### TC-202 — Program with maximum-length Name is rendered without breaking layout

- **Preconditions:** A program exists with a Name at the max length (assume 100 — see Gaps).
- **Test data:** Name = `"A" × 100`.
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** The Name cell either wraps cleanly or truncates with an ellipsis (and a tooltip / `title` attribute reveals the full value on hover/focus). No horizontal overflow on a 1280 px viewport.
- **Priority:** Medium

### TC-203 — Program with very long Description is rendered without breaking layout

- **Preconditions:** A program exists with a Description ≥ 1000 characters.
- **Test data:** Description = a 1000-character string.
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Description cell truncates with an ellipsis (or is collapsed to a fixed line count) and provides a way to read the full value (tooltip, modal, or detail view). No layout breakage.
- **Priority:** Medium

### TC-204 — Program with special characters in Name and Description is rendered safely (XSS)

- **Preconditions:** Programs exist with:
  - Name = `Informatique & IA - Niveau 2`, Description = `Niveau "intermédiaire" — accents`.
  - Name = `<script>alert('xss')</script>`, Description = `<img src=x onerror=alert(1)>`.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:**
  - Special characters render literally; no HTML interpretation.
  - No JavaScript executes; no DOM injection.
  - Stored values match what's displayed (after HTML escaping).
- **Priority:** High *(security-relevant)*

### TC-205 — Program with Unicode / emoji in Name and Description is rendered correctly

- **Preconditions:** Program exists with Name = `数据科学 2026 🚀`, Description = `Cours en français — première édition`.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Both fields display all codepoints correctly. No mojibake. No truncation mid-surrogate pair.
- **Priority:** Low

### TC-206 — Empty / null Description renders gracefully

- **Preconditions:** A program exists where Description is empty/null (if the schema allows).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Description cell shows an empty cell or a placeholder (e.g., `—` or `No description`). Never `undefined`, `null`, or `[object Object]`.
- **Priority:** Medium

### TC-207 — Default sort order is deterministic and documented

- **Preconditions:** 5 programs exist with mixed names and known creation/edit timestamps.
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
  2. Note the order of rows.
  3. Reload the page.
  4. Compare order.
- **Expected result:** Order is identical on every load (deterministic). The order matches the documented default (e.g., alphabetical by Name, or newest-first by creation date — see Gaps).
- **Priority:** Medium

### TC-208 — List updates after another admin creates / deletes a program

- **Preconditions:** Admin A and Admin B both viewing the Programs page in separate sessions.
- **Test data:** —
- **Steps:**
  1. Admin A creates `New Program 2026`.
  2. Admin B refreshes the Programs page (or, if live updates are supported, observes without refresh).
- **Expected result:** Admin B sees `New Program 2026`. After Admin A deletes it, Admin B sees it removed (after refresh, or live, per design — see Gaps).
- **Priority:** Medium

### TC-209 — Pagination boundary: last page with one row

- **Preconditions:** Programs count = `page_size × N + 1` (e.g., 26 programs at 25 per page).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
  2. Go to the last page.
- **Expected result:** Last page renders exactly one row; pagination control disables `Next` and indicates `Page N+1 of N+1` (or equivalent).
- **Priority:** Medium *(conditional on pagination — see Gaps)*

### TC-210 — Programs with identical Names (if uniqueness is scoped) are both visible

- **Preconditions:** *(Only relevant if Name uniqueness is scoped, not global — see Gaps and TICKET-003.)* Two programs both named `Pilot 2026` exist under different scopes (e.g., different cohort years).
- **Test data:** —
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Both rows are visible and distinguishable (e.g., by a scope column or by ID). The user can tell them apart without ambiguity.
- **Priority:** Low *(conditional on scoped uniqueness)*

### TC-211 — Programs with deeply nested or RTL text render correctly

- **Test data:** A program with Description in Arabic (`دورة تطوير الويب 2026`) and one mixing LTR + RTL.
- **Steps:**
  1. Navigate to the Programs page.
- **Expected result:** Text direction is detected and applied per cell. Layout does not collapse for RTL content. Punctuation rendering is correct.
- **Priority:** Low *(only if i18n is in scope — see Gaps)*

---

## 4. Non-functional

### TC-301 — List is fully keyboard navigable

- **Steps:**
  1. Reach the Programs page via Tab navigation.
  2. Tab through every row's interactive elements (edit, delete, etc., if present).
  3. Activate row actions with Enter/Space.
- **Expected result:** Logical tab order, visible focus rings on every interactive element, no keyboard traps.
- **Priority:** High

### TC-302 — Screen reader announces the list structure and counts

- **Steps:**
  1. With a screen reader running (NVDA / VoiceOver), navigate to the Programs page.
- **Expected result:**
  - The list is rendered with appropriate semantics (`<table>` with `<thead>`/`<tbody>`, or `role="list"` / `role="grid"` per design).
  - Total program count is announced (e.g., via an `aria-live` region or as part of the heading).
  - Each row's accessible name includes the program Name.
- **Priority:** High

### TC-303 — Page is responsive at small viewports (≤ 375 px)

- **Steps:**
  1. Open the Programs page at 375 px width.
- **Expected result:** No horizontal scroll. Either rows reflow to a card layout, or only essential columns remain. All actions remain reachable.
- **Priority:** Medium

### TC-304 — Initial list render meets a target time

- **Preconditions:** Typical dataset (25–100 programs).
- **Test data:** —
- **Steps:**
  1. Measure time-to-first-meaningful-paint of the list on a baseline machine and network.
- **Expected result:** Under 2 seconds at the median (or whichever target the product defines — see Gaps). No layout shift > 0.1 CLS.
- **Priority:** Medium

### TC-305 — Empty-state CTA is accessible

- **Steps:**
  1. With a screen reader, navigate to the empty-state CTA.
- **Expected result:** Button has an accessible name (e.g., `Create your first program`) and a meaningful `role="button"`. It is keyboard activatable with Enter and Space.
- **Priority:** Medium

### TC-306 — XSS hardening verified across list and detail views

- **Steps:**
  1. Create programs with payloads in Name and Description containing HTML, JS, and SVG attack vectors.
  2. View Programs list, any tooltip / popover, and the detail page (if it exists).
- **Expected result:** All views render strings as literal text. CSP (if present) is not violated.
- **Priority:** High

---

## 5. Filtering — *Conditional (depends on resolved requirements)*

> These cases are drafted in anticipation of the filtering behavior implied by
> the feature title but **not specified in any AC**. They should be confirmed
> or pruned once the team clarifies filter scope.

### TC-401 — Text search filters the list by Name

- **Preconditions:** Programs `Web Development 2026`, `Data Science 2026`, `Cybersecurity 2026` exist.
- **Test data:** Search term = `Web`.
- **Steps:**
  1. Type `Web` into the search box.
- **Expected result:** Only `Web Development 2026` is shown. The total count updates to `1 of 3`. No layout flicker.
- **Priority:** High *(conditional)*

### TC-402 — Search is case-insensitive

- **Test data:** Search term = `WEB`.
- **Expected result:** Same result as TC-401 — `Web Development 2026` is shown.
- **Priority:** Medium *(conditional)*

### TC-403 — Search yielding zero matches shows an explicit "no matches" state (not the empty state)

- **Test data:** Search term = `NoSuchProgramXYZ`.
- **Expected result:** A "no matches for 'NoSuchProgramXYZ'" message is shown — distinct from the empty state of TC-005, since programs *do* exist in the system.
- **Priority:** High *(conditional)*

### TC-404 — Clearing the search restores the full list

- **Steps:**
  1. Apply a search term.
  2. Clear it (X button or backspace).
- **Expected result:** Full list returns; count returns to `N of N`.
- **Priority:** Medium *(conditional)*

### TC-405 — Filter state survives a page reload (URL query param)

- **Steps:**
  1. Apply a search term `Data`.
  2. Reload the page.
- **Expected result:** Search box still shows `Data`; list is filtered to matches. (Bookmark-friendly behavior.) *(Confirm with design — see Gaps.)*
- **Priority:** Medium *(conditional)*

---

## Ambiguities & Gaps in the Acceptance Criteria

The ACs cover the two scenarios provided, but they leave large parts of the
feature undefined. Before sign-off, the team should clarify:

1. **Filtering — entirely missing from the ACs.** The feature title says *"filtering and display"* but no AC defines:
   - Which fields are filterable (Name? Description? Status? Date range? Owner?)
   - The filter UI (search box, dropdown, faceted panel, tags?)
   - Match semantics (substring, prefix, exact, fuzzy?)
   - Case sensitivity
   - Multi-filter combinations (AND/OR)
   - Empty filter result state
   - Whether filter state is reflected in the URL
2. **Displayed columns / fields beyond Name + Description** — Are Start Date, Status, Capacity, Owner, etc. shown? Which columns are visible by default?
3. **Sort order** — Default sort? User-changeable? Persisted per user?
4. **Pagination model** — Pagination, infinite scroll, or virtualization? Default page size? URL state?
5. **Empty-state copy and CTA destination** — Exact message text; does the CTA open a modal or navigate to a new route?
6. **Loading state** — Skeleton rows? Spinner? Optimistic empty list?
7. **Error state copy and retry behavior** — Exact wording; auto-retry policy?
8. **Permission model** — What does a non-admin see — the same list with hidden actions, a read-only list, or a 403?
9. **Live updates** — When another admin creates/edits/deletes, does the current list refresh in real-time, or only on user-initiated refresh?
10. **Row actions** — Are edit / delete icons present in each row (cross-ref TICKET-002, TICKET-004)? Is the row itself clickable to a detail view?
11. **Bulk actions** — Multi-select with bulk delete or export? (Out of scope per current ACs but a likely follow-up.)
12. **Column customization** — Can the user show/hide columns or reorder them?
13. **Truncation rules** — At what character or pixel width does Name / Description truncate? Tooltip on hover?
14. **Description rendering** — Plain text only? Markdown? HTML? (XSS implications — TC-204/TC-306.)
15. **Internationalization** — Are field labels (`Name`, `Description`, action buttons, empty-state copy) localized? RTL supported? (TC-211.)
16. **Accessibility bar** — WCAG 2.1 AA assumed; please confirm. Especially relevant for empty-state CTA and table semantics.
17. **Performance budget** — Target time-to-first-meaningful-paint for the list; expected dataset size at p95?
18. **Stale-data behavior** — If the list is loaded and then a program is deleted server-side, what happens when the user clicks the row?
19. **Export / share** — Out of scope for this ticket, but is a CSV / clipboard export planned?
20. **Auditing** — Does merely viewing the list produce telemetry / audit entries (for compliance)?
