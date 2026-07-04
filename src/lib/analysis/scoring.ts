import { Keypoint } from '@/lib/mediapipe/poseDetector';
import { calculateAngle, calculateBodyTilt } from './angles';

// ─────────────────────────────────────────────────────────────────────────────
// MediaPipe Pose 33-landmark index reference
// ─────────────────────────────────────────────────────────────────────────────
// 0   NOSE
// 7   LEFT_EAR          8   RIGHT_EAR
// 11  LEFT_SHOULDER     12  RIGHT_SHOULDER
// 13  LEFT_ELBOW        14  RIGHT_ELBOW
// 15  LEFT_WRIST        16  RIGHT_WRIST
// 23  LEFT_HIP          24  RIGHT_HIP
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 1. Body Alignment (身体水平度)
// ─────────────────────────────────────────────────────────────────────────────
// Ideal freestyle: body as horizontal as possible, tilt < 10°.
// Source: USA Swimming front-quadrant freestyle drills; common coaching cue
// "swim downhill".
//
// Scoring:
//   tilt ≤ 10°  → 100
//   tilt ≥ 30°  →   0
//   otherwise   → linear interpolation
// ─────────────────────────────────────────────────────────────────────────────
export function scoreBodyAlignment(keypoints: Keypoint[]): number {
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];

  // If any required landmark is not visible, return neutral score
  if ([leftShoulder, rightShoulder, leftHip, rightHip].some(kp => kp.visibility < 0.15)) {
    return 50;
  }

  const tilt = calculateBodyTilt(leftShoulder, rightShoulder, leftHip, rightHip);

  if (tilt <= 10) return 100;
  if (tilt >= 30) return 0;
  return Math.round(100 - ((tilt - 10) / 20) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Arm Entry Angle (手臂入水角)
// ─────────────────────────────────────────────────────────────────────────────
// Ideal: elbow angle 150–170° at the moment of entry (slight bend, relaxed
// forearm reaching forward).  < 150° = over-bent / "chopping"; > 170° =
// hyper-extended / overreaching.
// Source: Total Immersion freestyle; Coach Mikel du Toit video analysis.
//
// Scoring (per arm):
//   150° ≤ angle ≤ 170°  → 100
//   otherwise            → penalise 2 pts per degree outside range, min 0
// ─────────────────────────────────────────────────────────────────────────────
export function scoreArmEntry(keypoints: Keypoint[], side: 'left' | 'right'): number {
  const shoulder = side === 'left' ? keypoints[11] : keypoints[12];
  const elbow = side === 'left' ? keypoints[13] : keypoints[14];
  const wrist = side === 'left' ? keypoints[15] : keypoints[16];

  if ([shoulder, elbow, wrist].some(kp => kp.visibility < 0.15)) {
    return 50; // cannot assess → neutral
  }

  const elbowAngle = calculateAngle(shoulder, elbow, wrist);

  if (elbowAngle >= 150 && elbowAngle <= 170) return 100;
  if (elbowAngle < 150) return Math.max(0, Math.round(100 - (150 - elbowAngle) * 2));
  return Math.max(0, Math.round(100 - (elbowAngle - 170) * 2));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Head Position (头部位置)
// ─────────────────────────────────────────────────────────────────────────────
// Ideal: neutral spine — head aligned with torso, not lifted to look forward.
//
// We measure the angle between the shoulder→ear direction and the body's
// "up" perpendicular (90° CCW from the shoulder→hip axis).  In a neutral
// head position the ear is roughly along body-Up, giving a small deviation.
// Lifting the head to look forward increases this deviation significantly.
//
// This body-relative approach works for ANY body orientation (horizontal
// freestyle, vertical beginner, etc.) — unlike an absolute-from-vertical
// approach which only works for upright swimmers.
//
// Source: Sheila Taormina "Swim Speed Secrets"; common coaching cue
// "look at the black line".
//
// Scoring:
//   deviation ≤ 15°  → 100
//   deviation ≥ 30°  →   0
//   otherwise        → linear interpolation
// ─────────────────────────────────────────────────────────────────────────────
export function scoreHeadPosition(keypoints: Keypoint[]): number {
  const nose = keypoints[0];
  const leftEar = keypoints[7];
  const rightEar = keypoints[8];
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];

  const required = [nose, leftEar, rightEar, leftShoulder, rightShoulder, leftHip, rightHip];
  if (required.some(kp => kp.visibility < 0.15)) {
    return 50;
  }

  // Ear midpoint
  const earMid = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2,
  };
  // Shoulder midpoint
  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  // Hip midpoint
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  // Body axis vector (shoulders → hips)
  const bodyDx = hipMid.x - shoulderMid.x;
  const bodyDy = hipMid.y - shoulderMid.y;

  // Shoulder → ear vector
  const headDx = earMid.x - shoulderMid.x;
  const headDy = earMid.y - shoulderMid.y;

  // "Up" perpendicular to body axis (always pointing toward surface / up in screen)
  // Rotate body axis 90° and pick the direction with negative y (up in screen coords)
  let bodyUpX = -bodyDy;
  let bodyUpY = bodyDx;
  if (bodyUpY > 0) { bodyUpX = bodyDy; bodyUpY = -bodyDx; }

  const dot = headDx * bodyUpX + headDy * bodyUpY;
  const cross = headDx * bodyUpY - headDy * bodyUpX;

  const magHead = Math.sqrt(headDx * headDx + headDy * headDy);
  const magBodyUp = Math.sqrt(bodyUpX * bodyUpX + bodyUpY * bodyUpY);

  if (magHead < 1e-6 || magBodyUp < 1e-6) return 50;

  const angleRad = Math.atan2(Math.abs(cross), dot);
  const deviation = angleRad * (180 / Math.PI);

  if (deviation <= 15) return 100;
  if (deviation >= 30) return 0;
  return Math.round(100 - ((deviation - 15) / 15) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Body Roll (身体滚动)
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: True body roll is a dynamic metric that requires video.  For a single
// image we use a *proxy*: the Y-axis asymmetry between shoulders and hips.
// A swimmer who is perfectly flat (both shoulders at same Y) is likely not
// rotating; moderate asymmetry suggests active rotation.
//
// This is a rough heuristic and will be flagged as "limited accuracy" in the
// UI.  Video-based roll measurement is a Phase 3 feature.
//
// Scoring:
//   avg asymmetry 0.02–0.08  → 100  (moderate rotation)
//   avg asymmetry 0.08–0.15  →  70  (some rotation)
//   otherwise                →  40  (too flat or exaggerated)
// ─────────────────────────────────────────────────────────────────────────────
export function scoreBodyRoll(keypoints: Keypoint[]): number {
  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];

  if ([leftShoulder, rightShoulder, leftHip, rightHip].some(kp => kp.visibility < 0.15)) {
    return 50;
  }

  const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const hipDiff = Math.abs(leftHip.y - rightHip.y);
  const avgAsymmetry = (shoulderDiff + hipDiff) / 2;

  if (avgAsymmetry >= 0.02 && avgAsymmetry <= 0.08) return 100;
  if (avgAsymmetry > 0.08 && avgAsymmetry <= 0.15) return 70;
  return 40;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Left-Right Symmetry (对称性)
// ─────────────────────────────────────────────────────────────────────────────
// Compare left vs right elbow angles.  Symmetrical stroke = balanced power
// application.  Large differences often indicate a crossover or favouring one
// breathing side.
//
// Scoring:
//   diff ≤ 10°  → 100
//   diff ≥ 40°  →   0
//   otherwise   → linear interpolation
// ─────────────────────────────────────────────────────────────────────────────
export function scoreSymmetry(keypoints: Keypoint[]): number {
  const leftElbow = keypoints[13];
  const rightElbow = keypoints[14];
  const leftWrist = keypoints[15];
  const rightWrist = keypoints[16];

  // Need both arms visible for a meaningful comparison
  if ([leftElbow, rightElbow, leftWrist, rightWrist].some(kp => kp.visibility < 0.15)) {
    return 50;
  }

  const leftAngle = calculateAngle(keypoints[11], leftElbow, leftWrist);
  const rightAngle = calculateAngle(keypoints[12], rightElbow, rightWrist);

  const diff = Math.abs(leftAngle - rightAngle);

  if (diff <= 10) return 100;
  if (diff >= 40) return 0;
  return Math.round(100 - ((diff - 10) / 30) * 100);
}
