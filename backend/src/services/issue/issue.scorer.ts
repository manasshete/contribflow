import { RepoIssue } from '../github/types';

const POSITIVE_LABELS = ['good first issue', 'help wanted', 'bug', 'enhancement', 'documentation', 'feature'];
const NEGATIVE_LABELS = ['wontfix', 'duplicate', 'invalid', 'spam', 'discussion', 'question', 'stale'];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Deterministic, metadata-only scoring used to filter out spam/dead issues
 * before classification and recommendation scoring.
 */
export function computeCandidateScore(issue: RepoIssue): number {
  let score = 0;
  const labels = issue.labels.map((l) => l.toLowerCase());

  const bodyLength = issue.body?.trim().length ?? 0;
  if (bodyLength === 0) score -= 30;
  else if (bodyLength < 20) score -= 10;
  else if (bodyLength > 40) score += 15;

  for (const label of labels) {
    if (POSITIVE_LABELS.some((l) => label.includes(l))) score += 15;
    if (NEGATIVE_LABELS.some((l) => label.includes(l))) score -= 40;
  }

  const ageDays = (Date.now() - new Date(issue.createdAt).getTime()) / MS_PER_DAY;
  if (ageDays > 365) score -= 15;
  else if (ageDays < 180) score += 5;

  const updatedDays = (Date.now() - new Date(issue.updatedAt).getTime()) / MS_PER_DAY;
  if (updatedDays < 60) score += 15;
  else if (updatedDays > 270) score -= 10;

  if (issue.commentCount === 0) score += 5;
  else if (issue.commentCount > 15) score -= 10;
  else score += 5;

  const looksLikeSpam = /^(test|asdf|foo|bar|\.+|xx+)$/i.test(issue.title.trim());
  if (looksLikeSpam) score -= 100;

  return score;
}

export interface IssueHealthInput {
  labels: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  commentCount: number;
}

/**
 * Deterministic 0-100 "is this issue worth engaging with" signal, independent
 * of how well it fits any particular developer (that's `matchScore`). Reused
 * wherever an issue is shown to a contributor as extra context.
 */
export function computeIssueHealthScore(issue: IssueHealthInput): number {
  let score = 50;
  const labels = issue.labels.map((l) => l.toLowerCase());

  for (const label of labels) {
    if (POSITIVE_LABELS.some((l) => label.includes(l))) score += 8;
    if (NEGATIVE_LABELS.some((l) => label.includes(l))) score -= 25;
  }

  const updatedDays = (Date.now() - new Date(issue.updatedAt).getTime()) / MS_PER_DAY;
  if (updatedDays <= 30) score += 20;
  else if (updatedDays <= 90) score += 10;
  else if (updatedDays > 270) score -= 15;

  const ageDays = (Date.now() - new Date(issue.createdAt).getTime()) / MS_PER_DAY;
  if (ageDays > 730) score -= 10;

  if (issue.commentCount > 0 && issue.commentCount <= 10) score += 10;
  else if (issue.commentCount > 25) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function selectCandidateIssues(issues: RepoIssue[], maxCandidates = 12): RepoIssue[] {
  return [...issues]
    .map((issue) => ({ issue, score: computeCandidateScore(issue) }))
    .filter(({ score }) => score > -50)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCandidates)
    .map(({ issue }) => issue);
}
