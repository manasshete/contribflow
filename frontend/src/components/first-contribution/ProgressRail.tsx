import { Check } from 'lucide-react';

const NODES: { label: string; steps: number[] }[] = [
  { label: 'Repository', steps: [1] },
  { label: 'Issue', steps: [2, 3] },
  { label: 'Code', steps: [4] },
  { label: 'PR Research', steps: [5] },
  { label: 'Checklist', steps: [6] },
  { label: 'PR Preparation', steps: [7] },
  { label: 'Completion', steps: [8] },
];

export function ProgressRail({
  currentStep,
  completedSteps,
  onSelect,
}: {
  currentStep: number;
  completedSteps: number[];
  onSelect?: (step: number) => void;
}) {
  return (
    <div className="apple-card flex flex-wrap items-center justify-between gap-3 p-4 border border-white/[0.08] shadow-lg">
      {NODES.map((node, i) => {
        const isDone = node.steps.every((s) => completedSteps.includes(s));
        const isCurrent = node.steps.includes(currentStep);
        const clickable = isDone && Boolean(onSelect);
        return (
          <div key={node.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onSelect?.(node.steps[0])}
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-mono font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                    : isCurrent
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] border-white/[0.1] text-zinc-500 cursor-default'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </button>
              <span
                className={`text-[10px] font-mono uppercase tracking-wide ${
                  isCurrent ? 'text-white font-bold' : isDone ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                {node.label}
              </span>
            </div>
            {i < NODES.length - 1 && <div className="h-px w-6 sm:w-10 bg-white/[0.1] mb-4" />}
          </div>
        );
      })}
    </div>
  );
}
