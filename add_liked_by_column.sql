-- AURA CROWD - LIKE TOGGLE MIGRATION
-- Run this in your Supabase SQL Editor to enable personal tracking of likes.

-- 1. Add the liked_by array column
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS liked_by TEXT[] DEFAULT '{}';

-- 2. Optional: Migration of existing likes (simple increment)
-- Note: This won't be perfectly accurate because we don't know who liked them previously,
-- but it prevents them from being lost. Future likes will use the array.

-- 3. Verify the change
-- SELECT id, likes, liked_by FROM public.posts LIMIT 5;
