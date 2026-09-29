'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Check, Copy, GitBranch, Package, Terminal, FileEdit, FileText, GitPullRequestDraft, ArrowRight } from 'lucide-react';
import { getIssueToolkit } from '@/lib/api';

function CopyLine({ label, command }: { label?: string; command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">{label}</span>
      )}
      <div className="flex items-center gap-2 rounded-xl bg-black/60 border border-white/[0.08] px-3 py-2">
        <code className="flex-1 text-xs font-mono text-zinc-200 overflow-x-auto whitespace-pre">{command}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label={`Copy: ${command}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="rounded-xl bg-black/60 border border-white/[0.08] p-3.5 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
        {content}
      </pre>
    </div>
  );
}

export function DevToolkitPanel({
  owner,
  repo,
  issueNumber,
}: {
  owner: string;
  repo: string;
  issueNumber: number;
}) {
  const { data: toolkit, error, isLoading } = useSWR(
    { owner, repo, issueNumber, kind: 'issue-toolkit' },
    () => getIssueToolkit(owner, repo, issueNumber)
  );

  if (isLoading) {
    return <div className="apple-card p-8 h-48 animate-pulse border border-white/[0.06] bg-white/[0.02]" />;
  }

  if (error || !toolkit) {
    return null;
  }

  const { bootstrap, pr } = toolkit;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Terminal className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Local Workspace Bootstrapper</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed -mt-2">
            Copy-paste these commands to get straight to work on this issue.
          </p>

          <CopyLine label="1 · Clone the repository" command={bootstrap.cloneCommand} />
          <CopyLine label="2 · Create a branch" command={bootstrap.checkoutCommand} />

          {bootstrap.installCommand ? (
            <CopyLine
              label={`3 · Install dependencies (${bootstrap.packageManager})`}
              command={bootstrap.installCommand}
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Package className="h-3.5 w-3.5" />
              <span>Could not auto-detect a package manager for this repo.</span>
            </div>
          )}

          {bootstrap.gotoCommands.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                4 · Jump straight to the affected files
              </span>
              <div className="flex flex-col gap-2">
                {bootstrap.gotoCommands.map((cmd) => (
                  <CopyLine key={cmd} command={cmd} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
            <GitBranch className="h-3 w-3" />
            <span>Suggested branch: <code className="text-zinc-400">{bootstrap.branchName}</code></span>
          </div>
        </div>

        <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-tight">PR Description Generator</h2>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
              <FileText className="h-3 w-3" />
              {pr.templateFound ? pr.templatePath : 'No template found'}
            </span>
          </div>

          <CopyLine label="PR Title" command={pr.title} />
          <CopyBlock label="PR Description" content={pr.body} />
        </div>
      </div>

      <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/[0.06] to-purple-500/[0.06]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <GitPullRequestDraft className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">One-Click Fork &amp; PR Automation</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Fork {owner}/{repo}, create branch <code className="text-zinc-300 font-mono">{bootstrap.branchName}</code>, and open your draft PR from a dedicated flow.
          </p>
        </div>
        <Link
          href={`/repository/${owner}/${repo}/issues/${issueNumber}/actions`}
          className="h-10 px-5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <span>Open One-Click Fork &amp; PR</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
