import { Locator, Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.heading = this.dialog.getByRole('heading', { name: 'Edit Program' });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.dialog.getByRole('banner').getByRole('button');
  }

  async fillName(name: string): Promise<void> {
    await this.programName.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.description.fill(description);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async closeWithX(): Promise<void> {
    await this.closeButton.click();
  }
}
