# Prompt — Test Plan from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the **Edit existing program details** feature.

## User Story

> As an admin user, I want to edit an existing program's details so that I can
> correct or update program information after creation.

## Context

- **Jira ticket:** TICKET-002
- **Surface area:** Web UI — Programs page (admin console)
- **Role / permissions:** Admin user
- **Trigger:** Edit icon on a program row
- **Interaction pattern:** Modal-based edit form, pre-populated with current values
- **Affected entities:** Program (Name, Description, and other fields not yet enumerated)

## Acceptance Criteria

### Scenario: Open program for editing
```
Given I am on the Programs page
And a program "Web Development 2026" exists
When I click the edit icon on "Web Development 2026"
Then I see the edit form pre-populated with the program's current data
```

### Scenario: Successfully edit a program name
```
Given I am editing "Web Development 2026"
When I change the Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list immediately shows "Web Development 2026 - Updated"
```

### Scenario: Edit preserves unchanged fields
```
Given I am editing a program
When I only change the Description
And I click Save
Then the Name and other fields remain unchanged
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
