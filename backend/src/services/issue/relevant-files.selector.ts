import { IssueHydrated } from './issue.service';
import { MergedPullRequest, RepoTreeEntry } from '../github/types';

export interface RelevantFile {
  path: string;
  reason: string;
  relevance: number;
}

const MAX_CANDIDATE_PATHS = 300;
const IGNORED_PATTERN = /node_modules|\.git\/|dist\/|build\/|\.(png|jpe?g|svg|gif|ico|lock|woff2?|ttf|pdf)$/i;
const CORE_DIR_HINTS = ['src', 'lib', 'app', 'core', 'api', 'server'];

function isLikelySourceFile(path: string): boolean {
  return !IGNORED_PATTERN.test(path);
}

/**
 * Ranks repository files by relevance to an issue using only deterministic
 * signals: keyword overlap with the issue's likely-affected-areas, path depth,
 * core-directory hints, and frequency of appearance in recently merged PRs.
 * No AI involved.
 */
export function selectRelevantFiles(
  issue: IssueHydrated,
  tree: RepoTreeEntry[],
  recentPRs: MergedPullRequest[] = []
): RelevantFile[] {
  const analysis = issue.analysis!;
  const keywords = analysis.likelyAffectedAreas.map((area) => area.toLowerCase()).filter(Boolean);

  const prFileFrequency = new Map<string, number>();
  for (const pr of recentPRs) {
    for (const file of pr.files) {
      prFileFrequency.set(file, (prFileFrequency.get(file) ?? 0) + 1);
    }
  }
  const maxPrFrequency = Math.max(1, ...Array.from(prFileFrequency.values(), (v) => v));

  const candidates = tree
    .filter((entry) => entry.type === 'blob' && isLikelySourceFile(entry.path))
    .slice(0, MAX_CANDIDATE_PATHS)
    .map((entry) => {
      const lower = entry.path.toLowerCase();
      const matchedKeyword = keywords.find((kw) => kw && lower.includes(kw));
      const depth = entry.path.split('/').length;
      const isCoreDir = CORE_DIR_HINTS.some((hint) => lower.startsWith(`${hint}/`));
      const prFrequency = prFileFrequency.get(entry.path) ?? 0;

      let score = 0;
      let reason = 'General source file';

      if (matchedKeyword) {
        score += 50;
        reason = `Path matches issue keyword "${matchedKeyword}"`;
      }
      if (prFrequency > 0) {
        score += 30 * (prFrequency / maxPrFrequency);
        reason = matchedKeyword ? reason : 'Frequently touched in recent related PRs';
      }
      if (isCoreDir) {
        score += 10;
        if (!matchedKeyword && prFrequency === 0) reason = 'Core source directory';
      }
      score -= depth; // prefer shallower, closer-to-entry-point files

      return { path: entry.path, reason, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (candidates.length === 0) return [];

  const maxScore = candidates[0].score;
  return candidates.map((c) => ({
    path: c.path,
    reason: c.reason,
    relevance: Math.max(5, Math.min(99, Math.round((c.score / maxScore) * 99))),
  }));
}
