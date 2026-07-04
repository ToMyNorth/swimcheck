'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  Video,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VideoUploader, { UploadedVideo } from '@/components/upload/VideoUploader';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { Keypoint, detectPoseOrNull, filterKeypoints } from '@/lib/mediapipe/poseDetector';
import { calculateStrokeScores, StrokeScores } from '@/lib/analysis/scorer';
import {
  extractFrames,
  frameToImageElement,
  ExtractedFrame,
} from '@/lib/video/frameExtractor';
import { drawSkeleton } from '@/lib/mediapipe/drawing';

type AnalysisState = 'upload' | 'extracting' | 'analyzing' | 'generating' | 'results';

interface FrameAnalysisResult {
  frame: ExtractedFrame;
  keypoints: Keypoint[];
  scores: StrokeScores;
  thumbnailUrl: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoAnalyzePage() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>('upload');
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [results, setResults] = useState<FrameAnalysisResult[]>([]);
  const [averageScores, setAverageScores] = useState<StrokeScores | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [skippedFrames, setSkippedFrames] = useState(0);

  const handleVideoSelected = useCallback((video: UploadedVideo) => {
    setUploadedVideo(video);
    setError(null);
  }, []);

  const startAnalysis = async () => {
    // Guard: prevent repeated or empty submissions
    if (!uploadedVideo || state !== 'upload' || error) return;

    // Check quota before analysis
    try {
      const quotaRes = await fetch('/api/analysis/quota');
      if (quotaRes.ok) {
        const quota = await quotaRes.json();
        if (!quota.isPro && quota.used >= quota.limit) {
          setShowPaywall(true);
          return;
        }
      }
    } catch (err) {
      console.error('Quota check failed:', err);
      // Proceed anyway if quota check fails
    }

    setError(null);
    setProgress(0);
    setSkippedFrames(0);

    try {
      // Phase 1: Extract frames
      setState('extracting');
      setProgressText('Extracting key frames from video...');

      const frames = await extractFrames(uploadedVideo.file, (p) => {
        setProgress(p.percentage);
        setProgressText(`Extracting key frames... (${p.currentFrame}/${p.totalFrames})`);
      });

      if (frames.length === 0) {
        throw new Error('No frames could be extracted from the video.');
      }

      // Phase 2: Analyze each frame
      setState('analyzing');
      setProgress(0);
      setProgressText('Analyzing pose in each frame...');

      const frameResults: FrameAnalysisResult[] = [];
      let failedFrames = 0;

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const imgElement = await frameToImageElement(frame);

        // Run pose detection with fallback (returns null instead of throwing)
        const keypoints = await detectPoseOrNull(imgElement);

        if (!keypoints) {
          // Skip frames where no pose could be detected — continue with the rest
          failedFrames++;
          setSkippedFrames(failedFrames);
          console.warn(`Frame ${i + 1}/${frames.length} (t=${frame.timestamp.toFixed(1)}s): no pose detected, skipping`);
          setProgress(Math.round(((i + 1) / frames.length) * 100));
          setProgressText(`Analyzing pose... (${i + 1}/${frames.length} frames, ${failedFrames} skipped)`);
          continue;
        }

        const filtered = filterKeypoints(keypoints, 0.1);

        // Calculate scores
        const scores = calculateStrokeScores(filtered);

        // Generate thumbnail
        const thumbnailCanvas = document.createElement('canvas');
        const thumbSize = 200;
        const aspectRatio = frame.imageData.height / frame.imageData.width;
        thumbnailCanvas.width = thumbSize;
        thumbnailCanvas.height = thumbSize * aspectRatio;
        const thumbCtx = thumbnailCanvas.getContext('2d');
        if (thumbCtx) {
          thumbCtx.drawImage(frame.imageData, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          drawSkeleton(thumbCtx, filtered, thumbnailCanvas.width, thumbnailCanvas.height);
        }

        frameResults.push({
          frame,
          keypoints: filtered,
          scores,
          thumbnailUrl: thumbnailCanvas.toDataURL('image/png'),
        });

        setProgress(Math.round(((i + 1) / frames.length) * 100));
        setProgressText(`Analyzing pose... (${i + 1}/${frames.length} frames${failedFrames > 0 ? `, ${failedFrames} skipped` : ''})`);
      }

      // Only fail if EVERY frame failed detection
      if (frameResults.length === 0) {
        throw new Error(
          'Unable to detect body pose in any video frame. The most common reason is that the full body is not visible.\n\n' +
          'Please ensure:\n' +
          '• The swimmer\'s FULL BODY (head to toes) is visible\n' +
          '• Shot from the SIDE (profile view) for best results\n' +
          '• Taken ABOVE water — underwater or partially submerged shots may fail\n' +
          '• Good lighting with minimal water splash obstruction'
        );
      }

      // Phase 3: Generate summary
      setState('generating');
      setProgressText('Generating summary...');
      setProgress(100);

      // Calculate trimmed mean (remove min and max, average the rest)
      const overallScores = frameResults.map((r) => r.scores.overall).sort((a, b) => a - b);
      let avgScores: StrokeScores;

      if (overallScores.length <= 2) {
        // Too few frames to trim, just average all
        avgScores = computeAverage(frameResults.map((r) => r.scores));
      } else {
        // Remove min and max, average the rest
        const trimmedResults = frameResults
          .slice()
          .sort((a, b) => a.scores.overall - b.scores.overall)
          .slice(1, -1);
        avgScores = computeAverage(trimmedResults.map((r) => r.scores));
      }

      setResults(frameResults);
      setAverageScores(avgScores);
      setState('results');

      // Save analysis to backend (silent failure)
      try {
        await fetch('/api/analysis/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: null,
            scores: avgScores,
            advice: null,
          }),
        });
      } catch (err) {
        console.error('Failed to save video analysis:', err);
      }
    } catch (err) {
      console.error('Video analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setState('upload');
    }
  };

  const resetAnalysis = () => {
    setState('upload');
    setUploadedVideo(null);
    setResults([]);
    setAverageScores(null);
    setError(null);
    setProgress(0);
    setProgressText('');
    setSkippedFrames(0);
  };

  // Find best and worst frames
  const bestFrame = results.length > 0
    ? results.reduce((best, r) => (r.scores.overall > best.scores.overall ? r : best))
    : null;
  const worstFrame = results.length > 0
    ? results.reduce((worst, r) => (r.scores.overall < worst.scores.overall ? r : worst))
    : null;

  // Trend analysis: compare first half vs second half
  const trendData = results.map((r) => r.scores.overall);
  const firstHalfAvg = trendData.length > 0
    ? trendData.slice(0, Math.ceil(trendData.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(trendData.length / 2)
    : 0;
  const secondHalfAvg = trendData.length > 0
    ? trendData.slice(Math.ceil(trendData.length / 2)).reduce((a, b) => a + b, 0) / Math.max(1, trendData.length - Math.ceil(trendData.length / 2))
    : 0;
  const trendDiff = secondHalfAvg - firstHalfAvg;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Video Stroke Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a swimming video for multi-frame AI analysis with trend detection.
        </p>
      </div>

      {/* Step 1: Upload */}
      {state === 'upload' && (
        <div className="space-y-6">
          <VideoUploader onVideoSelected={handleVideoSelected} />

          {error && (
            <div className="mx-auto flex max-w-2xl items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive whitespace-pre-line">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {uploadedVideo && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={startAnalysis}
                disabled={!!error}
                className="gap-2 px-8"
              >
                <Video className="h-4 w-4" />
                {error ? 'Upload New Video to Retry' : 'Start Video Analysis'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2a: Extracting frames */}
      {(state === 'extracting' || state === 'analyzing' || state === 'generating') && (
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-background" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                {state === 'extracting' && 'Extracting Key Frames'}
                {state === 'analyzing' && 'Analyzing Pose'}
                {state === 'generating' && 'Generating Summary'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{progressText}</p>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {state === 'results' && averageScores && (
        <div className="space-y-8">
          {/* Success banner */}
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Analysis complete — {results.length} frames analyzed from video
          </div>

          {/* Partial detection warning */}
          {skippedFrames > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {skippedFrames} frame(s) were skipped due to pose detection failure. Analysis is based on the {results.length} successfully analyzed frame(s). This may affect accuracy.
              </span>
            </div>
          )}

          {/* Overall Score */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Video Stroke Scores</h2>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-blue-500 bg-blue-50/60 p-6 text-center dark:border-blue-400 dark:bg-blue-950/30">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Overall Score (Trimmed Average)
              </p>
              <p className="text-5xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {averageScores.overall}
              </p>
              <p className="text-xs text-gray-400">out of 100 — {results.length} frames analyzed</p>
            </div>

            {/* Individual metrics grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ScoreCard label="Body Alignment" score={averageScores.bodyAlignment} subtitle="Horizontal tilt" />
              <ScoreCard
                label="Arm Entry"
                score={Math.round((averageScores.armEntryLeft + averageScores.armEntryRight) / 2)}
                subtitle="Elbow angle at entry"
              />
              <ScoreCard label="Head Position" score={averageScores.headPosition} subtitle="Neutral spine" />
              <ScoreCard label="Body Roll" score={averageScores.bodyRoll} subtitle="Rotation" />
              <ScoreCard label="Symmetry" score={averageScores.symmetry} subtitle="L/R balance" />
            </div>

            {/* Limitations note */}
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Scores are computed per-frame and averaged (excluding highest and lowest frames to reduce outliers).
                Video-based analysis provides more comprehensive feedback than single-image analysis.
              </span>
            </div>
          </div>

          {/* Score Trend Chart */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Score Trend Over Time</h2>
            <Card>
              <CardContent className="pt-6">
                {/* Trend indicator */}
                <div className="mb-4 flex items-center gap-2">
                  {Math.abs(trendDiff) < 3 ? (
                    <>
                      <Minus className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Consistent performance throughout</span>
                    </>
                  ) : trendDiff > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400">
                        Improving trend (+{trendDiff.toFixed(1)} pts in second half)
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Declining trend ({trendDiff.toFixed(1)} pts in second half) — fatigue may be a factor
                      </span>
                    </>
                  )}
                </div>

                {/* Simple CSS bar chart */}
                <div className="space-y-1">
                  <div className="flex items-end gap-1" style={{ height: '120px' }}>
                    {results.map((r, idx) => {
                      const height = Math.max(5, r.scores.overall);
                      const color =
                        r.scores.overall >= 80
                          ? 'bg-emerald-500'
                          : r.scores.overall >= 60
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
                          {/* Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                            <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                              {formatTime(r.frame.timestamp)}: {r.scores.overall}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>0:00</span>
                    <span>{formatTime(uploadedVideo?.duration ?? 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best & Worst Frames */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Frame Comparison</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {bestFrame && (
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardContent className="pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Best Frame
                      </span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {bestFrame.scores.overall}/100
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bestFrame.thumbnailUrl} alt="Best frame" className="w-full" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      at {formatTime(bestFrame.frame.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              )}
              {worstFrame && (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                        Needs Improvement
                      </span>
                      <span className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
                        {worstFrame.scores.overall}/100
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={worstFrame.thumbnailUrl} alt="Worst frame" className="w-full" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      at {formatTime(worstFrame.frame.timestamp)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Frame Sequence Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Frames</h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {results.map((r) => (
                <div key={r.frame.frameIndex} className="group relative">
                  <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumbnailUrl} alt={`Frame ${r.frame.frameIndex + 1}`} className="w-full" />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatTime(r.frame.timestamp)}</span>
                    <span
                      className={
                        r.scores.overall >= 80
                          ? 'font-medium text-emerald-600 dark:text-emerald-400'
                          : r.scores.overall >= 60
                          ? 'font-medium text-amber-600 dark:text-amber-400'
                          : 'font-medium text-red-600 dark:text-red-400'
                      }
                    >
                      {r.scores.overall}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="outline" onClick={resetAnalysis} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another Video
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (!averageScores) return;
                const data = {
                  scores: averageScores,
                  frameResults: results.map((r) => ({
                    frameIndex: r.frame.frameIndex,
                    timestamp: r.frame.timestamp,
                    overall: r.scores.overall,
                    bodyAlignment: r.scores.bodyAlignment,
                    armEntryLeft: r.scores.armEntryLeft,
                    armEntryRight: r.scores.armEntryRight,
                    headPosition: r.scores.headPosition,
                    bodyRoll: r.scores.bodyRoll,
                    symmetry: r.scores.symmetry,
                  })),
                };
                const encoded = encodeURIComponent(JSON.stringify(data));
                router.push(`/report/video/temp-video-id?data=${encoded}`);
              }}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              View Full Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compute average StrokeScores from an array */
function computeAverage(scoresList: StrokeScores[]): StrokeScores {
  if (scoresList.length === 0) {
    return { bodyAlignment: 0, armEntryLeft: 0, armEntryRight: 0, headPosition: 0, bodyRoll: 0, symmetry: 0, overall: 0 };
  }
  return {
    bodyAlignment: Math.round(scoresList.reduce((s, sc) => s + sc.bodyAlignment, 0) / scoresList.length),
    armEntryLeft: Math.round(scoresList.reduce((s, sc) => s + sc.armEntryLeft, 0) / scoresList.length),
    armEntryRight: Math.round(scoresList.reduce((s, sc) => s + sc.armEntryRight, 0) / scoresList.length),
    headPosition: Math.round(scoresList.reduce((s, sc) => s + sc.headPosition, 0) / scoresList.length),
    bodyRoll: Math.round(scoresList.reduce((s, sc) => s + sc.bodyRoll, 0) / scoresList.length),
    symmetry: Math.round(scoresList.reduce((s, sc) => s + sc.symmetry, 0) / scoresList.length),
    overall: Math.round(scoresList.reduce((s, sc) => s + sc.overall, 0) / scoresList.length),
  };
}
