import { GitHubService } from '../github/github.service';
import { MergedPullRequest } from '../github/types';

const RECENT_PR_COUNT = 15;

export interface RelatedPRSummary {
  number: number;
  title: string;
  mergedAt: string | null;
  changedFiles: number;
  additions: number;
  deletions: number;
  files: string[];
  linkedDirectly: boolean;
  relevanceReason: string;
}

export interface ComplexitySignal {
  relatedPRs: RelatedPRSummary[];
  insight: string;
}

function pathPrefix(path: string, segments = 2): string {
  return path.split('/').slice(0, segments).join('/');
}

function overlapCount(prFiles: string[], relevantFiles: string[]): number {
  const relevantPrefixes = new Set(relevantFiles.map((f) => pathPrefix(f)));
  return prFiles.filter((f) => relevantPrefixes.has(pathPrefix(f))).length;
}

function referencesIssue(pr: MergedPullRequest, issueNumber: number): boolean {
  const pattern = new RegExp(`(close[sd]?|fix(e[sd])?|resolve[sd]?)\\s+#${issueNumber}\\b|#${issueNumber}\\b`, 'i');
  return pattern.test(pr.title) || pattern.test(pr.body);
}

/**
 * Correlates already-fetched recently-merged PRs with an issue, purely by
 * deterministic signals (no AI): direct issue references first, then file
 * path overlap with the files we believe are relevant. Pure/sync so callers
 * scoring many issues can fetch the PR list once and reuse it.
 */
export function correlatePRs(
  recentPRs: MergedPullRequest[],
  relevantFiles: string[],
  issueNumber?: number
): ComplexitySignal {
  if (recentPRs.length === 0) {
    return { relatedPRs: [], insight: 'No recent merged PR history available for this repository.' };
  }

  const scored = recentPRs.map((pr) => {
    const linkedDirectly = issueNumber !== undefined && referencesIssue(pr, issueNumber);
    const overlap = overlapCount(pr.files, relevantFiles);
    const score = linkedDirectly ? 1000 : overlap;
    return { pr, score, linkedDirectly, overlap };
  });

  const related = scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ pr, linkedDirectly, overlap }): RelatedPRSummary => ({
      number: pr.number,
      title: pr.title,
      mergedAt: pr.mergedAt,
      changedFiles: pr.changedFiles,
      additions: pr.additions,
      deletions: pr.deletions,
      files: pr.files,
      linkedDirectly,
      relevanceReason: linkedDirectly
        ? 'Directly linked to this issue'
        : `Modified ${overlap} file${overlap === 1 ? '' : 's'} that ${overlap === 1 ? 'is' : 'are'} also relevant to your issue`,
    }));

  if (related.length === 0) {
    return {
      relatedPRs: [],
      insight: 'No recent merged PRs touched similar areas of the codebase; complexity estimate relies on the issue description alone.',
    };
  }

  const avgChangedFiles = related.reduce((sum, pr) => sum + pr.changedFiles, 0) / related.length;

  const insight =
    avgChangedFiles > 5
      ? `Recent related PRs touched ${avgChangedFiles.toFixed(1)} files on average (e.g. #${related[0].number}) - this area tends to require wider-reaching changes than the issue text alone suggests.`
      : `Recent related PRs were narrowly scoped (avg ${avgChangedFiles.toFixed(1)} files, e.g. #${related[0].number}), consistent with a contained change.`;

  return { relatedPRs: related, insight };
}

/**
 * Fetches recent merged PRs for a repository and correlates them against the
 * given relevant files/issue. Use `correlatePRs` directly when scoring many
 * issues in one pass to avoid re-fetching the PR list per issue.
 */
export async function analyzeRecentPRComplexity(
  owner: string,
  repo: string,
  relevantFiles: string[],
  issueNumber?: number
): Promise<ComplexitySignal> {
  const recentPRs = await GitHubService.getRecentMergedPullRequests(owner, repo, RECENT_PR_COUNT);
  return correlatePRs(recentPRs, relevantFiles, issueNumber);
}
