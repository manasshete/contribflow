import { Star, GitFork, CircleDot, ShieldCheck, Code2, Sparkles } from 'lucide-react';
import type { RepositoryAnalysis } from '@/types';

const HEALTH_STYLES: Record<RepositoryAnalysis['health'], { label: string; style: string }> = {
  good: {
    label: 'Good Health',
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  moderate: {
    label: 'Moderate Health',
    style: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  poor: {
    label: 'Poor Health',
    style: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
};

export function RepoOverview({ analysis }: { analysis: RepositoryAnalysis }) {
  const { metadata } = analysis;
  const healthConfig = HEALTH_STYLES[analysis.health] ?? HEALTH_STYLES.moderate;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.1] shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="uppercase tracking-widest font-semibold">Repository Overview</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Sparkles className="h-3 w-3 text-emerald-400" /> Octokit AST Analyzed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {analysis.owner}/<span className="titanium-text">{analysis.repo}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            {metadata.description ?? 'No description provided.'}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3.5 py-1 text-xs font-mono font-bold capitalize flex items-center gap-1.5 ${healthConfig.style}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {healthConfig.label}
        </span>
      </div>

      <div className="flex flex-col gap-5 pt-5">
        <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06] text-xs sm:text-sm text-zinc-200 leading-relaxed">
          {analysis.summary}
        </div>

        {/* Apple Pro metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Stars</span>
              <span className="text-sm font-black font-mono text-white">{metadata.stars.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <GitFork className="h-4 w-4 text-zinc-300 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Forks</span>
              <span className="text-sm font-black font-mono text-white">{metadata.forks.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <CircleDot className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Open Issues</span>
              <span className="text-sm font-black font-mono text-white">{metadata.openIssuesCount.toLocaleString()}</span>
            </div>
          </div>

          {metadata.primaryLanguage && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
              <Code2 className="h-4 w-4 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Language</span>
                <span className="text-sm font-black font-mono text-white truncate">{metadata.primaryLanguage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mr-1">
            Stack:
          </span>
          {analysis.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-white/[0.06] border border-white/[0.1] px-3 py-1 text-xs font-mono font-semibold text-zinc-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
