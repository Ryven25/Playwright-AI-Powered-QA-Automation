import path from 'path';

export const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth');
export const AUTH_FILE = path.join(AUTH_DIR, 'user.json');

/** Relative path used by playwright.config.ts storageState */
export const AUTH_STORAGE_STATE = 'playwright/.auth/user.json';

/** Opt out of project storageState for unauthenticated login tests */
export const EMPTY_STORAGE_STATE = { cookies: [], origins: [] };

export const AUTH_ROUTES = {
  login: '/login',
  programs: '/programs',
} as const;

export const AUTH_SETUP_TEST = 'authenticate';

/** Playwright project name for the auth setup dependency */
export const AUTH_SETUP_PROJECT = 'setup';
