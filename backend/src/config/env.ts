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

export const isGithubOAuthConfigured = Boolean(
  env.GITHUB_OAUTH_CLIENT_ID && env.GITHUB_OAUTH_CLIENT_SECRET && env.SESSION_SECRET && env.TOKEN_ENCRYPTION_KEY
);
