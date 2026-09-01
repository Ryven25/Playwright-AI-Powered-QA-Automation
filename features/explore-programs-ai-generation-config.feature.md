## Coverage snapshot
- Page: `/programs` — New Program modal (DS-1 create flow)
- Already covered (`tests/ds1-create-program.spec.ts` and adjacent specs):
  - Create with name + optional description; modal closes; row appears in list
  - Empty / whitespace name keeps Create disabled
  - Duplicate name behavior (TC-07; note DS-3 also covers duplicate rejection)
  - Dismiss via Escape without creating (TC-08)
  - Special chars, Unicode, trim, XSS in program name
  - Edit modal Close (X) covered in DS-2; create modal Close (X) and Cancel button not covered
- Not mentioned in any spec:
  - **AI Generation Config** toggle (`▸ Show` / `▾ Hide AI Generation Config`)
  - Default Session Hours (`4`), Default Exam Hours (`3`), Total Program Hours, Target Audience, Focus Areas, Sync/Async ratio slider
  - Helper copy: `Required for AI curriculum generation`
- Explored via a11y tree: this session (2026-08-31)

## Selected gap (one flow)
**Flow:** Expand AI Generation Config in the New Program modal
**Why this one:** DS-1 exercises only Program Name and Description; the live modal exposes a collapsible AI config region with scheduling defaults that no spec opens or asserts.

## Gherkin test plan

```gherkin
Feature: Programs — New Program AI Generation Config (discovered)

  # Positive path
  Scenario: Expanding AI Generation Config reveals scheduling defaults
    Given I am logged in as admin
    And I am on the Programs page
    When I click the button "+ New Program"
    Then I see a dialog named "New Program"
    And I see the button "▸ Show AI Generation Config"
    When I click the button "▸ Show AI Generation Config"
    Then I see the button "▾ Hide AI Generation Config"
    And I see the text "Required for AI curriculum generation"
    And the textbox "Default Session Hours" has value "4"
    And the textbox "Default Exam Hours" has value "3"
    And I see the textbox "Total Program Hours"
    And I see the textbox "Target Audience"
    And I see the textbox "Focus Areas"

  # Edge case
  Scenario: AI config fields do not enable Create without a program name
    Given I am logged in as admin
    And I am on the Programs page
    When I click the button "+ New Program"
    And I click the button "▸ Show AI Generation Config"
    Then the button "Create" is disabled
    When I fill the textbox "Total Program Hours" with "900"
    And I fill the textbox "Target Audience" with "Career changers"
    Then the button "Create" is still disabled
    When I fill the textbox "Program Name" with "AI Config Guard Program"
    Then the button "Create" is enabled
```

## Locator hints (from a11y tree)
- Open modal: button `+ New Program`
- Dialog: `getByRole('dialog', { name: 'New Program' })` — heading level 2 `New Program`
- Toggle: button `▸ Show AI Generation Config` / `▾ Hide AI Generation Config`
- Program Name *: `getByLabel('Program Name')` (placeholder `e.g. Computer Science BSc`)
- Description: textbox `"Description"` (placeholder `Brief description`)
- Total Program Hours: textbox `"Total Program Hours"` (placeholder `e.g. 900`)
- Default Session Hours: textbox `"Default Session Hours"` (default value `4`)
- Default Exam Hours: textbox `"Default Exam Hours"` (default value `3`)
- Target Audience: textbox `"Target Audience"`
- Focus Areas: textbox `"Focus Areas"`
- Sync/Async: slider + label text like `Sync/Async Ratio: 70% sync / 30% async`
- Helper: text `Required for AI curriculum generation`
- Cancel: button `"Cancel"` (closes dialog without creating — distinct from TC-08 Escape path)
- Submit: button `"Create"` — disabled until Program Name is non-empty
- Dialog close (X): unnamed button in dialog banner (same pattern as Edit Program modal)

## For test-writer
- Suggested file: `tests/ds8-new-program-ai-config.spec.ts`
- POM updates: extend `pages/didaxis/components/new-program.modal.ts` with AI config toggle + field locators; optional `closeButton` via dialog banner (mirror `EditProgramModal`)
- Tags: `@regression` for both scenarios (modal UI guard, no full create path required unless you add a follow-up create-with-config test)
- Cleanup: if a create path is added later, use `createProgramAndTrack()` + `fixtures/cleanup.fixture.ts`
- Follow `pom-conventions` and `playwright-conventions.mdc`; no inline locators in the spec
