import { GitHubService } from '../github/github.service';
import { RepositoryDocument } from '../../models/Repository.model';
import { RepositoryAnalysisDocument } from '../../models/RepositoryAnalysis.model';
import { IssueHydrated } from './issue.service';
import { selectRelevantFiles } from './relevant-files.selector';
import { correlatePRs, RelatedPRSummary } from './pr-complexity';

const MAX_FILE_CONTENT_CHARS = 4000;
const MAX_FILES_WITH_CONTENT = 5;
const RECENT_PR_COUNT = 15;

export interface ContributionPlan {
  problem: string;
  whyItMatters: string;
  relevantFiles: { path: string; reason: string; relevance: number }[];
  relevantSymbols: string[];
  dependencies: string[];
  repositoryArea: string;
  similarPRs: RelatedPRSummary[];
  implementationSteps: string[];
  potentialRisks: string[];
  testingStrategy: string;
  expectedResult: string;
  recentActivityInsight: string;
  generatedAt: Date;
}

const SYMBOL_PATTERNS = [
  /export\s+(?:default\s+)?function\s+([A-Za-z0-9_]+)/g,
  /export\s+(?:default\s+)?class\s+([A-Za-z0-9_]+)/g,
  /export\s+const\s+([A-Za-z0-9_]+)\s*=/g,
  /function\s+([A-Za-z0-9_]+)\s*\(/g,
  /class\s+([A-Za-z0-9_]+)/g,
];

const IMPORT_PATTERNS = [
  /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractSymbols(content: string): string[] {
  const symbols = new Set<string>();
  for (const pattern of SYMBOL_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]) symbols.add(match[1]);
    }
  }
  return Array.from(symbols).slice(0, 10);
}

function extractLocalDependencies(content: string): string[] {
  const deps = new Set<string>();
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      const target = match[1];
      if (target && (target.startsWith('.') || target.startsWith('/'))) deps.add(target);
    }
  }
  return Array.from(deps);
}

function deriveRepositoryArea(relevantFiles: { path: string }[]): string {
  if (relevantFiles.length === 0) return 'repository root';
  const segments = relevantFiles.map((f) => f.path.split('/').slice(0, -1));
  const shortest = segments.reduce((a, b) => (a.length <= b.length ? a : b));
  const shared: string[] = [];
  for (let i = 0; i < shortest.length; i++) {
    if (segments.every((s) => s[i] === shortest[i])) shared.push(shortest[i]);
    else break;
  }
  return shared.length > 0 ? shared.join('/') : 'repository root';
}

export function hasTestDirectory(treePaths: string[]): boolean {
  return treePaths.some((p) => /(^|\/)(tests?|__tests__|spec)(\/|$)/i.test(p) || /\.(test|spec)\.[jt]sx?$/i.test(p));
}

