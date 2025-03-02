-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Update existing profiles with a username derived from their ID
UPDATE public.profiles 
SET username = CONCAT('user_', SUBSTRING(id::text, 1, 8))
WHERE username IS NULL;

-- Verify the update
SELECT id, username FROM public.profiles LIMIT 10; 