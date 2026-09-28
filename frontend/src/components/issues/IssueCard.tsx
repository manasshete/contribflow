import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Plus,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCode2,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';
import { MatchBadge } from './MatchBadge';
import type { Recommendation } from '@/types';

const RISK_BADGES: Record<
  Recommendation['risk'],
  { label: string; icon: typeof ShieldCheck; style: string }
> = {
  Low: {
    label: 'Low Risk',
    icon: ShieldCheck,
    style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  Medium: {
    label: 'Medium Risk',
    icon: AlertTriangle,
    style: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
  High: {
    label: 'High Risk',
    icon: ShieldAlert,
    style: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
};

export function IssueCard({
  recommendation,
  owner,
  repo,
}: {
  recommendation: Recommendation;
  owner: string;
  repo: string;
}) {
  const { matchingSkills, relevantFiles } = recommendation;
  const riskConfig = RISK_BADGES[recommendation.risk] ?? RISK_BADGES.Medium;
  const RiskIcon = riskConfig.icon;

  return (
    <div className="apple-card group relative overflow-hidden rounded-3xl border border-white/[0.08] p-6 transition-all duration-300 hover:border-white/20 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Dominant Left Match Badge Anchor */}
        <div className="shrink-0 self-start sm:self-auto">
          <MatchBadge score={recommendation.matchScore} />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {/* Header & Meta Row */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5 text-zinc-400" />
                <span>Issue #{recommendation.issueNumber}</span>
              </span>
              <a
                href={`https://github.com/${owner}/${repo}/issues/${recommendation.issueNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              {recommendation.title}
            </h3>
          </div>

          {/* Meta Chips Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="capitalize rounded-full bg-white/[0.05] px-3 py-1 font-mono text-xs font-semibold text-zinc-300 border border-white/[0.08]">
              {recommendation.difficulty}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 font-mono text-xs text-zinc-300 border border-white/[0.08]">
              <Clock className="h-3 w-3 text-zinc-400" /> {recommendation.estimatedTime}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-mono font-semibold ${riskConfig.style}`}
            >
              <RiskIcon className="h-3.5 w-3.5" /> {riskConfig.label}
            </span>
          </div>

          {/* Explanation Reason */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {recommendation.reason}
          </p>

          {/* Explainable Checklist */}
          {recommendation.reasons.length > 0 && (
            <ul className="flex flex-col gap-1">
              {recommendation.reasons.map((r) => (
                <li key={r} className="flex items-start gap-1.5 text-xs text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Differentiated Skill Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mr-1">
              Skills:
            </span>
            {recommendation.requiredSkills.map((skill) => {
              const isMatch = matchingSkills.includes(skill);
              return isMatch ? (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono px-2.5 py-0.5"
                >
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  {skill}
                </span>
              ) : (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 bg-white/[0.03] text-zinc-400 text-xs font-normal font-mono px-2.5 py-0.5"
                >
                  <Plus className="h-3 w-3 text-zinc-500" />
                  {skill}
                </span>
              );
            })}
          </div>

          {/* Monospace Codebase Files View */}
          {relevantFiles && relevantFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-xs">
              <FileCode2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase font-semibold">Targets:</span>
              {relevantFiles.slice(0, 3).map((file) => (
                <code
                  key={file}
                  className="rounded-lg bg-black/60 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-white/[0.08]"
                >
                  {file}
                </code>
              ))}
              {relevantFiles.length > 3 && (
                <span className="font-mono text-[10px] text-zinc-500">+{relevantFiles.length - 3} files</span>
              )}
            </div>
          )}

          {/* Single Clear Apple / Nike Capsule CTA */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              Step-by-step guidance &amp; code suggestions
            </span>
            <Link
              href={`/repository/${owner}/${repo}/issues/${recommendation.issueNumber}`}
              className="h-10 px-5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md ml-auto"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
