Feature: DS-4 — Delete program with confirmation

  As an admin user, I want to delete a program I no longer need, with a
  confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Delete icon opens a confirmation dialog
    Given I am logged in as admin on Didaxis Studio
    And a program named "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And "Test Program" is still present in the program list

  Scenario: Confirming deletion removes the program from the list
    Given I am logged in as admin on Didaxis Studio
    And a program named "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    And I confirm deletion in the confirmation dialog
    Then the confirmation dialog closes
    And the program list does not show "Test Program"

  Scenario: Cancel keeps the program in the list
    Given I am logged in as admin on Didaxis Studio
    And a program named "Web Development 2026" exists on the Programs page
    When I click the delete icon for "Web Development 2026"
    And I see the confirmation dialog
    And I click Cancel (dismiss the confirmation)
    Then the confirmation dialog closes
    And the program list still shows "Web Development 2026"

  # Negative

  Scenario: Dismissing confirmation does not delete the program
    Given I am logged in as admin on Didaxis Studio
    And a program named "Keep Me Program" exists on the Programs page
    When I click the delete icon for "Keep Me Program"
    And I dismiss the confirmation dialog without confirming
    Then the program list still shows "Keep Me Program"

  Scenario: Deleting one program does not affect other programs
    Given I am logged in as admin on Didaxis Studio
    And a program named "Keep Program A" exists on the Programs page
    And a program named "Remove Program B" exists on the Programs page
    When I click the delete icon for "Remove Program B"
    And I confirm deletion
    Then the program list does not show "Remove Program B"
    And the program list still shows "Keep Program A"

  # Edge cases

  Scenario: Delete a program whose name contains special characters
    Given I am logged in as admin on Didaxis Studio
    And a program named "Prog & \"Quotes\" <Tags>" exists on the Programs page
    When I click the delete icon for that program
    And I confirm deletion
    Then the program list does not show "Prog & \"Quotes\" <Tags>"

  Scenario: Confirmation dialog message includes the program name
    Given I am logged in as admin on Didaxis Studio
    And a program named "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    Then the confirmation dialog message contains "Test Program"

  Scenario: Confirmation dialog warns that deletion cannot be undone
    Given I am logged in as admin on Didaxis Studio
    And a program named "Test Program" exists on the Programs page
    When I click the delete icon for "Test Program"
    Then the confirmation dialog message contains "cannot be undone"

<!--
Ambiguities & Gaps
==================

1. Confirmation UI type is not specified in the ACs.
   - Observed behavior: native `window.confirm` (not a Mantine dialog).
   - Assumption: Cancel = dismiss / reject the confirm dialog.

2. Exact confirmation copy is not specified.
   - Observed: message includes the program name and "cannot be undone".
   - Open question: Is that wording contractually required, or only that a confirm step exists?

3. Success feedback after delete is not specified.
   - Open question: Should a toast/banner appear after successful deletion?

4. Cascade / related data is not addressed.
   - Open question: What happens if the program has cohorts, enrollments, or other dependents?

5. Soft vs hard delete is not specified.
   - Open question: Can a deleted program be restored? Does GET /api/programs/{id} return 404?

6. Non-admin access is not covered.
   - AC assumes admin; behavior for other roles is undefined.

7. Persistence after reload is implied but not stated.
   - Assumption: removal from the list reflects a persisted delete (covered by API cleanup / re-fetch on navigation).
-->
