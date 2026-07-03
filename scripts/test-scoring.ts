/**
 * Manual scoring verification script.
 *
 * Usage:
 *   npx tsx scripts/test-scoring.ts [image-path-or-url ...]
 *
 * This script loads swimming images, runs MediaPipe pose detection, and prints
 * the resulting stroke scores so you can manually verify whether the numbers
 * match your swimming-coach intuition.
 *
 * Because MediaPipe Pose requires a browser DOM, this script is intended to be
 * run in a Node environment with `jsdom` or adapted for your test setup.
 * For quick iteration you can also paste the scoring functions into a browser
 * DevTools console alongside pre-detected keypoints.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Suggested test images (find your own):
 *   1. Good stroke – side view, body horizontal, clean entry
 *   2. Good stroke – front view, symmetrical arms
 *   3. Poor stroke – head up, hips dropping
 *   4. Poor stroke – overreaching / crossing over
 *   5. Average stroke – some issues visible
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Mock keypoints for offline testing ────────────────────────────────────────
// These simulate a "decent" freestyle swimmer (all visibility = 1).
// Coordinates are normalised 0–1 as per MediaPipe output.
//
// Layout (approximate side-view freestyle):
//   Head slightly below shoulder line (looking down)
//   Arms extended forward with slight elbow bend (~160°)
//   Body roughly horizontal (small tilt)
// ──────────────────────────────────────────────────────────────────────────────

import { calculateStrokeScores } from '../src/lib/analysis/scorer';
import { Keypoint } from '../src/lib/mediapipe/poseDetector';

function makeMockKeypoints(overrides: Partial<Record<number, Partial<Keypoint>>> = {}): Keypoint[] {
  // Base positions for a horizontal freestyler (side view, swimming left→right)
  const base: Keypoint[] = Array.from({ length: 33 }, () => ({
    x: 0.5, y: 0.5, z: 0, visibility: 1,
  }));

  // Rough anatomical positions (normalised 0–1)
  // Side-view freestyle, swimming left→right.
  // Head is SLIGHTLY above and forward of shoulders (neutral spine).
  const positions: Record<number, { x: number; y: number }> = {
    0:  { x: 0.27, y: 0.37 },  // nose
    7:  { x: 0.28, y: 0.35 },  // left ear — slightly above & forward of shoulder
    8:  { x: 0.32, y: 0.35 },  // right ear
    11: { x: 0.30, y: 0.45 },  // left shoulder
    12: { x: 0.30, y: 0.50 },  // right shoulder
    13: { x: 0.42, y: 0.43 },  // left elbow
    14: { x: 0.42, y: 0.52 },  // right elbow
    15: { x: 0.55, y: 0.42 },  // left wrist
    16: { x: 0.55, y: 0.53 },  // right wrist
    23: { x: 0.60, y: 0.46 },  // left hip
    24: { x: 0.60, y: 0.50 },  // right hip
  };

  for (const [idx, pos] of Object.entries(positions)) {
    const i = Number(idx);
    base[i] = { ...base[i], ...pos };
  }

  // Apply overrides
  for (const [idx, override] of Object.entries(overrides)) {
    const i = Number(idx);
    base[i] = { ...base[i], ...override };
  }

  return base;
}

// ── Test cases ────────────────────────────────────────────────────────────────

console.log('=== StrokeLab Scoring Engine — Offline Tests ===\n');

// Test 1: Decent freestyle (horizontal, slight elbow bend)
console.log('Test 1: Decent freestyle (horizontal body, 160° elbow)');
const decent = makeMockKeypoints();
const scores1 = calculateStrokeScores(decent);
console.log(scores1);
console.log(`Overall: ${scores1.overall}\n`);

// Test 2: Head-up swimmer (head lifted to look forward — common fault)
console.log('Test 2: Head-up swimmer (head lifted forward, hips dropping)');
const headUp = makeMockKeypoints({
  7: { x: 0.22, y: 0.22 }, // left ear — lifted & forward
  8: { x: 0.28, y: 0.22 }, // right ear — lifted
  0: { x: 0.23, y: 0.21 }, // nose
  23: { x: 0.60, y: 0.55 }, // left hip dropped
  24: { x: 0.60, y: 0.60 }, // right hip dropped
});
const scores2 = calculateStrokeScores(headUp);
console.log(scores2);
console.log(`Overall: ${scores2.overall}\n`);

// Test 3: Overreaching (arms fully extended, 180° elbow)
console.log('Test 3: Overreaching (arms fully straight)');
const overreach = makeMockKeypoints({
  13: { x: 0.50, y: 0.42 }, // left elbow further forward
  14: { x: 0.50, y: 0.53 }, // right elbow further forward
  15: { x: 0.65, y: 0.42 }, // left wrist far
  16: { x: 0.65, y: 0.53 }, // right wrist far
});
const scores3 = calculateStrokeScores(overreach);
console.log(scores3);
console.log(`Overall: ${scores3.overall}\n`);

// Test 4: Very vertical swimmer (beginner standing in water)
console.log('Test 4: Very vertical body (beginner / standing)');
const vertical = makeMockKeypoints({
  0:  { x: 0.52, y: 0.08 },  // nose — slightly to the side
  7:  { x: 0.52, y: 0.10 },  // left ear — to the side of head
  8:  { x: 0.58, y: 0.10 },  // right ear
  11: { x: 0.45, y: 0.20 },  // shoulders high
  12: { x: 0.55, y: 0.20 },
  23: { x: 0.45, y: 0.75 },  // hips low
  24: { x: 0.55, y: 0.75 },
});
const scores4 = calculateStrokeScores(vertical);
console.log(scores4);
console.log(`Overall: ${scores4.overall}\n`);

console.log('=== All tests complete ===');
