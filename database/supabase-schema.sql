-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    host_id UUID NOT NULL,
    winning_movie UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    added_by UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    poster TEXT,
    year TEXT,
    director TEXT,
    genre TEXT,
    imdb_rating TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rank INTEGER NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(session_id, movie_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_host_id ON public.sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_movies_session_id ON public.movies(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_id ON public.votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_movie_id ON public.votes(movie_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

-- Set up Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Allow read access to all sessions for authenticated users"
    ON public.sessions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to sessions for authenticated users"
    ON public.sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Allow update access to sessions for hosts"
    ON public.sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = host_id)
    WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Allow delete access to sessions for hosts"
    ON public.sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = host_id);

-- Create policies for movies
CREATE POLICY "Allow read access to all movies for authenticated users"
    ON public.movies
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to movies for authenticated users"
    ON public.movies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Allow update access to movies for owners"
    ON public.movies
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = added_by)
    WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Allow delete access to movies for owners"
    ON public.movies
    FOR DELETE
    TO authenticated
    USING (auth.uid() = added_by);

-- Create policies for votes
CREATE POLICY "Allow read access to all votes for authenticated users"
    ON public.votes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow insert access to votes for authenticated users"
    ON public.votes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update access to votes for owners"
    ON public.votes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow delete access to votes for owners"
    ON public.votes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create RPC function to get table schema
CREATE OR REPLACE FUNCTION get_table_schema(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable BOOLEAN,
  column_default TEXT
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    (c.is_nullable = 'YES')::BOOLEAN,
    c.column_default::TEXT
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = 'public' 
    AND c.table_name = table_name
  ORDER BY 
    c.ordinal_position;
END;
$$ LANGUAGE plpgsql; 