import { ArrowRight, ExternalLink, GitMerge, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SimilarPR } from '@/types';

export function SimilarPRStep({
  owner,
  repo,
  similarPRs,
  onNext,
}: {
  owner: string;
  repo: string;
  similarPRs: SimilarPR[];
  onNext: () => void;
}) {
  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 5 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Study a Successful PR</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          These past merged pull requests are the most relevant to your issue - use them as a reference for scope and style.
        </p>
      </div>

      {similarPRs.length === 0 ? (
        <p className="text-xs text-zinc-500">No closely related merged PRs were found for this issue.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {similarPRs.map((pr) => (
            <div key={pr.number} className="rounded-2xl bg-white/[0.02] p-5 border border-white/[0.06] flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">PR #{pr.number} — {pr.title}</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                  Merged
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
                <span>Files changed: {pr.changedFiles}</span>
                <span className="text-emerald-400">+{pr.additions}</span>
                <span className="text-rose-400">-{pr.deletions}</span>
              </div>

              {pr.files.length > 0 && (
                <div className="flex flex-col gap-1">
                  {pr.files.slice(0, 5).map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <code className="font-mono truncate">{f}</code>
                    </div>
                  ))}
                  {pr.files.length > 5 && (
                    <span className="text-[11px] text-zinc-500">+{pr.files.length - 5} more files</span>
                  )}
                </div>
              )}

              <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-3">
                Recommended because: {pr.relevanceReason}.
              </p>

              <a
                href={`https://github.com/${owner}/${repo}/pull/${pr.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-zinc-300 transition-colors w-fit"
              >
                <span>View PR on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={onNext}
        className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
      >
        <span>Build My Checklist</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
