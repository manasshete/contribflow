import { createUserOctokit } from './github.service';
import { AppError } from '../../middleware/errorHandler';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ForkResult {
  forkOwner: string;
  forkRepo: string;
  htmlUrl: string;
  alreadyExisted: boolean;
  defaultBranch: string;
}

/** Forks `owner/repo` into the authenticated user's account (idempotent — GitHub returns the existing fork if one exists). */
export async function forkRepository(accessToken: string, owner: string, repo: string): Promise<ForkResult> {
  const octokit = await createUserOctokit(accessToken);

  const { data: viewer } = await octokit.users.getAuthenticated();
  const existing = await octokit.repos
    .get({ owner: viewer.login, repo })
    .then((r) => r.data)
    .catch(() => null);

  if (existing && existing.fork) {
    return {
      forkOwner: existing.owner.login,
      forkRepo: existing.name,
      htmlUrl: existing.html_url,
      alreadyExisted: true,
      defaultBranch: existing.default_branch,
    };
  }

  const { data: fork } = await octokit.repos.createFork({ owner, repo });

  // Newly created forks take a few seconds to become fully available.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const ready = await octokit.repos
      .get({ owner: fork.owner.login, repo: fork.name })
      .then((r) => r.data)
      .catch(() => null);
    if (ready) {
      return {
        forkOwner: ready.owner.login,
        forkRepo: ready.name,
        htmlUrl: ready.html_url,
        alreadyExisted: false,
        defaultBranch: ready.default_branch,
      };
    }
    await sleep(1500);
  }

  return {
    forkOwner: fork.owner.login,
    forkRepo: fork.name,
    htmlUrl: fork.html_url,
    alreadyExisted: false,
    defaultBranch: fork.default_branch ?? 'main',
  };
}

export interface CreateBranchResult {
  branch: string;
  alreadyExisted: boolean;
}

/** Creates `branch` on the user's fork, pointed at the fork's default branch HEAD. */
export async function createRemoteBranch(
  accessToken: string,
  forkOwner: string,
  forkRepo: string,
  branch: string,
  baseBranch: string
): Promise<CreateBranchResult> {
  const octokit = await createUserOctokit(accessToken);

  const existingRef = await octokit.git
    .getRef({ owner: forkOwner, repo: forkRepo, ref: `heads/${branch}` })
    .then(() => true)
    .catch(() => false);

  if (existingRef) {
    return { branch, alreadyExisted: true };
  }

  const { data: baseRef } = await octokit.git
    .getRef({ owner: forkOwner, repo: forkRepo, ref: `heads/${baseBranch}` })
    .catch(() => {
      throw new AppError(`Could not find base branch "${baseBranch}" on your fork.`, 404);
    });

  await octokit.git.createRef({
    owner: forkOwner,
    repo: forkRepo,
    ref: `refs/heads/${branch}`,
    sha: baseRef.object.sha,
  });

  return { branch, alreadyExisted: false };
}

export interface CreateDraftPrResult {
  number: number;
  htmlUrl: string;
  alreadyExisted: boolean;
}

/** Opens a draft PR from `forkOwner:branch` into `owner/repo`'s default branch. */
export async function createDraftPullRequest(
  accessToken: string,
  owner: string,
  repo: string,
  forkOwner: string,
  branch: string,
  baseBranch: string,
  title: string,
  body: string
): Promise<CreateDraftPrResult> {
  const octokit = await createUserOctokit(accessToken);

  const { data: existing } = await octokit.pulls.list({
    owner,
    repo,
    head: `${forkOwner}:${branch}`,
    state: 'all',
    per_page: 1,
  });

  if (existing.length > 0) {
    return { number: existing[0].number, htmlUrl: existing[0].html_url, alreadyExisted: true };
  }

  try {
    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head: `${forkOwner}:${branch}`,
      base: baseBranch,
      draft: true,
    });
    return { number: pr.number, htmlUrl: pr.html_url, alreadyExisted: false };
  } catch (err: any) {
    if (err?.status === 422) {
      throw new AppError(
        `GitHub rejected the pull request — push at least one commit to "${branch}" on your fork first.`,
        422
      );
    }
    throw new AppError(`Could not create the pull request: ${err?.message ?? 'unknown error'}`, 502);
  }
}
