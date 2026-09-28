import { ArrowRight, Clock, MessageSquare, Tag, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AnalyzedIssue } from '@/types';

export function IssueUnderstandingStep({
  issue,
  issueHealth,
  onNext,
}: {
  issue: AnalyzedIssue;
  issueHealth: number | null;
  onNext: () => void;
}) {
  const { analysis } = issue;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 3 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Understand the Issue</h1>
      </div>

      <div>
        <h2 className="text-xs font-bold text-white uppercase tracking-wide mb-2">What is the problem?</h2>
        <div className="rounded-2xl bg-white/[0.03] p-5 border border-white/[0.06] flex flex-col gap-3">
          <h3 className="text-lg font-bold text-white">#{issue.issueNumber} — {issue.title}</h3>
          <p className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {issue.body || 'No description provided by the issue author.'}
          </p>
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="h-3 w-3 text-zinc-500" />
              {issue.labels.map((l) => (
                <span key={l} className="rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400">
                  {l}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <MessageSquare className="h-3.5 w-3.5" /> {issue.commentCount} comments
          </div>
        </div>
      </div>

      {analysis && (
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wide mb-2">What will probably be involved?</h2>
          <div className="rounded-2xl bg-white/[0.03] p-5 border border-white/[0.06] flex flex-col gap-3">
            {analysis.likelyAffectedAreas.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Likely areas:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {analysis.likelyAffectedAreas.map((area) => (
                    <code key={area} className="rounded-lg bg-black/60 px-2 py-0.5 text-xs font-mono text-zinc-300 border border-white/[0.08]">
                      {area}
                    </code>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Difficulty</span>
                <span className="text-sm font-bold text-white capitalize">{analysis.difficulty}</span>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Estimated effort</span>
                  <span className="text-sm font-bold text-white">
                    {analysis.estimatedHours.min}–{analysis.estimatedHours.max} hours
                  </span>
                </div>
              </div>
              {issueHealth !== null && (
                <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block">Issue health</span>
                    <span className="text-sm font-bold text-white">{issueHealth}/100</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
      >
        <span>Explore the Code</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
