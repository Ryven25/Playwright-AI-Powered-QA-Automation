# Prompt — Test Plan from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the **Delete program with confirmation** feature.

## User Story

> As an admin user, I want to delete a program I no longer need, with a
> confirmation step to prevent accidental deletion.

## Context

- **Jira ticket:** TICKET-004
- **Surface area:** Web UI — Programs page (admin console) + backing API
- **Role / permissions:** Admin user
- **Trigger:** Delete icon on a program row
- **Interaction pattern:** Two-step (icon click → confirmation dialog → confirm/cancel)
- **Affected entities:** Program record; possibly downstream cohorts/enrollments (TBD)
- **Related work:**
  - TICKET-002 (Edit existing program details) — same row-action UI pattern
  - TICKET-003 (Program name validation) — name reuse after deletion is touched here

## Acceptance Criteria

### Scenario: Delete program with confirmation
```
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then I see a confirmation dialog
When I confirm deletion
Then "Test Program" is removed from the program list
```

### Scenario: Cancel program deletion
```
Given I click the delete icon for a program
When I see the confirmation dialog
And I click Cancel
Then the program still exists in the list
```

## Requirements for the test plan

- Cover every AC with at least one test case
- Add edge cases the ACs don't mention
  (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as:
  - ID (TC-001, TC-002, etc.)
  - Title (expected behavior, not action)
  - AC reference (which AC, or "Edge" / "Negative")
  - Preconditions
  - Test data
  - Steps (numbered)
  - Expected result
  - Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases, Non-functional (if applicable)

## Output

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- Include a traceability table mapping each AC → TC IDs
- At the end: list any ambiguities or gaps in the ACs
