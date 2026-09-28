import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { AnalyzedIssue, FirstContributionSession } from '@/types';

export function CompletionStep({
  session,
  issue,
}: {
  session: FirstContributionSession;
  issue: AnalyzedIssue | null;
}) {
  const filesExplored = issue?.contributionPlan?.relevantFiles.length ?? 0;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6 items-center text-center">
      <span className="text-4xl">🎉</span>
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 8 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Your first contribution is ready!</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white/[0.03] p-5 border border-white/[0.06] flex flex-col gap-3 text-left">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 font-mono uppercase">Repository</span>
          <span className="text-white font-bold">{session.owner}/{session.repo}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 font-mono uppercase">Issue</span>
          <span className="text-white font-bold">#{session.selectedIssueNumber}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 font-mono uppercase">Skills practiced</span>
          <span className="text-white font-bold text-right">{session.skills.join(', ')}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500 font-mono uppercase">Files explored</span>
          <span className="text-white font-bold">{filesExplored}</span>
        </div>
        {issue?.analysis && (
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500 font-mono uppercase">Estimated contribution</span>
            <span className="text-white font-bold">
              {issue.analysis.estimatedHours.min}–{issue.analysis.estimatedHours.max} hours
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs pt-2 border-t border-white/[0.06]">
          <span className="text-zinc-500 font-mono uppercase">Progress</span>
          <span className="text-emerald-400 font-bold">{session.completedSteps.length} / 8 steps completed</span>
        </div>
      </div>

      <p className="text-xs text-zinc-400">Next step: open your PR on GitHub.</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`https://github.com/${session.owner}/${session.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          <span>Open GitHub</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          href={`/repository/${session.owner}/${session.repo}`}
          className="h-12 px-6 rounded-full bg-white/[0.06] border border-white/[0.1] text-white font-bold text-xs hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
        >
          <span>Back to Repository</span>
        </Link>
      </div>
    </div>
  );
}
