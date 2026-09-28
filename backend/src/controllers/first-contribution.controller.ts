import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { RepositoryModel } from '../models/Repository.model';
import { RepositoryAnalysisModel } from '../models/RepositoryAnalysis.model';
import { IssueModel } from '../models/Issue.model';
import { FirstContributionSessionModel } from '../models/FirstContributionSession.model';
import { GitHubService } from '../services/github/github.service';
import { buildRecommendations } from '../services/recommendation/recommendation.service';
import { generateContributionPlan, hasTestDirectory } from '../services/issue/contribution-plan.service';
import { buildRepositoryUnderstanding, buildChecklist } from '../services/first-contribution/first-contribution.service';
import { serializeIssue } from './issue.controller';

const ISSUE_TYPES = ['Bug', 'Feature', 'Documentation', 'Refactor', 'Testing', 'Performance', 'Security', 'Maintenance', 'Other'] as const;

async function requireRepo(owner: string, repo: string) {
  const repoDoc = await RepositoryModel.findOne({ owner, repo });
  if (!repoDoc) {
    throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet. POST to /api/repositories/analyze first.`, 404);
  }
  return repoDoc;
}

export async function getFirstContributionStateHandler(
  req: Request<{ owner: string; repo: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo } = req.params;
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;

    const repoDoc = await requireRepo(owner, repo);
    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });
    const repository = await buildRepositoryUnderstanding(repoDoc, analysisDoc);

    const session = sessionId
      ? await FirstContributionSessionModel.findOne({ sessionId, repositoryId: repoDoc._id })
      : null;

    return res.json({ repository, session });
  } catch (err) {
    return next(err);
  }
}

const profileRequestSchema = z.object({
  sessionId: z.string().min(1),
  skills: z.array(z.string()).default([]),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  availableHours: z.number().positive().max(1000),
  preferredType: z.enum([...ISSUE_TYPES, 'Any']).optional(),
});

export async function submitFirstContributionProfileHandler(
  req: Request<{ owner: string; repo: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo } = req.params;
    const body = profileRequestSchema.parse(req.body);

    const repoDoc = await requireRepo(owner, repo);
    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });

    const profile = { skills: body.skills, experience: body.experience, availableHours: body.availableHours };
    const allRecommendations = await buildRecommendations(repoDoc, analysisDoc, profile);

    let pool = allRecommendations;
    if (body.preferredType && body.preferredType !== 'Any') {
      const matching = allRecommendations.filter((r) => r.type === body.preferredType);
      const rest = allRecommendations.filter((r) => r.type !== body.preferredType);
      pool = [...matching, ...rest];
    }
    const recommendations = pool.slice(0, 3);

    const session = await FirstContributionSessionModel.findOneAndUpdate(
      { sessionId: body.sessionId, repositoryId: repoDoc._id },
      {
        $set: {
          owner,
          repo,
          skills: body.skills,
          experience: body.experience,
          availableHours: body.availableHours,
          preferredType: body.preferredType,
          currentStep: 2,
          updatedAt: new Date(),
        },
        $addToSet: { completedSteps: 1 },
        $setOnInsert: { sessionId: body.sessionId, repositoryId: repoDoc._id, checklist: [] },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ session, recommendations });
  } catch (err) {
    return next(err);
  }
}

const issueSelectRequestSchema = z.object({
  sessionId: z.string().min(1),
  issueNumber: z.number().int().positive(),
});

export async function selectFirstContributionIssueHandler(
  req: Request<{ owner: string; repo: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo } = req.params;
    const body = issueSelectRequestSchema.parse(req.body);

    const repoDoc = await requireRepo(owner, repo);
    const issueDoc = await IssueModel.findOne({ repositoryId: repoDoc._id, issueNumber: body.issueNumber });
    if (!issueDoc) {
      throw new AppError(`Issue #${body.issueNumber} not found for ${owner}/${repo}.`, 404);
    }
    if (!issueDoc.analysis) {
      throw new AppError(`Issue #${body.issueNumber} has not been analyzed yet.`, 409);
    }

    if (!issueDoc.contributionPlan) {
      const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });
      const plan = await generateContributionPlan(repoDoc, analysisDoc, issueDoc);
      issueDoc.contributionPlan = plan;
      await issueDoc.save();
    }

    const tree = await GitHubService.getFileTree(owner, repo, repoDoc.metadata.defaultBranch);
    const testingAvailable = hasTestDirectory(tree.map((t) => t.path));
    const checklist = buildChecklist(issueDoc.contributionPlan!, testingAvailable, body.issueNumber);

    const session = await FirstContributionSessionModel.findOneAndUpdate(
      { sessionId: body.sessionId, repositoryId: repoDoc._id },
      {
        $set: {
          owner,
          repo,
          selectedIssueNumber: body.issueNumber,
          currentStep: 3,
          checklist,
          updatedAt: new Date(),
        },
        $addToSet: { completedSteps: 2 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ session, issue: serializeIssue(issueDoc) });
  } catch (err) {
    return next(err);
  }
}

const progressRequestSchema = z.object({
  currentStep: z.number().int().min(1).max(8).optional(),
  completedSteps: z.array(z.number().int()).optional(),
  checklistToggle: z.object({ id: z.string(), done: z.boolean() }).optional(),
});

export async function updateFirstContributionProgressHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const body = progressRequestSchema.parse(req.body);
    const session = await FirstContributionSessionModel.findById(req.params.id);
    if (!session) {
      throw new AppError('First contribution session not found.', 404);
    }

    if (body.currentStep !== undefined) session.currentStep = body.currentStep;
    if (body.completedSteps !== undefined) {
      session.completedSteps = Array.from(new Set([...session.completedSteps, ...body.completedSteps]));
    }
    if (body.checklistToggle !== undefined) {
      const item = session.checklist.find((c) => c.id === body.checklistToggle!.id);
      if (item) item.done = body.checklistToggle.done;
    }
    session.updatedAt = new Date();
    await session.save();

    return res.json({ session });
  } catch (err) {
    return next(err);
  }
}
