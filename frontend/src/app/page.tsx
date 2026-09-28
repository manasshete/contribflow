import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { InteractiveShowcase } from '@/components/home/InteractiveShowcase';

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-[#050507] text-[#f5f5f7]">
      {/* Background ambient radial aura (Apple Pro Keynote style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/[0.12] via-purple-500/[0.05] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[600px] left-1/4 w-[600px] h-[400px] bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-12 animate-fade-in-up">
        {/* Apple-style Eyebrow pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-xl mb-6 shadow-sm hover:border-white/20 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">ContribFlow 1.0</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400">Powered by Deterministic Repository Intelligence</span>
        </div>

        {/* Nike + Apple Monumental Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-white">
          <span className="titanium-text block">Find it. Match it.</span>
          <span className="block mt-1">Ship it.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-xl text-zinc-400 font-normal leading-relaxed">
          Point at any public GitHub repository. ContribFlow parses codebase architectures, filters open issues by fit and difficulty, and hands you an executable file-by-file blueprint in seconds.
        </p>

        {/* Dual Apple / Nike Capsule CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/analyze"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black font-extrabold text-sm hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-white/10"
          >
            <span>Find My Contribution</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#live-showcase"
            className="w-full sm:w-auto h-12 px-7 rounded-full border border-white/[0.14] bg-white/[0.05] text-white font-semibold text-xs hover:bg-white/[0.1] active:scale-[0.98] transition-all flex items-center justify-center gap-2 backdrop-blur-xl"
          >
            <span>Explore Live Demo</span>
            <span className="text-zinc-500 font-mono text-[10px]">⌘D</span>
          </a>
        </div>

        {/* Nike Precision Stat Ticker */}
        <div className="mt-12 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/[0.08] text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">94%</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">Match Precision</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">&lt; 2.5s</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">Match Scoring</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">0 Clones</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">Zero Overhead</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">100%</div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mt-1">Ground Truth PRs</div>
          </div>
        </div>
      </section>

      {/* Interactive Apple Pro Live Showcase Section */}
      <section id="live-showcase" className="w-full max-w-5xl px-6 py-12 sm:py-16 scroll-mt-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            Interactive Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Engineered for real-world codebases.
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl mx-auto">
            Switch between real repositories below to inspect how ContribFlow ranks issues, analyzes risks, and resolves code targets.
          </p>
        </div>

        <InteractiveShowcase />
      </section>

      {/* Nike Bento Feature Matrix: Performance & Engineering */}
      <section id="performance" className="w-full max-w-6xl px-6 py-16 sm:py-24 border-t border-white/[0.06] scroll-mt-16">
        <div className="text-center mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            Architecture & Specs
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2">
            Built different. Ship faster.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            We stripped out the bloat of generic chatbots and built a high-precision developer tool optimized for open source velocity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Deterministic Match Engine */}
          <div className="apple-card p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Cpu className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Deterministic Match Engine</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Rule-based scoring over GitHub metadata, labels, and PR history delivers explainable code understanding in under 2 seconds, with zero hallucinations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Explainable scoring</span>
              <span className="text-indigo-400 font-bold">No external AI calls</span>
            </div>
          </div>

          {/* Card 2 - Zero-Clone Octokit Engine */}
          <div className="apple-card p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Zero-Clone Architecture</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Never wait for massive gigabyte git clones. Our intelligent Octokit tree crawler extracts manifests, configs, and key source files directly via the GitHub API.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Zero disk usage</span>
              <span className="text-cyan-400 font-bold">Instant start</span>
            </div>
          </div>

          {/* Card 3 - PR History Grounding */}
          <div className="apple-card p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div>
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 border border-white/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">PR-Grounded Difficulty</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Analyzes recently merged pull requests in related files to detect real-world complexity, preventing you from stepping into deceptive &ldquo;good-first-issues&rdquo;.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Merged PR insights</span>
              <span className="text-emerald-400 font-bold">Honest estimation</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Step Playbook Section (Nike Athletic Game Plan) */}
      <section id="how-it-works" className="w-full max-w-5xl px-6 py-16 sm:py-24 border-t border-white/[0.06] scroll-mt-16">
        <div className="text-center mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            The Contributor Playbook
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-2">
            Three steps to your next merged PR.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-card p-6 border border-white/[0.08]">
            <div className="font-mono text-3xl font-black text-white/20 mb-4">01</div>
            <h4 className="text-lg font-bold text-white mb-2">Drop the URL</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste any public GitHub repository URL. ContribFlow parses structure, manifests, and the issue tracker without cloning.
            </p>
          </div>

          <div className="apple-card p-6 border border-white/[0.08]">
            <div className="font-mono text-3xl font-black text-white/20 mb-4">02</div>
            <h4 className="text-lg font-bold text-white mb-2">Calibrate Your Skills</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Specify your tech stack (React, Python, Go, Node) and available time. Our hybrid ranking matches issues you can actually complete.
            </p>
          </div>

          <div className="apple-card p-6 border border-white/[0.08]">
            <div className="font-mono text-3xl font-black text-white/20 mb-4">03</div>
            <h4 className="text-lg font-bold text-white mb-2">Execute & Ship</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Open the interactive Workspace with step-by-step implementation tasks, precise file targets, and testing guides.
            </p>
          </div>
        </div>
      </section>

      {/* Apple-grade Grand Finale CTA Banner */}
      <section className="w-full max-w-4xl px-6 pb-24">
        <div className="apple-card relative overflow-hidden p-8 sm:p-12 text-center border border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.06] rounded-full blur-3xl pointer-events-none"></div>

          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            Zero Barriers • Zero Friction
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            Stop hesitating. Start contributing.
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            Your next open-source contribution is already waiting. Test your skills on real repositories today.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/analyze"
              className="h-12 px-8 rounded-full bg-white text-black font-extrabold text-sm hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-2xl shadow-white/20"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
