import { ZodType } from 'zod';

export type AIRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  raw?: unknown;
}

export interface AIProvider {
  generate(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
  generateStructured<T>(messages: AIMessage[], schema: ZodType<T>, options?: AIOptions): Promise<T>;
}
