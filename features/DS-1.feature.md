Feature: DS-1 — Create new academic program

  As an admin user, I want to create a new academic program
  so that I can begin designing its curriculum structure.

  # Happy paths

  Scenario: Navigate to program creation form
    Given I am logged in as admin on Didaxis Studio
    When I navigate to the Programs page at /programs
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description
    And I see a Create button and a way to dismiss the modal

  Scenario: Successfully create a program with name and description
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the program list shows "Full-stack web development program"

  Scenario: Create program with only the name (description optional)
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals 2026"
    And I leave the Description field empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals 2026"

  Scenario: New program appears in the programs list immediately after creation
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "Cybersecurity Essentials 2026"
    And I fill in Description with "Introductory cybersecurity curriculum"
    And I click Create
    Then the program list shows "Cybersecurity Essentials 2026"
    And the program list shows "Introductory cybersecurity curriculum"
    And I do not need to refresh the page to see the new program

  # Negative

  Scenario: Validation prevents empty program name
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled
    And no program is created

  Scenario: Whitespace-only program name keeps Create button disabled
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Whitespace name test"
    Then the Create button is disabled
    And no program is created

  Scenario: Cancel closes modal without creating a program
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "Abandoned Program 2026"
    And I fill in Description with "Should not be created"
    And I dismiss the modal without clicking Create
    Then the modal closes
    And the program list does not show "Abandoned Program 2026"

  Scenario: Duplicate program name is allowed (no uniqueness validation)
    Given I am logged in as admin on Didaxis Studio
    And a program named "Web Development 2026" already exists in the program list
    When I open the program creation form
    And I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Second instance of the same program"
    And I click Create
    Then the modal closes
    And the program list shows more than one entry for "Web Development 2026"

  # Edge cases

  Scenario: Program name with special characters is accepted
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "Informatique & IA - Niveau 2"
    And I fill in Description with "French-language program with ampersand and hyphen"
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  Scenario: Program name with Unicode characters is accepted
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "数据科学 2026"
    And I fill in Description with "Unicode program name test"
    And I click Create
    Then the modal closes
    And the program list shows "数据科学 2026"

  Scenario: Program name with leading and trailing whitespace is trimmed
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "   Cloud Computing 2026   "
    And I fill in Description with "Whitespace trim test"
    And I click Create
    Then the modal closes
    And the program list shows "Cloud Computing 2026"
    And the program list does not show "   Cloud Computing 2026   "

  Scenario: XSS script tag in program name is stored and displayed as plain text
    Given I am logged in as admin on Didaxis Studio
    And I am on the program creation form
    When I fill in Program Name with "<script>alert(\"xss\")</script>"
    And I fill in Description with "XSS safety test"
    And I click Create
    Then the modal closes
    And the program list shows "<script>alert(\"xss\")</script>"
    And no script alert dialog is displayed

<!--
Ambiguities & Gaps
==================

1. Description field behavior is not fully specified in the acceptance criteria.
   - AC confirms Description is present on the form but does not state whether it is required.
   - Assumption: Description is optional (covered in happy-path scenario).

2. No maximum length is defined for Program Name or Description.
   - Open question: What are the character limits, and what error message should appear if exceeded?

3. Duplicate program names are not addressed in the acceptance criteria.
   - Observed behavior (from exploratory testing): duplicates are allowed.
   - Open question: Is allowing duplicate names intentional, or should uniqueness validation be added?

4. Modal dismissal method is not specified.
   - AC does not define whether Cancel button, Escape key, or clicking outside closes the modal.
   - Assumption: at least one dismiss action closes without persisting data.

5. Non-admin access is not covered.
   - AC states "logged in as admin" but does not define behavior for non-admin or unauthenticated users.
   - Open question: Should non-admin users see "+ New Program" or receive an authorization error?

6. Success feedback beyond list update is not specified.
   - Open question: Should a toast, banner, or other confirmation appear after successful creation?

7. Program list sort order after creation is not defined.
   - Open question: Should the new program appear at the top, bottom, or in alphabetical order?

8. Confluence reference ("Program Setup & Management > Overview") was not fetched for this plan.
   - Additional requirements may exist in that document that are not reflected in the Jira ACs.
-->
