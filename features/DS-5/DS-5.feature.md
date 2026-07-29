# Feature: DS-5 — Program list filtering and display

As an admin user, I want to see all programs in a clear list so that I can quickly
find and manage them.

**Jira:** [DS-5](https://legionqaschool.atlassian.net/browse/DS-5)

---

# Happy paths

```gherkin
Feature: DS-5 — Program list filtering and display

  Scenario: Display program list with key details
    Given I am logged in as admin
    And programs exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description

  Scenario: Each program row exposes Edit and Delete actions
    Given a program "List Display Demo" exists with description "Visible in list"
    When I navigate to the Programs page
    Then I see "List Display Demo" and "Visible in list" in the list
    And the row has Edit and Delete action buttons

  Scenario: New Program button is always available
    Given I am on the Programs page
    Then I see the "+ New Program" button
```

# Negative

```gherkin
  Scenario: Empty state when no programs exist
    Given no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Unauthenticated user cannot view the program list
    Given I am not logged in
    When I navigate to the Programs page
    Then I am redirected to the login page
```

# Edge cases

```gherkin
  Scenario: Program with a very long name still displays
    Given I create a program with a name longer than 80 characters
    When I view the Programs page
    Then the program name is visible in the list

  Scenario: Program without a description shows the name only
    Given I create a program with name "No Desc Program" and no description
    When I view the Programs page
    Then I see "No Desc Program" in the list

  Scenario: Newly created program appears at the top of the list
    Given I create a program named "Latest Program"
    When the list refreshes
    Then the first data row contains "Latest Program"
```

<!--
Ambiguities / gaps:
- AC does not define exact empty-state copy — accept any clear "no programs" message
  plus a create prompt (e.g. "+ New Program" or dedicated CTA text).
- Title says "filtering" but AC only covers list display + empty state; no filter UI
  scenarios until AC is expanded.
- Empty-state TC requires an environment with zero programs (or API wipe before
  assertion). If the app never shows empty state when programs exist, isolate via
  API cleanup / dedicated empty fixture.
- Existing draft may omit AC empty-state; writer must add it and keep assertions
  aligned to AC (fail = product gap if empty state missing).
-->
