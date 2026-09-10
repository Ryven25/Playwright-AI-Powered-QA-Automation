#!/usr/bin/env node
/**
 * afterFileEdit guard for tests/** — blocks weakened assertions (exit 2).
 * Reads hook payload JSON from stdin: { file_path, edits: [{ old_string, new_string }] }.
 */

const fs = require('fs');
const path = require('path');

const TESTS_PATTERN = /(?:^|[\\/])tests[\\/]/;

function readStdin() {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => resolve(input));
    process.stdin.on('error', reject);
  });
}

/** Strip block comments; leave line structure for line-based checks. */
function stripBlockComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripTrailingLineComment(line) {
  return line.replace(/\/\/.*$/, '');
}

function countActiveExpects(source) {
  const withoutBlocks = stripBlockComments(source);
  let count = 0;
  for (const line of withoutBlocks.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;
    const code = stripTrailingLineComment(line);
    const matches = code.match(/\bexpect\s*\(/g);
    if (matches) count += matches.length;
  }
  return count;
}

function isExpectLineCommented(line) {
  const trimmed = line.trim();
  if (!/\bexpect\s*\(/.test(line)) return false;
  if (trimmed.startsWith('//')) return true;
  // Block-comment-only line (after block strip this line may be empty)
  const code = stripTrailingLineComment(stripBlockComments(line));
  return !/\bexpect\s*\(/.test(code) && /\bexpect\s*\(/.test(line);
}

function expectWasCommentedOut(before, after) {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const lineCount = Math.max(beforeLines.length, afterLines.length);

  for (let i = 0; i < lineCount; i += 1) {
    const beforeLine = beforeLines[i] ?? '';
    const afterLine = afterLines[i] ?? '';
    const beforeActive = /\bexpect\s*\(/.test(stripTrailingLineComment(beforeLine)) &&
      !beforeLine.trim().startsWith('//');
    if (beforeActive && isExpectLineCommented(afterLine)) {
      return true;
    }
  }

  // Whole-line delete of an expect is caught by count drop; partial block wrap:
  const beforeCount = countActiveExpects(before);
  const afterCount = countActiveExpects(after);
  if (beforeCount > afterCount) {
    const beforeRaw = (before.match(/\bexpect\s*\(/g) || []).length;
    const afterRaw = (after.match(/\bexpect\s*\(/g) || []).length;
    if (afterRaw >= beforeRaw && afterCount < beforeCount) {
      return true;
    }
  }

  return false;
}

function reconstructBefore(afterContent, edits) {
  let before = afterContent;
  for (let i = edits.length - 1; i >= 0; i -= 1) {
    const { old_string: oldString, new_string: newString } = edits[i] ?? {};
    if (typeof oldString !== 'string' || typeof newString !== 'string') continue;
    if (!before.includes(newString)) {
      before = before.replace(newString, oldString);
    } else {
      before = before.replace(newString, oldString);
    }
  }
  return before;
}

function isTestsFile(filePath) {
  const normalized = filePath.split(path.sep).join('/');
  return TESTS_PATTERN.test(normalized) &&
    (normalized.endsWith('.spec.ts') ||
      normalized.endsWith('.spec.tsx') ||
      normalized.endsWith('.test.ts') ||
      normalized.endsWith('.test.tsx'));
}

function analyzeAssertionChange(before, after) {
  const beforeCount = countActiveExpects(before);
  const afterCount = countActiveExpects(after);
  const commentedOut = expectWasCommentedOut(before, after);

  if (afterCount < beforeCount) {
    return {
      blocked: true,
      reason: `active expect( count dropped (${beforeCount} → ${afterCount})`,
      beforeCount,
      afterCount,
      commentedOut,
    };
  }

  if (commentedOut) {
    return {
      blocked: true,
      reason: 'an expect( was commented out',
      beforeCount,
      afterCount,
      commentedOut: true,
    };
  }

  return {
    blocked: false,
    reason: 'assertions unchanged',
    beforeCount,
    afterCount,
    commentedOut: false,
  };
}

function deny(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

async function main() {
  let payload;
  try {
    const raw = await readStdin();
    payload = raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    deny(`guard-test-assertions: invalid stdin JSON (${err.message})`);
  }

  const filePath = payload.file_path;
  if (!filePath || !isTestsFile(filePath)) {
    process.exit(0);
  }

  const edits = Array.isArray(payload.edits) ? payload.edits : [];
  let afterContent;
  try {
    afterContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    deny(`guard-test-assertions: cannot read ${filePath} (${err.message})`);
  }

  const beforeContent = reconstructBefore(afterContent, edits);
  const result = analyzeAssertionChange(beforeContent, afterContent);

  if (result.blocked) {
    deny(
      `guard-test-assertions: BLOCKED edit to ${path.basename(filePath)} — ${result.reason}. ` +
        `Refuse to weaken assertions (see playwright-conventions Refusals). ` +
        `Active expect( count: ${result.beforeCount} → ${result.afterCount}.`
    );
  }

  process.exit(0);
}

main().catch((err) => {
  deny(`guard-test-assertions: unexpected error (${err.message})`);
});
