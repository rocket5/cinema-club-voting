# Testing the Cinema Club Voting Application

This directory contains tests for the Cinema Club Voting application.

## Environment Setup

Before running the tests, make sure you have the following environment variables set in your `.env` file:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can copy the provided `.env.test.example` file as a starting point:

```bash
cp src/tests/.env.test.example .env
# Then edit .env with your actual credentials
```

### Authentication for Tests (Optional)

If your Supabase database uses Row-Level Security (RLS) policies that require authentication, you can provide test user credentials:

```
TEST_USER_EMAIL=your_test_user_email
TEST_USER_PASSWORD=your_test_user_password
```

This will allow the tests to run with an authenticated user, which can help bypass RLS policy restrictions.

## Available Test Scripts

### Verify Environment Variables

To verify that your environment variables are set correctly:

```bash
npm run verify:env
```

This will check if the required environment variables are available and if the Supabase client can be initialized correctly.

### Voting Functionality Tests

To run the voting functionality tests:

```bash
npm run test:voting
```

This will test the following functionality:
- Creating votes
- Getting votes by user and session
- Checking if a user has voted in a session
- Getting session results
- Deleting votes by user and session

### Full Voting Test Suite

To run both the environment verification and the voting tests:

```bash
npm run test:voting:full
```

## Troubleshooting

If you encounter issues with the tests, check the following:

1. **Environment Variables**: Make sure your `.env` file contains the correct Supabase URL and anonymous key.

2. **Supabase Connection**: Verify that you can connect to Supabase by running `npm run verify:env`.

3. **Database Tables**: Ensure that the `votes` table exists in your Supabase database with the following columns:
   - `id` (uuid, primary key)
   - `session_id` (uuid)
   - `movie_id` (uuid)
   - `user_id` (uuid)
   - `rank` (integer)
   - `voted_at` (timestamp with time zone)

4. **Row-Level Security (RLS) Policies**: If you encounter a "violates row-level security policy" error, this means your RLS policies are preventing the test from accessing the votes table. You have two options:

   a. **Recommended: Use Authentication for Tests**
      - Add TEST_USER_EMAIL and TEST_USER_PASSWORD to your `.env` file
      - Make sure this user has the necessary permissions according to your RLS policies
      - The tests will automatically sign in with this user before running

   b. **Alternative: Adjust Your RLS Policies for Testing**
      - If you're in a development environment, you might consider temporarily adjusting your RLS policies to allow the test operations
      - Make sure to revert any changes after testing

5. **Permissions**: Make sure the user you're testing with has the necessary permissions to read, insert, update, and delete records in the `votes` table according to your RLS policies.

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new test file in the `src/tests` directory.
2. Use the existing test files as templates.
3. Make sure to clean up any test data created during the test.
4. Add a new script to `package.json` to run your test.
5. Update this README with information about your new test.

## Common Errors and Solutions

### Invalid UUID Format

If you see an error like `invalid input syntax for type uuid`, make sure you're using proper UUID format for all IDs. The test files now use a UUID generator function to create valid UUIDs.

### Row-Level Security Policy Violation

If you see an error like `new row violates row-level security policy for table "votes"`, you need to run the tests with an authenticated user by setting TEST_USER_EMAIL and TEST_USER_PASSWORD in your `.env` file.

### Function Not Found

If you see an error related to a function not found (like `get_table_info`), this is not critical for the tests to run. It's just a helper function used in the environment verification script. 