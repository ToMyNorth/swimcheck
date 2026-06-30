import { Keypoint } from '@/lib/mediapipe/poseDetector';

/**
 * Calculate angle between three points (in degrees).
 * The angle is measured at p2 (the vertex).
 *
 * @param p1 - First point (e.g., shoulder)
 * @param p2 - Vertex point (e.g., elbow)
 * @param p3 - Third point (e.g., wrist)
 * @returns Angle in degrees (0–180)
 */
export function calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
  // Vector p2→p1
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  // Vector p2→p3
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  // Magnitudes
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);

  // Guard against division by zero
  if (mag1 === 0 || mag2 === 0) return 0;

  // Clamp to [-1, 1] to avoid NaN from floating-point errors
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
  // Angle in radians → degrees
  return Math.acos(cosAngle) * (180 / Math.PI);
}

/**
 * Calculate body tilt angle — the angle between the shoulder-hip centre line
 * and the horizontal axis.  A perfectly horizontal swimmer has 0° tilt.
 *
 * @returns Absolute tilt angle in degrees (0 = horizontal, 90 = vertical)
 */
export function calculateBodyTilt(
  leftShoulder: Keypoint,
  rightShoulder: Keypoint,
  leftHip: Keypoint,
  rightHip: Keypoint,
): number {
  // Midpoint of shoulders
  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  // Midpoint of hips
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  // Angle vs horizontal
  const dx = hipMid.x - shoulderMid.x;
  const dy = hipMid.y - shoulderMid.y;
  const angleRad = Math.atan2(dy, dx);
  return Math.abs(angleRad * (180 / Math.PI));
}
