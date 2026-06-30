import { Keypoint } from '@/lib/mediapipe/poseDetector';
import {
  scoreBodyAlignment,
  scoreArmEntry,
  scoreHeadPosition,
  scoreBodyRoll,
  scoreSymmetry,
} from './scoring';

// ─────────────────────────────────────────────────────────────────────────────
// StrokeScores — the output of a single-image scoring pass.
// All values are integers in the range 0–100.
// ─────────────────────────────────────────────────────────────────────────────
export interface StrokeScores {
  /** Body alignment (horizontal tilt) — 0–100 */
  bodyAlignment: number;
  /** Left arm entry angle — 0–100 */
  armEntryLeft: number;
  /** Right arm entry angle — 0–100 */
  armEntryRight: number;
  /** Head position (neutral vs lifted) — 0–100 */
  headPosition: number;
  /** Body roll proxy (shoulder-hip asymmetry) — 0–100 */
  bodyRoll: number;
  /** Left-right arm symmetry — 0–100 */
  symmetry: number;
  /** Weighted overall score — 0–100 */
  overall: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Weights used to compute the overall score.
//
// Rationale (freestyle priority):
//   • Body alignment is the single biggest drag factor → 25 %
//   • Head position directly controls hip position    → 20 %
//   • Arm entry (both arms combined)                  → 30 % (15 + 15)
//   • Symmetry                                        → 15 %
//   • Body roll (heuristic, single-image)             → 10 %
// ─────────────────────────────────────────────────────────────────────────────
const WEIGHTS = {
  bodyAlignment: 0.25,
  armEntryLeft: 0.15,
  armEntryRight: 0.15,
  headPosition: 0.20,
  bodyRoll: 0.10,
  symmetry: 0.15,
} as const;

/**
 * Calculate all stroke scores from a single set of MediaPipe keypoints.
 *
 * @param keypoints Array of 33 Keypoint objects from poseDetector
 * @returns StrokeScores with 5 individual metrics + weighted overall
 */
export function calculateStrokeScores(keypoints: Keypoint[]): StrokeScores {
  const bodyAlignment = scoreBodyAlignment(keypoints);
  const armEntryLeft = scoreArmEntry(keypoints, 'left');
  const armEntryRight = scoreArmEntry(keypoints, 'right');
  const headPosition = scoreHeadPosition(keypoints);
  const bodyRoll = scoreBodyRoll(keypoints);
  const symmetry = scoreSymmetry(keypoints);

  const overall = Math.round(
    bodyAlignment * WEIGHTS.bodyAlignment +
    armEntryLeft  * WEIGHTS.armEntryLeft +
    armEntryRight * WEIGHTS.armEntryRight +
    headPosition  * WEIGHTS.headPosition +
    bodyRoll      * WEIGHTS.bodyRoll +
    symmetry      * WEIGHTS.symmetry,
  );

  return {
    bodyAlignment,
    armEntryLeft,
    armEntryRight,
    headPosition,
    bodyRoll,
    symmetry,
    overall,
  };
}
