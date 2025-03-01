# FaunaDB to Supabase Migration Guide

This document outlines the steps to migrate from FaunaDB to Supabase in the Cinema Club Voting application.

## Migration Steps

### 1. Set Up Supabase Tables

Run the SQL script in `database/supabase-schema.sql` in the Supabase SQL Editor to create the necessary tables:

- `sessions` - For storing cinema club sessions
- `movies` - For storing movies associated with sessions
- `votes` - For storing user votes on movies

### 2. Update Environment Variables

Ensure the following environment variables are set:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can remove the FaunaDB environment variables once the migration is complete:

```
FAUNA_SECRET_KEY
```

### 3. Update Netlify Functions

Update all Netlify functions to use the Supabase services instead of FaunaDB:

1. Update imports from `'../../src/lib/fauna/...'` to `'../../src/lib/supabase/...'`
2. Update any FaunaDB-specific code to use Supabase equivalents
3. Ensure that all Supabase service files use CommonJS syntax (`module.exports` and `require`) instead of ES modules syntax (`export` and `import`) for compatibility with Netlify functions

### 4. Testing the Migration

Test each functionality to ensure it works with Supabase:

1. Creating and retrieving sessions
2. Adding and retrieving movies
3. Voting on movies
4. User authentication (already using Supabase)

### 5. Cleanup

Once everything is working with Supabase, you can:

1. Remove FaunaDB dependencies from `package.json`
2. Remove FaunaDB-related files and directories
3. Update documentation to reflect the new database setup

## API Differences

### Data Format

- FaunaDB uses camelCase for field names
- Supabase uses snake_case for field names

The service layer handles the conversion between these formats, so the rest of the application should continue to work with camelCase.

### Authentication

Supabase authentication is already implemented in the application. The Row Level Security (RLS) policies in the Supabase schema ensure that users can only access and modify their own data.

### Querying

- FaunaDB uses FQL (Fauna Query Language)
- Supabase uses a SQL-like query builder

The service layer abstracts these differences, so the rest of the application should not need to change.

## Troubleshooting

### Common Issues

1. **Missing Tables**: Ensure you've run the SQL script to create all necessary tables.
2. **Authentication Issues**: Check that the Supabase URL and anon key are correctly set.
3. **Permission Errors**: Verify that the RLS policies are correctly set up.
4. **Data Format Issues**: Check that the service layer is correctly converting between camelCase and snake_case.

### Debugging

- Check the Netlify function logs for errors
- Use the Supabase dashboard to inspect the database tables and logs
- Test the API endpoints using tools like Postman or curl 