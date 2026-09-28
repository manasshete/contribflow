'use client';

import { Search } from 'lucide-react';
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
    <div className="flex flex-col gap-3 sm:flex-row items-center justify-between p-2 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
      <div className="relative w-full sm:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Filter recommendations…"
          value={state.search}
          onChange={(e) => onChange({ ...state, search: e.target.value })}
          className="h-10 pl-9 pr-4 bg-white/[0.03] text-white text-xs border-white/[0.1] rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/20"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={state.difficulty}
          onValueChange={(v) =>
            onChange({ ...state, difficulty: (v ?? 'all') as IssueFilterState['difficulty'] })
          }
        >
          <SelectTrigger className="h-10 text-xs bg-white/[0.03] text-white border-white/[0.1] rounded-xl sm:w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/[0.1] text-white text-xs">
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={state.skill}
          onValueChange={(v) => onChange({ ...state, skill: v ?? 'all' })}
        >
          <SelectTrigger className="h-10 text-xs bg-white/[0.03] text-white border-white/[0.1] rounded-xl sm:w-44">
            <SelectValue placeholder="Skill" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/[0.1] text-white text-xs">
            <SelectItem value="all">All skills</SelectItem>
            {availableSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
