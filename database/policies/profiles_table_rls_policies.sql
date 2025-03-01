-- Enable Row Level Security for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Create a policy that allows users to read any profile
CREATE POLICY "Anyone can read profiles" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Create a policy that allows users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id); 