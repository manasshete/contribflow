import { GitHubService } from '../github/github.service';
import { RepositoryDocument } from '../../models/Repository.model';
import { IssueDocument } from '../../models/Issue.model';

export interface BootstrapInfo {
  cloneCommand: string;
  branchName: string;
  checkoutCommand: string;
  packageManager: string | null;
  installCommand: string | null;
  gotoCommands: string[];
}

export interface PrTemplateInfo {
  title: string;
  body: string;
  templateFound: boolean;
  templatePath: string | null;
}

export interface DevToolkit {
  bootstrap: BootstrapInfo;
  pr: PrTemplateInfo;
}

const PACKAGE_MANAGERS: [RegExp, string, string][] = [
  [/(^|\/)pnpm-lock\.yaml$/i, 'pnpm', 'pnpm install'],
  [/(^|\/)yarn\.lock$/i, 'Yarn', 'yarn install'],
  [/(^|\/)package-lock\.json$/i, 'npm', 'npm install'],
  [/(^|\/)pyproject\.toml$/i, 'Poetry', 'poetry install'],
  [/(^|\/)pipfile$/i, 'Pipenv', 'pipenv install'],
  [/(^|\/)requirements\.txt$/i, 'pip', 'pip install -r requirements.txt'],
  [/(^|\/)cargo\.toml$/i, 'Cargo', 'cargo build'],
  [/(^|\/)go\.mod$/i, 'Go modules', 'go mod download'],
];

const TYPE_BRANCH_PREFIX: Record<string, string> = {
  Bug: 'fix',
  Feature: 'feat',
  Documentation: 'docs',
  Refactor: 'refactor',
  Testing: 'test',
  Performance: 'perf',
  Security: 'fix',
  Maintenance: 'chore',
  Other: 'fix',
};

const PR_TEMPLATE_PATHS = [
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/pull_request_template.md',
  '.github/PULL_REQUEST_TEMPLATE/pull_request_template.md',
  'PULL_REQUEST_TEMPLATE.md',
  'docs/PULL_REQUEST_TEMPLATE.md',
];

async function findPrTemplate(owner: string, repo: string): Promise<{ path: string; content: string } | null> {
  for (const path of PR_TEMPLATE_PATHS) {
    const content = await GitHubService.getFileContent(owner, repo, path);
    if (content) return { path, content };
  }
  return null;
}

function buildPrBody(issue: IssueDocument, template: { path: string; content: string } | null): string {
  const fixesLine = `Fixes #${issue.issueNumber}`;
  const plan = issue.contributionPlan;

  const summary = plan
    ? `## Summary\n${plan.problem}\n\n${plan.whyItMatters}`
    : `## Summary\n${issue.title}`;

  const changes = plan?.implementationSteps?.length
    ? `## Changes\n${plan.implementationSteps.map((s) => `- ${s}`).join('\n')}`
    : '';

  const testChecklist = plan?.testingStrategy
    ? `## Testing\n${plan.testingStrategy}\n\n### Test Checklist\n- [ ] Verified the change resolves #${issue.issueNumber}\n- [ ] Added/updated tests where applicable\n- [ ] Ran the existing test suite\n- [ ] Ran the linter`
    : `## Testing\n- [ ] Manually verified the fix\n- [ ] Ran the existing test suite`;

  const suggested = [summary, changes, testChecklist].filter(Boolean).join('\n\n');

  if (template) {
    const hasIssueRef = /\b(fixes|closes|resolves)\s+#\d+/i.test(template.content);
    const templateSection = hasIssueRef ? template.content : `${fixesLine}\n\n${template.content}`;
    return `${templateSection.trim()}\n\n---\n*Suggested by ContribFlow (fill in the checkboxes above, remove if unused):*\n\n${suggested}`;
  }

  return `${fixesLine}\n\n${suggested}`;
}

function buildPrTitle(issue: IssueDocument): string {
  const prefix = issue.analysis ? TYPE_BRANCH_PREFIX[issue.analysis.type] : null;
  return prefix ? `${prefix}: ${issue.title} (#${issue.issueNumber})` : `${issue.title} (#${issue.issueNumber})`;
}

export async function buildDevToolkit(repoDoc: RepositoryDocument, issueDoc: IssueDocument): Promise<DevToolkit> {
  const { owner, repo } = repoDoc;
  const branchPrefix = issueDoc.analysis ? TYPE_BRANCH_PREFIX[issueDoc.analysis.type] ?? 'fix' : 'fix';
  const branchName = `${branchPrefix}/issue-${issueDoc.issueNumber}`;

  const tree = await GitHubService.getFileTree(owner, repo, repoDoc.metadata.defaultBranch).catch(() => []);
  const treePaths = tree.map((t) => t.path);
  const detected = PACKAGE_MANAGERS.find(([pattern]) => treePaths.some((p) => pattern.test(p)));

  const gotoCommands = (issueDoc.contributionPlan?.relevantFiles ?? [])
    .slice(0, 5)
    .map((f) => `code --goto ${f.path}`);

  const template = await findPrTemplate(owner, repo);

  return {
    bootstrap: {
      cloneCommand: `git clone ${repoDoc.url}.git && cd ${repo}`,
      branchName,
      checkoutCommand: `git checkout -b ${branchName}`,
      packageManager: detected?.[1] ?? null,
      installCommand: detected?.[2] ?? null,
      gotoCommands,
    },
    pr: {
      title: buildPrTitle(issueDoc),
      body: buildPrBody(issueDoc, template),
      templateFound: Boolean(template),
      templatePath: template?.path ?? null,
    },
  };
}
