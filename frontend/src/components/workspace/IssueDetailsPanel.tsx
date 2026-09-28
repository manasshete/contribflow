import { Clock, GitCommit, Tag } from 'lucide-react';
import type { AnalyzedIssue } from '@/types';

export function IssueDetailsPanel({ issue }: { issue: AnalyzedIssue }) {
  const { analysis } = issue;

  return (
    <div className="apple-card p-6 border border-white/[0.08] shadow-xl flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <GitCommit className="h-3.5 w-3.5 text-zinc-400" />
          <span>Issue #{issue.issueNumber}</span>
          {analysis && (
            <>
              <span>•</span>
              <span className="capitalize text-zinc-300 font-semibold">{analysis.type}</span>
            </>
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
          {issue.title}
        </h2>
      </div>

      {analysis && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="capitalize rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1 font-mono text-zinc-300">
            {analysis.difficulty}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1 font-mono text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{analysis.estimatedHours.min}–{analysis.estimatedHours.max} hrs</span>
          </span>
        </div>
      )}

      <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06] max-h-72 overflow-y-auto">
        <p className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          {issue.body || 'No description provided by the issue author.'}
        </p>
      </div>

      {issue.labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="h-3 w-3 text-zinc-500 mr-1" />
          {issue.labels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 text-[11px] font-mono text-zinc-400"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {analysis && analysis.requiredSkills.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-1.5">
            Required Knowledge
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-white/[0.08] border border-white/[0.1] px-2.5 py-0.5 text-xs font-mono font-semibold text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
