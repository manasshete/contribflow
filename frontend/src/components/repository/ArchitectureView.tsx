import { Layers } from 'lucide-react';
import type { Architecture } from '@/types';

const LABELS: { key: keyof Architecture; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'database', label: 'Database' },
  { key: 'testing', label: 'Testing' },
];

export function ArchitectureView({ architecture }: { architecture: Architecture }) {
  const entries = LABELS.filter(({ key }) => architecture[key]);

  return (
    <div className="apple-card p-6 border border-white/[0.08] shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-zinc-300" />
            <span>Architecture Breakdown</span>
          </h2>
          <span className="rounded-full bg-white/[0.08] border border-white/[0.1] px-2.5 py-0.5 text-[10px] font-mono font-bold capitalize text-zinc-200">
            {architecture.type.replace(/-/g, ' ')}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Identified project archetype based on repository manifests, directory hierarchy, and dependency graphs.
          </p>

          {entries.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {entries.map(({ key, label }) => (
                <div key={key} className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
                  <span className="text-zinc-500 font-mono uppercase text-[10px] font-semibold block">
                    {label}
                  </span>
                  <span className="font-bold text-white text-xs mt-1 block truncate">
                    {architecture[key]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
