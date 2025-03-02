# Supabase Auth Trigger for Profile Creation

This document explains how to set up an automatic trigger in Supabase that creates a profile entry whenever a new user signs up.

## The Problem

Currently, when users sign up, their username and other metadata are stored in the `auth.users` table's `raw_user_meta_data` field, but this information is not automatically transferred to the `profiles` table. This results in NULL values in the `username` and `name` columns of the `profiles` table.

## The Solution

We need to create a database trigger that automatically creates a profile entry whenever a new user is created in the authentication system.

## How to Apply

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query
4. Copy and paste the contents of `create-auth-trigger.sql` into the editor
5. Run the query

This will:
1. Create a function called `handle_new_user()` that extracts username and name from user metadata
2. Create a trigger that runs this function whenever a new user is created
3. The function will automatically create a profile entry with the user's ID, username, and name

## Testing

After applying the trigger:
1. Create a new user account through your application
2. Check the `profiles` table in the Supabase dashboard
3. Verify that a new profile was created with the correct username and name values

## Troubleshooting

If profiles are still not being created automatically:

1. Check the Supabase logs for any errors related to the trigger function
2. Verify that the `profiles` table has the expected columns (id, username, name, etc.)
3. Make sure the trigger is properly installed by querying:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
4. If needed, you can manually run the function for existing users:
   ```sql
   INSERT INTO public.profiles (id, username, name, created_at, updated_at)
   SELECT 
     id, 
     COALESCE(raw_user_meta_data->>'username', email), 
     COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'username', email),
     NOW(),
     NOW()
   FROM auth.users
   ON CONFLICT (id) DO NOTHING;
   ``` 