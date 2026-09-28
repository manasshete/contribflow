import { RepositoryDocument } from '../../models/Repository.model';
import { RepositoryAnalysisDocument } from '../../models/RepositoryAnalysis.model';
import { getAnalyzedIssues } from '../issue/issue.service';
import { computeRuleScore, DeveloperProfile } from './rule.scorer';
import { scoreIssuesForProfile } from './llm.scorer';

const RULE_WEIGHT = 0.6;
const LLM_WEIGHT = 0.4;

export interface RankedRecommendation {
  issueNumber: number;
  title: string;
  matchScore: number;
  ruleScore: number;
  llmScore: number;
  difficulty: string;
  estimatedTime: string;
  requiredSkills: string[];
  matchingSkills: string[];
  reason: string;
  risk: string;
  relevantFiles: string[];
  labels: string[];
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

  const ruleResults = analyzedIssues.map((issue) => ({
    issue,
    breakdown: computeRuleScore(issue, profile),
  }));

  const llmScores = await scoreIssuesForProfile(
    ruleResults.map(({ issue, breakdown }) => ({ issue, matchingSkills: breakdown.matchingSkills })),
    profile
  );

  const recommendations: RankedRecommendation[] = ruleResults.map(({ issue, breakdown }) => {
    const llm = llmScores.get(issue.issueNumber);
    const llmScore = llm?.llmScore ?? breakdown.ruleScore; // fall back to rule score if LLM omitted an item
    const matchScore = Math.round(RULE_WEIGHT * breakdown.ruleScore + LLM_WEIGHT * llmScore);

    return {
      issueNumber: issue.issueNumber,
      title: issue.title,
      matchScore,
      ruleScore: breakdown.ruleScore,
      llmScore,
      difficulty: issue.analysis!.difficulty,
      estimatedTime: `${issue.analysis!.estimatedHours.min}-${issue.analysis!.estimatedHours.max} hours`,
      requiredSkills: issue.analysis!.requiredSkills,
      matchingSkills: breakdown.matchingSkills,
      reason: llm?.reason ?? 'Matches based on skill overlap, time budget, and issue activity.',
      risk: llm?.risk ?? (breakdown.difficultyFit < 10 ? 'High' : breakdown.difficultyFit < 16 ? 'Medium' : 'Low'),
      relevantFiles: issue.analysis!.likelyAffectedAreas,
      labels: issue.labels,
    };
  });

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
