-- Add policy for anonymous users to insert movies
CREATE POLICY "Allow insert access to movies for anonymous users"
    ON public.movies
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Add policy for anonymous users to read movies
CREATE POLICY "Allow read access to all movies for anonymous users"
    ON public.movies
    FOR SELECT
    TO anon
    USING (true);

-- Add policy for anonymous users to read sessions
CREATE POLICY "Allow read access to all sessions for anonymous users"
    ON public.sessions
    FOR SELECT
    TO anon
    USING (true); 