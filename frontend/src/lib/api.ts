import {
  AnalyzedIssue,
  ChatMessage,
  DeveloperProfileInput,
  Recommendation,
  RepositoryAnalysis,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // ignore body parse failure
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export function analyzeRepository(url: string): Promise<RepositoryAnalysis> {
  return request<RepositoryAnalysis>('/api/repositories/analyze', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function getRepository(owner: string, repo: string): Promise<RepositoryAnalysis> {
  return request<RepositoryAnalysis>(`/api/repositories/${owner}/${repo}`);
}

export function getRepositoryIssues(
  owner: string,
  repo: string
): Promise<{ owner: string; repo: string; issues: AnalyzedIssue[]; source: 'cache' | 'fresh' }> {
  return request(`/api/repositories/${owner}/${repo}/issues`);
}

export function getRecommendations(
  profile: DeveloperProfileInput
): Promise<{ sessionId: string; owner: string; repo: string; recommendations: Recommendation[] }> {
  return request('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export function getIssueDetail(owner: string, repo: string, issueNumber: number): Promise<AnalyzedIssue> {
  return request(`/api/issues/${owner}/${repo}/${issueNumber}`);
}

export function analyzeIssue(owner: string, repo: string, issueNumber: number): Promise<AnalyzedIssue> {
  return request(`/api/issues/${owner}/${repo}/${issueNumber}/analyze`, { method: 'POST' });
}

export function getConversation(
  owner: string,
  repo: string,
  issueNumber: number,
  sessionId: string
): Promise<{ messages: ChatMessage[] }> {
  return request(`/api/chat/${owner}/${repo}/${issueNumber}?sessionId=${encodeURIComponent(sessionId)}`);
}

export function sendChatMessage(input: {
  owner: string;
  repo: string;
  issueNumber: number;
  sessionId: string;
  message: string;
}): Promise<{ sessionId: string; reply: string; messages: ChatMessage[] }> {
  return request('/api/chat', { method: 'POST', body: JSON.stringify(input) });
}
