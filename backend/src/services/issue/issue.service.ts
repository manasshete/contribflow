import { HydratedDocument, Types } from 'mongoose';
import { GitHubService } from '../github/github.service';
import { IssueModel, IssueDocument } from '../../models/Issue.model';
import { RepositoryDocument } from '../../models/Repository.model';
import { RepositoryAnalysisDocument } from '../../models/RepositoryAnalysis.model';
import { selectCandidateIssues } from './issue.scorer';
import { classifyIssues } from './issue.analyzer';

const MAX_FETCHED_ISSUES = 50;
const MAX_CANDIDATES = 50;

export type IssueHydrated = HydratedDocument<IssueDocument>;

export interface AnalyzedIssuesResult {
  issues: IssueHydrated[];
  source: 'cache' | 'fresh';
}

/**
 * Returns analyzed candidate issues for a repository, fetching + running the
 * two-stage (deterministic spam filter -> deterministic classification)
 * pipeline only when there is no usable cache. Shared by the issues endpoint
 * and the recommendation engine.
 */
export async function getAnalyzedIssues(
  repoDoc: RepositoryDocument,
  analysisDoc: RepositoryAnalysisDocument | null,
  forceRefresh = false
): Promise<AnalyzedIssuesResult> {
  const repositoryId = repoDoc._id as Types.ObjectId;

  if (!forceRefresh) {
    const cached = await IssueModel.find({ repositoryId, analysis: { $exists: true } });
    if (cached.length > 0) {
      return { issues: cached, source: 'cache' };
    }
  }

  const { owner, repo } = repoDoc;
  const openIssues = await GitHubService.getOpenIssues(owner, repo, MAX_FETCHED_ISSUES);

  await Promise.all(
    openIssues.map((issue) =>
      IssueModel.findOneAndUpdate(
        { repositoryId, issueNumber: issue.number },
        {
          repositoryId,
          issueNumber: issue.number,
          title: issue.title,
          body: issue.body,
          labels: issue.labels,
          state: issue.state,
          author: issue.author,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
          commentCount: issue.commentCount,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      )
    )
  );

  const candidates = selectCandidateIssues(openIssues, MAX_CANDIDATES);
  if (candidates.length === 0) {
    return { issues: [], source: 'fresh' };
  }

  const analyses = classifyIssues(candidates, {
    primaryLanguage: repoDoc.metadata.primaryLanguage,
    technologies: analysisDoc?.technologies ?? [],
  });

  const analyzedDocs = await Promise.all(
    candidates
      .filter((issue) => analyses.has(issue.number))
      .map((issue) => {
        const analysis = analyses.get(issue.number)!;
        return IssueModel.findOneAndUpdate(
          { repositoryId, issueNumber: issue.number },
          { $set: { analysis: { ...analysis, analyzedAt: new Date() } } },
          { returnDocument: 'after' }
        );
      })
  );

  return {
    issues: analyzedDocs.filter((doc): doc is NonNullable<typeof doc> => doc !== null),
    source: 'fresh',
  };
}
