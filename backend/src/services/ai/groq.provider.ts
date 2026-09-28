import Groq, { RateLimitError } from 'groq-sdk';
import { ZodType } from 'zod';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AIMessage, AIOptions, AIProvider, AIResponse } from './types';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayFromError(err: RateLimitError): number {
  const retryAfter = err.headers?.get?.('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 15_000);
    }
  }
  return DEFAULT_RETRY_DELAY_MS;
}

async function withRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!(err instanceof RateLimitError)) {
        throw err;
      }
      if (attempt === MAX_RETRIES) {
        throw new AppError('The AI provider is temporarily rate-limited. Please wait a moment and try again.', 503);
      }
      const delay = retryDelayFromError(err) + attempt * 500;
      await sleep(delay);
    }
  }

  throw lastError;
}

export class GroqProvider implements AIProvider {
  private client: Groq;
  private model: string;

  constructor(model: string = DEFAULT_MODEL) {
    this.client = new Groq({ apiKey: env.GROQ_API_KEY });
    this.model = model;
  }

  async generate(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const completion = await withRateLimitRetry(() =>
      this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
      })
    );

    const content = completion.choices[0]?.message?.content ?? '';
    return { content, raw: completion };
  }

  async generateStructured<T>(messages: AIMessage[], schema: ZodType<T>, options: AIOptions = {}): Promise<T> {
    const completion = await withRateLimitRetry(() =>
      this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 2048,
        response_format: { type: 'json_object' },
      })
    );

    const raw = completion.choices[0]?.message?.content ?? '{}';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Groq returned non-JSON output despite json_object mode: ${raw.slice(0, 200)}`);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`Groq structured output failed schema validation: ${result.error.message}`);
    }

    return result.data;
  }
}
