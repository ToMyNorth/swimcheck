-- Fix: Allow image_url to be NULL in analyses table
-- This is needed because video analysis doesn't have an image URL

ALTER TABLE public.analyses ALTER COLUMN image_url DROP NOT NULL;
