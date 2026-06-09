# Prompt — Test Plan from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the **Program list filtering and display** feature.

## User Story

> As an admin user, I want to see all programs in a clear list so that I can
> quickly find and manage them.

## Context

- **Jira ticket:** TICKET-005
- **Surface area:** Web UI — Programs page (admin console) + backing API (list endpoint)
- **Role / permissions:** Admin user
- **Trigger:** Navigating to the Programs page
- **Affected entities:** Program records (Name, Description, and possibly other fields)
- **Related work:**
  - TICKET-002 (Edit existing program details) — edited values must reflect in the list
  - TICKET-003 (Program name validation) — created programs appear here
  - TICKET-004 (Delete program with confirmation) — deleted programs disappear here

> ⚠️ **Naming note:** the feature is titled *"Program list filtering and display"*,
> but the supplied ACs describe **display + empty state only** — they do not
> define any filtering behavior. The test plan covers display thoroughly and
> calls out the missing filter requirements in the Ambiguities section.

## Acceptance Criteria

### Scenario: Display program list with key details
```
Given programs exist in the system
When I navigate to the Programs page
Then I see a list showing each program's name and description
```

### Scenario: Empty state when no programs exist
```
Given no programs exist
When I navigate to the Programs page
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
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
- At the end: list any ambiguities or gaps in the ACs — especially the missing
  filtering requirements implied by the feature title
