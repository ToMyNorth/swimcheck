import { cn } from '@/lib/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  /** When true, renders a larger card with a blue accent for the overall score */
  highlight?: boolean;
  /** Optional subtitle shown below the score */
  subtitle?: string;
  className?: string;
}

/**
 * Returns a Tailwind text-colour class based on score thresholds.
 *   ≥ 80  → green  (good)
 *   ≥ 60  → amber  (needs work)
 *   <  60 → red    (poor)
 */
function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function ScoreCard({ label, score, highlight, subtitle, className }: ScoreCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        highlight
          ? 'border-blue-500 bg-blue-50/60 shadow-sm dark:border-blue-400 dark:bg-blue-950/30'
          : 'border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>

      <p className={cn('mt-1 font-bold tabular-nums', scoreColor(score), highlight ? 'text-4xl' : 'text-2xl')}>
        {score}
      </p>

      {subtitle && (
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
