import { GitHubService } from '../github/github.service';
import { MergedPullRequest } from '../github/types';

const RECENT_PR_COUNT = 15;

function pathPrefix(path: string, segments = 2): string {
  return path.split('/').slice(0, segments).join('/');
}

function overlapScore(prFiles: string[], relevantFiles: string[]): number {
  const relevantPrefixes = new Set(relevantFiles.map((f) => pathPrefix(f)));
  return prFiles.filter((f) => relevantPrefixes.has(pathPrefix(f))).length;
}

export interface ComplexitySignal {
  relatedPRs: MergedPullRequest[];
  insight: string;
}

/**
 * Correlates recently merged PRs with the files we believe are relevant to an
 * issue, purely by path-prefix overlap (no AI). Used to sanity-check whether
 * an issue that "looks simple" has historically required wide-reaching changes.
 */
export async function analyzeRecentPRComplexity(
  owner: string,
  repo: string,
  relevantFiles: string[]
): Promise<ComplexitySignal> {
  const recentPRs = await GitHubService.getRecentMergedPullRequests(owner, repo, RECENT_PR_COUNT);

  if (recentPRs.length === 0) {
    return { relatedPRs: [], insight: 'No recent merged PR history available for this repository.' };
  }

  const scored = recentPRs
    .map((pr) => ({ pr, score: overlapScore(pr.files, relevantFiles) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const related = scored.slice(0, 3).map(({ pr }) => pr);

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
