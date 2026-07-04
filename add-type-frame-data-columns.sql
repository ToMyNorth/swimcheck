-- Add 'type' and 'frame_data' columns to public.analyses table
-- Run this in Supabase Dashboard > SQL Editor

-- Add type column to distinguish image vs video analyses
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'image';

-- Add frame_data column to store video frame results + thumbnails (JSONB)
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS frame_data JSONB;

-- Update existing records: if image_url is NULL, mark as 'video'; otherwise 'image'
UPDATE public.analyses SET type = 'video' WHERE image_url IS NULL AND type = 'image';

-- Add index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_analyses_type ON public.analyses(type);
