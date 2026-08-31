import { Locator, Page } from '@playwright/test';
import { AUTH_ROUTES } from '../../support/auth.constants';
import { EditProgramModal } from './components/edit-program.modal';
import { NewProgramModal } from './components/new-program.modal';
import { NewSemesterModal } from './components/new-semester.modal';
import { SemesterPanel } from './components/semester-panel';

export class ProgramsPage {
  readonly newProgram: NewProgramModal;
  readonly editProgram: EditProgramModal;
  readonly newSemester: NewSemesterModal;
  readonly semesterPanel: SemesterPanel;
  readonly heading: Locator;
  readonly pageDescription: Locator;
  readonly table: Locator;
  readonly programColumnHeader: Locator;
  readonly newProgramButton: Locator;
  /** Message shown when the Programs list has zero programs (AC2). */
  readonly emptyStateMessage: Locator;
  /** Empty-state create CTA (distinct from header "+ New Program"). */
  readonly emptyStateCreatePrompt: Locator;

  constructor(readonly page: Page) {
    this.newProgram = new NewProgramModal(page);
    this.editProgram = new EditProgramModal(page);
    this.newSemester = new NewSemesterModal(page);
    this.semesterPanel = new SemesterPanel(page);
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.pageDescription = page.getByText('Manage academic programs and semesters');
    this.table = page.getByRole('table');
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.emptyStateMessage = page.getByText(/no programs/i);
    this.emptyStateCreatePrompt = page.getByRole('button', { name: 'Create Program' });
  }

  async goto(): Promise<void> {
    await this.page.goto(AUTH_ROUTES.programs);
    await this.page.waitForLoadState('networkidle');
  }

  async openNewProgramModal(): Promise<void> {
    await this.newProgramButton.click();
  }

  editButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${programName}` });
  }

  deleteButton(programName: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${programName}` });
  }

  programText(text: string, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  firstDataRow(): Locator {
    return this.page.getByRole('row').nth(1);
  }

  programRow(programName: string): Locator {
    // Table rows expose no accessible name, so match on the row's text content.
    return this.page.getByRole('row').filter({ hasText: programName });
  }

  /** Selecting a program name opens its semester panel on the right. */
  async selectProgram(programName: string): Promise<void> {
    await this.programText(programName, { exact: true }).click();
  }

  async openEditModal(programName: string): Promise<void> {
    await this.editButton(programName).click();
  }

  async clickDelete(programName: string): Promise<void> {
    await this.deleteButton(programName).click();
  }
}
