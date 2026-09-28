import { RepoIssue } from '../github/types';

export const ISSUE_TYPES = [
  'Bug',
  'Feature',
  'Documentation',
  'Refactor',
  'Testing',
  'Performance',
  'Security',
  'Maintenance',
  'Other',
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number];
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface IssueAnalysisItem {
  issueNumber: number;
  type: IssueType;
  difficulty: Difficulty;
  estimatedHours: { min: number; max: number };
  requiredSkills: string[];
  likelyAffectedAreas: string[];
  requiresDeepKnowledge: boolean;
  suitableForBeginners: boolean;
}

export interface RepoTechContext {
  primaryLanguage: string | null;
  technologies: string[];
}

const TYPE_LABEL_KEYWORDS: [RegExp, IssueType][] = [
  [/security|vulnerab|cve/i, 'Security'],
  [/documentation|docs?\b/i, 'Documentation'],
  [/performance|perf\b|slow|latency/i, 'Performance'],
  [/\btest(ing)?\b|coverage/i, 'Testing'],
  [/refactor|cleanup|tech.?debt/i, 'Refactor'],
  [/bug|fix|crash|broken|error/i, 'Bug'],
  [/feature|enhancement|feature.?request/i, 'Feature'],
  [/chore|maintenance|dependenc|upgrade/i, 'Maintenance'],
];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'is', 'are', 'with', 'this', 'that',
  'when', 'should', 'not', 'be', 'it', 'as', 'from', 'by', 'at', 'can', 'does', 'doesn\'t', 'don\'t',
]);

const ARCHITECTURE_KEYWORDS = /breaking.?change|architecture|security|migration/i;

function classifyType(issue: RepoIssue): IssueType {
  const labelText = issue.labels.join(' ');
  for (const [pattern, type] of TYPE_LABEL_KEYWORDS) {
    if (pattern.test(labelText)) return type;
  }
  const titleAndBody = `${issue.title} ${issue.body ?? ''}`;
  for (const [pattern, type] of TYPE_LABEL_KEYWORDS) {
    if (pattern.test(titleAndBody)) return type;
  }
  return 'Other';
}

function hasGoodFirstIssueLabel(labels: string[]): boolean {
  return labels.some((label) => /good.?first|beginner.?friendly/i.test(label));
}

function hasHelpWantedLabel(labels: string[]): boolean {
  return labels.some((label) => /help.?wanted/i.test(label));
}

function classifyDifficulty(issue: RepoIssue): Difficulty {
  let points = 0;

  if (hasGoodFirstIssueLabel(issue.labels)) points -= 3;
  if (hasHelpWantedLabel(issue.labels)) points += 1;

  const titleAndBody = `${issue.title} ${issue.body ?? ''}`;
  if (ARCHITECTURE_KEYWORDS.test(titleAndBody)) points += 3;
  if (issue.commentCount > 15) points += 2;
  else if (issue.commentCount === 0) points -= 1;

  const bodyLength = issue.body?.trim().length ?? 0;
  if (bodyLength === 0) points -= 1;
  else if (bodyLength > 800) points += 1;

  if (points <= -2) return 'beginner';
  if (points >= 3) return 'advanced';
  return 'intermediate';
}

const HOUR_RANGES: Record<Difficulty, { min: number; max: number }> = {
  beginner: { min: 1, max: 4 },
  intermediate: { min: 3, max: 8 },
  advanced: { min: 8, max: 20 },
};

const SKILL_KEYWORDS: [RegExp, string][] = [
  [/\bcss\b|style|tailwind/i, 'CSS'],
  [/\bapi\b|endpoint|backend|server/i, 'API Development'],
  [/\btest(ing)?\b/i, 'Testing'],
  [/database|\bdb\b|query|migration/i, 'Database'],
  [/\bui\b|component|frontend/i, 'Frontend'],
  [/auth(entication)?|security/i, 'Security'],
  [/docs?\b|documentation/i, 'Technical Writing'],
];

function extractRequiredSkills(issue: RepoIssue, tech: RepoTechContext): string[] {
  const skills = new Set<string>();
  if (tech.primaryLanguage) skills.add(tech.primaryLanguage);

  const haystack = `${issue.title} ${issue.body ?? ''} ${issue.labels.join(' ')}`;
  for (const [pattern, skill] of SKILL_KEYWORDS) {
    if (pattern.test(haystack)) skills.add(skill);
  }
  for (const techName of tech.technologies) {
    if (haystack.toLowerCase().includes(techName.toLowerCase())) skills.add(techName);
  }

  return Array.from(skills).slice(0, 6);
}

function extractLikelyAffectedAreas(issue: RepoIssue): string[] {
  const words = `${issue.title} ${issue.labels.join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));

  return Array.from(new Set(words)).slice(0, 8);
}

export function classifyIssue(issue: RepoIssue, tech: RepoTechContext): IssueAnalysisItem {
  const type = classifyType(issue);
  const difficulty = classifyDifficulty(issue);
  const estimatedHours = HOUR_RANGES[difficulty];
  const requiredSkills = extractRequiredSkills(issue, tech);
  const likelyAffectedAreas = extractLikelyAffectedAreas(issue);
  const requiresDeepKnowledge =
    difficulty === 'advanced' || ARCHITECTURE_KEYWORDS.test(`${issue.title} ${issue.body ?? ''}`);
  const suitableForBeginners =
    difficulty === 'beginner' && (hasGoodFirstIssueLabel(issue.labels) || type === 'Documentation' || type === 'Testing');

  return {
    issueNumber: issue.number,
    type,
    difficulty,
    estimatedHours,
    requiredSkills,
    likelyAffectedAreas,
    requiresDeepKnowledge,
    suitableForBeginners,
  };
}

export function classifyIssues(issues: RepoIssue[], tech: RepoTechContext): Map<number, IssueAnalysisItem> {
  const results = new Map<number, IssueAnalysisItem>();
  for (const issue of issues) {
    results.set(issue.number, classifyIssue(issue, tech));
  }
  return results;
}
