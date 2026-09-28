import Link from 'next/link';
import { GitBranch, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#050507] text-[#86868b] text-xs transition-colors mt-auto">
      {/* Upper highlight ticker */}
      <div className="border-b border-white/[0.05] bg-white/[0.015] py-3 px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300 font-medium">Match Engine:</span>
            <span className="text-emerald-400 font-semibold">Operational (sub-second)</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Octokit REST API v22</span>
            <span>•</span>
            <span>Zero-Clone AST Pipeline</span>
            <span>•</span>
            <span>Next.js 16</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 text-white font-bold tracking-tight text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-black font-black">
                <GitBranch className="h-3.5 w-3.5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-tight text-base text-white">ContribFlow</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">PRO</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The high-velocity open source recommendation engine. Point to any public GitHub repository, calibrate your skills, and receive an instant, PR-aware contribution game plan with precise file targets.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-500 font-mono">
              <Terminal className="h-3.5 w-3.5" />
              <span>Engineered for developers who ship.</span>
            </div>
          </div>

          {/* Column 1 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-mono">Product</span>
            <Link href="/analyze" className="hover:text-white transition-colors">Analyze Repository</Link>
            <Link href="/analyze" className="hover:text-white transition-colors">Skill Matcher</Link>
            <Link href="/analyze" className="hover:text-white transition-colors">Contribution Blueprints</Link>
            <Link href="/analyze" className="hover:text-white transition-colors">Interactive Workspace</Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-mono">Intelligence</span>
            <span className="hover:text-white transition-colors cursor-default">Deterministic Match Engine</span>
            <span className="hover:text-white transition-colors cursor-default">PR History Grounding</span>
            <span className="hover:text-white transition-colors cursor-default">Difficulty Estimator</span>
            <span className="hover:text-white transition-colors cursor-default">AST File Resolver</span>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-mono">Architecture</span>
            <span className="hover:text-white transition-colors cursor-default">Zero-Clone Engine</span>
            <span className="hover:text-white transition-colors cursor-default">Rate Limiter Safe</span>
            <span className="hover:text-white transition-colors cursor-default">Clean Provider Abstraction</span>
            <span className="hover:text-white transition-colors cursor-default">Explainable Scoring</span>
          </div>
        </div>

        {/* Bottom Fine Print (Apple minimal style) */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} ContribFlow Inc. All rights reserved. Built with precision.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/analyze" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/analyze" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/analyze" className="hover:text-zinc-300 transition-colors">System Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
