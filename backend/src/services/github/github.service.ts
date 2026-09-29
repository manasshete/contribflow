import type { Octokit } from '@octokit/rest';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { MergedPullRequest, RepoIssue, RepoMetadata, RepoTreeEntry } from './types';
import { TtlCache, mapWithConcurrency } from '../../utils/ttlCache';

const FILE_TREE_CACHE_TTL_MS = 10 * 60 * 1000;
const RECENT_PRS_CACHE_TTL_MS = 10 * 60 * 1000;
const PR_DETAIL_CONCURRENCY = 6;

async function loadOctokitConstructor(): Promise<any> {
  try {
    const octoModule = require('@octokit/rest');
    return octoModule.Octokit || octoModule.default?.Octokit || octoModule.default;
  } catch {
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const octoModule = await dynamicImport('@octokit/rest');
    return octoModule.Octokit || octoModule.default?.Octokit || octoModule.default;
  }
}

/** Builds an Octokit instance authenticated as a specific user (for fork/branch/PR actions taken on their behalf). */
export async function createUserOctokit(accessToken: string): Promise<Octokit> {
  const OctokitConstructor = await loadOctokitConstructor();
  return new OctokitConstructor({ auth: accessToken });
}

class GitHubServiceImpl {
  private octokitPromise: Promise<Octokit> | null = null;
  private fileTreeCache = new TtlCache<RepoTreeEntry[]>(FILE_TREE_CACHE_TTL_MS);
  private recentPRsCache = new TtlCache<MergedPullRequest[]>(RECENT_PRS_CACHE_TTL_MS);

  private async getOctokit(): Promise<Octokit> {
    if (!this.octokitPromise) {
      this.octokitPromise = (async () => {
        const OctokitConstructor = await loadOctokitConstructor();
        return new OctokitConstructor(env.GITHUB_TOKEN ? { auth: env.GITHUB_TOKEN } : {});
      })();
    }
    return this.octokitPromise;
  }

  private async handle<T>(fn: () => Promise<T>, notFoundMessage: string): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status === 404) {
        throw new AppError(notFoundMessage, 404);
      }
      if (err?.status === 403) {
        throw new AppError('GitHub API rate limit exceeded. Add a GITHUB_TOKEN to increase the limit.', 429);
      }
      throw new AppError(`GitHub API error: ${err?.message ?? 'unknown error'}`, 502);
    }
  }

  async getRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
    return this.handle(async () => {
      const octokit = await this.getOctokit();
      const { data } = await octokit.repos.get({ owner, repo });
      return {
        owner: data.owner.login,
        repo: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        primaryLanguage: data.language,
        openIssuesCount: data.open_issues_count,
        topics: data.topics ?? [],
        license: data.license?.spdx_id ?? null,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at,
      };
    }, `Repository ${owner}/${repo} not found`);
  }

  async getReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const octokit = await this.getOctokit();
      const { data } = await octokit.repos.getReadme({ owner, repo });
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  async getFileTree(owner: string, repo: string, branch: string): Promise<RepoTreeEntry[]> {
    return this.fileTreeCache.getOrCompute(`${owner}/${repo}@${branch}`, () =>
      this.handle(async () => {
        const octokit = await this.getOctokit();
        const { data } = await octokit.git.getTree({
          owner,
          repo,
          tree_sha: branch,
          recursive: '1',
        });
        return data.tree
          .filter((entry) => entry.path && entry.type)
          .map((entry) => ({
            path: entry.path as string,
            type: entry.type as 'blob' | 'tree',
            size: entry.size,
          }));
      }, `Could not fetch file tree for ${owner}/${repo}`)
    );
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const octokit = await this.getOctokit();
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      if (Array.isArray(data) || data.type !== 'file' || !('content' in data)) {
        return null;
      }
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  async getOpenIssues(owner: string, repo: string, maxCount = 50): Promise<RepoIssue[]> {
    return this.handle(async () => {
      const octokit = await this.getOctokit();
      const issues: RepoIssue[] = [];
      // The "issues" endpoint also returns pull requests, so we may need several
      // pages to collect `maxCount` real issues. Cap pages as a safety net.
      const PER_PAGE = 100;
      const MAX_PAGES = 5;
      let page = 1;
      let realIssueCount = 0;

      while (realIssueCount < maxCount && page <= MAX_PAGES) {
        const { data } = await octokit.issues.listForRepo({
          owner,
          repo,
          state: 'open',
          per_page: PER_PAGE,
          page,
          sort: 'updated',
          direction: 'desc',
        });
        if (data.length === 0) break;

        for (const issue of data) {
          const isPullRequest = Boolean(issue.pull_request);
          issues.push({
            number: issue.number,
            title: issue.title,
            body: issue.body ?? null,
            labels: issue.labels.map((l) => (typeof l === 'string' ? l : l.name ?? '')).filter(Boolean),
            state: issue.state as 'open' | 'closed',
            author: issue.user?.login ?? null,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            commentCount: issue.comments,
            isPullRequest,
          });
          if (!isPullRequest) realIssueCount += 1;
        }
        if (data.length < PER_PAGE) break;
        page += 1;
      }
      return issues.filter((issue) => !issue.isPullRequest).slice(0, maxCount);
    }, `Could not fetch issues for ${owner}/${repo}`);
  }

  async getRecentMergedPullRequests(owner: string, repo: string, maxCount = 20): Promise<MergedPullRequest[]> {
    return this.recentPRsCache.getOrCompute(`${owner}/${repo}:${maxCount}`, () =>
      this.handle(async () => {
        const octokit = await this.getOctokit();
        const { data } = await octokit.pulls.list({
          owner,
          repo,
          state: 'closed',
          per_page: maxCount,
          sort: 'updated',
          direction: 'desc',
        });

        const merged = data.filter((pr) => pr.merged_at).slice(0, maxCount);

        const withFiles = await mapWithConcurrency(merged, PR_DETAIL_CONCURRENCY, async (pr) => {
          try {
            const { data: full } = await octokit.pulls.get({ owner, repo, pull_number: pr.number });
            const { data: files } = await octokit.pulls.listFiles({ owner, repo, pull_number: pr.number, per_page: 100 });
            const result: MergedPullRequest = {
              number: pr.number,
              title: pr.title,
              body: full.body ?? '',
              mergedAt: pr.merged_at,
              changedFiles: full.changed_files,
              additions: full.additions,
              deletions: full.deletions,
              files: files.map((f) => f.filename),
            };
            return result;
          } catch {
            return null;
          }
        });

        return withFiles.filter((pr): pr is MergedPullRequest => pr !== null);
      }, `Could not fetch pull requests for ${owner}/${repo}`)
    );
  }
}

export const GitHubService = new GitHubServiceImpl();
