# Supabase Authentication Tests

This directory contains tests for the Supabase authentication implementation in the Cinema Club Voting application. The tests are designed to verify that authentication works correctly and to help diagnose issues.

## Test Structure

The tests are organized into the following directories:

- `supabase/` - Unit tests for Supabase client and auth service
- `integration/` - Integration tests that test the entire authentication flow
- `services/` - Unit tests for service layer implementations

## How to Run Tests

### Unit Tests

Unit tests can be run using Jest. Make sure you have Jest installed:

```bash
npm install --save-dev jest @testing-library/react @testing-library/react-hooks
```

Then run the tests:

```bash
# Run all unit tests
npm test

# Run Supabase-specific tests
npx jest src/tests/supabase

# Run a specific test file
npx jest src/tests/supabase/auth.test.js
```

### Integration Tests

Integration tests use real credentials to test against the actual Supabase backend. Before running these tests, you need to:

1. Update the test files with real credentials
2. Make sure your environment variables are set up correctly

To run the integration tests:

```bash
# Test authentication service with real credentials
node src/tests/supabase/run-auth-tests.js

# Test login flow with edge cases
node src/tests/integration/login-test.js
```

## Setting Up Test Credentials

To run the integration tests, you need to replace the placeholder credentials in the test files:

1. Open `src/tests/supabase/run-auth-tests.js` and update:
   ```javascript
   const EMAIL = 'test@example.com'; // Replace with real email
   const PASSWORD = 'password123';    // Replace with real password
   ```

2. Open `src/tests/integration/login-test.js` and update:
   ```javascript
   const TEST_CREDENTIALS = {
     valid: {
       email: 'test@example.com',      // Replace with real email
       password: 'password123'          // Replace with real password
     },
     // Keep other credential sets as they are
   };
   ```

## Debugging Authentication Issues

If you encounter authentication issues, follow these steps:

1. Check the browser console for error messages
2. Use the debug tools in the UI (look for "Debug Info" sections)
3. Run the integration tests to verify API connectivity
4. Check Supabase environment variables are correctly set:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

### Common Issues and Solutions

1. **Login gets stuck in loading state:**
   - Use the "Emergency Reset" button
   - Check for unhandled Promise rejections in the console
   - Verify `onAuthStateChange` is working correctly

2. **Profile data not loading:**
   - Check console for database query errors
   - Verify profile table exists in Supabase
   - Test profile fetch directly using `authService.getUserProfile()`

3. **Session not persisting across page reloads:**
   - Check localStorage for Supabase session data
   - Verify `autoRefreshToken` is set to true in Supabase client
   - Test session retrieval using `authService.getSession()`

## Architecture Overview

The authentication system follows best practices:

1. **Single Responsibility Principle:**
   - `client.js` - Handles Supabase client initialization
   - `auth.service.js` - Encapsulates authentication operations
   - `AuthContext.js` - Manages auth state in React

2. **Error Handling:**
   - All API calls have try/catch blocks
   - Timeout protection using Promise.race()
   - Fallback mechanisms for failures

3. **Testing:**
   - Unit tests for individual components
   - Integration tests for full authentication flow
   - Timeout and error case testing 