export interface RepoMetadata {
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  openIssuesCount: number;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  updatedAt: string;
}

export interface RepoTreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export interface RepoIssue {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  state: 'open' | 'closed';
  author: string | null;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  isPullRequest: boolean;
}

export interface MergedPullRequest {
  number: number;
  title: string;
  mergedAt: string | null;
  changedFiles: number;
  additions: number;
  deletions: number;
  files: string[];
}
