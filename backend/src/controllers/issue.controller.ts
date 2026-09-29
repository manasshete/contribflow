import { NextFunction, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { RepositoryModel } from '../models/Repository.model';
import { RepositoryAnalysisModel } from '../models/RepositoryAnalysis.model';
import { IssueDocument, IssueModel } from '../models/Issue.model';
import { getAnalyzedIssues } from '../services/issue/issue.service';
import { generateContributionPlan } from '../services/issue/contribution-plan.service';
import { buildDevToolkit } from '../services/issue/dev-toolkit.service';

export async function getRepositoryIssuesHandler(
  req: Request<{ owner: string; repo: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet. POST to /api/repositories/analyze first.`, 404);
    }

    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });
    const { issues, source } = await getAnalyzedIssues(repoDoc, analysisDoc, forceRefresh);

    return res.json({ owner, repo, issues: issues.map(serializeIssue), source });
  } catch (err) {
    return next(err);
  }
}

export function serializeIssue(doc: IssueDocument) {
  return {
    issueNumber: doc.issueNumber,
    title: doc.title,
    body: doc.body,
    labels: doc.labels,
    state: doc.state,
    author: doc.author,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    commentCount: doc.commentCount,
    analysis: doc.analysis,
    contributionPlan: doc.contributionPlan,
  };
}

export async function getIssueDetailHandler(
  req: Request<{ owner: string; repo: string; issueNumber: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo, issueNumber } = req.params;
    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet. POST to /api/repositories/analyze first.`, 404);
    }

    const issueDoc = await IssueModel.findOne({ repositoryId: repoDoc._id, issueNumber: Number(issueNumber) });
    if (!issueDoc) {
      throw new AppError(
        `Issue #${issueNumber} not found for ${owner}/${repo}. Fetch GET /api/repositories/${owner}/${repo}/issues first.`,
        404
      );
    }

    return res.json(serializeIssue(issueDoc));
  } catch (err) {
    return next(err);
  }
}

export async function analyzeIssueHandler(
  req: Request<{ owner: string; repo: string; issueNumber: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo, issueNumber } = req.params;
    const forceRefresh = req.query.refresh === 'true';

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet. POST to /api/repositories/analyze first.`, 404);
    }

    const issueDoc = await IssueModel.findOne({ repositoryId: repoDoc._id, issueNumber: Number(issueNumber) });
    if (!issueDoc) {
      throw new AppError(
        `Issue #${issueNumber} not found for ${owner}/${repo}. Fetch GET /api/repositories/${owner}/${repo}/issues first.`,
        404
      );
    }
    if (!issueDoc.analysis) {
      throw new AppError(`Issue #${issueNumber} has not been analyzed yet.`, 409);
    }

    if (!forceRefresh && issueDoc.contributionPlan) {
      return res.json(serializeIssue(issueDoc));
    }

    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });
    const plan = await generateContributionPlan(repoDoc, analysisDoc, issueDoc);

    issueDoc.contributionPlan = plan;
    await issueDoc.save();

    return res.json(serializeIssue(issueDoc));
  } catch (err) {
    return next(err);
  }
}

export async function getIssueToolkitHandler(
  req: Request<{ owner: string; repo: string; issueNumber: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo, issueNumber } = req.params;

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet. POST to /api/repositories/analyze first.`, 404);
    }

    const issueDoc = await IssueModel.findOne({ repositoryId: repoDoc._id, issueNumber: Number(issueNumber) });
    if (!issueDoc) {
      throw new AppError(
        `Issue #${issueNumber} not found for ${owner}/${repo}. Fetch GET /api/repositories/${owner}/${repo}/issues first.`,
        404
      );
    }

    const toolkit = await buildDevToolkit(repoDoc, issueDoc);
    return res.json(toolkit);
  } catch (err) {
    return next(err);
  }
}
