import fs from 'fs';
import path from 'path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

type FailureRecord = {
  test: string;
  file: string;
  line: number;
  error: string;
  tracePath?: string;
  errorContextPath?: string;
};

class FailureSummaryReporter implements Reporter {
  private failures: FailureRecord[] = [];
  private outputDir = 'test-results';

  onBegin(config: FullConfig) {
    this.outputDir = config.outputDir ?? 'test-results';
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'failed' && result.status !== 'timedOut') {
      return;
    }

    const error = result.errors.map((entry) => entry.message).join('\n\n');
    const trace = result.attachments.find((attachment) => attachment.name === 'trace');
    const errorContext = result.attachments.find(
      (attachment) => attachment.name === 'error-context'
    );

    this.failures.push({
      test: test.title,
      file: test.location.file,
      line: test.location.line,
      error,
      tracePath: trace?.path,
      errorContextPath: errorContext?.path,
    });
  }

  onEnd(result: FullResult) {
    const summaryPath = path.join(this.outputDir, 'failure-summary.json');

    if (this.failures.length === 0) {
      if (fs.existsSync(summaryPath)) {
        fs.unlinkSync(summaryPath);
      }
      return;
    }

    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.writeFileSync(
      summaryPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          status: result.status,
          failed: this.failures.length,
          failures: this.failures,
          skill: '.agents/skills/jira-bug-reporter/SKILL.md',
        },
        null,
        2
      )
    );
  }
}

export default FailureSummaryReporter;
