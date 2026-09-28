const TIERS: { min: number; bg: string; text: string; border: string; label: string }[] = [
  {
    min: 80,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    label: 'GREAT MATCH',
  },
  {
    min: 50,
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    label: 'GOOD FIT',
  },
  {
    min: 0,
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-white/10',
    label: 'POTENTIAL',
  },
];

export function MatchBadge({ score }: { score: number }) {
  const tier = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 text-center transition-all ${tier.bg} ${tier.border} min-w-[76px] sm:min-w-[84px] shadow-sm`}
    >
      <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none ${tier.text}`}>
        {score}
        <span className="text-xs font-bold">%</span>
      </span>
      <span className={`mt-1.5 text-[9px] font-mono font-extrabold uppercase tracking-widest ${tier.text}`}>
        {tier.label}
      </span>
    </div>
  );
}
