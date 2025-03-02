-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Update existing profiles with a username derived from their ID
UPDATE public.profiles 
SET username = CONCAT('user_', SUBSTRING(id::text, 1, 8))
WHERE username IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN public.profiles.username IS 'Username for display purposes';

-- Make sure the column is included in the RLS policies
-- This assumes you have RLS enabled on the profiles table

-- If you want to make the username column required in the future, you can uncomment this:
-- ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL; 