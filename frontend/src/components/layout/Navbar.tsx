'use client';

import Link from 'next/link';
import { GitBranch, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import useSWR from 'swr';
import { getGithubSession, getGithubConnectUrl, disconnectGithub } from '@/lib/api';

export function Navbar() {
  const { data: session, isLoading, mutate } = useSWR('github-session', getGithubSession);

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

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {/* GitHub Connection Badge / Button */}
          {!isLoading && (
            session?.connected ? (
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full pl-1.5 pr-2.5 py-1">
                <img
                  src={session.avatarUrl}
                  alt={session.login}
                  className="h-5 w-5 rounded-full border border-white/20"
                />
                <span className="text-xs font-mono text-zinc-300">@{session.login}</span>
                <button
                  onClick={async () => {
                    await disconnectGithub();
                    mutate({ connected: false });
                  }}
                  className="text-zinc-500 hover:text-rose-400 transition-colors ml-1"
                  title="Disconnect GitHub"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <a
                href={getGithubConnectUrl(typeof window !== 'undefined' ? window.location.pathname : '/')}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/[0.12] bg-white/[0.04] text-zinc-200 hover:text-white hover:bg-white/[0.08] text-xs font-semibold transition-all shadow-sm"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Connect GitHub</span>
              </a>
            )
          )}

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



