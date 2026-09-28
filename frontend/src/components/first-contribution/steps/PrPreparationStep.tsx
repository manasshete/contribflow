import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistGroup } from '../ChecklistGroup';
import type { ChecklistItem } from '@/types';

export function PrPreparationStep({
  owner,
  repo,
  checklist,
  onToggle,
  onNext,
}: {
  owner: string;
  repo: string;
  checklist: ChecklistItem[];
  onToggle: (id: string, done: boolean) => void;
  onNext: () => void;
}) {
  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 7 of 8</span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">Prepare Your PR</h1>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">Before opening your PR, confirm the following.</p>
      </div>

      <div className="flex flex-col gap-5">
        <ChecklistGroup title="Code" items={checklist.filter((c) => c.section === 'pr-code')} onToggle={onToggle} />
        <ChecklistGroup title="PR Description" items={checklist.filter((c) => c.section === 'pr-meta')} onToggle={onToggle} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 self-end">
        <a
          href={`https://github.com/${owner}/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 px-6 rounded-full bg-white/[0.06] border border-white/[0.1] text-white font-bold text-xs hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
        >
          <span>Open GitHub Repository</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Button
          onClick={onNext}
          className="h-12 px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          <span>I&apos;m Ready to Submit My PR</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
