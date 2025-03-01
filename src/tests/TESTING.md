# Testing Setup for Cinema Club Voting

This document outlines the testing setup for the Cinema Club Voting application.

## Testing Framework

We use Jest as our testing framework with the following configuration:

- **Jest**: Main testing framework
- **jest-environment-jsdom**: For DOM testing
- **@testing-library/react**: For React component testing
- **@testing-library/jest-dom**: For additional DOM matchers

## Configuration Files

- **jest.config.js**: Main Jest configuration
- **.babelrc**: Babel configuration for transpiling JavaScript
- **src/tests/setupTests.js**: Global test setup and mocks
- **src/tests/mocks/**: Mock files for CSS and assets

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm run test:jest

# Run a specific test file
npm run test:jest -- --testPathPattern=path/to/test.js

# Run simple tests to verify setup
npm run test:simple

# Run login integration tests
npm run test:login

# Run Supabase client and authentication tests
npm run test:supabase
```

## Test Structure

Tests are organized in the following directories:

- **src/tests/services/**: Tests for service modules
- **src/tests/supabase/**: Tests for Supabase integration
  - `client.test.js`: Tests for the Supabase client initialization and methods
  - `auth.test.js`: Tests for the authentication service using Supabase
- **src/tests/integration/**: Integration tests
  - **login.test.js**: Tests for the login flow
- **src/tests/simple.test.js**: Basic tests to verify Jest setup
- **src/tests/__mocks__/**: Mock implementations for modules

## Integration Tests

### Login Tests

The `login.test.js` file contains integration tests for the authentication flow:

1. **Successful Login**: Tests that a user can log in with valid credentials
2. **Invalid Credentials**: Tests that login is rejected with invalid credentials
3. **Nonexistent User**: Tests that login is rejected for nonexistent users
4. **Empty Credentials**: Tests that login is rejected with empty credentials
5. **Missing Credentials**: Tests that login is rejected with missing credentials
6. **Profile Fetch**: Tests that a user profile can be fetched after login
7. **Timeout Handling**: Tests that timeouts during login are handled properly
8. **Emergency Cleanup**: Tests the emergency cleanup functionality
9. **Sign Out**: Tests that a user can sign out successfully

## Mocks

The following browser APIs and services are mocked for testing:

- **localStorage**: Mocked to simulate browser storage
- **sessionStorage**: Mocked to simulate browser session storage
- **window.location**: Mocked to test navigation and page reloads
- **document.cookie**: Mocked to test cookie operations
- **fetch**: Mocked for API requests
- **Supabase Client**: Mocked to test Supabase integration without actual API calls

## Troubleshooting

If you encounter issues with tests:

1. Ensure all dependencies are installed: `npm install`
2. Check that the Jest configuration is correct
3. Verify that mocks are properly set up
4. Use the simple test (`npm run test:simple`) to verify the basic setup

## Best Practices

- Use the `@jest-environment jsdom` comment at the top of test files that need DOM access
- Mock external dependencies and APIs
- Use descriptive test names
- Group related tests in describe blocks
- Clean up after tests using beforeEach/afterEach hooks 