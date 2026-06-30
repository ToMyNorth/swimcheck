/**
 * Video Frame Extractor Module
 * Extracts key frames from video files using HTML5 Canvas + Video API
 * All processing happens client-side without server FFmpeg
 */

export interface ExtractedFrame {
  /** Frame index (0-based) */
  frameIndex: number;
  /** Timestamp in seconds */
  timestamp: number;
  /** Canvas element containing the frame image */
  imageData: HTMLCanvasElement;
}

export interface ExtractionProgress {
  /** Current frame being extracted */
  currentFrame: number;
  /** Total frames to extract */
  totalFrames: number;
  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Determine number of frames to extract based on video duration
 * - ≤30s: 10 frames
 * - 30s-2min: 15 frames
 * - >2min: 20 frames
 */
function getFrameCount(durationSeconds: number): number {
  if (durationSeconds <= 30) return 10;
  if (durationSeconds <= 120) return 15;
  return 20;
}

/**
 * Extract key frames from a video file
 * @param videoFile - The video file to process
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to array of extracted frames
 */
export async function extractFrames(
  videoFile: File,
  onProgress?: (progress: ExtractionProgress) => void
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    // Disable CORS for local blob URLs
    video.crossOrigin = 'anonymous';

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const frameCount = getFrameCount(duration);
      const frames: ExtractedFrame[] = [];

      // Calculate timestamps for each frame (evenly spaced)
      const timestamps: number[] = [];
      for (let i = 0; i < frameCount; i++) {
        // Spread frames evenly across the video duration
        // Avoid the very first and last 0.1s for better content
        const t = 0.1 + (i / (frameCount - 1)) * (duration - 0.2);
        timestamps.push(Math.min(t, duration - 0.1));
      }

      // Create canvas for frame extraction
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to create canvas context'));
        return;
      }

      // Extract frames sequentially
      for (let i = 0; i < frameCount; i++) {
        try {
          await seekToTime(video, timestamps[i]);
          
          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Clone the canvas for this frame
          const frameCanvas = document.createElement('canvas');
          frameCanvas.width = canvas.width;
          frameCanvas.height = canvas.height;
          const frameCtx = frameCanvas.getContext('2d');
          if (frameCtx) {
            frameCtx.drawImage(canvas, 0, 0);
          }

          frames.push({
            frameIndex: i,
            timestamp: timestamps[i],
            imageData: frameCanvas,
          });

          // Report progress
          if (onProgress) {
            onProgress({
              currentFrame: i + 1,
              totalFrames: frameCount,
              percentage: Math.round(((i + 1) / frameCount) * 100),
            });
          }

          // Yield to UI thread to prevent blocking
          await new Promise((r) => setTimeout(r, 10));
        } catch (err) {
          console.warn(`Failed to extract frame ${i} at ${timestamps[i]}s:`, err);
          // Continue with other frames
        }
      }

      URL.revokeObjectURL(objectUrl);
      resolve(frames);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video file. Please check the format and try again.'));
    };
  });
}

/**
 * Seek video to specific time and wait for frame to be ready
 */
function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/**
 * Convert extracted frame to HTMLImageElement for pose detection
 */
export function frameToImageElement(frame: ExtractedFrame): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to convert frame ${frame.frameIndex} to image`));
    img.src = frame.imageData.toDataURL('image/png');
  });
}

/**
 * Get video duration from file
 */
export function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to read video metadata'));
    };
  });
}
