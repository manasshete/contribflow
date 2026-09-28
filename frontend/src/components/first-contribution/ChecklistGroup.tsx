import { Check } from 'lucide-react';
import type { ChecklistItem } from '@/types';

export function ChecklistGroup({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: ChecklistItem[];
  onToggle: (id: string, done: boolean) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-2">{title}</span>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.06] cursor-pointer hover:border-white/20 transition-colors"
          >
            <button
              type="button"
              onClick={() => onToggle(item.id, !item.done)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                item.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/[0.03]'
              }`}
            >
              {item.done && <Check className="h-3.5 w-3.5 text-black stroke-[3]" />}
            </button>
            <span className={`text-xs sm:text-sm ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
