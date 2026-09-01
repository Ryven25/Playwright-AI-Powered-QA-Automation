## Coverage snapshot
- Page: `/programs`
- Already covered:
  - DS-1 create program (including cancel-create)
  - DS-2 edit program
  - DS-3 name validation
  - DS-4 delete program
  - DS-5 program list display / empty state
  - DS-6 selecting a program reveals the semester panel; switching selection updates it
- Explored via a11y tree: this session (2026-08-31) via Playwright MCP

## Selected gap (one flow)
**Flow:** Add a semester to a selected program
**Why this one:** DS-6 only asserts the empty panel (`+ Semester`, "No semesters yet"); no spec opens the New Semester dialog or creates a semester.

## Gherkin test plan

```gherkin
Feature: Programs — Add semester (discovered)

  # Positive path
  Scenario: Creating a semester with required fields adds it to the panel
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Add Semester Program" exists in the list
    And I have selected that program so the semester panel is open
    When I click the button "+ Semester"
    Then I see a dialog named "New Semester"
    When I fill the textbox "Semester Name" with "Fall 2026"
    And I fill the textbox "Start Date" with "2026-09-01"
    And I fill the textbox "End Date" with "2026-12-15"
    And I click the button "Create Semester"
    Then I do not see the dialog "New Semester"
    And I do not see "No semesters yet"
    And I see "Fall 2026" in the semester panel

  # Edge case
  Scenario: Create Semester stays disabled until required fields are filled
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Add Semester Guard" exists in the list
    And I have selected that program so the semester panel is open
    When I click the button "+ Semester"
    Then I see a dialog named "New Semester"
    And the button "Create Semester" is disabled
    When I fill the textbox "Semester Name" with "Fall 2026"
    Then the button "Create Semester" is still disabled
    When I fill the textbox "Start Date" with "2026-09-01"
    And I fill the textbox "End Date" with "2026-12-15"
    Then the button "Create Semester" is enabled
```

## Locator hints (from a11y tree)
- Open dialog: button `+ Semester` (semester panel)
- Dialog: `getByRole('dialog', { name: 'New Semester' })` — heading level 2 "New Semester"
- Semester Name *: textbox `"Semester Name"` (placeholder `e.g. Semester 1`)
- Start Date *: textbox `"Start Date"` (date, value like `2026-09-01`)
- End Date *: textbox `"End Date"`
- Allowed Weekdays: group `"Allowed Weekdays"`; Mon–Fri checked by default; Sat/Sun unchecked
- Max Sessions/Day: textbox default `"2"`
- Max Hours/Day: textbox default `"8"`
- Weekly Hour Limit: textbox default `"16"`
- Default Start Time: textbox default `08:00`
- Cancel: button `"Cancel"` (closes without creating)
- Submit: button `"Create Semester"` — disabled until Name + Start Date + End Date are filled
- Dialog close (X): unnamed button in the dialog banner
- Empty panel: text `"No semesters yet"`
- After create (inferred, not persisted during exploration): dialog gone, empty-state gone, semester name visible

## For test-writer
- Suggested file: `tests/ds7-add-semester.spec.ts`
- POM updates: new `pages/didaxis/components/new-semester.modal.ts`; add `openAddSemesterModal()` on `SemesterPanel`; expose semester-name locator on the panel for assertions
- Compose on `ProgramsPage` like other modals (`programs.newSemester`)
- Prerequisite data: `createProgramAndTrack()` then `programs.selectProgram(name)`
- Tags: exactly one per test — `@e2e` for the create path, `@regression` for the disabled-button guard
- Cleanup: track the program; do not add per-test `afterAll` deletes
- Follow `pom-conventions` and `playwright-conventions.mdc`; no inline locators in the spec
