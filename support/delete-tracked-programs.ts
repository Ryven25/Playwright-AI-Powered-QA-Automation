import fs from 'fs';
import dotenv from 'dotenv';
import { deleteProgramsByIds } from './delete-program';
import { clearTracker, readTrackedIds, TRACKER_PATH } from './program-tracker';

dotenv.config();

export type DeleteProgramsResult = {
  trackerPath: string;
  ids: string[];
  deleted: number;
  failed: number;
  failedIds: string[];
  trackerCleared: boolean;
  skipped: boolean;
  skipReason?: string;
};

export async function deleteTrackedPrograms(options?: {
  delaySec?: number;
  clearTrackerAfter?: boolean;
  dryRun?: boolean;
  ids?: string[];
}): Promise<DeleteProgramsResult> {
  const trackerIds = readTrackedIds();
  const ids = options?.ids?.length
    ? [...new Set(options.ids.map((id) => id.trim()).filter(Boolean))]
    : trackerIds;

  if (options?.dryRun) {
    return {
      trackerPath: TRACKER_PATH,
      ids,
      deleted: 0,
      failed: 0,
      failedIds: [],
      trackerCleared: false,
      skipped: ids.length === 0,
      skipReason: ids.length === 0 ? 'No program IDs to delete.' : undefined,
    };
  }

  if (ids.length === 0) {
    return {
      trackerPath: TRACKER_PATH,
      ids: [],
      deleted: 0,
      failed: 0,
      failedIds: [],
      trackerCleared: false,
      skipped: true,
      skipReason: 'No program IDs to delete.',
    };
  }

  if (!process.env.DIDAXIS_API_TOKEN) {
    return {
      trackerPath: TRACKER_PATH,
      ids,
      deleted: 0,
      failed: 0,
      failedIds: [],
      trackerCleared: false,
      skipped: true,
      skipReason: 'DIDAXIS_API_TOKEN not set in .env.',
    };
  }

  console.log(`[cleanup] Tracker file: ${TRACKER_PATH}`);
  if (fs.existsSync(TRACKER_PATH)) {
    console.log('[cleanup] created-program-ids.jsonl contents:');
    console.log(fs.readFileSync(TRACKER_PATH, 'utf-8').trimEnd());
  }

  const delaySec = options?.delaySec ?? Number(process.env.CLEANUP_DELAY_SEC ?? 1);
  console.log(`[cleanup] Waiting ${delaySec} seconds before deletion...`);
  await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));

  console.log(`[cleanup] Deleting ${ids.length} tracked program(s)...`);

  const results = await deleteProgramsByIds(ids);
  const deleted = results.filter((result) => result.ok).length;
  const failedIds = results.filter((result) => !result.ok).map((result) => result.id);

  for (const result of results) {
    if (!result.ok) {
      console.error(
        `[cleanup] Failed to delete program: ${result.id} (${result.status} ${result.message})`
      );
    }
  }

  console.log(`[cleanup] Done. Deleted: ${deleted}, Failed: ${failedIds.length}`);

  const shouldClearTracker =
    options?.clearTrackerAfter ?? process.env.KEEP_TEST_ARTIFACTS !== 'true';

  let trackerCleared = false;
  if (shouldClearTracker) {
    clearTracker();
    trackerCleared = true;
    console.log('[cleanup] Removed .test-artifacts folder.');
  } else {
    console.log(
      `[cleanup] KEEP_TEST_ARTIFACTS=true — kept folder for inspection: ${TRACKER_PATH}`
    );
  }

  return {
    trackerPath: TRACKER_PATH,
    ids,
    deleted,
    failed: failedIds.length,
    failedIds,
    trackerCleared,
    skipped: false,
  };
}
