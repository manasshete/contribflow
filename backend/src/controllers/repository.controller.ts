import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { parseGithubUrl } from '../middleware/validateGithubUrl';
import { AppError } from '../middleware/errorHandler';
import { RepositoryModel } from '../models/Repository.model';
import { RepositoryAnalysisModel } from '../models/RepositoryAnalysis.model';
import { analyzeRepository } from '../services/repository/repository.analyzer';

const ANALYSIS_TTL_MS = 24 * 60 * 60 * 1000;

const analyzeBodySchema = z.object({
  url: z.string().min(1, 'url is required'),
});

export async function analyzeRepositoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = analyzeBodySchema.parse(req.body);
    const { owner, repo } = parseGithubUrl(url);

    const existingRepo = await RepositoryModel.findOne({ owner, repo });
    const cachedAnalysis = existingRepo
      ? await RepositoryAnalysisModel.findOne({ repositoryId: existingRepo._id }).sort({ cachedAt: -1 })
      : null;

    if (cachedAnalysis && cachedAnalysis.expiresAt > new Date()) {
      return res.json(serializeAnalysis(existingRepo!, cachedAnalysis));
    }

    const { metadata, analysis, repoContext } = await analyzeRepository(owner, repo);

    const repoDoc = await RepositoryModel.findOneAndUpdate(
      { owner, repo },
      {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
        metadata: {
          description: metadata.description,
          stars: metadata.stars,
          forks: metadata.forks,
          primaryLanguage: metadata.primaryLanguage,
          openIssuesCount: metadata.openIssuesCount,
          topics: metadata.topics,
          license: metadata.license,
          defaultBranch: metadata.defaultBranch,
          updatedAt: new Date(metadata.updatedAt),
        },
        lastFetchedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    const analysisDoc = await RepositoryAnalysisModel.create({
      repositoryId: repoDoc._id,
      owner,
      repo,
      summary: analysis.summary,
      technologies: analysis.technologies,
      architecture: analysis.architecture,
      importantFiles: analysis.importantFiles,
      contributionRequirements: analysis.contributionRequirements,
      repoContext,
      health: analysis.health,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + ANALYSIS_TTL_MS),
    });

    return res.json(serializeAnalysis(repoDoc, analysisDoc));
  } catch (err) {
    return next(err);
  }
}

export async function getRepositoryHandler(
  req: Request<{ owner: string; repo: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { owner, repo } = req.params;
    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`No cached analysis for ${owner}/${repo}. POST to /api/repositories/analyze first.`, 404);
    }
    const analysisDoc = await RepositoryAnalysisModel.findOne({ repositoryId: repoDoc._id }).sort({ cachedAt: -1 });
    if (!analysisDoc) {
      throw new AppError(`No cached analysis for ${owner}/${repo}. POST to /api/repositories/analyze first.`, 404);
    }
    return res.json(serializeAnalysis(repoDoc, analysisDoc));
  } catch (err) {
    return next(err);
  }
}

function serializeAnalysis(repoDoc: any, analysisDoc: any) {
  return {
    owner: repoDoc.owner,
    repo: repoDoc.repo,
    url: repoDoc.url,
    metadata: repoDoc.metadata,
    summary: analysisDoc.summary,
    technologies: analysisDoc.technologies,
    architecture: analysisDoc.architecture,
    importantFiles: analysisDoc.importantFiles,
    contributionRequirements: analysisDoc.contributionRequirements,
    health: analysisDoc.health,
    cachedAt: analysisDoc.cachedAt,
    expiresAt: analysisDoc.expiresAt,
  };
}
