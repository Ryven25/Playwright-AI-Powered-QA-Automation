# Test Plan: Program name validation and duplicate prevention

**Jira:** [DS-3](https://legionqaschool.atlassian.net/browse/DS-3)  
**Role:** Admin user  
**Surface:** Web UI — Programs page (`/programs`) + New Program modal  
**Story:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

### Acceptance criteria (from Jira)

1. **AC1 — Reject whitespace-only name:** Form not submitted when name is `"   "` (trimmed, treated as empty).
2. **AC2 — Accept special characters:** Name `"Informatique & IA - Niveau 2"` creates successfully.
3. **AC3 — Reject duplicate name:** Existing `"Web Development 2026"` blocks a second create with an error.

---

## Traceability (AC → Test Cases)

| AC | Scenario | Test cases |
| --- | --- | --- |
| AC1 | Reject whitespace-only / empty | TC-001, TC-002 |
| AC2 | Accept special / valid names | TC-003, TC-004, TC-005 |
| AC3 | Reject duplicate program name | TC-006 |
| — | Edge cases | TC-007, TC-008, TC-009 |

**Automation:** `tests/ds3-name-validation.spec.ts`  
**Gherkin:** `features/DS-3/DS-3.feature.md`

---

## Test cases

### TC-001 — Reject empty program name (Create disabled)
- **AC:** AC1 · **Priority:** High  
- Open New Program; leave name blank → Create disabled

### TC-002 — Reject whitespace-only program name
- **AC:** AC1 · **Priority:** High  
- Enter `"   "` → form not submitted / Create disabled

### TC-003 — Accept special characters
- **AC:** AC2 · **Priority:** High  
- Create `Informatique & IA - Niveau 2 {ts}` → visible in list

### TC-004 — Accept Unicode
- **AC:** AC2 · **Priority:** Medium  
- Create `データサイエンス {ts}` → visible

### TC-005 — Accept numbers and hyphens
- **AC:** AC2 · **Priority:** Medium  
- Create `Program-101-Advanced {ts}` → visible

### TC-006 — Reject duplicate program name
- **AC:** AC3 · **Priority:** High  
- Create name `N`; submit again with `N` → error that name already exists; only one program with that name  
- **Do not soften** if app allows duplicates → real app bug (see also DS-201)

### TC-007 — Leading/trailing whitespace trimmed
- Create `   Trimmed {ts}   ` → list shows trimmed name · Medium

### TC-008 — XSS script tag rendered as text
- Create `<script>…</script> {ts}` → visible as text · Medium

### TC-009 — Emoji in name accepted
- Create `🎓 Program {ts}` → visible · Low

---

## Handoff to test-writer

- Spec: `tests/ds3-name-validation.spec.ts`
- POM: `pages/didaxis/programs.page.ts`, `pages/didaxis/components/new-program.modal.ts`
- Use `createProgramAndTrack`; follow `pom-conventions` + `api-cleanup`
- TC-006 must expect **rejection** (AC3), not “duplicates allowed”
