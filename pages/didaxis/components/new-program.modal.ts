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
    // Scoped to the New Program dialog so list descriptions containing "Duplicate"
    // (or similar) do not cause strict-mode matches / false positives.
    this.duplicateNameError = this.dialog
      .getByRole('alert')
      .or(this.dialog.getByText(/already exists|duplicate (name|program)|name.*(taken|in use)/i));
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
