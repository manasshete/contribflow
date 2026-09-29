import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  GITHUB_TOKEN: z.string().optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // GitHub OAuth (one-click fork/branch/PR). Optional — when absent, the
  // /api/auth and /api/github/* routes return a clear 503 instead of crashing.
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
  GITHUB_OAUTH_REDIRECT_URI: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  // Comma-separated list of extra origins allowed to call this API (e.g. a
  // deployed Vercel frontend URL). FRONTEND_URL is always allowed too.
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = JSON.stringify(parsed.error.flatten().fieldErrors);
  console.error('Invalid environment variables:', errors);
  if (process.env.VERCEL) {
    throw new Error(`Invalid environment variables on Vercel: ${errors}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins = Array.from(
  new Set(
    [env.FRONTEND_URL, 'http://localhost:3000', ...(env.ALLOWED_ORIGINS?.split(',') ?? [])]
      .map((o) => o.trim())
      .filter(Boolean)
  )
);

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;

  // Exact match from allowed list (e.g. FRONTEND_URL or custom domains)
  if (allowedOrigins.includes(origin)) return true;

  // Any Vercel deployment URL (production, previews, branch deployments)
  // e.g. https://frontend-*.vercel.app, https://*-manasshetes-projects.vercel.app
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(origin)) return true;

  // Local development on localhost or 127.0.0.1 on any port
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;

  return false;
}

export const isGithubOAuthConfigured = Boolean(
  env.GITHUB_OAUTH_CLIENT_ID && env.GITHUB_OAUTH_CLIENT_SECRET && env.SESSION_SECRET && env.TOKEN_ENCRYPTION_KEY
);
