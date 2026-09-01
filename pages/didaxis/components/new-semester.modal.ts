import { Locator, Page } from '@playwright/test';

export class NewSemesterModal {
  readonly dialog: Locator;
  readonly semesterName: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Semester' });
    this.semesterName = this.dialog.getByRole('textbox', { name: 'Semester Name' });
    this.startDate = this.dialog.getByRole('textbox', { name: 'Start Date' });
    this.endDate = this.dialog.getByRole('textbox', { name: 'End Date' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create Semester' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fill(name: string, startDate: string, endDate: string): Promise<void> {
    await this.semesterName.fill(name);
    await this.startDate.fill(startDate);
    await this.endDate.fill(endDate);
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
