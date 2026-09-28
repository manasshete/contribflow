'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  ShieldCheck,
  FileCode2,
  GitBranch,
  ArrowRight,
  Sparkles,
  Code2,
} from 'lucide-react';

interface ShowcaseProject {
  id: string;
  name: string;
  repoUrl: string;
  skills: string[];
  issueNumber: number;
  issueTitle: string;
  matchScore: number;
  difficulty: string;
  estimatedTime: string;
  risk: string;
  affectedFiles: string[];
  reason: string;
  badgeText: string;
}

const SAMPLE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'nextjs',
    name: 'vercel/next.js',
    repoUrl: 'https://github.com/vercel/next.js',
    skills: ['TypeScript', 'React', 'Node.js'],
    issueNumber: 62418,
    issueTitle: 'Turbopack: Improve error formatting for invalid middleware matcher config',
    matchScore: 96,
    difficulty: 'Intermediate',
    estimatedTime: '2–3 hours',
    risk: 'Low',
    affectedFiles: [
      'packages/next/src/build/webpack/plugins/middleware-plugin.ts',
      'test/e2e/app-dir/middleware-matcher/index.test.ts',
    ],
    reason:
      'The issue matches your TypeScript and React skills. The middleware matcher syntax validator needs a clearer diagnostic message when regex brackets are unclosed. Recent merged PRs touched fewer than 3 files.',
    badgeText: 'Rank #1 Best Fit',
  },
  {
    id: 'openai',
    name: 'Anil-matcha/Open-Generative-AI',
    repoUrl: 'https://github.com/Anil-matcha/Open-Generative-AI',
    skills: ['JavaScript', 'React', 'Python'],
    issueNumber: 42,
    issueTitle: 'Add stream response timeout handling and retry banner in chat UI',
    matchScore: 94,
    difficulty: 'Beginner',
    estimatedTime: '1–2 hours',
    risk: 'Low',
    affectedFiles: [
      'frontend/src/components/Chat/ChatContainer.jsx',
      'frontend/src/utils/streamClient.js',
    ],
    reason:
      'Isolated frontend UI component with clear error callbacks. Perfect entry point for your React skills with zero backend schema migrations required.',
    badgeText: 'Highest Velocity',
  },
  {
    id: 'express',
    name: 'expressjs/express',
    repoUrl: 'https://github.com/expressjs/express',
    skills: ['JavaScript', 'Node.js'],
    issueNumber: 5120,
    issueTitle: 'Normalize deprecation warnings in res.send() for numeric payloads',
    matchScore: 91,
    difficulty: 'Intermediate',
    estimatedTime: '2 hours',
    risk: 'Medium',
    affectedFiles: [
      'lib/response.js',
      'test/res.send.js',
    ],
    reason:
      'Strict JavaScript test suite already written. Requires updating response type check while ensuring backwards compatibility with HTTP 204 no-content headers.',
    badgeText: 'Core Architecture',
  },
];

export function InteractiveShowcase() {
  const [selectedId, setSelectedId] = useState(SAMPLE_PROJECTS[0].id);
  const current = SAMPLE_PROJECTS.find((p) => p.id === selectedId) ?? SAMPLE_PROJECTS[0];

  return (
    <div className="w-full">
      {/* Apple-style interactive tabs pill */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {SAMPLE_PROJECTS.map((project) => {
          const isActive = project.id === selectedId;
          return (
            <button
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                  : 'bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.06]'
              }`}
            >
              <Code2 className="h-3 w-3" />
              <span>{project.name}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Apple Pro Studio Window */}
      <div className="apple-card relative overflow-hidden border border-white/[0.1] p-0 shadow-2xl transition-all duration-500">
        {/* macOS Window Titlebar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]/90 border border-white/10 shadow-xs" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/90 border border-white/10 shadow-xs" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]/90 border border-white/10 shadow-xs" />
            <span className="ml-3 font-mono text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
              <span>{current.name}</span>
              <span className="text-zinc-600 font-normal">/</span>
              <span className="text-zinc-400 font-normal">issues</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="hidden sm:inline-flex items-center gap-1 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
              <Sparkles className="h-3 w-3 text-indigo-400" /> Deterministic Match Engine
            </span>
            <span className="text-emerald-400 font-semibold">Matched in 0.8s</span>
          </div>
        </div>

        {/* Studio Body Grid */}
        <div className="p-6 sm:p-8 flex flex-col gap-6">
          {/* Top Banner Card */}
          <div className="relative rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 border border-white/[0.08] overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-white/10 text-white border border-white/15">
                  {current.badgeText}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Issue #{current.issueNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>{current.matchScore}% Match Score</span>
                </div>
              </div>
            </div>

            <h3 className="mt-4 text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              {current.issueTitle}
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              {current.reason}
            </p>
          </div>

          {/* Nike Precision 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Algorithmic Fit</span>
              <div className="text-xl font-black text-emerald-400 mt-1 flex items-baseline gap-1">
                {current.matchScore}%
                <span className="text-[10px] text-zinc-500 font-normal">confidence</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Est. Completion</span>
              <div className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span>{current.estimatedTime}</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Difficulty Curve</span>
              <div className="text-xl font-black text-amber-300 mt-1">
                {current.difficulty}
              </div>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Repository Risk</span>
              <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>{current.risk} Risk</span>
              </div>
            </div>
          </div>

          {/* Affected Codebase Files & Target Skills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <FileCode2 className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                <span className="font-mono text-[11px] text-zinc-400 uppercase font-semibold">Exact Target Files:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {current.affectedFiles.map((file) => (
                  <code
                    key={file}
                    className="rounded-lg bg-black/60 px-2.5 py-1 font-mono text-[11px] text-zinc-200 border border-white/[0.08]"
                  >
                    {file}
                  </code>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/analyze"
                className="h-10 px-5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg"
              >
                <span>Analyze Any Repo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
