Feature: DS-5 — Program list filtering and display

  As an admin user, I want to see all programs in a clear list
  so that I can quickly find and manage them.

  # Happy paths

  Scenario: Display program list with key details
    Given I am logged in as admin on Didaxis Studio
    And programs exist in the system
    When I navigate to the Programs page at /programs
    Then I see a list showing each program's name and description
    And I see the Programs heading
    And I see the "+ New Program" button

  Scenario: Newly created program appears in the list with name and description
    Given I am logged in as admin on Didaxis Studio
    And I am on the Programs page
    When I create a program named "Web Development 2026" with description "Full-stack web development program"
    Then the program list shows "Web Development 2026"
    And the program list shows "Full-stack web development program"

  Scenario: Empty state when no programs exist
    Given I am logged in as admin on Didaxis Studio
    And no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  # Negative

  Scenario: Empty state does not show a data table of programs
    Given I am logged in as admin on Didaxis Studio
    And no programs exist
    When I navigate to the Programs page
    Then I do not see program rows in the list

  Scenario: Deleted program no longer appears in the list
    Given I am logged in as admin on Didaxis Studio
    And a program named "Temp List Program" exists
    When I delete "Temp List Program" and confirm
    Then the program list does not show "Temp List Program"

  # Edge cases

  Scenario: Program with special characters displays correctly in the list
    Given I am logged in as admin on Didaxis Studio
    When I create a program named "Informatique & IA - Niveau 2" with description "Special chars display"
    Then the program list shows "Informatique & IA - Niveau 2"
    And the program list shows "Special chars display"

  Scenario: Program with only a name and empty description still appears
    Given I am logged in as admin on Didaxis Studio
    When I create a program named "Name Only List Program" with an empty description
    Then the program list shows "Name Only List Program"

  Scenario: Multiple programs are all visible in the list
    Given I am logged in as admin on Didaxis Studio
    When I create programs "List Alpha" and "List Beta" with distinct descriptions
    Then the program list shows "List Alpha"
    And the program list shows "List Beta"

<!--
Ambiguities & Gaps
==================

1. Feature title says "filtering and display" but ACs only cover display + empty state.
   - No filter control, search box, sort, or pagination is specified.
   - Assumption for this plan: cover display/empty state only; do not invent filter UI tests.

2. Exact empty-state copy is not specified.
   - Open question: exact message text and whether the prompt is the "+ New Program" button only.

3. List layout is not specified (table vs cards).
   - Observed: table with Program column; Edit/Delete per row.

4. Sort order of programs is not defined.

5. Behavior with very long names/descriptions (truncation, tooltip) is not specified.

6. Non-admin access is not covered.
-->
