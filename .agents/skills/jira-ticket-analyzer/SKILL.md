---
name: jira-ticket-analyzer
description: Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin test scenarios and a detailed test plan. Use this skill whenever the user references a Jira ticket (DS-1, DS-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Test Plan + Gherkin

Generate reviewable test artifacts from a Jira ticket. Humans review the
plan before Playwright code is written.

## Steps

1. Read the referenced Jira ticket using the Atlassian MCP (or Jira REST
   fallback). Extract the title, description, and every acceptance criterion.

2. Create folder `features/<ticket-key>/` (e.g. `features/DS-4/`).

3. Write Gherkin as `<ticket-key>.feature.md`:
   - One `Feature`, named after the ticket
   - Cover every acceptance criterion with at least one `Scenario`
   - Add negative scenarios — what should NOT happen
   - Add edge-case scenarios — boundaries, empty inputs, duplicates,
     special characters, max length
   - Given / When / Then; group with `# Happy paths`, `# Negative`, `# Edge cases`
   - Real values from the ticket — never placeholders
   - End with a comment block listing ambiguities / gaps

4. Write a detailed plan as `<ticket-key>_test_plan.md`:
   - Traceability table (AC → TC IDs)
   - Each TC: ID, title, AC reference, preconditions, steps, expected result, priority
   - Link the expected automation path: `tests/ds{N}-{slug}.spec.ts`

## Output

```
features/<ticket-key>/
  <ticket-key>.feature.md
  <ticket-key>_test_plan.md
```

Do **not** also write under `test-suite/` — `features/` is the single source of truth.

## Spec naming (for handoff to test-writer)

Jira `DS-{N}` → `tests/ds{N}-{short-slug}.spec.ts`  
Examples: DS-4 delete → `tests/ds4-delete-program.spec.ts`; DS-3 validation → `tests/ds3-name-validation.spec.ts`.

## Example

```gherkin
Feature: DS-4 — Delete program with confirmation

  Scenario: Delete icon opens a confirmation dialog
    Given I am logged in as admin
    And a program named "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
```
