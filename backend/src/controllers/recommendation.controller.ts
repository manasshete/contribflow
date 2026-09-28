import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { RepositoryModel } from '../models/Repository.model';
import { RepositoryAnalysisModel } from '../models/RepositoryAnalysis.model';
import { IssueModel } from '../models/Issue.model';
import { IssueRecommendationModel } from '../models/IssueRecommendation.model';
import { buildRecommendations } from '../services/recommendation/recommendation.service';

const recommendationRequestSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  skills: z.array(z.string()).default([]),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  availableHours: z.number().positive().max(1000),
  sessionId: z.string().optional(),
});

export async function createRecommendationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = recommendationRequestSchema.parse(req.body);
    const sessionId = body.sessionId ?? randomUUID();

    const repoDoc = await RepositoryModel.findOne({ owner: body.owner, repo: body.repo });
    if (!repoDoc) {
      throw new AppError(
        `Repository ${body.owner}/${body.repo} has not been analyzed yet. POST to /api/repositories/analyze first.`,
        404
      );
    }

    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });

    const profile = { skills: body.skills, experience: body.experience, availableHours: body.availableHours };
    const recommendations = await buildRecommendations(repoDoc, analysisDoc, profile);

    if (recommendations.length > 0) {
      const issueDocs = await IssueModel.find({
        repositoryId: repoDoc._id,
        issueNumber: { $in: recommendations.map((r) => r.issueNumber) },
      });
      const issueIdByNumber = new Map(issueDocs.map((doc) => [doc.issueNumber, doc._id]));

      await IssueRecommendationModel.create({
        sessionId,
        repositoryId: repoDoc._id,
        developerProfile: profile,
        recommendations: recommendations.map((rec) => ({
          issueId: issueIdByNumber.get(rec.issueNumber),
          issueNumber: rec.issueNumber,
          matchScore: rec.matchScore,
          ruleScore: rec.ruleScore,
          llmScore: rec.llmScore,
          difficulty: rec.difficulty,
          estimatedTime: rec.estimatedTime,
          requiredSkills: rec.requiredSkills,
          matchingSkills: rec.matchingSkills,
          reason: rec.reason,
          risk: rec.risk,
          relevantFiles: rec.relevantFiles,
        })),
      });
    }

    return res.json({ sessionId, owner: body.owner, repo: body.repo, recommendations });
  } catch (err) {
    return next(err);
  }
}
