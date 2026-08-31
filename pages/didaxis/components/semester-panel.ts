import { Locator, Page } from '@playwright/test';

/**
 * Right-hand semester panel on the Programs page. It shows a placeholder until a
 * program row is selected, then swaps to that program's semesters & scheduling
 * config (heading, action buttons, and the "No semesters yet" empty state).
 */
export class SemesterPanel {
  /** Shown before any program is selected. */
  readonly placeholder: Locator;
  /** Subtitle rendered under the selected program's name. */
  readonly subtitle: Locator;
  readonly addSemesterButton: Locator;
  readonly manageCoursesButton: Locator;
  readonly generateCurriculumButton: Locator;
  /** Empty state shown for a program that has no semesters yet. */
  readonly noSemestersMessage: Locator;

  constructor(private readonly page: Page) {
    this.placeholder = page.getByText('Select a program to manage semesters');
    this.subtitle = page.getByText('Semesters & scheduling config');
    this.addSemesterButton = page.getByRole('button', { name: '+ Semester' });
    this.manageCoursesButton = page.getByRole('button', { name: 'Manage Courses' });
    this.generateCurriculumButton = page.getByRole('button', { name: /Generate Curriculum/ });
    this.noSemestersMessage = page.getByText('No semesters yet');
  }

  /** The panel heading carries the selected program's name (level-4 heading). */
  heading(programName: string): Locator {
    return this.page.getByRole('heading', { level: 4, name: programName, exact: true });
  }

  async openAddSemesterModal(): Promise<void> {
    await this.addSemesterButton.click();
  }

  semesterName(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }
}
