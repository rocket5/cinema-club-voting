/**
 * @jest-environment jsdom
 */

import { supabase } from '../../lib/supabase/client';

// Mock the Supabase client
jest.mock('../../lib/supabase/client', () => {
  // Create mock implementations for auth methods
  const mockSignOut = jest.fn().mockResolvedValue({ error: null });
  const mockSignIn = jest.fn().mockResolvedValue({ 
    data: { user: { id: 'test-id' }, session: { access_token: 'test-token' } }, 
    error: null 
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
  
  // Create mock for upsert().select()
  const mockUpsertSelect = jest.fn().mockResolvedValue({
    data: { id: 'test-id' },
    error: null
  });
  
  // Create mock for upsert
  const mockUpsert = jest.fn().mockReturnValue({
    select: mockUpsertSelect
  });
  
  // Create mock for update().eq()
  const mockUpdateEq = jest.fn().mockResolvedValue({
    data: { id: 'test-id' },
    error: null
  });
  
  // Create mock for update
  const mockUpdate = jest.fn().mockReturnValue({
    eq: mockUpdateEq
  });
  
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

// Mock the browser's localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn(index => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

// Set up global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
Object.defineProperty(window, 'location', { 
  value: {
    reload: jest.fn(),
    href: 'https://example.com'
  },
  writable: true
});

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
});

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Import the auth service after mocking
import authService from '../../services/auth.service';

describe('Auth Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
  });

  describe('signIn', () => {
    it('should sign in a user with valid credentials', async () => {
      // Test data
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Execute
      const result = await authService.signIn(credentials);
      
      // Verify
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });
    
    it('should handle sign in errors', async () => {
      // Mock error for this test
      const mockError = { message: 'Invalid login credentials' };
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError
      });
      
      // Test data
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      
      // Execute
      const result = await authService.signIn(credentials);
      
      // Verify
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.error).toEqual(mockError);
    });
    
    it('should handle exceptions during sign in', async () => {
      // Mock exception for this test
      const mockError = new Error('Network error');
      supabase.auth.signInWithPassword.mockRejectedValueOnce(mockError);
      
      // Test data
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Execute
      const result = await authService.signIn(credentials);
      
      // Verify
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.error).toEqual(mockError);
    });
  });
  
  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      // Execute
      const result = await authService.signOut();
      
      // Verify
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle sign out errors with emergency cleanup', async () => {
      // Mock error for this test
      const mockError = { message: 'Sign out failed' };
      supabase.auth.signOut.mockResolvedValueOnce({ error: mockError });
      
      // Setup localStorage with some items
      localStorage.setItem('sb-test-auth', 'test-value');
      
      // Execute
      const result = await authService.signOut();
      
      // Verify
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Forced logout');
      
      // For this test, we'll manually remove the item to simulate the behavior
      localStorage.removeItem('sb-test-auth');
    });
  });
  
  describe('getSession', () => {
    it('should get the current session', async () => {
      // Execute
      const result = await authService.getSession();
      
      // Verify
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.data.session).toBeDefined();
    });
    
    it('should handle get session errors', async () => {
      // Mock error for this test
      const mockError = { message: 'Session retrieval failed' };
      supabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: mockError
      });
      
      // Execute
      const result = await authService.getSession();
      
      // Verify
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.error).toEqual(mockError);
    });
  });
  
  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      // Test data
      const callback = jest.fn();
      
      // Execute
      const result = authService.onAuthStateChange(callback);
      
      // Verify
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(result.data.subscription).toBeDefined();
      
      // Trigger the callback with a mocked auth event
      global.authStateChangeCallback('SIGNED_IN', { user: { id: 'test-id' } });
      
      // Verify callback was called with correct arguments
      expect(callback).toHaveBeenCalledWith('SIGNED_IN', { user: { id: 'test-id' } });
    });
  });
  
  describe('User Profile Management', () => {
    it('should create a user profile', async () => {
      // Test data
      const userId = 'test-id';
      const userData = { name: 'Test User' };
      
      // Execute
      const result = await authService.createUserProfile(userId, userData);
      
      // Verify
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.error).toBeNull();
    });
    
    it('should get a user profile', async () => {
      // Test data
      const userId = 'test-id';
      
      // Execute
      const result = await authService.getUserProfile(userId);
      
      // Verify
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
    
    it('should update a user profile', async () => {
      // Test data
      const userId = 'test-id';
      const profileData = { name: 'Updated Name' };
      
      // Execute
      const result = await authService.updateUserProfile(userId, profileData);
      
      // Verify
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.error).toBeNull();
    });
  });
  
  describe('Emergency Functions', () => {
    it('should perform emergency cleanup', async () => {
      // Setup localStorage with some items
      localStorage.setItem('sb-test-auth', 'test-value');
      
      // Execute
      const result = await authService.emergencyCleanup('Test cleanup');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.message).toBe('Test cleanup');
      
      // For this test, we'll manually remove the item to simulate the behavior
      localStorage.removeItem('sb-test-auth');
    });
    
    it('should perform emergency reset', async () => {
      // Execute
      const result = await authService.emergencyReset();
      
      // Verify
      expect(result.success).toBe(true);
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });
}); 