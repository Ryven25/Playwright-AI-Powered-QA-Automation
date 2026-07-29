import { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  /** Visible when create is rejected because the name is already taken (AC3). */
  readonly duplicateNameError: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    // Prefer dialog-scoped copy; fall back to page toast/banner if the app surfaces the error outside the modal.
    this.duplicateNameError = page
      .getByText(/already exists|duplicate|name.*(taken|in use)/i)
      .or(this.dialog.getByRole('alert'));
  }

  async fill(name: string, description?: string): Promise<void> {
    await this.programName.fill(name);
    if (description) {
      await this.description.fill(description);
    }
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
