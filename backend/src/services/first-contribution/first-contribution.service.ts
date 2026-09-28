import { GitHubService } from '../github/github.service';
import { buildDirectoryStructure } from '../repository/file.prioritizer';
import { RepositoryDocument } from '../../models/Repository.model';
import { RepositoryAnalysisDocument } from '../../models/RepositoryAnalysis.model';
import { ContributionPlan } from '../issue/contribution-plan.service';
import { ChecklistItem } from '../../models/FirstContributionSession.model';

export interface RepositoryUnderstanding {
  owner: string;
  repo: string;
  description: string | null;
  primaryLanguage: string | null;
  technologies: string[];
  repositoryType: string;
  summary: string;
  mainDirectories: { frontend: string[]; backend: string[]; tests: string[]; other: string[] };
  testingFramework: string | null;
  packageManager: string | null;
  contributionGuideAvailable: boolean;
  contributingPath: string | null;
}

const FRONTEND_DIR_HINTS = /components|pages|views|hooks|ui|client|frontend|public/i;
const BACKEND_DIR_HINTS = /controllers|services|models|routes|server|api|backend|middleware/i;
const TEST_DIR_HINTS = /(^|\/)(tests?|__tests__|spec)(\/|$)/i;

const TESTING_FRAMEWORKS: [RegExp, string][] = [
  [/vitest/i, 'Vitest'],
  [/jest/i, 'Jest'],
  [/playwright/i, 'Playwright'],
  [/mocha/i, 'Mocha'],
  [/pytest/i, 'PyTest'],
];

const PACKAGE_MANAGERS: [RegExp, string][] = [
  [/(^|\/)pnpm-lock\.yaml$/i, 'pnpm'],
  [/(^|\/)yarn\.lock$/i, 'Yarn'],
  [/(^|\/)package-lock\.json$/i, 'npm'],
  [/(^|\/)cargo\.toml$/i, 'Cargo'],
  [/(^|\/)go\.mod$/i, 'Go modules'],
  [/(^|\/)pipfile$/i, 'pip (Pipenv)'],
  [/(^|\/)requirements\.txt$/i, 'pip'],
];

function bucketDirectories(dirs: string[]): RepositoryUnderstanding['mainDirectories'] {
  const buckets: RepositoryUnderstanding['mainDirectories'] = { frontend: [], backend: [], tests: [], other: [] };
  for (const dir of dirs) {
    if (TEST_DIR_HINTS.test(dir)) buckets.tests.push(dir);
    else if (FRONTEND_DIR_HINTS.test(dir)) buckets.frontend.push(dir);
    else if (BACKEND_DIR_HINTS.test(dir)) buckets.backend.push(dir);
    else buckets.other.push(dir);
  }
  buckets.other = buckets.other.slice(0, 8);
  return buckets;
}

export async function buildRepositoryUnderstanding(
  repoDoc: RepositoryDocument,
  analysisDoc: RepositoryAnalysisDocument | null
): Promise<RepositoryUnderstanding> {
  const { owner, repo } = repoDoc;
  const tree = await GitHubService.getFileTree(owner, repo, repoDoc.metadata.defaultBranch);
  const treePaths = tree.map((t) => t.path);
  const dirs = buildDirectoryStructure(tree, 2);

  const testingFramework = analysisDoc
    ? TESTING_FRAMEWORKS.find(([pattern]) => pattern.test(analysisDoc.repoContext))?.[1] ?? null
    : null;

  const packageManager = PACKAGE_MANAGERS.find(([pattern]) => treePaths.some((p) => pattern.test(p)))?.[1] ?? null;

  const contributingEntry = treePaths.find((p) => /(^|\/)contributing\.md$/i.test(p));

  return {
    owner,
    repo,
    description: repoDoc.metadata.description,
    primaryLanguage: repoDoc.metadata.primaryLanguage,
    technologies: analysisDoc?.technologies ?? [],
    repositoryType: analysisDoc?.architecture.type ?? 'other',
    summary: analysisDoc?.summary ?? `${owner}/${repo}`,
    mainDirectories: bucketDirectories(dirs),
    testingFramework,
    packageManager,
    contributionGuideAvailable: Boolean(contributingEntry),
    contributingPath: contributingEntry ?? null,
  };
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Builds the full First Contribution checklist (understand/implement/verify
 * for the code change, plus pr-code/pr-meta for PR prep) in one pass, purely
 * from the already-computed deterministic contribution plan - no AI.
 */
export function buildChecklist(
  plan: ContributionPlan,
  testingAvailable: boolean,
  issueNumber: number
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const add = (section: ChecklistItem['section'], label: string) => {
    items.push({ id: `${section}-${slugify(label)}`, section, label, done: false });
  };

  // Understand
  for (const file of plan.relevantFiles.slice(0, 3)) {
    add('understand', `Read ${file.path}`);
  }
  for (const symbol of plan.relevantSymbols.slice(0, 4)) {
    add('understand', `Understand ${symbol}`);
  }
  if (testingAvailable) add('understand', 'Review related tests');

  // Implement
  add('implement', `Implement the change in ${plan.repositoryArea}`);
  if (testingAvailable) add('implement', 'Add or update tests');
  else add('implement', 'Manually verify the fix works as expected');
  if (plan.similarPRs.length > 0) {
    add('implement', `Follow the pattern used in PR #${plan.similarPRs[0].number}`);
  }

  // Verify
  if (testingAvailable) add('verify', 'Run the test suite');
  add('verify', 'Run the linter');
  add('verify', 'Review changed files for unrelated changes');
  add('verify', 'Confirm the issue scenario is resolved');

  // PR prep - code
  add('pr-code', 'Changes are limited to the issue');
  add('pr-code', 'No debug code remains');
  add('pr-code', 'Existing coding conventions followed');
  if (testingAvailable) {
    add('pr-code', 'Tests added/updated');
    add('pr-code', 'Tests pass');
  }
  add('pr-code', 'Linter passes');

  // PR prep - metadata
  add('pr-meta', 'Clear PR title');
  add('pr-meta', 'Explain what changed');
  add('pr-meta', 'Explain why');
  add('pr-meta', `Reference issue #${issueNumber}`);
  add('pr-meta', 'Explain how it was tested');

  return items;
}
