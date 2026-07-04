'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SwimmingAdvice } from '@/lib/llm/advisor';
import type { StrokeScores } from '@/lib/analysis/scorer';

interface AICoachSectionProps {
  scores: StrokeScores;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function AdviceContent({ advice }: { advice: SwimmingAdvice }) {
  const [expandedDrill, setExpandedDrill] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:from-blue-950/40 dark:to-indigo-950/40">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            AI Coach Feedback
          </h2>
        </div>
        <CardContent className="space-y-6 py-6">
          {/* Summary text */}
          <p className="text-base leading-relaxed">{advice.summary}</p>

          {/* Strengths */}
          {advice.strengths.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {advice.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {advice.weaknesses.length > 0 && (
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Areas to Improve
              </h3>
              <ul className="space-y-1.5">
                {advice.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {advice.recommendations.length > 0 && (
        <Card>
          <div className="border-b px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Target className="h-5 w-5 text-indigo-500" />
              Priority Recommendations
            </h2>
          </div>
          <CardContent className="space-y-5 py-6">
            {advice.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
              >
                {/* Issue header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Priority {idx + 1}
                    </span>
                    <h3 className="mt-0.5 font-semibold">{rec.issue}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreColor(rec.currentScore)} bg-gray-100 dark:bg-gray-800`}>
                    {rec.currentScore}/100
                  </span>
                </div>

                {/* Score progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {rec.currentScore}</span>
                    <span>Target: {rec.targetScore}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${scoreBg(rec.currentScore)} transition-all`}
                      style={{ width: `${rec.currentScore}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-blue-400/30"
                      style={{ width: `${rec.targetScore}%` }}
                    />
                  </div>
                </div>

                {/* Explanation */}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {rec.explanation}
                </p>

                {/* Drill section */}
                <div className="mt-4 rounded-lg bg-blue-50/60 p-4 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-blue-500">Recommended Drill</span>
                      <p className="mt-0.5 font-semibold text-blue-700 dark:text-blue-300">{rec.drill}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setExpandedDrill(expandedDrill === idx ? null : idx)}
                    >
                      How to do it
                      {expandedDrill === idx ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {expandedDrill === idx && (
                    <div className="mt-3 border-t border-blue-200 pt-3 dark:border-blue-800">
                      <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                        {rec.howTo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Encouragement */}
      {advice.encouragement && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-6 py-5 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
          <p className="text-sm font-medium italic text-emerald-700 dark:text-emerald-300">
            &ldquo;{advice.encouragement}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export function AICoachSection({ scores }: AICoachSectionProps) {
  const [advice, setAdvice] = useState<SwimmingAdvice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function fetchAdvice() {
      try {
        const response = await fetch('/api/advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scores }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          setAdvice(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to generate advice');
          setLoading(false);
        }
      }
    }

    fetchAdvice();

    return () => {
      mounted = false;
    };
  }, [scores]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Generating AI advice...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Unable to Generate Advice</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!advice) {
    return null;
  }

  return <AdviceContent advice={advice} />;
}
