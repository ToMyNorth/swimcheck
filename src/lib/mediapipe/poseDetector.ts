/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Keypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

declare global {
  interface Window {
    Pose: any;
  }
}

let poseInstance: any = null;
let loadingPromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadMediaPipe(): Promise<void> {
  if (window.Pose) return;

  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');

  if (!window.Pose) {
    throw new Error('MediaPipe Pose failed to load');
  }
}

async function getPoseInstance(): Promise<any> {
  if (poseInstance) return poseInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await loadMediaPipe();

    poseInstance = new window.Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    poseInstance.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      // Very relaxed detection thresholds for maximum compatibility
      minDetectionConfidence: 0.1,  // Extremely low to detect any human figure
      minTrackingConfidence: 0.1,   // Extremely low for lenient tracking
    });

    await poseInstance.initialize();
    return poseInstance;
  })();

  return loadingPromise;
}

/**
 * Preprocess an image element via canvas: resize to optimal resolution and
 * enhance contrast to help MediaPipe detect poses in challenging swimming scenes
 * (water reflection, splash, low light).
 */
function preprocessImage(
  source: HTMLImageElement | HTMLCanvasElement,
  enhance: boolean = true
): HTMLCanvasElement {
  // MediaPipe works best with ~256px on the longer side
  const maxDim = 320;
  const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const outW = Math.round(w * scale);
  const outH = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;

  if (enhance) {
    // Draw with contrast / brightness adjustment
    ctx.filter = 'contrast(1.3) brightness(1.1) saturate(1.2)';
  }
  ctx.drawImage(source, 0, 0, outW, outH);
  ctx.filter = 'none';

  return canvas;
}

/**
 * Core single-attempt detection — returns null instead of throwing when no
 * landmarks are found, so callers can implement fallback strategies.
 */
async function detectPoseOnce(
  pose: any,
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<Keypoint[] | null> {
  return new Promise<Keypoint[] | null>((resolve) => {
    pose.onResults((results: any) => {
      if (!results.poseLandmarks) {
        resolve(null);
        return;
      }
      const keypoints: Keypoint[] = results.poseLandmarks.map(
        (landmark: { x: number; y: number; z: number; visibility: number }) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
          visibility: landmark.visibility ?? 0,
        })
      );
      resolve(keypoints);
    });

    pose.send({ image: imageSource }).catch(() => {
      resolve(null);
    });
  });
}

/**
 * Detect pose with multi-stage fallback:
 *   1. Original image at current complexity
 *   2. Contrast-enhanced + resized canvas
 *   Returns null if all attempts fail (caller decides how to handle).
 */
export async function detectPoseOrNull(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<Keypoint[] | null> {
  const pose = await getPoseInstance();

  // Attempt 1: original image
  let keypoints = await detectPoseOnce(pose, imageElement);
  if (keypoints) return keypoints;

  // Attempt 2: preprocessed (contrast-enhanced + resized)
  try {
    const enhanced = preprocessImage(imageElement, true);
    keypoints = await detectPoseOnce(pose, enhanced);
    if (keypoints) return keypoints;
  } catch {
    // preprocessing failed — continue
  }

  return null;
}

/**
 * Original detectPose — now with built-in fallback + improved error message.
 * Throws if all fallback attempts fail.
 */
export async function detectPose(imageElement: HTMLImageElement): Promise<Keypoint[]> {
  const keypoints = await detectPoseOrNull(imageElement);
  if (keypoints) return keypoints;

  throw new Error(
    'Unable to detect body pose. The most common reason is that the full body is not visible in the frame.\n\n' +
    'Please ensure:\n' +
    '• The swimmer\'s FULL BODY (head to toes) is visible in the image/video\n' +
    '• Shot from the SIDE (profile view) for best results\n' +
    '• Taken ABOVE water — underwater or partially submerged shots may fail\n' +
    '• Good lighting with minimal water splash obstruction\n\n' +
    'Tip: Photos where only the head or upper body is above water cannot be analyzed.'
  );
}

export function filterKeypoints(keypoints: Keypoint[], threshold = 0.1): Keypoint[] {
  return keypoints.map((kp) => ({
    ...kp,
    visibility: kp.visibility < threshold ? 0 : kp.visibility,
  }));
}

// MediaPipe Pose 33 landmark names
export const LANDMARK_NAMES = [
  'NOSE',
  'LEFT_EYE_INNER', 'LEFT_EYE', 'LEFT_EYE_OUTER',
  'RIGHT_EYE_INNER', 'RIGHT_EYE', 'RIGHT_EYE_OUTER',
  'LEFT_EAR', 'RIGHT_EAR',
  'MOUTH_LEFT', 'MOUTH_RIGHT',
  'LEFT_SHOULDER', 'RIGHT_SHOULDER',
  'LEFT_ELBOW', 'RIGHT_ELBOW',
  'LEFT_WRIST', 'RIGHT_WRIST',
  'LEFT_PINKY', 'RIGHT_PINKY',
  'LEFT_INDEX', 'RIGHT_INDEX',
  'LEFT_THUMB', 'RIGHT_THUMB',
  'LEFT_HIP', 'RIGHT_HIP',
  'LEFT_KNEE', 'RIGHT_KNEE',
  'LEFT_ANKLE', 'RIGHT_ANKLE',
  'LEFT_HEEL', 'RIGHT_HEEL',
  'LEFT_FOOT_INDEX', 'RIGHT_FOOT_INDEX',
];

// MediaPipe Pose connections for skeleton drawing
export const POSE_CONNECTIONS: [number, number][] = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7],    // Left eye
  [0, 4], [4, 5], [5, 6], [6, 8],    // Right eye
  [9, 10],                             // Mouth
  // Torso
  [11, 12],                            // Shoulders
  [11, 23], [12, 24],                  // Side torso
  [23, 24],                            // Hips
  // Left arm
  [11, 13], [13, 15],                  // Upper & lower arm
  [15, 17], [15, 19], [15, 21],       // Wrist to fingers
  // Right arm
  [12, 14], [14, 16],                  // Upper & lower arm
  [16, 18], [16, 20], [16, 22],       // Wrist to fingers
  // Left leg
  [23, 25], [25, 27], [27, 29], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [30, 32],
];
