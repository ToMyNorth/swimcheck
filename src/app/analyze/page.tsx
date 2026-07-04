'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle, Info, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ImageUploader, { UploadedImage } from '@/components/upload/ImageUploader';
import SkeletonOverlay from '@/components/visualization/SkeletonOverlay';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { Keypoint, detectPose, filterKeypoints } from '@/lib/mediapipe/poseDetector';
import { calculateStrokeScores, StrokeScores } from '@/lib/analysis/scorer';

type AnalysisState = 'upload' | 'processing' | 'results';

export default function AnalyzePage() {
  const router = useRouter();
  const [state, setState] = useState<AnalysisState>('upload');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [keypointsList, setKeypointsList] = useState<Keypoint[][]>([]);
  const [scoresList, setScoresList] = useState<StrokeScores[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const handleImagesSelected = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
    setError(null);
  }, []);

  const startAnalysis = async () => {
    if (uploadedImages.length === 0) return;

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

    setState('processing');
    setError(null);
    setProgress(0);

    const allKeypoints: Keypoint[][] = [];
    const allScores: StrokeScores[] = [];

    try {
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];

        // Create an HTMLImageElement for MediaPipe
        const imageElement = new Image();
        imageElement.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          imageElement.onload = () => resolve();
          imageElement.onerror = () => reject(new Error(`Failed to load image: ${img.file.name}`));
          imageElement.src = img.preview;
        });

        imageRefs.current[i] = imageElement;

        // Run pose detection
        const keypoints = await detectPose(imageElement);
        const filtered = filterKeypoints(keypoints, 0.5);
        allKeypoints.push(filtered);

        // Calculate stroke scores for this image
        const scores = calculateStrokeScores(filtered);
        allScores.push(scores);

        console.log(`Image ${i + 1}: Detected ${filtered.filter(kp => kp.visibility > 0.5).length} visible keypoints`);
        console.log('Scores:', scores);

        setProgress(Math.round(((i + 1) / uploadedImages.length) * 100));
      }

      setKeypointsList(allKeypoints);
      setScoresList(allScores);
      setState('results');

      // Save analysis to backend (silent failure)
      try {
        await fetch('/api/analysis/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'image',
            imageUrl: uploadedImages[0]?.preview || null,
            scores: allScores.length === 1 ? allScores[0] : allScores,
            advice: null,
          }),
        });
      } catch (err) {
        console.error('Failed to save analysis:', err);
      }
    } catch (err) {
      console.error('Pose detection error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setState('upload');
    }
  };

  const resetAnalysis = () => {
    setState('upload');
    setUploadedImages([]);
    setKeypointsList([]);
    setScoresList([]);
    setError(null);
    setProgress(0);
    imageRefs.current = [];
  };

  // Average scores across all images (useful when >1 image uploaded)
  const averageScores: StrokeScores | null =
    scoresList.length > 0
      ? {
          bodyAlignment: Math.round(scoresList.reduce((s, sc) => s + sc.bodyAlignment, 0) / scoresList.length),
          armEntryLeft:  Math.round(scoresList.reduce((s, sc) => s + sc.armEntryLeft,  0) / scoresList.length),
          armEntryRight: Math.round(scoresList.reduce((s, sc) => s + sc.armEntryRight, 0) / scoresList.length),
          headPosition:  Math.round(scoresList.reduce((s, sc) => s + sc.headPosition,  0) / scoresList.length),
          bodyRoll:      Math.round(scoresList.reduce((s, sc) => s + sc.bodyRoll,      0) / scoresList.length),
          symmetry:      Math.round(scoresList.reduce((s, sc) => s + sc.symmetry,      0) / scoresList.length),
          overall:       Math.round(scoresList.reduce((s, sc) => s + sc.overall,       0) / scoresList.length),
        }
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analyze Your Stroke</h1>
        <p className="mt-2 text-muted-foreground">
          Upload swimming photos and get instant AI-powered pose analysis.
        </p>
        {/* Tab switcher */}
        <div className="mt-4 flex gap-2">
          <div className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Photo Analysis
          </div>
          <Link href="/analyze/video">
            <div className="flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
              <Video className="h-3.5 w-3.5" />
              Video Analysis
            </div>
          </Link>
        </div>
      </div>

      {/* Step 1: Upload */}
      {state === 'upload' && (
        <div className="space-y-6">
          <ImageUploader onImagesSelected={handleImagesSelected} maxImages={3} />

          {error && (
            <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" onClick={startAnalysis} className="gap-2 px-8">
                Start Analysis
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Processing */}
      {state === 'processing' && (
        <Card className="mx-auto max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-background" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold">Analyzing your stroke...</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Running AI pose estimation on your images
              </p>
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
            Analysis complete — {keypointsList.reduce((sum, kps) => sum + kps.filter(kp => kp.visibility > 0.5).length, 0)} keypoints detected across {keypointsList.length} image(s)
          </div>

          {/* ── Score Dashboard ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Stroke Scores</h2>

            {/* Overall hero card */}
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-blue-500 bg-blue-50/60 p-6 text-center dark:border-blue-400 dark:bg-blue-950/30">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Overall Score</p>
              <p className="text-5xl font-bold tabular-nums text-blue-600 dark:text-blue-400">{averageScores.overall}</p>
              <p className="text-xs text-gray-400">out of 100</p>
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
              <ScoreCard label="Body Roll" score={averageScores.bodyRoll} subtitle="Rotation proxy*" />
              <ScoreCard label="Symmetry" score={averageScores.symmetry} subtitle="L/R balance" />
            </div>

            {/* Limitations note */}
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                * Body Roll is estimated from a single image and has limited accuracy.
                For full dynamic analysis, try video-based assessment for better results.
                Scores are heuristic and based on common freestyle coaching principles.
              </span>
            </div>
          </div>

          {/* ── Per-image Skeleton Overlay ──────────────────────────────────── */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Skeleton Overlay</h2>
            {uploadedImages.map((img, idx) => (
              keypointsList[idx] && (
                <div key={img.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Image {idx + 1}: {img.file.name}
                    </h3>
                    {scoresList[idx] && (
                      <span className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                        Score: {scoresList[idx].overall}
                      </span>
                    )}
                  </div>
                  <SkeletonOverlay
                    imageSrc={img.preview}
                    keypoints={keypointsList[idx]}
                    showAngles={true}
                  />
                </div>
              )
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="outline" onClick={resetAnalysis} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (!averageScores) return;
                const scoresJson = encodeURIComponent(JSON.stringify(averageScores));
                router.push(`/report/temp-id?scores=${scoresJson}`);
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
