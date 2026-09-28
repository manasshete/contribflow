import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChecklistGroup } from '../ChecklistGroup';
import type { ChecklistItem } from '@/types';

export function ChecklistStep({
  checklist,
  onToggle,
  onNext,
}: {
  checklist: ChecklistItem[];
  onToggle: (id: string, done: boolean) => void;
  onNext: () => void;
}) {
  const relevant = checklist.filter((c) => c.section === 'understand' || c.section === 'implement' || c.section === 'verify');
  const done = relevant.filter((c) => c.done).length;

  return (
    <div className="apple-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Step 6 of 8</span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">Your Contribution Checklist</h1>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-400">
          {done} / {relevant.length} completed
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <ChecklistGroup title="Understand" items={checklist.filter((c) => c.section === 'understand')} onToggle={onToggle} />
        <ChecklistGroup title="Implement" items={checklist.filter((c) => c.section === 'implement')} onToggle={onToggle} />
        <ChecklistGroup title="Verify" items={checklist.filter((c) => c.section === 'verify')} onToggle={onToggle} />
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-fit px-6 rounded-full bg-white text-black font-extrabold text-xs hover:bg-[#e8e8ed] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl self-end"
      >
        <span>Prepare My PR</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
