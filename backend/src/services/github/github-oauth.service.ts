import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const OAUTH_SCOPES = 'public_repo';

export interface GithubOAuthProfile {
  githubId: number;
  login: string;
  name: string | null;
  avatarUrl: string;
}

export function buildGithubAuthorizeUrl(state: string): string {
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_REDIRECT_URI) {
    throw new AppError('GitHub OAuth is not configured on this server.', 503);
  }
  const params = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: env.GITHUB_OAUTH_REDIRECT_URI,
    scope: OAUTH_SCOPES,
    state,
    allow_signup: 'true',
  });
  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; scopes: string[] }> {
  if (!env.GITHUB_OAUTH_CLIENT_ID || !env.GITHUB_OAUTH_CLIENT_SECRET) {
    throw new AppError('GitHub OAuth is not configured on this server.', 503);
  }

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_OAUTH_REDIRECT_URI,
    }),
  });

  const data = (await res.json()) as { access_token?: string; scope?: string; error_description?: string };
  if (!data.access_token) {
    throw new AppError(`GitHub OAuth exchange failed: ${data.error_description ?? 'unknown error'}`, 502);
  }

  return { accessToken: data.access_token, scopes: (data.scope ?? '').split(',').filter(Boolean) };
}

export async function fetchGithubProfile(accessToken: string): Promise<GithubOAuthProfile> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    throw new AppError('Could not fetch GitHub profile for the connected account.', 502);
  }
  const data = (await res.json()) as { id: number; login: string; name: string | null; avatar_url: string };
  return { githubId: data.id, login: data.login, name: data.name, avatarUrl: data.avatar_url };
}
