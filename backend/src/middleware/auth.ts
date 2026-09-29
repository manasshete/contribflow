import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';
import { UserDocument, UserModel } from '../models/User.model';
import { verifySession, SESSION_COOKIE_NAME } from '../utils/session';
import { decryptSecret } from '../utils/crypto';
import { isGithubOAuthConfigured } from '../config/env';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      githubUser?: { doc: UserDocument; accessToken: string };
    }
  }
}

async function loadUserFromCookie(req: Request): Promise<{ doc: UserDocument; accessToken: string } | null> {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) return null;

  const session = verifySession(token);
  if (!session) return null;

  const doc = await UserModel.findById(session.userId);
  if (!doc) return null;

  const accessToken = decryptSecret(doc.accessTokenEncrypted);
  return { doc, accessToken };
}

export async function attachGithubUser(req: Request, _res: Response, next: NextFunction) {
  if (!isGithubOAuthConfigured) return next();
  try {
    req.githubUser = (await loadUserFromCookie(req)) ?? undefined;
  } catch {
    req.githubUser = undefined;
  }
  return next();
}

export async function requireGithubAuth(req: Request, _res: Response, next: NextFunction) {
  if (!isGithubOAuthConfigured) {
    return next(new AppError('GitHub OAuth is not configured on this server.', 503));
  }
  try {
    const user = req.githubUser ?? (await loadUserFromCookie(req)) ?? undefined;
    if (!user) {
      return next(new AppError('Not connected to GitHub. Connect your account first.', 401));
    }
    req.githubUser = user;
    return next();
  } catch (err) {
    return next(err);
  }
}
