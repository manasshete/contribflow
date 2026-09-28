import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  GITHUB_TOKEN: z.string().optional(),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
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
