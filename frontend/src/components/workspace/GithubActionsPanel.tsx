'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { GitPullRequestDraft, GitFork, GitBranch, GitPullRequest, ExternalLink, Loader2, LogOut, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getGithubSession,
  getGithubConnectUrl,
  disconnectGithub,
  forkRepository,
  createRemoteBranch,
  createDraftPullRequest,
  ApiError,
} from '@/lib/api';
import type { CreateBranchResult, CreateDraftPrResult, ForkResult } from '@/types';

export function GithubActionsPanel({
  owner,
  repo,
  branchName,
  prTitle,
  prBody,
}: {
  owner: string;
  repo: string;
  branchName: string;
  prTitle: string;
  prBody: string;
}) {
  const { data: session, isLoading, mutate } = useSWR('github-session', getGithubSession);

  const [fork, setFork] = useState<ForkResult | null>(null);
  const [branch, setBranch] = useState<CreateBranchResult | null>(null);
  const [pr, setPr] = useState<CreateDraftPrResult | null>(null);

  const [busy, setBusy] = useState<'fork' | 'branch' | 'pr' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(step: 'fork' | 'branch' | 'pr', action: () => Promise<void>) {
    setBusy(step);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Failed to ${step}.`);
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) {
    return <div className="apple-card p-6 h-40 animate-pulse border border-white/[0.06] bg-white/[0.02]" />;
  }

  if (!session?.connected) {
    return (
      <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <GitPullRequestDraft className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">One-Click Fork &amp; PR</h2>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed -mt-2">
          Connect your GitHub account to fork this repository, push a branch, and open a draft pull request without leaving ContribFlow.
        </p>
        <a
          href={getGithubConnectUrl(typeof window !== 'undefined' ? window.location.pathname : '/')}
          className="h-11 w-fit px-5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl"
        >
          <Link2 className="h-4 w-4" />
          <span>Connect GitHub</span>
        </a>
      </div>
    );
  }

  return (
    <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <GitPullRequestDraft className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">One-Click Fork &amp; PR</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={session.avatarUrl} alt={session.login} className="h-5 w-5 rounded-full" />
          <span className="text-xs font-mono text-zinc-300">{session.login}</span>
          <button
            type="button"
            onClick={async () => {
              await disconnectGithub();
              await mutate();
            }}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Disconnect GitHub"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-xl">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <GitFork className="h-3.5 w-3.5 text-zinc-400" />
            <span>1. Fork {owner}/{repo} to your account</span>
          </div>
          {fork ? (
            <a href={fork.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              {fork.alreadyExisted ? 'Fork ready' : 'Forked'} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={() =>
                run('fork', async () => {
                  const result = await forkRepository(owner, repo);
                  setFork(result);
                })
              }
              className="h-8 px-3 rounded-full bg-white text-black font-extrabold text-[11px] hover:bg-[#e8e8ed]"
            >
              {busy === 'fork' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Fork'}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
            <span>2. Create <code className="text-zinc-400">{branchName}</code> on your fork</span>
          </div>
          {branch ? (
            <span className="text-[11px] font-bold text-emerald-400">
              {branch.alreadyExisted ? 'Branch ready' : 'Created'}
            </span>
          ) : (
            <Button
              size="sm"
              disabled={busy !== null || !fork}
              onClick={() =>
                run('branch', async () => {
                  const result = await createRemoteBranch(owner, repo, fork!.forkOwner, branchName);
                  setBranch(result);
                })
              }
              className="h-8 px-3 rounded-full bg-white text-black font-extrabold text-[11px] hover:bg-[#e8e8ed] disabled:opacity-40"
            >
              {busy === 'branch' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Create Branch'}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <GitPullRequest className="h-3.5 w-3.5 text-zinc-400" />
            <span>3. Open a draft pull request</span>
          </div>
          {pr ? (
            <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              PR #{pr.number} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Button
              size="sm"
              disabled={busy !== null || !fork || !branch}
              onClick={() =>
                run('pr', async () => {
                  const result = await createDraftPullRequest(owner, repo, fork!.forkOwner, branchName, prTitle, prBody);
                  setPr(result);
                })
              }
              className="h-8 px-3 rounded-full bg-white text-black font-extrabold text-[11px] hover:bg-[#e8e8ed] disabled:opacity-40"
            >
              {busy === 'pr' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Create Draft PR'}
            </Button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
          After creating the branch, clone your fork and push at least one commit before opening the draft PR.
        </p>
      </div>
    </div>
  );
}
