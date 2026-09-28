'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRecommendations, ApiError } from '@/lib/api';
import { loadProfile, saveProfile, saveSessionId, subscribeProfile, StoredProfile } from '@/lib/profile';
import { IssueCard } from './IssueCard';
import { IssueFilters, IssueFilterState } from './IssueFilters';
import type { Experience, Recommendation } from '@/types';

const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function ProfileQuickForm({ onSubmit }: { onSubmit: (profile: StoredProfile) => void }) {
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState<Experience>('intermediate');
  const [availableHours, setAvailableHours] = useState('3');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.1] shadow-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-300" />
          <span>Profile Required</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Set Your Developer Profile</h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Calibrate your tech skills and available time to generate ranked contribution recommendations for this repository.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="skills" className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Your Skills (comma-separated)
          </Label>
          <Input
            id="skills"
            placeholder="React, TypeScript, Node.js, Python..."
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="h-12 bg-white/[0.03] text-white text-sm border-white/[0.1] rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Experience Level
            </Label>
            <Select value={experience} onValueChange={(v) => v && setExperience(v as Experience)}>
              <SelectTrigger className="h-12 bg-white/[0.03] text-white border-white/[0.1] rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white border-white/[0.1]">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="hours" className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Available Time (Hours)
            </Label>
            <Input
              id="hours"
              type="number"
              min={1}
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              className="h-12 bg-white/[0.03] text-white border-white/[0.1] rounded-2xl text-sm font-mono"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-xl">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="h-12 w-full rounded-full bg-white text-black font-extrabold text-sm hover:bg-[#e8e8ed] active:scale-[0.98] transition-all shadow-xl mt-2"
          onClick={() => {
            const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
            const hours = Number(availableHours);
            if (skills.length === 0) return setError('Enter at least one skill.');
            if (!Number.isFinite(hours) || hours <= 0) return setError('Available hours must be a positive number.');
            onSubmit({ skills, experience, availableHours: hours });
          }}
        >
          Generate My Ranked Recommendations
        </Button>
      </div>
    </div>
  );
}

function getServerProfileSnapshot() {
  return null;
}

export function RecommendationsView({ owner, repo }: { owner: string; repo: string }) {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, getServerProfileSnapshot);
  const [filters, setFilters] = useState<IssueFilterState>({ search: '', difficulty: 'all', skill: 'all' });

  const recommendationKey = profile
    ? {
        owner,
        repo,
        skills: profile.skills,
        experience: profile.experience,
        availableHours: profile.availableHours,
      }
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    recommendationKey,
    async (key) => {
      const sessionId = loadProfile()?.sessionId;
      const res = await getRecommendations({ ...key, sessionId });
      saveSessionId(res.sessionId);
      return res.recommendations;
    },
    { shouldRetryOnError: false }
  );

  const availableSkills = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.forEach((r) => r.requiredSkills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r: Recommendation) => {
      if (filters.difficulty !== 'all' && r.difficulty !== filters.difficulty) return false;
      if (filters.skill !== 'all' && !r.requiredSkills.includes(filters.skill)) return false;
      if (filters.search && !r.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [data, filters]);

  if (!profile) {
    return <ProfileQuickForm onSubmit={(p) => saveProfile(p)} />;
  }

  if (isLoading) {
    return (
      <div className="apple-card p-10 sm:p-14 text-center border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center gap-4 animate-fade-in-up">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-mono text-zinc-400 mb-2">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Deterministic Match Engine Active</span>
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Ranking Open Issues By Fit</h3>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Extracting candidate issues, checking PR history, estimating difficulty curves, and scoring match against your skills.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/30 text-rose-300 rounded-2xl p-5">
        <AlertDescription className="flex flex-col gap-3 text-xs sm:text-sm">
          <span>{error instanceof ApiError ? error.message : 'Failed to load recommendations.'}</span>
          <Button
            variant="outline"
            size="sm"
            className="w-fit border-rose-500/40 bg-transparent text-rose-200 hover:bg-rose-500/10"
            onClick={() => mutate()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="apple-card p-8 text-center border border-white/[0.08] shadow-lg">
        <p className="text-sm text-zinc-300">
          No strong contribution opportunities found for this repository right now. Try adjusting your skills or time commitment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <IssueFilters state={filters} onChange={setFilters} availableSkills={availableSkills} />
      {filtered.length === 0 ? (
        <div className="apple-card p-8 text-center border border-white/[0.08]">
          <p className="text-xs sm:text-sm text-zinc-400">No issues match the selected filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((rec: Recommendation) => (
            <IssueCard key={rec.issueNumber} recommendation={rec} owner={owner} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
