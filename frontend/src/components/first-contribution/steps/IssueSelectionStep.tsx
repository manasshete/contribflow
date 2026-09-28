'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, HeartPulse, Loader2 } from 'lucide-react';
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
}: {
  recommendations: Recommendation[] | null;
  onSubmitProfile: (profile: {
    skills: string[];
    experience: Experience;
    availableHours: number;
    preferredType: IssueType | 'Any';
  }) => Promise<void>;
  onChooseIssue: (issueNumber: number) => void;
}) {
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState<Experience>('beginner');
  const [hours, setHours] = useState(TIME_BUCKETS[1].hours);
  const [preferredType, setPreferredType] = useState<IssueType | 'Any'>('Any');
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
    } catch {
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 2 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Find Your Issue</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Tell us about your skills and available time so we can find the best-fitting issue for you.
        </p>
      </div>

      {!recommendations && (
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

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{submitting ? 'Finding issues...' : 'Find My Issues'}</span>
          </Button>
        </div>
      )}

      {recommendations && (
        <div className="flex flex-col gap-4">
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
