'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, FileCode2, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContributionPlan } from '@/types';

export function CodeExplorationStep({ plan, onNext }: { plan: ContributionPlan; onNext: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(plan.relevantFiles[0]?.path ?? null);

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 4 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Explore the Code</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          These are the files most likely to need changes, ranked by relevance to your issue.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {plan.relevantFiles.length === 0 && (
          <p className="text-xs text-zinc-500">No specific files could be pinpointed - explore the repository structure directly.</p>
        )}
        {plan.relevantFiles.map((file, i) => {
          const isOpen = expanded === file.path;
          return (
            <div key={file.path} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : file.path)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />}
                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">{i + 1}.</span>
                  <code className="text-xs sm:text-sm font-mono font-bold text-zinc-200 truncate">{file.path}</code>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-300 shrink-0">{file.relevance}%</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/[0.06] pt-3">
                  <p className="text-xs text-zinc-400">{file.reason}</p>
                  {plan.relevantSymbols.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold flex items-center gap-1 mb-1.5">
                        <Boxes className="h-3 w-3" /> Structure
                      </span>
                      <div className="flex flex-col gap-1">
                        {plan.relevantSymbols.map((s) => (
                          <code key={s} className="text-xs font-mono text-zinc-300">├── {s}()</code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plan.dependencies.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-2">
            <FileCode2 className="h-3.5 w-3.5 text-zinc-400" /> Dependency Chain
          </h3>
          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06] flex flex-col items-start gap-1">
            {plan.dependencies.slice(0, 5).map((dep, i, arr) => (
              <div key={dep} className="flex flex-col items-start">
                <code className="text-xs font-mono text-zinc-300">{dep}</code>
                {i < arr.length - 1 && <span className="text-zinc-600 pl-1">↓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
      >
        <span>I&apos;ve Explored the Code</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
