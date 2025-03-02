-- Check if the profiles table has the necessary columns
-- and add them if they don't exist

-- Check if the profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- Create the profiles table if it doesn't exist
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY,
      username TEXT,
      name TEXT,
      is_host BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Enable RLS on the profiles table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'Profiles table already exists';
  END IF;
  
  -- Check if the username column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'username'
  ) THEN
    -- Add the username column
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    RAISE NOTICE 'Added username column';
  ELSE
    RAISE NOTICE 'Username column already exists';
  END IF;
  
  -- Check if the name column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'name'
  ) THEN
    -- Add the name column
    ALTER TABLE public.profiles ADD COLUMN name TEXT;
    RAISE NOTICE 'Added name column';
  ELSE
    RAISE NOTICE 'Name column already exists';
  END IF;
  
  -- Check if the is_host column exists
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_host'
  ) THEN
    -- Add the is_host column
    ALTER TABLE public.profiles ADD COLUMN is_host BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_host column';
  ELSE
    RAISE NOTICE 'is_host column already exists';
  END IF;
END $$;

-- Show the current schema of the profiles table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY 
  ordinal_position; 