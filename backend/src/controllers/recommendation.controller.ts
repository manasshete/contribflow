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

const RECOMMENDATION_CACHE_TTL_MS = 30 * 60 * 1000;

function sameSkillSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const normalize = (skills: string[]) => [...skills].map((s) => s.toLowerCase()).sort();
  const [na, nb] = [normalize(a), normalize(b)];
  return na.every((skill, i) => skill === nb[i]);
}

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

    const recentCached = await IssueRecommendationModel.find({
      repositoryId: repoDoc._id,
      'developerProfile.experience': profile.experience,
      'developerProfile.availableHours': profile.availableHours,
      createdAt: { $gte: new Date(Date.now() - RECOMMENDATION_CACHE_TTL_MS) },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const cached = recentCached.find((doc) => sameSkillSet(doc.developerProfile.skills, profile.skills));

    if (cached) {
      return res.json({
        sessionId,
        owner: body.owner,
        repo: body.repo,
        recommendations: cached.recommendations
          .map((rec) => ({
            issueNumber: rec.issueNumber,
            title: rec.title,
            type: rec.type,
            matchScore: rec.matchScore,
            issueHealth: rec.issueHealth,
            difficulty: rec.difficulty,
            estimatedTime: rec.estimatedTime,
            requiredSkills: rec.requiredSkills,
            matchingSkills: rec.matchingSkills,
            reason: rec.reason,
            reasons: rec.reasons,
            risk: rec.risk,
            relevantFiles: rec.relevantFiles,
            labels: rec.labels,
          }))
          .sort((a, b) => b.matchScore - a.matchScore),
      });
    }

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
          title: rec.title,
          type: rec.type,
          matchScore: rec.matchScore,
          issueHealth: rec.issueHealth,
          difficulty: rec.difficulty,
          estimatedTime: rec.estimatedTime,
          requiredSkills: rec.requiredSkills,
          matchingSkills: rec.matchingSkills,
          reason: rec.reason,
          reasons: rec.reasons,
          risk: rec.risk,
          relevantFiles: rec.relevantFiles,
          labels: rec.labels,
        })),
      });
    }

    return res.json({ sessionId, owner: body.owner, repo: body.repo, recommendations });
  } catch (err) {
    return next(err);
  }
}
