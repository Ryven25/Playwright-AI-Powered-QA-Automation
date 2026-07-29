# Feature: DS-3 — Program name validation and duplicate prevention

As an admin user, I want the system to prevent invalid or duplicate program names
so that data integrity is maintained.

**Jira:** [DS-3](https://legionqaschool.atlassian.net/browse/DS-3)

---

# Happy paths

```gherkin
Feature: DS-3 — Program name validation and duplicate prevention

  Scenario: Accept program name with special characters
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill other required fields
    And I click Create
    Then the program is created successfully
    And I see "Informatique & IA - Niveau 2" in the program list

  Scenario: Accept program name with numbers and hyphens
    Given I am on the program creation form
    When I enter "Program-101-Advanced" as the program name
    And I click Create
    Then the program is created successfully
```

# Negative

```gherkin
  Scenario: Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I click Create
    Then the form is not submitted
    And the name is trimmed and treated as empty

  Scenario: Reject empty program name
    Given I am on the program creation form
    When I leave the program name blank
    Then the Create button is disabled

  Scenario: Reject duplicate program name
    Given a program "Web Development 2026" already exists
    When I try to create a new program with the same name
    Then I see an error indicating the name already exists
    And a second program with that name is not created
```

# Edge cases

```gherkin
  Scenario: Leading and trailing whitespace is trimmed on save
    Given I am on the program creation form
    When I enter "   Trimmed Name   " as the program name
    And I click Create
    Then the program is saved as "Trimmed Name"

  Scenario: Unicode characters in program name are accepted
    Given I am on the program creation form
    When I enter "データサイエンス" as the program name
    And I click Create
    Then the program is created successfully

  Scenario: XSS-like script tag in name is rendered as text
    Given I am on the program creation form
    When I enter "<script>alert(\"xss\")</script>" as the program name
    And I click Create
    Then the program is created successfully
    And the name is displayed as plain text
```

<!--
Ambiguities / gaps:
- Max length and case-sensitivity for duplicates not specified in AC.
- Whitespace-only may disable Create rather than show a server error.
- Prior run filed DS-201 for AC3 (duplicates allowed). Re-run should still assert rejection.
-->
