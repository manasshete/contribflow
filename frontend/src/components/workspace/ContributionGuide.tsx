import { FileCode2, Info, ListChecks, TriangleAlert, CheckCircle2, Sparkles, TestTube, Boxes, GitPullRequest, FolderTree } from 'lucide-react';
import type { ContributionPlan } from '@/types';

export function ContributionGuide({ plan }: { plan: ContributionPlan }) {
  return (
    <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Contribution Blueprint</h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          Repository Analysis
        </span>
      </div>

      {plan.repositoryArea && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <FolderTree className="h-3.5 w-3.5 text-zinc-500" />
          <span>Repository area: <code className="text-zinc-300 font-mono">{plan.repositoryArea}</code></span>
        </div>
      )}

      {/* Problem & Why it matters */}
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-1">
            Problem Diagnosis
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.05]">
            {plan.problem}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-1">
            Why It Matters
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.05]">
            {plan.whyItMatters}
          </p>
        </div>
      </div>

      {/* Relevant Files */}
      {plan.relevantFiles.length > 0 && (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5 mb-2">
            <FileCode2 className="h-3.5 w-3.5 text-zinc-400" /> Exact File Targets
          </span>
          <div className="flex flex-col gap-2">
            {plan.relevantFiles.map((file) => (
              <div
                key={file.path}
                className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="w-fit rounded-lg bg-black/60 px-2 py-0.5 text-xs font-mono font-bold text-zinc-200 border border-white/[0.08]">
                    {file.path}
                  </code>
                  {typeof file.relevance === 'number' && (
                    <span className="text-[10px] font-mono font-bold text-indigo-300">{file.relevance}%</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{file.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symbols, Dependencies & Similar PRs */}
      {(plan.relevantSymbols.length > 0 || plan.dependencies.length > 0 || plan.similarPRs.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plan.relevantSymbols.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1 mb-1.5">
                <Boxes className="h-3 w-3 text-zinc-400" /> Relevant Functions/Classes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {plan.relevantSymbols.map((symbol) => (
                  <code key={symbol} className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-mono text-zinc-300 border border-white/[0.08]">
                    {symbol}
                  </code>
                ))}
              </div>
            </div>
          )}

          {plan.dependencies.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1 mb-1.5">
                <FileCode2 className="h-3 w-3 text-zinc-400" /> Dependencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {plan.dependencies.map((dep) => (
                  <code key={dep} className="rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-mono text-zinc-300 border border-white/[0.08]">
                    {dep}
                  </code>
                ))}
              </div>
            </div>
          )}

          {plan.similarPRs.length > 0 && (
            <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06] sm:col-span-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1 mb-1.5">
                <GitPullRequest className="h-3 w-3 text-zinc-400" /> Similar Previous PRs
              </span>
              <ul className="space-y-1 text-xs text-zinc-300">
                {plan.similarPRs.map((pr) => (
                  <li key={pr.number}>
                    #{pr.number} — {pr.title} <span className="text-zinc-500">({pr.changedFiles} files changed)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Implementation Steps */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5 mb-2.5">
          <ListChecks className="h-3.5 w-3.5 text-zinc-400" /> Implementation Steps
        </span>
        <div className="flex flex-col gap-2.5">
          {plan.implementationSteps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Risks */}
      {plan.potentialRisks.length > 0 && (
        <div className="rounded-2xl bg-amber-500/[0.04] p-4 border border-amber-500/20">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
            <TriangleAlert className="h-3.5 w-3.5" /> Architectural Watchouts
          </span>
          <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
            {plan.potentialRisks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Testing & Expected Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1 mb-1">
            <TestTube className="h-3 w-3 text-zinc-400" /> Testing Strategy
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">{plan.testingStrategy}</p>
        </div>

        <div className="rounded-xl bg-white/[0.02] p-3.5 border border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Expected Result
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">{plan.expectedResult}</p>
        </div>
      </div>

      {/* Recent PR Activity Insight */}
      {plan.recentActivityInsight && (
        <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.08] text-xs text-zinc-300">
          <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{plan.recentActivityInsight}</p>
        </div>
      )}
    </div>
  );
}
