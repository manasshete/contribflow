import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler';
import { UserModel } from '../models/User.model';
import { encryptSecret } from '../utils/crypto';
import { signSession, setSessionCookie, clearSessionCookie } from '../utils/session';
import { buildGithubAuthorizeUrl, exchangeCodeForToken, fetchGithubProfile } from '../services/github/github-oauth.service';
import { env, isGithubOAuthConfigured } from '../config/env';

const STATE_COOKIE_NAME = 'contribflow_oauth_state';

function isSafeReturnTo(value: string): boolean {
  return value.startsWith('/');
}

export async function startGithubAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isGithubOAuthConfigured) {
      throw new AppError('GitHub OAuth is not configured on this server.', 503);
    }
    const returnTo = typeof req.query.returnTo === 'string' && isSafeReturnTo(req.query.returnTo) ? req.query.returnTo : '/';
    const state = crypto.randomBytes(16).toString('hex');

    res.cookie(STATE_COOKIE_NAME, JSON.stringify({ state, returnTo }), {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    return res.redirect(buildGithubAuthorizeUrl(state));
  } catch (err) {
    return next(err);
  }
}

export async function githubAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isGithubOAuthConfigured) {
      throw new AppError('GitHub OAuth is not configured on this server.', 503);
    }

    const { code, state } = req.query as { code?: string; state?: string };
    const rawStateCookie = req.cookies?.[STATE_COOKIE_NAME];
    res.clearCookie(STATE_COOKIE_NAME, { path: '/' });

    if (!code || !state || !rawStateCookie) {
      throw new AppError('Invalid or expired GitHub OAuth callback.', 400);
    }

    const { state: expectedState, returnTo } = JSON.parse(rawStateCookie) as { state: string; returnTo: string };
    if (state !== expectedState) {
      throw new AppError('GitHub OAuth state mismatch. Please try connecting again.', 400);
    }

    const { accessToken, scopes } = await exchangeCodeForToken(code);
    const profile = await fetchGithubProfile(accessToken);

    const userDoc = await UserModel.findOneAndUpdate(
      { githubId: profile.githubId },
      {
        githubId: profile.githubId,
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        accessTokenEncrypted: encryptSecret(accessToken),
        scopes,
        updatedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const sessionToken = signSession({ userId: userDoc!._id.toString() });
    setSessionCookie(res, sessionToken);

    return res.redirect(`${env.FRONTEND_URL}${returnTo}`);
  } catch (err) {
    return next(err);
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.githubUser) {
    return res.json({ connected: false });
  }
  const { doc } = req.githubUser;
  return res.json({
    connected: true,
    login: doc.login,
    name: doc.name,
    avatarUrl: doc.avatarUrl,
  });
}

export async function logout(_req: Request, res: Response) {
  clearSessionCookie(res);
  return res.json({ ok: true });
}
