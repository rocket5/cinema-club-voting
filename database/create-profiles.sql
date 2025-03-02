-- Create profiles table for anonymous users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some default profiles for anonymous operations
INSERT INTO public.profiles (id, username, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Anonymous User 1', now(), now()),
    ('00000000-0000-0000-0000-000000000002', 'Anonymous User 2', now(), now()),
    ('test1', 'Test User 1', now(), now()),
    ('test2', 'Test User 2', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow read access to all profiles for all users"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Create policy to allow anonymous users to create profiles
CREATE POLICY "Allow insert access to profiles for anonymous users"
    ON public.profiles
    FOR INSERT
    TO anon
    WITH CHECK (true); 