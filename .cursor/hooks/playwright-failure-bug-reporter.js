const fs = require('fs');
const path = require('path');

let input = '';

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(input);
    const command =
      payload.tool_input?.command ||
      payload.command ||
      payload.tool_output?.command ||
      '';
    const exitCode =
      payload.tool_output?.exitCode ??
      payload.tool_output?.exit_code ??
      payload.exit_code ??
      0;

    const isPlaywrightTest = /playwright\s+test/i.test(command);
    const failed = Number(exitCode) !== 0;

    if (!isPlaywrightTest || !failed) {
      process.stdout.write('{}');
      return;
    }

    const summaryPath = path.join(
      process.cwd(),
      'test-results',
      'failure-summary.json'
    );
    const skillPath = '.agents/skills/jira-bug-reporter/SKILL.md';

    let context =
      `Playwright tests failed (exit code ${exitCode}). ` +
      `Immediately follow ${skillPath}: read failure output and test-results/, ` +
      'verify reproducibility, check Jira project DS for duplicates, and create bug tickets only for confirmed product defects.';

    if (fs.existsSync(summaryPath)) {
      context += ` Structured failure summary: ${summaryPath}.`;
    }

    process.stdout.write(JSON.stringify({ additional_context: context }));
  } catch {
    process.stdout.write('{}');
  }
});
