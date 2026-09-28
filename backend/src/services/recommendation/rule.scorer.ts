import { IssueDocument } from '../../models/Issue.model';
import { ComplexitySignal } from '../issue/pr-complexity';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DeveloperProfile {
  skills: string[];
  experience: ExperienceLevel;
  availableHours: number;
}

export interface RuleScoreContext {
  prComplexity: ComplexitySignal | null;
  repoComplexity: number; // 0-100, higher = more complex repository
}

export interface RuleScoreBreakdown {
  ruleScore: number;
  matchingSkills: string[];
  skillMatch: number;
  timeFit: number;
  difficultyFit: number;
  activity: number;
  issueAge: number;
  goodFirstIssueBonus: number;
  typeAdjustment: number;
  repoComplexityAdjustment: number;
  prComplexityAdjustment: number;
  reasons: string[];
}

const EXPERIENCE_RANK: Record<ExperienceLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 };
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const EASIER_TYPES = new Set(['Documentation', 'Testing']);
const RISKIER_TYPES = new Set(['Security', 'Performance', 'Refactor']);

function computeSkillMatch(requiredSkills: string[], devSkills: string[]): { score: number; matchingSkills: string[] } {
  if (requiredSkills.length === 0) {
    return { score: 17.5, matchingSkills: [] };
  }
  const devSkillsLower = new Set(devSkills.map((s) => s.toLowerCase()));
  const matching = requiredSkills.filter((skill) => devSkillsLower.has(skill.toLowerCase()));
  const fraction = matching.length / requiredSkills.length;
  return { score: fraction * 35, matchingSkills: matching };
}

function computeTimeFit(availableHours: number, min: number, max: number): number {
  if (max <= 0) return 10;
  if (availableHours >= max) return 20;
  if (availableHours >= min) return 12;
  if (min <= 0) return 10;
  return Math.max(0, Math.min(12, 12 * (availableHours / min)));
}

function computeDifficultyFit(experience: ExperienceLevel, difficulty: string): number {
  const expNum = EXPERIENCE_RANK[experience];
  const diffNum = EXPERIENCE_RANK[difficulty as ExperienceLevel] ?? 2;
  const gap = expNum - diffNum;

  if (gap === 0) return 20; // matches their level exactly
  if (gap > 0) return 16; // issue is easier than their level - safe, low risk
  if (gap === -1) return 10; // one level harder - a reasonable stretch
  return 4; // much harder than their level - risky
}

function computeActivity(commentCount: number, updatedAt: Date): number {
  const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / MS_PER_DAY;
  let score = 0;
  if (daysSinceUpdate <= 30) score += 6;
  else if (daysSinceUpdate <= 90) score += 3;

  if (commentCount === 0) score += 2;
  else if (commentCount <= 10) score += 4;
  else if (commentCount <= 15) score += 2;
  else score += 1;

  return Math.min(10, score);
}

function computeIssueAge(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / MS_PER_DAY;
  if (ageDays <= 180) return 10;
  if (ageDays <= 365) return 6;
  return 2;
}

function hasGoodFirstIssueLabel(labels: string[]): boolean {
  return labels.some((label) => /good.?first|help.?wanted/i.test(label));
}

function computeTypeAdjustment(type: string): number {
  if (EASIER_TYPES.has(type)) return 3;
  if (RISKIER_TYPES.has(type)) return -3;
  return 0;
}

function computeRepoComplexityAdjustment(repoComplexity: number): number {
  // Higher repo complexity slightly lowers the score - larger, more intricate
  // codebases are riskier for any given issue regardless of its own difficulty.
  if (repoComplexity >= 70) return -4;
  if (repoComplexity >= 40) return -2;
  return 0;
}

function computePrComplexityAdjustment(prComplexity: ComplexitySignal | null): number {
  if (!prComplexity || prComplexity.relatedPRs.length === 0) return 0;
  const avgChangedFiles =
    prComplexity.relatedPRs.reduce((sum, pr) => sum + pr.changedFiles, 0) / prComplexity.relatedPRs.length;
  if (avgChangedFiles <= 3) return 4;
  if (avgChangedFiles > 6) return -4;
  return 0;
}

export function computeRuleScore(
  issue: IssueDocument,
  profile: DeveloperProfile,
  context: RuleScoreContext
): RuleScoreBreakdown {
  const analysis = issue.analysis;
  if (!analysis) {
    throw new Error(`Issue #${issue.issueNumber} has no analysis to score against`);
  }

  const { score: skillMatch, matchingSkills } = computeSkillMatch(analysis.requiredSkills, profile.skills);
  const timeFit = computeTimeFit(profile.availableHours, analysis.estimatedHours.min, analysis.estimatedHours.max);
  const difficultyFit = computeDifficultyFit(profile.experience, analysis.difficulty);
  const activity = computeActivity(issue.commentCount, issue.updatedAt);
  const issueAge = computeIssueAge(issue.createdAt);
  const goodFirstIssueBonus = hasGoodFirstIssueLabel(issue.labels) ? 5 : 0;
  const typeAdjustment = computeTypeAdjustment(analysis.type);
  const repoComplexityAdjustment = computeRepoComplexityAdjustment(context.repoComplexity);
  const prComplexityAdjustment = computePrComplexityAdjustment(context.prComplexity);

  const total =
    skillMatch +
    timeFit +
    difficultyFit +
    activity +
    issueAge +
    goodFirstIssueBonus +
    typeAdjustment +
    repoComplexityAdjustment +
    prComplexityAdjustment;

  const ruleScore = Math.max(0, Math.min(100, Math.round(total)));

  const reasons: string[] = [];
  if (matchingSkills.length > 0) {
    reasons.push(`${matchingSkills.length}/${analysis.requiredSkills.length} required skills match`);
  }
  if (timeFit >= 16) reasons.push('Estimated effort fits your available time');
  if (difficultyFit >= 16) reasons.push('Difficulty matches your experience');
  if (prComplexityAdjustment > 0) reasons.push('Similar recent PRs were relatively small');
  if (activity >= 8) reasons.push('Issue is actively maintained');
  if (goodFirstIssueBonus > 0) reasons.push('Tagged as a good first issue');
  if (reasons.length === 0) reasons.push('Matches based on skill overlap, time budget, and issue activity');

  return {
    ruleScore,
    matchingSkills,
    skillMatch,
    timeFit,
    difficultyFit,
    activity,
    issueAge,
    goodFirstIssueBonus,
    typeAdjustment,
    repoComplexityAdjustment,
    prComplexityAdjustment,
    reasons,
  };
}
