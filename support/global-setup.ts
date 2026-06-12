import { clearTracker } from './program-tracker';

async function globalSetup(): Promise<void> {
  clearTracker();
}

export default globalSetup;
