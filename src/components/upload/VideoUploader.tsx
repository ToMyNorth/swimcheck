'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Video as VideoIcon, AlertCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface UploadedVideo {
  file: File;
  preview: string;
  duration: number;
  id: string;
}

interface VideoUploaderProps {
  onVideoSelected: (video: UploadedVideo) => void;
}

const ACCEPTED_TYPES = ['video/mp4', 'video/webm'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoUploader({ onVideoSelected }: VideoUploaderProps) {
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only MP4 and WebM formats are supported.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be under 50MB.';
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      // Get video duration
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = previewUrl;
      
      tempVideo.onloadedmetadata = () => {
        const duration = tempVideo.duration;
        const newVideo: UploadedVideo = {
          file,
          preview: previewUrl,
          duration,
          id: crypto.randomUUID(),
        };
        setVideo(newVideo);
        onVideoSelected(newVideo);
      };
      
      tempVideo.onerror = () => {
        setError('Failed to read video file. Please check the format and try again.');
      };
    },
    [onVideoSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
    onVideoSelected(null as unknown as UploadedVideo);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Upload Swimming Video</CardTitle>
        <CardDescription>
          Upload a video (MP4/WebM, max 50MB) for multi-frame AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        {!video && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
              px-6 py-12 cursor-pointer transition-colors
              ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <Upload className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-center">
              <p className="text-sm font-medium">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Video Preview */}
        {video && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10">
              <video
                src={video.preview}
                controls
                className="w-full"
                style={{ maxHeight: '360px' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo();
                }}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                aria-label="Remove video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Video info */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{video.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(video.file.size)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatDuration(video.duration)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>

            {/* Duration warning */}
            {video.duration > 120 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Video is longer than 2 minutes. For best results, consider trimming to the most relevant portion. 
                  Analysis will extract 20 key frames.
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
