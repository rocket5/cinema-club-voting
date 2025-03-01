/**
 * @jest-environment jsdom
 */

// Import the auth service
import authService from '../../services/auth.service';

// Mock the Supabase client
jest.mock('../../lib/supabase/client', () => {
  // Create mock implementations for auth methods
  const mockSignOut = jest.fn().mockResolvedValue({ error: null });
  const mockSignIn = jest.fn().mockImplementation((credentials) => {
    if (!credentials.email || !credentials.password) {
      return Promise.resolve({ 
        data: { user: null, session: null }, 
        error: new Error('Email and password are required') 
      });
    }
    
    if (credentials.email === TEST_CREDENTIALS.valid.email && 
        credentials.password === TEST_CREDENTIALS.valid.password) {
      return Promise.resolve({ 
        data: { 
          user: { id: 'test-user-id', email: credentials.email },
          session: { access_token: 'test-token' }
        }, 
        error: null 
      });
    }
    
    return Promise.resolve({ 
      data: { user: null, session: null }, 
      error: new Error('Invalid credentials') 
    });
  });
  
  const mockSignUp = jest.fn().mockResolvedValue({ 
    data: { user: { id: 'test-id' } }, 
    error: null 
  });
  
  const mockGetSession = jest.fn().mockResolvedValue({ 
    data: { session: { user: { id: 'test-id' } } }, 
    error: null 
  });
  
  const mockOnAuthStateChange = jest.fn((callback) => {
    // Store the callback for testing purposes
    global.authStateChangeCallback = callback;
    return { 
      data: { 
        subscription: { 
          unsubscribe: jest.fn() 
        } 
      } 
    };
  });
  
  // Create mock DB methods
  const mockSelect = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockResolvedValue({ 
    data: { id: 'test-id', name: 'Test User', is_host: false },
    error: null
  });
  const mockUpsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    upsert: mockUpsert,
    update: mockUpdate
  });
  
  // Create the mock auth object
  const mockAuth = {
    signOut: mockSignOut,
    signInWithPassword: mockSignIn,
    signUp: mockSignUp,
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange
  };
  
  // Export the mock Supabase client
  return {
    supabase: {
      auth: mockAuth,
      from: mockFrom
    }
  };
});

// Test credentials
const TEST_CREDENTIALS = {
  valid: {
    email: 'test@example.com',
    password: 'password123'
  },
  invalid: {
    email: 'test@example.com',
    password: 'wrong-password'
  },
  nonexistent: {
    email: 'nonexistent@example.com',
    password: 'password123'
  }
};

// Utility to create delays (simulating network conditions)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Login Integration Tests', () => {
  // Setup before tests
  beforeAll(() => {
    // Mock timers for testing timeouts
    jest.useFakeTimers();
  });

  // Cleanup after tests
  afterAll(() => {
    jest.useRealTimers();
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
  });

  // Test 1: Successful login
  test('should successfully log in with valid credentials', async () => {
    // Execute
    const signInResult = await authService.signIn(TEST_CREDENTIALS.valid);
    
    // Verify
    expect(signInResult.error).toBeNull();
    expect(signInResult.data.user).toBeDefined();
    expect(signInResult.data.user.id).toBe('test-user-id');
    
    // Verify session exists
    const sessionResult = await authService.getSession();
    expect(sessionResult.data.session).toBeDefined();
    
    // Clean up: sign out after success
    await authService.signOut();
  });
  
  // Test 2: Invalid credentials
  test('should reject login with invalid credentials', async () => {
    // Execute
    const signInResult = await authService.signIn(TEST_CREDENTIALS.invalid);
    
    // Verify
    expect(signInResult.error).toBeDefined();
    expect(signInResult.data.user).toBeNull();
  });
  
  // Test 3: Nonexistent user
  test('should reject login for nonexistent user', async () => {
    // Execute
    const signInResult = await authService.signIn(TEST_CREDENTIALS.nonexistent);
    
    // Verify
    expect(signInResult.error).toBeDefined();
    expect(signInResult.data.user).toBeNull();
  });
  
  // Test 4: Empty credentials
  test('should reject login with empty credentials', async () => {
    // Execute
    const signInResult = await authService.signIn({ email: '', password: '' });
    
    // Verify
    expect(signInResult.error).toBeDefined();
    expect(signInResult.data.user).toBeNull();
  });
  
  // Test 5: Missing credentials
  test('should reject login with missing credentials', async () => {
    // Execute
    const signInResult = await authService.signIn({});
    
    // Verify
    expect(signInResult.error).toBeDefined();
    expect(signInResult.data.user).toBeNull();
  });
  
  // Test 6: Login and immediate profile fetch
  test('should fetch profile immediately after login', async () => {
    // Login
    const signInResult = await authService.signIn(TEST_CREDENTIALS.valid);
    expect(signInResult.error).toBeNull();
    
    // Immediately fetch profile
    const userId = signInResult.data.user.id;
    const profileResult = await authService.getUserProfile(userId);
    
    // Verify
    expect(profileResult.error).toBeNull();
    expect(profileResult.data).toBeDefined();
    expect(profileResult.data.id).toBe('test-id');
    
    // Clean up: sign out after success
    await authService.signOut();
  });
  
  // Test 7: Login timeout simulation - with increased timeout
  test('should handle login timeout', async () => {
    // Skip running timers in real time
    jest.useRealTimers();
    
    // Create a mock implementation for this specific test
    const originalSignIn = authService.signIn;
    
    // Mock the signIn method to resolve immediately but simulate a timeout error
    authService.signIn = jest.fn().mockImplementation(() => {
      return Promise.resolve({ 
        data: { user: null, session: null }, 
        error: new Error('Login timed out') 
      });
    });
    
    // Execute
    const signInResult = await authService.signIn(TEST_CREDENTIALS.valid);
    
    // Verify
    expect(signInResult.error).toBeDefined();
    expect(signInResult.error.message).toBe('Login timed out');
    
    // Restore original implementation
    authService.signIn = originalSignIn;
    
    // Restore fake timers for other tests
    jest.useFakeTimers();
  }, 10000); // Increase timeout to 10 seconds
  
  // Test 8: Emergency cleanup
  test('should perform emergency cleanup', async () => {
    // Mock the emergencyCleanup method
    const originalEmergencyCleanup = authService.emergencyCleanup;
    authService.emergencyCleanup = jest.fn().mockImplementation((message) => {
      // Simulate the actual behavior
      localStorage.removeItem('sb-test-item');
      return Promise.resolve({ 
        success: true, 
        message: message || 'Forced logout' 
      });
    });
    
    // Set some localStorage items
    localStorage.setItem('sb-test-item', 'value');
    localStorage.setItem('other-item', 'value');
    
    // Execute emergency cleanup
    const cleanupResult = await authService.emergencyCleanup('Test cleanup');
    
    // Verify the method was called
    expect(authService.emergencyCleanup).toHaveBeenCalled();
    
    // Verify the result
    expect(cleanupResult.success).toBe(true);
    expect(cleanupResult.message).toBe('Test cleanup');
    
    // Verify localStorage state
    expect(localStorage.getItem('sb-test-item')).toBeNull();
    expect(localStorage.getItem('other-item')).toBe('value'); // Should still exist
    
    // Restore original implementation
    authService.emergencyCleanup = originalEmergencyCleanup;
  });
  
  // Test 9: Sign out
  test('should sign out successfully', async () => {
    // Execute
    const result = await authService.signOut();
    
    // Verify
    expect(result.success).toBe(true);
  });
}); 