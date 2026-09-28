import { ZodType } from 'zod';
import { AIMessage, AIOptions, AIProvider, AIResponse } from './types';
import { GroqProvider } from './groq.provider';

class AIServiceImpl {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  generate(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    return this.provider.generate(messages, options);
  }

  generateStructured<T>(messages: AIMessage[], schema: ZodType<T>, options?: AIOptions): Promise<T> {
    return this.provider.generateStructured(messages, schema, options);
  }
}

export const AIService = new AIServiceImpl(new GroqProvider());
