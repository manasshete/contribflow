import { IssueDocument } from '../../models/Issue.model';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DeveloperProfile {
  skills: string[];
  experience: ExperienceLevel;
  availableHours: number;
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
}

const EXPERIENCE_RANK: Record<ExperienceLevel, number> = { beginner: 1, intermediate: 2, advanced: 3 };
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

export function computeRuleScore(issue: IssueDocument, profile: DeveloperProfile): RuleScoreBreakdown {
  const analysis = issue.analysis;
  if (!analysis) {
    throw new Error(`Issue #${issue.issueNumber} has no AI analysis to score against`);
  }

  const { score: skillMatch, matchingSkills } = computeSkillMatch(analysis.requiredSkills, profile.skills);
  const timeFit = computeTimeFit(profile.availableHours, analysis.estimatedHours.min, analysis.estimatedHours.max);
  const difficultyFit = computeDifficultyFit(profile.experience, analysis.difficulty);
  const activity = computeActivity(issue.commentCount, issue.updatedAt);
  const issueAge = computeIssueAge(issue.createdAt);
  const goodFirstIssueBonus = hasGoodFirstIssueLabel(issue.labels) ? 5 : 0;

  const ruleScore = Math.round(skillMatch + timeFit + difficultyFit + activity + issueAge + goodFirstIssueBonus);

  return {
    ruleScore: Math.min(100, ruleScore),
    matchingSkills,
    skillMatch,
    timeFit,
    difficultyFit,
    activity,
    issueAge,
    goodFirstIssueBonus,
  };
}
