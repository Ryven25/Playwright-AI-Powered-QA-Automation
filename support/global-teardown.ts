import { deleteTrackedPrograms } from './delete-tracked-programs';

async function globalTeardown(): Promise<void> {
  const result = await deleteTrackedPrograms();

  if (result.skipped) {
    console.log(`[cleanup] ${result.skipReason ?? 'No tracked programs to delete.'}`);
  }
}

export default globalTeardown;
