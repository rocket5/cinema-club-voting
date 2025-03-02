-- Update existing profiles with username and name from user metadata
-- This script will update all existing profiles with the username and name from the auth.users table

-- First, update the username field
UPDATE public.profiles p
SET username = COALESCE(u.raw_user_meta_data->>'username', u.email)
FROM auth.users u
WHERE p.id = u.id
AND (p.username IS NULL OR p.username = '');

-- Then, update the name field
UPDATE public.profiles p
SET name = COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'username', u.email)
FROM auth.users u
WHERE p.id = u.id
AND (p.name IS NULL OR p.name = '');

-- Create missing profiles for users that don't have one
INSERT INTO public.profiles (id, username, name, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', email), 
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'username', email),
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Show the results
SELECT 
  u.id, 
  u.email, 
  u.raw_user_meta_data->>'username' as auth_username,
  u.raw_user_meta_data->>'name' as auth_name,
  p.username as profile_username,
  p.name as profile_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LIMIT 100; 