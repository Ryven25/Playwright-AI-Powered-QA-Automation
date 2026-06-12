import fs from 'fs';
import path from 'path';

export const TRACKER_PATH = path.join(
  process.cwd(),
  '.test-artifacts',
  'created-program-ids.jsonl'
);

export function trackProgram(id: string): void {
  const dir = path.dirname(TRACKER_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(TRACKER_PATH, `${id}\n`, 'utf-8');
}

export function readTrackedIds(): string[] {
  if (!fs.existsSync(TRACKER_PATH)) return [];

  return [
    ...new Set(
      fs
        .readFileSync(TRACKER_PATH, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    ),
  ];
}

export function clearTracker(): void {
  const dir = path.dirname(TRACKER_PATH);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function initTracker(): void {
  clearTracker();
}
