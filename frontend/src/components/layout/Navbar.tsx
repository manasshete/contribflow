import Link from 'next/link';
import { GitBranch, Sparkles, ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 apple-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-black shadow-sm">
            <GitBranch className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-tight text-white">ContribFlow</span>
            <span className="hidden sm:inline-block rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/[0.06]">
              Deterministic Engine
            </span>
          </div>
        </Link>

        {/* Center Nav - Apple minimal typography */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#86868b]">
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#live-showcase" className="hover:text-white transition-colors">
            Live Showcase
          </Link>
          <Link href="/#performance" className="hover:text-white transition-colors">
            Performance
          </Link>
          <Link href="/analyze" className="hover:text-white transition-colors flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" /> Engine
          </Link>
        </nav>

        {/* Right CTA - Apple capsule button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 border border-white/[0.08] rounded-full px-2.5 py-1 bg-white/[0.03]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero-Clone</span>
          </div>

          <Link
            href="/analyze"
            className="group h-8 px-4 rounded-full bg-white text-black font-bold text-xs hover:bg-[#e8e8ed] active:scale-[0.97] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Analyze Repo</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}



