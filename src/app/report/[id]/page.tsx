import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { ShareButton } from '@/components/share/ShareButton';
import { AICoachSection } from '@/components/report/AICoachSection';
import type { StrokeScores } from '@/lib/analysis/scorer';

interface ReportPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scores?: string }>;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-emerald-500';
  if (score >= 60) return 'stroke-amber-500';
  return 'stroke-red-500';
}

function OverallScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className={`${scoreRingColor(score)} transition-all duration-1000`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold tabular-nums ${scoreColor(score)}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { id } = await params;
  const resolved = await searchParams;

  if (!resolved.scores) {
    notFound();
  }

  let scores: StrokeScores;
  try {
    scores = JSON.parse(resolved.scores) as StrokeScores;
  } catch {
    notFound();
  }

  // Validate scores structure
  if (typeof scores.overall !== 'number') {
    notFound();
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const metrics = [
    { label: 'Body Alignment', score: scores.bodyAlignment, subtitle: 'Horizontal tilt' },
    { label: 'Arm Entry (L)', score: scores.armEntryLeft, subtitle: 'Left arm angle' },
    { label: 'Arm Entry (R)', score: scores.armEntryRight, subtitle: 'Right arm angle' },
    { label: 'Head Position', score: scores.headPosition, subtitle: 'Neutral spine' },
    { label: 'Body Roll', score: scores.bodyRoll, subtitle: 'Rotation proxy' },
    { label: 'Symmetry', score: scores.symmetry, subtitle: 'L/R balance' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Stroke Analysis Report</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton reportId={id} scores={scores} />
        </div>
      </div>

      <div className="space-y-8">
        {/* ── Overall Score Card ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 py-10 sm:flex-row sm:gap-10 sm:py-12">
            <OverallScoreRing score={scores.overall} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Overall Stroke Score
              </p>
              <p className={`mt-1 text-5xl font-bold tabular-nums ${scoreColor(scores.overall)}`}>
                {scores.overall}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {scores.overall >= 80
                  ? 'Excellent form! Your freestyle technique is solid. Focus on fine-tuning.'
                  : scores.overall >= 60
                  ? 'Good foundation with room for improvement. Targeted drills will help.'
                  : 'Key areas need attention. Follow the recommendations below to improve.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Metrics Grid ───────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Stroke Metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <ScoreCard
                key={m.label}
                label={m.label}
                score={m.score}
                subtitle={m.subtitle}
              />
            ))}
          </div>
        </div>

        {/* ── AI Coach Feedback ──────────────────────────────────────────────── */}
        <AICoachSection scores={scores} analysisId={id} />

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-center">
          <a href="/analyze" className={buttonVariants({ variant: 'outline' }) + ' gap-2'}>
            <ArrowLeft className="h-4 w-4" />
            Analyze Another Photo
          </a>
          <ShareButton reportId={id} scores={scores} />
        </div>
      </div>
    </div>
  );
}
