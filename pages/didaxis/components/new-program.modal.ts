import { Locator, Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly showAiConfigButton: Locator;
  readonly hideAiConfigButton: Locator;
  readonly totalProgramHours: Locator;
  readonly defaultSessionHours: Locator;
  readonly defaultExamHours: Locator;
  readonly targetAudience: Locator;
  readonly focusAreas: Locator;
  readonly aiConfigHelperText: Locator;
  /** Visible when create is rejected because the name is already taken (AC3). */
  readonly duplicateNameError: Locator;
  /** Visible when name exceeds max length (100 chars — DS-134). */
  readonly nameLengthError: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByLabel('Program Name');
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.showAiConfigButton = this.dialog.getByRole('button', {
      name: '▸ Show AI Generation Config',
    });
    this.hideAiConfigButton = this.dialog.getByRole('button', {
      name: '▾ Hide AI Generation Config',
    });
    this.totalProgramHours = this.dialog.getByRole('textbox', { name: 'Total Program Hours' });
    this.defaultSessionHours = this.dialog.getByRole('textbox', { name: 'Default Session Hours' });
    this.defaultExamHours = this.dialog.getByRole('textbox', { name: 'Default Exam Hours' });
    this.targetAudience = this.dialog.getByRole('textbox', { name: 'Target Audience' });
    this.focusAreas = this.dialog.getByRole('textbox', { name: 'Focus Areas' });
    this.aiConfigHelperText = this.dialog.getByText('Required for AI curriculum generation');
    // Scoped to the New Program dialog so list descriptions containing "Duplicate"
    // (or similar) do not cause strict-mode matches / false positives.
    this.duplicateNameError = this.dialog
      .getByRole('alert')
      .or(this.dialog.getByText(/already exists|duplicate (name|program)|name.*(taken|in use)/i));
    this.nameLengthError = this.dialog
      .getByRole('alert')
      .or(this.dialog.getByText(/100 characters|too long|max(imum)? length|character limit/i));
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

  async expandAiConfig(): Promise<void> {
    await this.showAiConfigButton.click();
  }

  async fillAiConfig(options: {
    totalProgramHours?: string;
    targetAudience?: string;
    focusAreas?: string;
  }): Promise<void> {
    if (options.totalProgramHours) {
      await this.totalProgramHours.fill(options.totalProgramHours);
    }
    if (options.targetAudience) {
      await this.targetAudience.fill(options.targetAudience);
    }
    if (options.focusAreas) {
      await this.focusAreas.fill(options.focusAreas);
    }
  }
}
