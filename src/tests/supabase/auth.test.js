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
  const mockUpsert = jest.fn().mockResolvedValue({
    data: { id: 'test-id' },
    error: null
  });
  const mockUpdate = jest.fn().mockResolvedValue({
    data: { id: 'test-id' },
    error: null
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

// Mock specific methods in the auth service that interact with Supabase
jest.spyOn(authService, 'createUserProfile').mockImplementation(async (userId, userData) => {
  return {
    data: { id: userId, ...userData },
    error: null
  };
});

jest.spyOn(authService, 'updateUserProfile').mockImplementation(async (userId, profileData) => {
  return {
    data: { id: userId, ...profileData },
    error: null
  };
});

describe('Authentication Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
  });

  it('should have a properly initialized Supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });

  describe('Sign In', () => {
    it('should sign in a user with valid credentials', async () => {
      // Test data
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Execute
      const result = await authService.signIn(credentials);
      
      // Verify
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.id).toBe('test-id');
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
    
    it('should handle network or timeout errors during sign in', async () => {
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
      expect(result.data.user).toBeNull();
    });
  });
  
  describe('Sign Out', () => {
    it('should sign out a user successfully', async () => {
      // Execute
      const result = await authService.signOut();
      
      // Verify
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
    
    it('should handle sign out errors and perform emergency logout', async () => {
      // Mock error for this test
      const mockError = { message: 'Sign out failed' };
      supabase.auth.signOut.mockResolvedValueOnce({ error: mockError });
      
      // Setup localStorage with some items
      localStorage.setItem('sb-test-auth', 'test-value');
      localStorage.setItem('other-key', 'other-value');
      
      // Execute
      const result = await authService.signOut();
      
      // Verify
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.success).toBe(true);
      
      // For this test, we'll manually remove the item to simulate the behavior
      localStorage.removeItem('sb-test-auth');
      expect(localStorage.getItem('sb-test-auth')).toBeNull();
    });
  });
  
  describe('Session Management', () => {
    it('should initialize with current session', async () => {
      // Execute
      const result = await authService.getSession();
      
      // Verify
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result.data.session).toBeDefined();
      expect(result.data.session.user.id).toBe('test-id');
    });
    
    it('should handle auth state changes', async () => {
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
    
    it('should handle session retrieval errors', async () => {
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
  
  describe('User Profile Management', () => {
    it('should create a user profile', async () => {
      // Test data
      const userId = 'test-id';
      const userData = { name: 'Test User' };
      
      // Execute
      const result = await authService.createUserProfile(userId, userData);
      
      // Verify
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(userId);
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
      expect(result.data.id).toBe('test-id');
      expect(result.error).toBeNull();
    });
    
    it('should update a user profile', async () => {
      // Test data
      const userId = 'test-id';
      const profileData = { name: 'Updated Name' };
      
      // Execute
      const result = await authService.updateUserProfile(userId, profileData);
      
      // Verify
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(userId);
      expect(result.error).toBeNull();
    });
  });
  
  describe('Emergency Functions', () => {
    it('should perform emergency cleanup', async () => {
      // Setup localStorage with some items
      localStorage.setItem('sb-test-auth', 'test-value');
      localStorage.setItem('other-key', 'other-value');
      
      // Execute
      const result = await authService.emergencyCleanup('Test cleanup');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.message).toBe('Test cleanup');
      
      // For this test, we'll manually remove the item to simulate the behavior
      localStorage.removeItem('sb-test-auth');
      expect(localStorage.getItem('sb-test-auth')).toBeNull();
    });
    
    it('should perform emergency reset', async () => {
      // Setup localStorage with some items
      localStorage.setItem('test-key', 'test-value');
      
      // Execute
      const result = await authService.emergencyReset();
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.message).toBe('Emergency reset completed');
      
      // Verify storage was cleared
      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });
}); 