'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface UploadedImage {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploaderProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  maxImages?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUploader({ onImagesSelected, maxImages = 3 }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; error: string | null } => {
    const valid: File[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return { valid: [], error: 'Only JPG and PNG files are accepted.' };
      }
      if (file.size > MAX_FILE_SIZE) {
        return { valid: [], error: 'Each file must be under 5MB.' };
      }
      valid.push(file);
    }
    if (images.length + valid.length > maxImages) {
      return { valid: [], error: `You can upload up to ${maxImages} images.` };
    }
    return { valid, error: null };
  };

  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const { valid, error: validationError } = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      const newImages: UploadedImage[] = valid.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      }));

      const updated = [...images, ...newImages];
      setImages(updated);
      onImagesSelected(updated);
    },
    [images, maxImages, onImagesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    },
    [addFiles]
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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    onImagesSelected(updated);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Upload Swimming Photos</CardTitle>
        <CardDescription>
          Upload 1–{maxImages} photos (JPG/PNG, max 5MB each) for AI analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
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
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt={img.file.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  aria-label={`Remove ${img.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="truncate text-xs text-white">{img.file.name}</p>
                </div>
              </div>
            ))}
            {/* Add more placeholder */}
            {images.length < maxImages && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">Add</span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Image count */}
        {images.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {images.length} / {maxImages} images selected
          </p>
        )}
      </CardContent>
    </Card>
  );
}
