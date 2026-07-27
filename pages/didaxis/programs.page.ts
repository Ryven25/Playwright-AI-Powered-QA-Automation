import { Locator, Page } from '@playwright/test';
import { AUTH_ROUTES } from '../../support/auth.constants';
import { EditProgramModal } from './components/edit-program.modal';
import { NewProgramModal } from './components/new-program.modal';

export class ProgramsPage {
  readonly newProgram: NewProgramModal;
  readonly editProgram: EditProgramModal;
  readonly heading: Locator;
  readonly pageDescription: Locator;
  readonly table: Locator;
  readonly programColumnHeader: Locator;
  readonly newProgramButton: Locator;
  readonly emptyStateMessage: Locator;
  readonly emptyStateCreateButton: Locator;

  constructor(readonly page: Page) {
    this.newProgram = new NewProgramModal(page);
    this.editProgram = new EditProgramModal(page);
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.pageDescription = page.getByText('Manage academic programs and semesters');
    this.table = page.getByRole('table');
    this.programColumnHeader = page.getByRole('columnheader', { name: 'Program' });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.emptyStateMessage = page.getByText(
      'No programs yet. Create your first program to get started.'
    );
    this.emptyStateCreateButton = page.getByRole('button', {
      name: 'Create Program',
      exact: true,
    });
  }

  /**
   * Mock GET /api/programs (list only) as empty so empty-state UI can be
   * asserted without deleting shared-environment data. Other methods / IDs continue.
   */
  async mockEmptyProgramsList(): Promise<void> {
    await this.page.route(/\/api\/programs\/?(\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
        return;
      }
      await route.continue();
    });
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

  async openEditModal(programName: string): Promise<void> {
    await this.editButton(programName).click();
  }

  async clickDelete(programName: string): Promise<void> {
    await this.deleteButton(programName).click();
  }
}
