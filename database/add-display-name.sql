-- Add display_name column to movies table
ALTER TABLE public.movies
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing movies to use email from auth.users as display_name
UPDATE public.movies m
SET display_name = u.email
FROM auth.users u
WHERE m.added_by = u.id
AND m.display_name IS NULL;

-- Create a comment explaining the column
COMMENT ON COLUMN public.movies.display_name IS 'Display name of the user who added the movie, for UI purposes';

-- Log the migration
INSERT INTO public.migrations (name, executed_at)
VALUES ('add-display-name-to-movies', now())
ON CONFLICT (name) DO NOTHING; 