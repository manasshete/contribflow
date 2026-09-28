'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  GitBranch,
  Sparkles,
  ArrowRight,
  Clock,
  Code2,
  Check,
  Star,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { analyzeRepository, ApiError } from '@/lib/api';
import { saveProfile } from '@/lib/profile';
import { cn } from '@/lib/utils';
import type { Experience } from '@/types';

interface CuratedRepo {
  ownerRepo: string;
  url: string;
  name: string;
  stars: string;
  defaultSkills: string[];
  description: string;
}

const CURATED_REPOS: CuratedRepo[] = [
  {
    ownerRepo: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
    name: 'Next.js',
    stars: '124k',
    defaultSkills: ['TypeScript', 'React', 'Node.js'],
    description: 'The React Framework for the Web',
  },
  {
    ownerRepo: 'expressjs/express',
    url: 'https://github.com/expressjs/express',
    name: 'Express',
    stars: '65k',
    defaultSkills: ['JavaScript', 'Node.js'],
    description: 'Fast, unopinionated Node web framework',
  },
  {
    ownerRepo: 'Anil-matcha/Open-Generative-AI',
    url: 'https://github.com/Anil-matcha/Open-Generative-AI',
    name: 'Open GenAI',
    stars: '2.5k',
    defaultSkills: ['JavaScript', 'React', 'Python'],
    description: 'Open source generative AI platform',
  },
];

const POPULAR_SKILLS = [
  'TypeScript',
  'React',
  'JavaScript',
  'Node.js',
  'Python',
  'Go',
  'Rust',
  'Docker',
  'Tailwind CSS',
  'GraphQL',
];

const EXPERIENCE_OPTIONS: { value: Experience; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'First issues & documentation' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Features & bug fixes' },
  { value: 'advanced', label: 'Advanced', desc: 'Architecture & core systems' },
];

const TIME_PRESETS = [
  { hours: 1, label: '1 hr' },
  { hours: 3, label: '3 hrs' },
  { hours: 5, label: '5 hrs' },
  { hours: 10, label: '10+ hrs' },
];

