const TIERS: { min: number; className: string }[] = [
  { min: 80, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { min: 50, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { min: 0, className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
];

export function MatchBadge({ score }: { score: number }) {
  const tier = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${tier.className}`}>
      {score}% match
    </span>
  );
}
