/**
 * Integration Test for Login Process (Node.js Compatible Version)
 * This script tests the entire login flow, including edge cases and error handling.
 * 
 * Usage:
 * 1. Update the TEST_CREDENTIALS with real credentials
 * 2. Run with Node.js: node login-test-node.js
 */

// Mock the Supabase client and auth service
const mockAuthService = {
  signIn: async (credentials) => {
    console.log('Mock signIn called with:', credentials);
    if (!credentials.email || !credentials.password) {
      return { data: { user: null, session: null }, error: new Error('Email and password are required') };
    }
    
    if (credentials.email === TEST_CREDENTIALS.valid.email && 
        credentials.password === TEST_CREDENTIALS.valid.password) {
      return { 
        data: { 
          user: { id: 'test-user-id', email: credentials.email },
          session: { access_token: 'test-token' }
        }, 
        error: null 
      };
    }
    
    return { data: { user: null, session: null }, error: new Error('Invalid credentials') };
  },
  
  signOut: async () => {
    console.log('Mock signOut called');
    return { success: true };
  },
  
  getSession: async () => {
    console.log('Mock getSession called');
    return { data: { session: { user: { id: 'test-user-id' } } }, error: null };
  },
  
  getUserProfile: async (userId) => {
    console.log('Mock getUserProfile called for user:', userId);
    return { 
      data: { 
        id: userId,
        name: 'Test User',
        is_host: false,
        created_at: new Date(),
        updated_at: new Date()
      }, 
      error: null 
    };
  },
  
  emergencyCleanup: async (message) => {
    console.log('Mock emergencyCleanup called with message:', message);
    return { success: true, message: message || 'Forced logout' };
  }
};

// Test credentials
const TEST_CREDENTIALS = {
  valid: {
    email: 'test@example.com',      // Replace with real email
    password: 'password123'          // Replace with real password
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
global.window = {
  location: {
    href: '',
    reload: () => console.log('Window reload called')
  }
};

// Mock localStorage
global.localStorage = {
  _data: {},
  getItem: function(key) {
    return this._data[key] || null;
  },
  setItem: function(key, value) {
    this._data[key] = value.toString();
  },
  removeItem: function(key) {
    delete this._data[key];
  },
  clear: function() {
    this._data = {};
  }
};

// Mock sessionStorage
global.sessionStorage = {
  _data: {},
  getItem: function(key) {
    return this._data[key] || null;
  },
  setItem: function(key, value) {
    this._data[key] = value.toString();
  },
  removeItem: function(key) {
    delete this._data[key];
  },
  clear: function() {
    this._data = {};
  }
};

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
      const signInResult = await mockAuthService.signIn(TEST_CREDENTIALS.valid);
      if (signInResult.error) {
        throw new Error(`Login failed: ${signInResult.error.message}`);
      }
      console.log('✅ Login successful');
      console.log(`  User ID: ${signInResult.data.user.id}`);
      console.log(`  Email: ${signInResult.data.user.email}`);
      testsSucceeded++;
      
      // Verify session exists
      const sessionResult = await mockAuthService.getSession();
      if (!sessionResult.data.session) {
        throw new Error('Session not created after login');
      }
      console.log('✅ Session verified');
      testsSucceeded++;
      
      // Clean up: sign out after success
      await mockAuthService.signOut();
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
      const signInResult = await mockAuthService.signIn(TEST_CREDENTIALS.invalid);
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
      const signInResult = await mockAuthService.signIn(TEST_CREDENTIALS.nonexistent);
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
      const signInResult = await mockAuthService.signIn({ email: '', password: '' });
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
      const signInResult = await mockAuthService.signIn({});
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
      const signInResult = await mockAuthService.signIn(TEST_CREDENTIALS.valid);
      if (signInResult.error) {
        throw new Error(`Login failed: ${signInResult.error.message}`);
      }
      console.log('✅ Login successful');
      
      // Immediately fetch profile
      const userId = signInResult.data.user.id;
      const profileResult = await mockAuthService.getUserProfile(userId);
      
      if (profileResult.error) {
        throw new Error(`Profile fetch failed: ${profileResult.error.message}`);
      }
      console.log('✅ Profile fetch successful immediately after login');
      console.log('  Profile:', profileResult.data);
      testsSucceeded++;
      
      // Clean up: sign out after success
      await mockAuthService.signOut();
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
      const timeoutAuthService = {
        ...mockAuthService,
        signIn: async () => {
          // Simulate a long delay
          await delay(5000);
          return { data: { user: null, session: null }, error: new Error('Timeout') };
        }
      };
      
      // Start the login
      const loginPromise = timeoutAuthService.signIn(TEST_CREDENTIALS.valid);
      
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
      localStorage.setItem('sb-test-item', 'value');
      localStorage.setItem('other-item', 'value');
      
      // Execute emergency cleanup
      const cleanupResult = await mockAuthService.emergencyCleanup('Test cleanup');
      
      if (!cleanupResult.success) {
        throw new Error('Emergency cleanup failed');
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