# Cinema Club Voting - Debug Tools Guide

This guide explains how to use the debugging tools available in the Cinema Club Voting application to troubleshoot authentication, database connections, and session creation issues.

## Getting Started

### Prerequisites

Before using the debug tools, make sure you have:

1. Set up your Supabase environment variables in your `.env` file:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. For advanced operations like applying schema changes, you may need a service key:
   ```
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

### Accessing the Debug Interface

1. Start your development server:
   ```bash
   netlify dev
   ```

2. Navigate to the debug page in your browser:
   ```
   http://localhost:8888/debug.html
   ```

## Debug Interface Overview

The debug interface is divided into several sections:

### 1. Authentication

#### Login Tab
- Enter your email and password to authenticate with Supabase
- Click "Login" to sign in to your account

#### Signup Tab
- Create a new account with email, password, and optional username
- Click "Signup" to create an account and automatically log in

#### Token Tab
- View your current authentication token
- Copy the token for use in other tools or API requests
- Paste a custom token if you want to use a token from another source

### 2. Authentication Status

Located at the bottom of each tab:
- Shows if you're currently logged in
- Displays your email and user ID when authenticated
- Provides the "Logout" button to sign out
- Includes a "Check Auth" button to verify your current authentication status

### 3. Supabase Connection

In the Supabase tab:
- **Check Supabase Connection**: Tests connectivity to your Supabase instance
- **Apply Schema**: Applies the database schema to your Supabase instance

### 4. Debug Session

At the bottom of the page:
- Choose how to send your authentication token (query parameter or header)
- Click "Run Debug Session" to test session creation with your current authentication

## How to Use the Debug Tools

### Troubleshooting Authentication Issues

1. **Check if you're authenticated**:
   - Click the "Check Auth" button
   - If successful, you'll see your email and user ID
   - If unsuccessful, you'll see an error message

2. **Login with your credentials**:
   - Go to the Login tab
   - Enter your email and password
   - Click "Login"
   - Check the authentication status at the bottom

3. **Create a new account**:
   - Go to the Signup tab
   - Enter your email, password, and optional username
   - Click "Signup"
   - You'll be automatically logged in if successful

4. **Inspect your authentication token**:
   - Go to the Token tab
   - View your current token
   - Use the "Copy" button to copy it for use elsewhere

### Testing Supabase Connection

1. **Check basic connectivity**:
   - Go to the Supabase tab
   - Click "Check Supabase Connection"
   - Review the results to see:
     - If the connection was successful
     - If your authentication token is valid
     - If you can access the database tables
     - If the schema helper functions exist

2. **Apply the database schema**:
   - Go to the Supabase tab
   - Click "Apply Schema"
   - Confirm the action when prompted
   - Review the results to see which statements were executed successfully

### Debugging Session Creation

1. **Run a debug session test**:
   - Make sure you're authenticated (check the authentication status)
   - Choose how to send your token (query parameter or header)
   - Click "Run Debug Session"
   - Review the detailed output to identify any issues

2. **Interpreting debug session results**:
   - The output will show:
     - Authentication status and user details
     - Supabase connection test results
     - Table existence verification
     - Schema information
     - Results of attempting to create a test session

## Common Issues and Solutions

### Authentication Problems

1. **"Not logged in" error**:
   - Try logging in again with correct credentials
   - Check if your token has expired (tokens typically expire after 1 hour)
   - Verify that your Supabase URL and anon key are correct

2. **"Invalid token" error**:
   - Your token may have expired - log in again to get a fresh token
   - If using a custom token, ensure it's properly formatted and valid

### Database Connection Issues

1. **"Missing Supabase environment variables" error**:
   - Check your `.env` file for the correct variables
   - Restart your development server after updating environment variables

2. **"RLS policy violation" error**:
   - This indicates a Row Level Security policy is preventing the operation
   - Verify you're authenticated and have the correct permissions
   - Check if the schema has been properly applied

### Schema Problems

1. **"Table does not exist" error**:
   - Use the "Apply Schema" button to create the necessary tables
   - Check the schema application results for any errors

2. **"Column does not exist" error**:
   - The schema may be outdated - apply the latest schema
   - Check if the column name matches what's in your code (e.g., `name` vs `session_name`)

## Advanced Debugging

### Using the Debug Session Function

The debug session function performs several checks:

1. Verifies authentication
2. Tests basic Supabase connectivity
3. Checks if the sessions table exists
4. Retrieves the table schema
5. Attempts to insert a test session directly
6. Tries to create a session using the service function

This comprehensive check helps identify where issues might be occurring in your session creation process.

### Examining the Debug Output

The debug output is structured to help you identify issues:

```json
{
  "message": "Debug completed",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "result": {
    "success": true/false,
    "message": "Status message",
    "directInsert": [/* Results of direct insert */],
    "serviceResult": [/* Results of service function */],
    "error": "Error message if any"
  }
}
```

Look for:
- Authentication errors in the user section
- Database errors in the result section
- Specific error messages that point to configuration or code issues

## Schema Issues

If you're experiencing issues with the database schema, here are some specific things to check:

### Column Name Discrepancies

The schema in `database/supabase-schema.sql` defines the sessions table with a column named `session_name`, but some parts of the application might be using `name` instead. If you encounter errors related to missing columns, check for these naming inconsistencies.

### Row Level Security (RLS) Policies

The schema includes RLS policies that restrict access based on user authentication:

- Sessions can only be created by authenticated users
- Users can only modify sessions where they are the host
- Similar restrictions apply to movies and votes

If you're getting permission errors, ensure you're properly authenticated and that your user ID matches the required field (e.g., `host_id` for sessions).

### Schema Verification

You can use the "Check Supabase Connection" button to verify if the `get_table_schema` function exists. This function helps diagnose schema issues by returning the structure of database tables.

## Conclusion

These debug tools provide a comprehensive way to troubleshoot issues with your Cinema Club Voting application. By systematically checking authentication, database connectivity, and session creation, you can identify and resolve problems more efficiently.

If you encounter persistent issues, review the detailed error messages in the debug output and check your Supabase dashboard for additional information about database structure and permissions. 