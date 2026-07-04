import { Keypoint, POSE_CONNECTIONS } from './poseDetector';

export interface DrawingOptions {
  keypointColor?: string;
  keypointRadius?: number;
  lineColor?: string;
  lineWidth?: number;
  visibilityThreshold?: number;
}

const DEFAULT_OPTIONS: DrawingOptions = {
  keypointColor: '#00ff88',
  keypointRadius: 4,
  lineColor: '#00ccff',
  lineWidth: 2,
  visibilityThreshold: 0.1, // Very relaxed to show all detected keypoints
};

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  width: number,
  height: number,
  options: DrawingOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const keypointColor = opts.keypointColor ?? DEFAULT_OPTIONS.keypointColor!;
  const keypointRadius = opts.keypointRadius ?? DEFAULT_OPTIONS.keypointRadius!;
  const lineColor = opts.lineColor ?? DEFAULT_OPTIONS.lineColor!;
  const lineWidth = opts.lineWidth ?? DEFAULT_OPTIONS.lineWidth!;
  const visibilityThreshold = opts.visibilityThreshold ?? DEFAULT_OPTIONS.visibilityThreshold!;

  // Draw connections (bones)
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = keypoints[startIdx];
    const end = keypoints[endIdx];

    if (!start || !end) continue;
    if (start.visibility < visibilityThreshold || end.visibility < visibilityThreshold) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  // Draw keypoints
  for (const kp of keypoints) {
    if (kp.visibility < visibilityThreshold) continue;

    ctx.beginPath();
    ctx.arc(kp.x * width, kp.y * height, keypointRadius, 0, 2 * Math.PI);
    ctx.fillStyle = keypointColor;
    ctx.fill();

    // Add a subtle glow effect
    ctx.beginPath();
    ctx.arc(kp.x * width, kp.y * height, keypointRadius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = keypointColor + '40'; // 25% opacity
    ctx.fill();
  }
}

export function calculateAngle(
  a: Keypoint,
  b: Keypoint,
  c: Keypoint
): number | null {
  if (a.visibility < 0.5 || b.visibility < 0.5 || c.visibility < 0.5) return null;

  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dotProduct = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

  if (magBA === 0 || magBC === 0) return null;

  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magBA * magBC)));
  return Math.round((Math.acos(cosAngle) * 180) / Math.PI);
}

export function drawAngleAnnotation(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  jointIdx: number,
  startIdx: number,
  endIdx: number,
  width: number,
  height: number
) {
  const angle = calculateAngle(
    keypoints[startIdx],
    keypoints[jointIdx],
    keypoints[endIdx]
  );

  if (angle === null) return;

  const joint = keypoints[jointIdx];
  const x = joint.x * width;
  const y = joint.y * height;

  // Draw angle text
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = `${angle}°`;
  const offsetY = -20;

  ctx.strokeText(text, x, y + offsetY);
  ctx.fillText(text, x, y + offsetY);
}
