import { AppError } from './errorHandler';

const GITHUB_URL_PATTERN = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9._-]+?)(\.git)?\/?$/;

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
}

export function parseGithubUrl(url: string): ParsedRepoUrl {
  const match = GITHUB_URL_PATTERN.exec(url.trim());
  if (!match) {
    throw new AppError('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo', 400);
  }
  const [, , owner, repo] = match;
  return { owner, repo: repo.replace(/\.git$/, '') };
}
