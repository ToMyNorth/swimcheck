'use client';

import { useRef, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Keypoint, filterKeypoints } from '@/lib/mediapipe/poseDetector';
import { drawSkeleton, drawAngleAnnotation } from '@/lib/mediapipe/drawing';

interface SkeletonOverlayProps {
  imageSrc: string;
  keypoints: Keypoint[];
  showAngles?: boolean;
}

export default function SkeletonOverlay({ imageSrc, keypoints, showAngles = false }: SkeletonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate display size (fit container)
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const aspectRatio = img.height / img.width;
      const displayWidth = containerWidth;
      const displayHeight = containerWidth * aspectRatio;

      setCanvasSize({ width: displayWidth, height: displayHeight });
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Draw image
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);

      // Filter and draw skeleton
      const filtered = filterKeypoints(keypoints, 0.5);
      drawSkeleton(ctx, filtered, canvasSize.width, canvasSize.height);

      // Draw key joint angles (elbow, shoulder, hip, knee)
      if (showAngles) {
        // Left elbow: shoulder(11) - elbow(13) - wrist(15)
        drawAngleAnnotation(ctx, filtered, 13, 11, 15, canvasSize.width, canvasSize.height);
        // Right elbow: shoulder(12) - elbow(14) - wrist(16)
        drawAngleAnnotation(ctx, filtered, 14, 12, 16, canvasSize.width, canvasSize.height);
        // Left shoulder: elbow(13) - shoulder(11) - hip(23)
        drawAngleAnnotation(ctx, filtered, 11, 13, 23, canvasSize.width, canvasSize.height);
        // Right shoulder: elbow(14) - shoulder(12) - hip(24)
        drawAngleAnnotation(ctx, filtered, 12, 14, 24, canvasSize.width, canvasSize.height);
        // Left hip: shoulder(11) - hip(23) - knee(25)
        drawAngleAnnotation(ctx, filtered, 23, 11, 25, canvasSize.width, canvasSize.height);
        // Right hip: shoulder(12) - hip(24) - knee(26)
        drawAngleAnnotation(ctx, filtered, 24, 12, 26, canvasSize.width, canvasSize.height);
      }
    };
    img.src = imageSrc;
  }, [imageSrc, keypoints, canvasSize, imageLoaded, showAngles]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'swimcheck-analysis.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl ring-1 ring-foreground/10"
      >
        <canvas
          ref={canvasRef}
          style={{
            width: canvasSize.width || '100%',
            height: canvasSize.height || 'auto',
            display: 'block',
          }}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Download Result
        </Button>
      </div>
    </div>
  );
}
