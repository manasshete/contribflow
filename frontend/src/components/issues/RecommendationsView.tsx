'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
    <Card>
      <CardHeader>
        <CardTitle>Tell us about yourself</CardTitle>
        <CardDescription>We need this to rank issues for you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="skills">Your skills (comma-separated)</Label>
          <Input id="skills" placeholder="React, TypeScript, Node.js" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Experience level</Label>
            <Select value={experience} onValueChange={(v) => v && setExperience(v as Experience)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hours">Available time (hours)</Label>
            <Input id="hours" type="number" min={1} value={availableHours} onChange={(e) => setAvailableHours(e.target.value)} />
          </div>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          onClick={() => {
            const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
            const hours = Number(availableHours);
            if (skills.length === 0) return setError('Enter at least one skill.');
            if (!Number.isFinite(hours) || hours <= 0) return setError('Available hours must be a positive number.');
            onSubmit({ skills, experience, availableHours: hours });
          }}
        >
          Show My Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}

function getServerProfileSnapshot() {
  return null;
}

export function RecommendationsView({ owner, repo }: { owner: string; repo: string }) {
  const profile = useSyncExternalStore(subscribeProfile, loadProfile, getServerProfileSnapshot);
  const [filters, setFilters] = useState<IssueFilterState>({ search: '', difficulty: 'all', skill: 'all' });

  // Deliberately excludes `sessionId` from the key: saving the sessionId
  // returned by the API would otherwise mutate this same key mid-flight
  // (profile is read from localStorage) and trigger a second, redundant
  // Groq-backed fetch on every load.
  const recommendationKey = profile
    ? {
        owner,
        repo,
        skills: profile.skills,
        experience: profile.experience,
        availableHours: profile.availableHours,
      }
    : null;

  const { data, error, isLoading } = useSWR(recommendationKey, async (key) => {
    const sessionId = loadProfile()?.sessionId;
    const res = await getRecommendations({ ...key, sessionId });
    saveSessionId(res.sessionId);
    return res.recommendations;
  });

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
      <Card className="border-primary/20 bg-muted/30 p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
            <svg
              className="h-6 w-6 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Analyzing Open Issues with Groq AI...</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Fetching GitHub issues, evaluating code difficulty, and scoring fit for your skills. This takes a few seconds on first analysis.
            </p>
          </div>
          <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
            <Skeleton className="h-4 w-full animate-pulse" />
            <Skeleton className="h-4 w-3/4 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error instanceof ApiError ? error.message : 'Failed to load recommendations.'}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No strong contribution opportunities found for this repository right now. Try adjusting your skills or check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <IssueFilters state={filters} onChange={setFilters} availableSkills={availableSkills} />
      {filtered.length === 0 ? (
        <Alert>
          <AlertDescription>No issues match these filters.</AlertDescription>
        </Alert>
      ) : (
        filtered.map((rec: Recommendation) => <IssueCard key={rec.issueNumber} recommendation={rec} owner={owner} repo={repo} />)
      )}
    </div>
  );
}