export function AnalyzeForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState<Experience>('intermediate');
  const [availableHours, setAvailableHours] = useState(3);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function toggleSkill(skill: string) {
    const current = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (current.includes(skill)) {
      setSkillsInput(current.filter((s) => s !== skill).join(', '));
    } else {
      setSkillsInput([...current, skill].join(', '));
    }
  }

  function selectCurated(repo: CuratedRepo) {
    setUrl(repo.url);
    setSkillsInput(repo.defaultSkills.join(', '));
    setError(null);
  }

  function adjustHours(delta: number) {
    setAvailableHours((prev) => Math.max(1, Math.min(40, prev + delta)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (!url.trim()) {
      setError('Please enter a public GitHub repository URL.');
      return;
    }
    if (skills.length === 0) {
      setError('Select or enter at least one skill to match issues.');
      return;
    }
    if (availableHours <= 0) {
      setError('Available time must be at least 1 hour.');
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    const stepTimer = setTimeout(() => {
      setLoadingStep(2);
    }, 1500);

    try {
      const analysis = await analyzeRepository(url.trim());
      setLoadingStep(3);
      saveProfile({ skills, experience, availableHours });
      router.push(`/repository/${analysis.owner}/${analysis.repo}`);
    } catch (err) {
      clearTimeout(stepTimer);
      setError(err instanceof ApiError ? err.message : 'Something went wrong analyzing that repository.');
      setLoading(false);
      setLoadingStep(0);
    }
  }

  const selectedSkillsList = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="w-full relative">
      {/* Background ambient radial glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/[0.1] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Studio Card */}
      <div className="apple-card p-6 sm:p-10 border border-white/[0.1] shadow-2xl relative overflow-hidden">
        {/* Apple Centered Clean Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 mb-4 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Calibration Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Analyze Any Repository
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Input a repository and calibrate your skills. ContribFlow parses codebase architectures, checks PR history, and matches open issues using a deterministic rule-based engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section 1: GitHub URL */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="url" className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                GitHub Repository URL
              </label>
              <span className="text-xs text-zinc-500 font-mono">Public repositories</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <GitBranch className="h-4 w-4" />
              </div>
              <Input
                id="url"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="h-13 pl-11 pr-4 bg-white/[0.03] text-white text-sm border-white/[0.12] rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all font-mono placeholder:text-zinc-600"
              />
            </div>

            {/* Curated Repositories Grid */}
            <div className="pt-1">
              <span className="text-xs text-zinc-400 mb-2.5 block font-medium">Or select a popular target:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CURATED_REPOS.map((repo) => {
                  const isSelected = url.trim() === repo.url;
                  return (
                    <button
                      key={repo.ownerRepo}
                      type="button"
                      onClick={() => selectCurated(repo)}
                      disabled={loading}
                      className={cn(
                        'flex flex-col text-left p-3.5 rounded-2xl border transition-all text-xs',
                        isSelected
                          ? 'bg-white/10 border-white/50 text-white shadow-lg'
                          : 'bg-white/[0.02] border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-white text-sm">{repo.name}</span>
                        <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 shrink-0">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          {repo.stars}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 line-clamp-1">{repo.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Skills Calibration */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="skills" className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Your Skills
              </label>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedSkillsList.length > 0 ? `${selectedSkillsList.length} selected` : 'Type or click below'}
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Code2 className="h-4 w-4" />
              </div>
              <Input
                id="skills"
                placeholder="TypeScript, React, Node.js, Python, Go..."
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                disabled={loading}
                className="h-13 pl-11 pr-4 bg-white/[0.03] text-white text-sm border-white/[0.12] rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/10 transition-all placeholder:text-zinc-600"
              />
            </div>

            {/* Quick Skill Cloud */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = selectedSkillsList.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={loading}
                    className={cn(
                      'h-8 px-3.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
                      isSelected
                        ? 'bg-white text-black font-bold shadow-md scale-105'
                        : 'bg-white/[0.03] text-zinc-300 border border-white/[0.08] hover:border-white/20 hover:text-white'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Experience & Time Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/[0.06]">
            {/* Experience Level */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Experience Level
              </label>

              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isActive = experience === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setExperience(opt.value)}
                      disabled={loading}
                      className={cn(
                        'w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center',
                        isActive
                          ? 'bg-white text-black shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <span className="text-xs text-zinc-400">
                {EXPERIENCE_OPTIONS.find((o) => o.value === experience)?.desc}
              </span>
            </div>

            {/* Available Hours */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Available Time
                </label>
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  {availableHours} {availableHours === 1 ? 'hour' : 'hours'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="grid grid-cols-4 gap-1.5 flex-1 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  {TIME_PRESETS.map((p) => {
                    const isActive = availableHours === p.hours;
                    return (
                      <button
                        key={p.hours}
                        type="button"
                        onClick={() => setAvailableHours(p.hours)}
                        disabled={loading}
                        className={cn(
                          'py-2.5 rounded-xl text-xs font-mono font-bold transition-all text-center',
                          isActive
                            ? 'bg-white text-black shadow-md'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        )}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stepper buttons for precision */}
                <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl shrink-0">
                  <button
                    type="button"
                    onClick={() => adjustHours(-1)}
                    disabled={loading || availableHours <= 1}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-white">
                    {availableHours}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustHours(1)}
                    disabled={loading || availableHours >= 40}
                    className="h-8 w-8 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <span className="text-xs text-zinc-400">
                Filters issues tailored to your exact time commitment.
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-2xl">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Apple-grade Loading Step Indicator */}
          {loading && (
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 flex flex-col gap-3 animate-fade-in-up">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-300 font-semibold flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  {loadingStep === 1 && '1/3 Connecting to GitHub Octokit...'}
                  {loadingStep === 2 && '2/3 Parsing codebase architecture & issues...'}
                  {loadingStep >= 3 && '3/3 Calculating match scores...'}
                </span>
                <span className="text-emerald-400 font-bold">Processing</span>
              </div>
              <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-700 ease-out"
                  style={{ width: loadingStep === 1 ? '35%' : loadingStep === 2 ? '70%' : '95%' }}
                />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full text-base font-extrabold rounded-full bg-white text-black hover:bg-[#e8e8ed] active:scale-[0.99] transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Calibrating Contribution Engine…</span>
              </>
            ) : (
              <>
                <span>Launch Analysis &amp; Match Issues</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
