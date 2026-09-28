'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyzeRepository, ApiError } from '@/lib/api';
import { saveProfile } from '@/lib/profile';
import type { Experience } from '@/types';

const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function AnalyzeForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState<Experience>('intermediate');
  const [availableHours, setAvailableHours] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const hours = Number(availableHours);
    if (!url.trim()) {
      setError('Enter a GitHub repository URL.');
      return;
    }
    if (skills.length === 0) {
      setError('Enter at least one skill.');
      return;
    }
    if (!Number.isFinite(hours) || hours <= 0) {
      setError('Available hours must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      const analysis = await analyzeRepository(url.trim());
      saveProfile({ skills, experience, availableHours: hours });
      router.push(`/repository/${analysis.owner}/${analysis.repo}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong analyzing that repository.');
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze a repository</CardTitle>
        <CardDescription>
          Paste a public GitHub repository and tell us about yourself. We&apos;ll do the rest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">GitHub repository URL</Label>
            <Input
              id="url"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="skills">Your skills (comma-separated)</Label>
            <Input
              id="skills"
              placeholder="React, TypeScript, Node.js"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Experience level</Label>
              <Select value={experience} onValueChange={(v) => v && setExperience(v as Experience)} disabled={loading}>
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
              <Input
                id="hours"
                type="number"
                min={1}
                step={1}
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Analyzing repository…' : 'Find My Contribution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
