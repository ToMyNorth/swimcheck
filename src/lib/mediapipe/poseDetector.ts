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
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    await poseInstance.initialize();
    return poseInstance;
  })();

  return loadingPromise;
}

export async function detectPose(imageElement: HTMLImageElement): Promise<Keypoint[]> {
  const pose = await getPoseInstance();

  return new Promise<Keypoint[]>((resolve, reject) => {
    pose.onResults((results: any) => {
      if (!results.poseLandmarks) {
        reject(new Error('No pose landmarks detected. Make sure a person is visible in the image.'));
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

    pose.send({ image: imageElement }).catch((err: Error) => {
      reject(err);
    });
  });
}

export function filterKeypoints(keypoints: Keypoint[], threshold = 0.5): Keypoint[] {
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
