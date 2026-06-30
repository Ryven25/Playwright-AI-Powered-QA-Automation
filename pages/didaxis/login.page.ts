import { Locator, Page } from '@playwright/test';
import { AUTH_ROUTES } from '../../support/auth.constants';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly tagline: Locator;

  constructor(readonly page: Page) {
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.tagline = page.getByText('Sign in to your account');
  }

  async goto(): Promise<void> {
    await this.page.goto(AUTH_ROUTES.login);
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  }
}