export async function generateContributionPlan(
  repoDoc: RepositoryDocument,
  _analysisDoc: RepositoryAnalysisDocument | null,
  issue: IssueHydrated
): Promise<ContributionPlan> {
  const { owner, repo } = repoDoc;
  const analysis = issue.analysis!;

  const tree = await GitHubService.getFileTree(owner, repo, repoDoc.metadata.defaultBranch);
  const recentPRs = await GitHubService.getRecentMergedPullRequests(owner, repo, RECENT_PR_COUNT);
  const relevantFiles = selectRelevantFiles(issue, tree, recentPRs);

  const fileContents = await Promise.all(
    relevantFiles.slice(0, MAX_FILES_WITH_CONTENT).map(async (file) => {
      const content = await GitHubService.getFileContent(owner, repo, file.path);
      if (!content) return null;
      const trimmed = content.length > MAX_FILE_CONTENT_CHARS ? content.slice(0, MAX_FILE_CONTENT_CHARS) : content;
      return { path: file.path, content: trimmed };
    })
  );

  const loadedFiles = fileContents.filter((f): f is NonNullable<typeof f> => Boolean(f));
  const relevantSymbols = Array.from(new Set(loadedFiles.flatMap((f) => extractSymbols(f.content)))).slice(0, 12);
  const dependencies = Array.from(new Set(loadedFiles.flatMap((f) => extractLocalDependencies(f.content)))).slice(0, 12);
  const repositoryArea = deriveRepositoryArea(relevantFiles);

  const { insight: recentActivityInsight, relatedPRs } = correlatePRs(
    recentPRs,
    relevantFiles.map((f) => f.path),
    issue.issueNumber
  );
  const similarPRs = relatedPRs;

  const treePaths = tree.map((t) => t.path);
  const testingAvailable = hasTestDirectory(treePaths);
  const isWideReaching = /wider-reaching changes/.test(recentActivityInsight);
  const hasSecurityLabel = issue.labels.some((l) => /security/i.test(l));

  const problem = `This is a "${analysis.type}" issue: "${issue.title}"${
    issue.body ? ` — ${issue.body.trim().slice(0, 240)}${issue.body.trim().length > 240 ? '...' : ''}` : ''
  }`;

  const whyItMatters =
    issue.commentCount > 5
      ? `This issue has ${issue.commentCount} comments, indicating active community interest in getting it resolved.`
      : issue.labels.some((l) => /good.?first|help.?wanted/i.test(l))
        ? 'This issue is flagged by maintainers as a good entry point for new contributors.'
        : `Resolving this ${analysis.type.toLowerCase()} issue improves the health and usability of ${owner}/${repo}.`;

  const implementationSteps: string[] = [
    relevantFiles.length > 0
      ? `Review the relevant files: ${relevantFiles.map((f) => f.path).join(', ')}`
      : 'Explore the repository structure to locate the code related to this issue',
  ];
  if (relevantSymbols.length > 0) {
    implementationSteps.push(`Locate and understand: ${relevantSymbols.slice(0, 5).join(', ')}`);
  }
  if (similarPRs.length > 0) {
    implementationSteps.push(
      `Look at similar prior change #${similarPRs[0].number} ("${similarPRs[0].title}") for the expected pattern`
    );
  }
  implementationSteps.push(`Implement the ${analysis.type.toLowerCase()} described in the issue`);
  if (testingAvailable) {
    implementationSteps.push('Add or update tests covering the change');
    implementationSteps.push('Run the existing test suite to confirm nothing else broke');
  } else {
    implementationSteps.push('Manually verify the change against the scenario described in the issue');
  }
  if (analysis.type === 'Documentation') {
    implementationSteps.push('Update related documentation/README sections');
  }
  implementationSteps.push('Review the final diff before opening a pull request');

  const potentialRisks: string[] = [];
  if (analysis.requiresDeepKnowledge) {
    potentialRisks.push('This issue requires deeper repository knowledge than a typical first contribution');
  }
  if (isWideReaching) {
    potentialRisks.push('Similar past changes in this area touched many files - scope creep is likely');
  }
  if (!testingAvailable) {
    potentialRisks.push('No obvious test directory was found - verify manually and consider adding test coverage');
  }
  if (hasSecurityLabel) {
    potentialRisks.push('This issue is security-related - be extra careful and consider requesting maintainer review early');
  }
  if (potentialRisks.length === 0) {
    potentialRisks.push('No major risks identified beyond the usual review process');
  }

  const testingStrategy = testingAvailable
    ? `Add or update tests near the modified files (this repository has an existing test setup) covering the ${analysis.type.toLowerCase()} described in the issue.`
    : 'No dedicated test directory was detected in this repository; validate the change manually against the issue description and consider introducing a basic test.';

  const expectedResult = `The behavior described in issue #${issue.issueNumber} is resolved, existing functionality is unaffected, and any new/updated tests pass.`;

  return {
    problem,
    whyItMatters,
    relevantFiles,
    relevantSymbols,
    dependencies,
    repositoryArea,
    similarPRs,
    implementationSteps,
    potentialRisks,
    testingStrategy,
    expectedResult,
    recentActivityInsight,
    generatedAt: new Date(),
  };
}
