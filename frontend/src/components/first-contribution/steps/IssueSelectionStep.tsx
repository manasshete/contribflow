'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, HeartPulse, Loader2, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MatchBadge } from '@/components/issues/MatchBadge';
import type { Experience, IssueType, Recommendation } from '@/types';

const TIME_BUCKETS: { label: string; hours: number }[] = [
  { label: '< 1 hour', hours: 0.5 },
  { label: '1–3 hours', hours: 2 },
  { label: '3–6 hours', hours: 4.5 },
  { label: '6+ hours', hours: 8 },
];

const TYPE_OPTIONS: (IssueType | 'Any')[] = ['Any', 'Bug', 'Feature', 'Documentation', 'Testing', 'Refactor'];

export function IssueSelectionStep({
  recommendations,
  onSubmitProfile,
  onChooseIssue,
  initialProfile,
  onResetProfile,
  owner,
  repo,
}: {
  recommendations: Recommendation[] | null;
  onSubmitProfile: (profile: {
    skills: string[];
    experience: Experience;
    availableHours: number;
    preferredType: IssueType | 'Any';
  }) => Promise<void>;
  onChooseIssue: (issueNumber: number) => void;
  initialProfile?: {
    skills?: string[];
    experience?: Experience;
    availableHours?: number;
    preferredType?: IssueType | 'Any';
  };
  onResetProfile?: () => void;
  owner?: string;
  repo?: string;
}) {
  const [skillsInput, setSkillsInput] = useState(initialProfile?.skills?.join(', ') ?? '');
  const [experience, setExperience] = useState<Experience>(initialProfile?.experience ?? 'beginner');
  const [hours, setHours] = useState(initialProfile?.availableHours ?? TIME_BUCKETS[1].hours);
  const [preferredType, setPreferredType] = useState<IssueType | 'Any'>(initialProfile?.preferredType ?? 'Any');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<number | null>(null);

  async function handleSubmit() {
    const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (skills.length === 0) return setError('Enter at least one skill.');
    setError(null);
    setSubmitting(true);
    try {
      await onSubmitProfile({ skills, experience, availableHours: hours, preferredType });
      setIsEditing(false);
    } catch {
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ponytail: explicitly distinguish between form, results, and 0-matches state (avoids JS ![] truthiness bug)
  const showForm = recommendations === null || isEditing;
  const showEmpty = recommendations !== null && recommendations.length === 0 && !isEditing;
  const showRecommendations = recommendations !== null && recommendations.length > 0 && !isEditing;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 2 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Find Your Issue</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Tell us about your skills and available time so we can find the best-fitting issue for you.
        </p>
      </div>

      {showForm && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">Your Skills (comma-separated)</Label>
            <Input
              placeholder="React, TypeScript, Node.js..."
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="h-11 bg-white/[0.03] text-white text-sm border-white/[0.1] rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">Experience</Label>
              <Select value={experience} onValueChange={(v) => v && setExperience(v as Experience)}>
                <SelectTrigger className="h-11 bg-white/[0.03] text-white border-white/[0.1] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-white/[0.1]">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">Available Time</Label>
              <Select value={String(hours)} onValueChange={(v) => v && setHours(Number(v))}>
                <SelectTrigger className="h-11 bg-white/[0.03] text-white border-white/[0.1] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-white/[0.1]">
                  {TIME_BUCKETS.map((b) => (
                    <SelectItem key={b.label} value={String(b.hours)}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300">Preferred Type</Label>
              <Select value={preferredType} onValueChange={(v) => v && setPreferredType(v as IssueType | 'Any')}>
                <SelectTrigger className="h-11 bg-white/[0.03] text-white border-white/[0.1] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 text-white border-white/[0.1]">
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end gap-3">
            {isEditing && recommendations && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-12 px-5 rounded-full border-white/[0.1] bg-white/[0.04] text-xs text-zinc-300 hover:text-white"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{submitting ? 'Finding issues...' : 'Find My Issues'}</span>
            </Button>
          </div>
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">No Matching Issues Found</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              We couldn&apos;t find any open issues in this repository matching your current profile. The repository might have no open issues, or they may require different skills or categories.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button
              onClick={() => {
                setIsEditing(true);
                onResetProfile?.();
              }}
              className="h-11 px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all"
            >
              Adjust Profile &amp; Try Again
            </Button>
            {owner && repo && (
              <a
                href={`/repository/${owner}/${repo}`}
                className="h-11 px-5 rounded-full bg-white/[0.06] text-zinc-300 font-semibold text-xs hover:bg-white/[0.1] transition-all inline-flex items-center justify-center border border-white/[0.08]"
              >
                Back to Repository Overview
              </a>
            )}
          </div>
        </div>
      )}

      {showRecommendations && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <span className="text-xs font-mono text-zinc-400">
              Showing top <strong className="text-white">{recommendations.length}</strong> recommended {recommendations.length === 1 ? 'issue' : 'issues'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                onResetProfile?.();
              }}
              className="h-8 px-3 rounded-full border-white/[0.1] bg-white/[0.04] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08]"
            >
              <SlidersHorizontal className="h-3 w-3 mr-1.5" />
              Refine Filters
            </Button>
          </div>
          {recommendations.map((rec) => (
            <div key={rec.issueNumber} className="rounded-2xl bg-white/[0.02] p-5 border border-white/[0.06] flex flex-col sm:flex-row gap-4">
              <MatchBadge score={rec.matchScore} />
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">#{rec.issueNumber} — {rec.title}</h3>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                    <HeartPulse className="h-3.5 w-3.5 text-emerald-400" /> Issue Health: {rec.issueHealth}/100
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="capitalize rounded-full bg-white/[0.06] px-3 py-1 font-mono text-zinc-300 border border-white/[0.08]">
                    {rec.difficulty}
                  </span>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 font-mono text-zinc-300 border border-white/[0.08]">
                    {rec.estimatedTime}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rec.matchingSkills.map((s) => (
                    <span key={s} className="text-xs font-mono text-emerald-400">✓ {s}</span>
                  ))}
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold">Why this is recommended:</span>
                  <ul className="mt-1 flex flex-col gap-1">
                    {rec.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-1.5 text-xs text-zinc-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setChoosing(rec.issueNumber);
                    onChooseIssue(rec.issueNumber);
                  }}
                  disabled={choosing !== null}
                  className="h-10 w-fit px-5 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all mt-1"
                >
                  {choosing === rec.issueNumber ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Choose This Issue'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
