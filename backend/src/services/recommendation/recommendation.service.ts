import { RepositoryDocument } from '../../models/Repository.model';
import { RepositoryAnalysisDocument } from '../../models/RepositoryAnalysis.model';
import { GitHubService } from '../github/github.service';
import { getAnalyzedIssues } from '../issue/issue.service';
import { computeRuleScore, DeveloperProfile } from './rule.scorer';
import { correlatePRs } from '../issue/pr-complexity';
import { computeIssueHealthScore } from '../issue/issue.scorer';
import { IssueType } from '../issue/issue.analyzer';

const RECENT_PR_COUNT = 15;

export interface RankedRecommendation {
  issueNumber: number;
  title: string;
  type: IssueType;
  matchScore: number;
  issueHealth: number;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  matchingSkills: string[];
  reason: string;
  reasons: string[];
  risk: string;
  relevantFiles: string[];
  labels: string[];
}

function computeRepoComplexity(repoDoc: RepositoryDocument, analysisDoc: RepositoryAnalysisDocument | null): number {
  const techCount = analysisDoc?.technologies.length ?? 0;
  const openIssues = repoDoc.metadata.openIssuesCount ?? 0;

  let score = techCount * 8;
  if (openIssues > 500) score += 40;
  else if (openIssues > 100) score += 20;
  else if (openIssues > 30) score += 10;

  return Math.max(0, Math.min(100, score));
}

function computeRisk(
  difficultyFit: number,
  requiresDeepKnowledge: boolean,
  prComplexityAdjustment: number
): string {
  let riskPoints = 0;
  if (difficultyFit < 10) riskPoints += 2;
  else if (difficultyFit < 16) riskPoints += 1;
  if (requiresDeepKnowledge) riskPoints += 1;
  if (prComplexityAdjustment < 0) riskPoints += 1;

  if (riskPoints >= 3) return 'High';
  if (riskPoints >= 1) return 'Medium';
  return 'Low';
}

export async function buildRecommendations(
  repoDoc: RepositoryDocument,
  analysisDoc: RepositoryAnalysisDocument | null,
  profile: DeveloperProfile
): Promise<RankedRecommendation[]> {
  const { issues } = await getAnalyzedIssues(repoDoc, analysisDoc, false);
  const analyzedIssues = issues.filter((issue) => issue.analysis);

  if (analyzedIssues.length === 0) {
    return [];
  }

  const repoComplexity = computeRepoComplexity(repoDoc, analysisDoc);
  const recentPRs = await GitHubService.getRecentMergedPullRequests(repoDoc.owner, repoDoc.repo, RECENT_PR_COUNT).catch(
    () => []
  );

  const recommendations: RankedRecommendation[] = analyzedIssues.map((issue) => {
    const prComplexity = correlatePRs(recentPRs, issue.analysis!.likelyAffectedAreas);
    const breakdown = computeRuleScore(issue, profile, { prComplexity, repoComplexity });

    return {
      issueNumber: issue.issueNumber,
      title: issue.title,
      type: issue.analysis!.type,
      matchScore: breakdown.ruleScore,
      issueHealth: computeIssueHealthScore(issue),
      difficulty: issue.analysis!.difficulty,
      estimatedTime: `${issue.analysis!.estimatedHours.min}-${issue.analysis!.estimatedHours.max} hours`,
      requiredSkills: issue.analysis!.requiredSkills,
      matchingSkills: breakdown.matchingSkills,
      reason: breakdown.reasons.join('. ') + '.',
      reasons: breakdown.reasons,
      risk: computeRisk(breakdown.difficultyFit, issue.analysis!.requiresDeepKnowledge, breakdown.prComplexityAdjustment),
      relevantFiles: issue.analysis!.likelyAffectedAreas,
      labels: issue.labels,
    };
  });

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
