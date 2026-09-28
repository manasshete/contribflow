'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Difficulty } from '@/types';

export interface IssueFilterState {
  search: string;
  difficulty: Difficulty | 'all';
  skill: string | 'all';
}

export function IssueFilters({
  state,
  onChange,
  availableSkills,
}: {
  state: IssueFilterState;
  onChange: (next: IssueFilterState) => void;
  availableSkills: string[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Search issues…"
        value={state.search}
        onChange={(e) => onChange({ ...state, search: e.target.value })}
        className="sm:max-w-xs"
      />

      <Select value={state.difficulty} onValueChange={(v) => onChange({ ...state, difficulty: (v ?? 'all') as IssueFilterState['difficulty'] })}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All difficulties</SelectItem>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

      <Select value={state.skill} onValueChange={(v) => onChange({ ...state, skill: v ?? 'all' })}>
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Skill" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All skills</SelectItem>
          {availableSkills.map((skill) => (
            <SelectItem key={skill} value={skill}>
              {skill}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
