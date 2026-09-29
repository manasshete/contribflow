import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { RepositoryModel } from '../models/Repository.model';
import { AppError } from '../middleware/errorHandler';
import { forkRepository, createRemoteBranch, createDraftPullRequest } from '../services/github/github-actions.service';

const forkBodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export async function forkRepositoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { owner, repo } = forkBodySchema.parse(req.body);
    const result = await forkRepository(req.githubUser!.accessToken, owner, repo);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

const branchBodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  forkOwner: z.string().min(1),
  branch: z.string().min(1),
});

export async function createBranchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { owner, repo, forkOwner, branch } = branchBodySchema.parse(req.body);

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    const baseBranch = repoDoc?.metadata.defaultBranch ?? 'main';

    const result = await createRemoteBranch(req.githubUser!.accessToken, forkOwner, repo, branch, baseBranch);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

const prBodySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  forkOwner: z.string().min(1),
  branch: z.string().min(1),
  title: z.string().min(1),
  body: z.string().default(''),
});

export async function createDraftPrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { owner, repo, forkOwner, branch, title, body } = prBodySchema.parse(req.body);

    const repoDoc = await RepositoryModel.findOne({ owner, repo });
    if (!repoDoc) {
      throw new AppError(`Repository ${owner}/${repo} has not been analyzed yet.`, 404);
    }
    const baseBranch = repoDoc.metadata.defaultBranch;

    const result = await createDraftPullRequest(
      req.githubUser!.accessToken,
      owner,
      repo,
      forkOwner,
      branch,
      baseBranch,
      title,
      body
    );
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
