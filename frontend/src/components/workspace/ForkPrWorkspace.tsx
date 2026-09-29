'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { ArrowLeft, GitPullRequestDraft, Sparkles, AlertCircle, FileText, GitBranch, ExternalLink } from 'lucide-react';
import { getIssueDetail, getIssueToolkit, ApiError } from '@/lib/api';
import { GithubActionsPanel } from './GithubActionsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ForkPrWorkspace({
  owner,
  repo,
  issueNumber,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
}) {
  const { data: issue, error: issueError, isLoading: issueLoading } = useSWR(
    { owner, repo, issueNumber, kind: 'issue-detail' },
    () => getIssueDetail(owner, repo, issueNumber)
  );

  const { data: toolkit, error: toolkitError, isLoading: toolkitLoading } = useSWR(
    { owner, repo, issueNumber, kind: 'issue-toolkit' },
    () => getIssueToolkit(owner, repo, issueNumber)
  );

  const isLoading = issueLoading || toolkitLoading;
  const error = issueError || toolkitError;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="apple-card p-8 h-32 animate-pulse border border-white/[0.06] bg-white/[0.02]" />
        <div className="apple-card p-8 h-80 animate-pulse border border-white/[0.06] bg-white/[0.02]" />
      </div>
    );
  }

  if (error || !toolkit || !issue) {
    return (
      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-2xl p-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {error instanceof ApiError ? error.message : `Could not load workspace for issue #${issueNumber}.`}
        </AlertDescription>
      </Alert>
    );
  }

  const { bootstrap, pr } = toolkit;

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner / Navigation */}
      <div className="apple-card p-6 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Issue #{issue.issueNumber}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-indigo-400 font-bold">{owner}/{repo}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {issue.title}
          </h1>
        </div>

        <Link
          href={`/repository/${owner}/${repo}/issues/${issueNumber}`}
          className="h-10 px-4 rounded-full border border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:text-white hover:bg-white/[0.08] text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto shrink-0 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Issue Workspace</span>
        </Link>
      </div>

      {/* Main One-Click Fork & PR Card */}
      <GithubActionsPanel
        owner={owner}
        repo={repo}
        branchName={bootstrap.branchName}
        prTitle={pr.title}
        prBody={pr.body}
      />

      {/* Context Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Target Branch Info</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When you click &ldquo;Create Branch&rdquo;, ContribFlow automatically initializes this remote branch on your fork:
          </p>
          <div className="bg-black/50 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-xs text-indigo-300">
            {bootstrap.branchName}
          </div>
        </div>

        <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <FileText className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Draft PR Title Preview</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your draft pull request will be opened against <code className="text-zinc-300">{owner}/{repo}</code> with:
          </p>
          <div className="bg-black/50 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-xs text-zinc-300 truncate">
            {pr.title}
          </div>
        </div>
      </div>
    </div>
  );
}
