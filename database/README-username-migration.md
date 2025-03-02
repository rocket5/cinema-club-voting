# Adding Username Column to Profiles Table

This migration adds a `username` column to the `profiles` table in the Supabase database. This column will be used to display user names in the application instead of relying on the `name` column which currently has NULL values.

## Option 1: Run in Supabase SQL Editor (Recommended)

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `add-username-to-profiles-direct.sql` into the editor
5. Run the query

This will:
- Add the `username` column to the `profiles` table
- Update existing profiles with a username derived from their user ID (e.g., "user_429063de")
- Show you the first 10 profiles with their new usernames

## Option 2: Run via Node.js Script

If you prefer to run the migration programmatically:

1. Make sure your `.env.local` file contains the correct Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the migration script:
   ```
   node database/run-migration.js
   ```

Note: This method requires that your Supabase instance has the `exec_sql` RPC function enabled, which may not be the case by default.

## Verifying the Migration

After running the migration, you should see the `username` column in the `profiles` table with values like `user_429063de` for each user.

The application code has been updated to use this column when displaying user names in the sessions list. 