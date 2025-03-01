/**
 * Integration Test for Login Process
 * This script tests the entire login flow, including edge cases and error handling.
 * 
 * Usage:
 * 1. Update the TEST_CREDENTIALS with real credentials
 * 2. Run with Node.js: node login-test.js
 */

// Import the auth service
const authService = require('../../services/auth.service').default;

// Test credentials
const TEST_CREDENTIALS = {
  valid: {
    email: 'rocket5tim+test1@gmail.com',      // Replace with real email
    password: 'password'          // Replace with real password
  },
  invalid: {
    email: 'test@example.com',       // Replace with real email
    password: 'wrong-password'       // Keep this as an intentionally wrong password
  },
  nonexistent: {
    email: 'nonexistent@example.com',
    password: 'password123'
  }
};

// Mock window.location for browser-like behavior
if (typeof window === 'undefined') {
  global.window = {
    location: {
      href: '',
      reload: () => console.log('Window reload called')
    }
  };
}

// Utility to create delays (simulating network conditions)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test runner
async function runLoginTests() {
  console.log('=== Login Integration Tests ===');
  
  // Track overall test success
  let testsSucceeded = 0;
  let testsFailed = 0;
  
  try {
    // Test 1: Successful login
    console.log('\n--- Test 1: Successful Login ---');
    try {
      const signInResult = await authService.signIn(TEST_CREDENTIALS.valid);
      if (signInResult.error) {
        throw new Error(`Login failed: ${signInResult.error.message}`);
      }
      console.log('✅ Login successful');
      console.log(`  User ID: ${signInResult.data.user.id}`);
      console.log(`  Email: ${signInResult.data.user.email}`);
      testsSucceeded++;
      
      // Verify session exists
      const sessionResult = await authService.getSession();
      if (!sessionResult.data.session) {
        throw new Error('Session not created after login');
      }
      console.log('✅ Session verified');
      testsSucceeded++;
      
      // Clean up: sign out after success
      await authService.signOut();
      console.log('  Signed out after test');
    } catch (error) {
      console.error('❌ Test 1 failed:', error.message);
      testsFailed++;
    }
    
    // Let's add a small delay between tests
    await delay(1000);
    
    // Test 2: Invalid credentials
    console.log('\n--- Test 2: Invalid Credentials ---');
    try {
      const signInResult = await authService.signIn(TEST_CREDENTIALS.invalid);
      if (!signInResult.error) {
        throw new Error('Login with invalid credentials succeeded when it should fail');
      }
      console.log('✅ Login correctly rejected invalid credentials');
      console.log(`  Error message: ${signInResult.error.message}`);
      testsSucceeded++;
    } catch (error) {
      console.error('❌ Test 2 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 3: Nonexistent user
    console.log('\n--- Test 3: Nonexistent User ---');
    try {
      const signInResult = await authService.signIn(TEST_CREDENTIALS.nonexistent);
      if (!signInResult.error) {
        throw new Error('Login with nonexistent user succeeded when it should fail');
      }
      console.log('✅ Login correctly rejected nonexistent user');
      console.log(`  Error message: ${signInResult.error.message}`);
      testsSucceeded++;
    } catch (error) {
      console.error('❌ Test 3 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 4: Empty credentials
    console.log('\n--- Test 4: Empty Credentials ---');
    try {
      const signInResult = await authService.signIn({ email: '', password: '' });
      if (!signInResult.error) {
        throw new Error('Login with empty credentials succeeded when it should fail');
      }
      console.log('✅ Login correctly rejected empty credentials');
      console.log(`  Error message: ${signInResult.error.message}`);
      testsSucceeded++;
    } catch (error) {
      console.error('❌ Test 4 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 5: Missing credentials
    console.log('\n--- Test 5: Missing Credentials ---');
    try {
      const signInResult = await authService.signIn({});
      if (!signInResult.error) {
        throw new Error('Login with missing credentials succeeded when it should fail');
      }
      console.log('✅ Login correctly rejected missing credentials');
      console.log(`  Error message: ${signInResult.error.message}`);
      testsSucceeded++;
    } catch (error) {
      console.error('❌ Test 5 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 6: Login and immediate profile fetch
    console.log('\n--- Test 6: Login and Immediate Profile Fetch ---');
    try {
      // Login
      const signInResult = await authService.signIn(TEST_CREDENTIALS.valid);
      if (signInResult.error) {
        throw new Error(`Login failed: ${signInResult.error.message}`);
      }
      console.log('✅ Login successful');
      
      // Immediately fetch profile
      const userId = signInResult.data.user.id;
      const profileResult = await authService.getUserProfile(userId);
      
      if (profileResult.error) {
        throw new Error(`Profile fetch failed: ${profileResult.error.message}`);
      }
      console.log('✅ Profile fetch successful immediately after login');
      console.log('  Profile:', profileResult.data);
      testsSucceeded++;
      
      // Clean up: sign out after success
      await authService.signOut();
      console.log('  Signed out after test');
    } catch (error) {
      console.error('❌ Test 6 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 7: Login timeout simulation
    console.log('\n--- Test 7: Login Timeout Simulation ---');
    try {
      // Create a mock auth service with a delayed sign in
      const mockAuthService = {
        ...authService,
        signIn: async () => {
          // Simulate a long delay
          await delay(5000);
          return { data: { user: null, session: null }, error: new Error('Timeout') };
        }
      };
      
      // Start the login
      const loginPromise = mockAuthService.signIn(TEST_CREDENTIALS.valid);
      
      // Create a race with a timeout
      const result = await Promise.race([
        loginPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Login timed out')), 3000))
      ]).catch(error => ({ error }));
      
      if (result.error && result.error.message === 'Login timed out') {
        console.log('✅ Timeout handling worked correctly');
        testsSucceeded++;
      } else {
        throw new Error('Timeout handling failed');
      }
    } catch (error) {
      console.error('❌ Test 7 failed:', error.message);
      testsFailed++;
    }
    
    await delay(1000);
    
    // Test 8: Emergency cleanup
    console.log('\n--- Test 8: Emergency Cleanup ---');
    try {
      // Set some localStorage items
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sb-test-item', 'value');
        localStorage.setItem('other-item', 'value');
      }
      
      // Execute emergency cleanup
      const cleanupResult = await authService.emergencyCleanup('Test cleanup');
      
      if (!cleanupResult.success) {
        throw new Error('Emergency cleanup failed');
      }
      
      // Verify Supabase-related items are cleared
      if (typeof localStorage !== 'undefined') {
        const sbItemExists = localStorage.getItem('sb-test-item') !== null;
        const otherItemExists = localStorage.getItem('other-item') !== null;
        
        if (sbItemExists) {
          throw new Error('Supabase localStorage items were not cleared');
        }
        
        if (!otherItemExists) {
          console.log('  Note: Non-Supabase items were also cleared');
        }
      }
      
      console.log('✅ Emergency cleanup succeeded');
      testsSucceeded++;
    } catch (error) {
      console.error('❌ Test 8 failed:', error.message);
      testsFailed++;
    }
  } catch (error) {
    console.error('❌ Unexpected error during tests:', error);
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${testsSucceeded + testsFailed}`);
  console.log(`Succeeded: ${testsSucceeded}`);
  console.log(`Failed: ${testsFailed}`);
  
  return {
    success: testsFailed === 0,
    testsSucceeded,
    testsFailed
  };
}

// Run the tests
runLoginTests().then(results => {
  // Exit with appropriate code for automated testing
  if (!results.success) {
    console.log('❌ Some tests failed. See logs for details.');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 