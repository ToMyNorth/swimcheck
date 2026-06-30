import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Video } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { AICoachSection } from '@/components/report/AICoachSection';
import { generateVideoAdvice, type SwimmingAdvice, type VideoFrameScore } from '@/lib/llm/advisor';
import type { StrokeScores } from '@/lib/analysis/scorer';

interface VideoReportPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ data?: string }>;
}

interface FrameResultData {
  frameIndex: number;
  timestamp: number;
  overall: number;
  bodyAlignment: number;
  armEntryLeft: number;
  armEntryRight: number;
  headPosition: number;
  bodyRoll: number;
  symmetry: number;
}

interface VideoReportData {
  scores: StrokeScores;
  frameResults: FrameResultData[];
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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function VideoReportPage({ params, searchParams }: VideoReportPageProps) {
  const { id } = await params;
  const resolved = await searchParams;

  if (!resolved.data) {
    notFound();
  }

  let reportData: VideoReportData;
  try {
    reportData = JSON.parse(resolved.data) as VideoReportData;
  } catch {
    notFound();
  }

  if (!reportData.scores || !reportData.frameResults || !Array.isArray(reportData.frameResults)) {
    notFound();
  }

  const scores = reportData.scores;
  const frameResults = reportData.frameResults;

  // Build frame scores for LLM
  const frameScores: VideoFrameScore[] = frameResults.map((f) => ({
    frameIndex: f.frameIndex,
    timestamp: f.timestamp,
    scores: {
      bodyAlignment: f.bodyAlignment,
      armEntryLeft: f.armEntryLeft,
      armEntryRight: f.armEntryRight,
      headPosition: f.headPosition,
      bodyRoll: f.bodyRoll,
      symmetry: f.symmetry,
      overall: f.overall,
    },
  }));

  // Generate AI advice
  let advicePromise: Promise<SwimmingAdvice>;
  try {
    advicePromise = generateVideoAdvice(frameScores, scores);
  } catch {
    advicePromise = Promise.reject(
      new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.')
    );
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
    { label: 'Body Roll', score: scores.bodyRoll, subtitle: 'Rotation' },
    { label: 'Symmetry', score: scores.symmetry, subtitle: 'L/R balance' },
  ];

  // Trend analysis
  const overallScores = frameResults.map((f) => f.overall);
  const firstHalf = overallScores.slice(0, Math.ceil(overallScores.length / 2));
  const secondHalf = overallScores.slice(Math.ceil(overallScores.length / 2));
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
  const trendDiff = secondAvg - firstAvg;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Stroke Analysis Report</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Video className="h-3.5 w-3.5" />
            {frameResults.length} frames analyzed — {today}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Overall Score */}
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 py-10 sm:flex-row sm:gap-10 sm:py-12">
            <OverallScoreRing score={scores.overall} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Video Overall Score
              </p>
              <p className={`mt-1 text-5xl font-bold tabular-nums ${scoreColor(scores.overall)}`}>
                {scores.overall}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {scores.overall >= 80
                  ? 'Excellent form across the video! Your technique is consistent. Focus on fine-tuning.'
                  : scores.overall >= 60
                  ? 'Good foundation with room for improvement. Targeted drills will help.'
                  : 'Key areas need attention. Follow the recommendations below to improve.'}
              </p>
              {/* Trend indicator */}
              <div className="mt-3 flex items-center gap-1.5 text-xs">
                {Math.abs(trendDiff) < 3 ? (
                  <span className="text-gray-500">Consistent throughout video</span>
                ) : trendDiff > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Improving trend (+{trendDiff.toFixed(1)} pts)
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    Declining trend ({trendDiff.toFixed(1)} pts) — possible fatigue
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Stroke Metrics (Averaged)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <ScoreCard key={m.label} label={m.label} score={m.score} subtitle={m.subtitle} />
            ))}
          </div>
        </div>

        {/* Frame Sequence */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Frame-by-Frame Scores</h2>
          <Card>
            <CardContent className="pt-6">
              {/* Timeline chart */}
              <div className="mb-4 flex items-end gap-1" style={{ height: '100px' }}>
                {frameResults.map((f, idx) => {
                  const height = Math.max(5, f.overall);
                  const color =
                    f.overall >= 80
                      ? 'bg-emerald-500'
                      : f.overall >= 60
                      ? 'bg-amber-500'
                      : 'bg-red-500';
                  return (
                    <div
                      key={idx}
                      className="group relative flex-1 flex flex-col items-center justify-end"
                      style={{ height: '100%' }}
                    >
                      <div
                        className={`w-full rounded-t ${color} transition-all hover:opacity-80`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                          {formatTime(f.timestamp)}: {f.overall}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Frame score list */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {frameResults.map((f) => (
                  <div key={f.frameIndex} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{formatTime(f.timestamp)}</span>
                    <span className={`font-bold tabular-nums ${scoreColor(f.overall)}`}>{f.overall}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Coach */}
        <AICoachSection advicePromise={advicePromise} />

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-center">
          <a href="/analyze/video" className={buttonVariants({ variant: 'outline' }) + ' gap-2'}>
            <ArrowLeft className="h-4 w-4" />
            Analyze Another Video
          </a>
          <a href="/analyze" className={buttonVariants({ variant: 'ghost' }) + ' gap-2'}>
            Photo Analysis
          </a>
        </div>
      </div>
    </div>
  );
}
