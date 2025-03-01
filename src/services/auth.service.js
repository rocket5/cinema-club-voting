import { supabase } from '../lib/supabase/client';

/**
 * Authentication Service
 * Handles all authentication-related operations with Supabase
 */
class AuthService {
  /**
   * Sign in a user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<{data: Object, error: Object}>} Result object with data or error
   */
  async signIn(credentials) {
    try {
      console.log('AuthService - signIn called');
      const result = await supabase.auth.signInWithPassword(credentials);
      
      if (result.error) {
        console.error('AuthService - signIn error:', result.error);
      } else {
        console.log('AuthService - signIn successful');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - signIn exception:', error);
      return {
        data: { user: null, session: null },
        error
      };
    }
  }
  
  /**
   * Sign up a new user
   * @param {Object} credentials - User signup data
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {Object} [credentials.options] - Additional signup options
   * @param {Object} [credentials.options.data] - User metadata
   * @returns {Promise<{data: Object, error: Object}>} Result object with data or error
   */
  async signUp(credentials) {
    try {
      console.log('AuthService - signUp called');
      const result = await supabase.auth.signUp(credentials);
      
      if (result.error) {
        console.error('AuthService - signUp error:', result.error);
      } else {
        console.log('AuthService - signUp successful');
        
        // If signup was successful and we have a user, create their profile
        if (result.data?.user) {
          await this.createUserProfile(result.data.user.id, credentials.options?.data);
        }
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - signUp exception:', error);
      return {
        data: { user: null, session: null },
        error
      };
    }
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<{success: boolean, error?: Object, message?: string}>} Result with success status
   */
  async signOut() {
    try {
      console.log('AuthService - signOut called');
      
      // Create a promise that times out after 3 seconds
      const signOutWithTimeout = Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SignOut timeout')), 3000)
        )
      ]);
      
      try {
        const { error } = await signOutWithTimeout;
        
        if (error) {
          console.error('AuthService - signOut error:', error);
          return this.emergencyCleanup();
        }
        
        console.log('AuthService - signOut successful');
        return { success: true };
      } catch (timeoutError) {
        console.error('AuthService - signOut timeout:', timeoutError);
        return this.emergencyCleanup('Forced logout after timeout');
      }
    } catch (error) {
      console.error('AuthService - signOut exception:', error);
      return this.emergencyCleanup('Forced logout after error');
    }
  }
  
  /**
   * Emergency cleanup when normal signOut fails
   * @param {string} [message] - Message describing the reason for emergency logout
   * @returns {Promise<{success: boolean, message: string}>} Result with success status
   */
  async emergencyCleanup(message = 'Forced logout') {
    console.log('AuthService - emergencyCleanup called');
    
    try {
      // Clear localStorage items related to Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          console.log(`AuthService - Removing localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage
      console.log('AuthService - Clearing sessionStorage');
      sessionStorage.clear();
      
      return { 
        success: true, 
        message
      };
    } catch (error) {
      console.error('AuthService - emergencyCleanup error:', error);
      return { 
        success: false, 
        error,
        message: 'Failed to perform emergency cleanup'
      };
    }
  }
  
  /**
   * Get the current session
   * @returns {Promise<{data: Object, error: Object}>} Session data or error
   */
  async getSession() {
    try {
      console.log('AuthService - getSession called');
      const result = await supabase.auth.getSession();
      
      if (result.error) {
        console.error('AuthService - getSession error:', result.error);
      } else {
        console.log('AuthService - getSession successful');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - getSession exception:', error);
      return {
        data: { session: null },
        error
      };
    }
  }
  
  /**
   * Set up a listener for auth state changes
   * @param {Function} callback - Callback function that receives (event, session)
   * @returns {Object} Subscription that can be unsubscribed
   */
  onAuthStateChange(callback) {
    try {
      console.log('AuthService - onAuthStateChange called');
      const subscription = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('AuthService - Auth state changed:', event);
          callback(event, session);
        }
      );
      
      return subscription;
    } catch (error) {
      console.error('AuthService - onAuthStateChange exception:', error);
      
      // Return a dummy subscription that won't break the app
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('AuthService - Dummy unsubscribe called');
            }
          }
        }
      };
    }
  }
  
  /**
   * Create a user profile in the database
   * @param {string} userId - User ID
   * @param {Object} [userData] - Additional user data
   * @returns {Promise<{data: Object, error: Object}>} Result with data or error
   */
  async createUserProfile(userId, userData = {}) {
    try {
      console.log('AuthService - createUserProfile called for user:', userId);
      
      const profileData = {
        id: userId,
        name: userData?.name || '',
        is_host: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = await supabase
        .from('profiles')
        .upsert(profileData)
        .select();
      
      if (result.error) {
        console.error('AuthService - createUserProfile error:', result.error);
      } else {
        console.log('AuthService - Profile created successfully');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - createUserProfile exception:', error);
      return {
        data: null,
        error
      };
    }
  }
  
  /**
   * Get a user profile from the database
   * @param {string} userId - User ID
   * @returns {Promise<{data: Object, error: Object}>} Profile data or error
   */
  async getUserProfile(userId) {
    try {
      console.log('AuthService - getUserProfile called for user:', userId);
      
      // Create a promise that times out after 5 seconds
      const fetchWithTimeout = Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )
      ]);
      
      const result = await fetchWithTimeout;
      
      if (result.error) {
        console.error('AuthService - getUserProfile error:', result.error);
        
        // If the profile doesn't exist, create one
        if (result.error.code === '42P01' || 
            result.error.message.includes('does not exist') || 
            result.error.code === 'PGRST116') {
          console.log('AuthService - Creating new profile for user:', userId);
          return this.createUserProfile(userId);
        }
      } else {
        console.log('AuthService - Profile fetched successfully');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - getUserProfile exception:', error);
      
      // If it's a timeout error, create a default profile
      if (error.message === 'Profile fetch timeout') {
        console.log('AuthService - Profile fetch timed out, creating default profile');
        return this.createUserProfile(userId);
      }
      
      return {
        data: null,
        error
      };
    }
  }
  
  /**
   * Update a user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<{data: Object, error: Object}>} Result with data or error
   */
  async updateUserProfile(userId, profileData) {
    try {
      console.log('AuthService - updateUserProfile called for user:', userId);
      
      // Ensure we have an updated_at field
      const dataToUpdate = {
        ...profileData,
        updated_at: new Date()
      };
      
      const result = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', userId);
      
      if (result.error) {
        console.error('AuthService - updateUserProfile error:', result.error);
      } else {
        console.log('AuthService - Profile updated successfully');
      }
      
      return result;
    } catch (error) {
      console.error('AuthService - updateUserProfile exception:', error);
      return {
        data: null,
        error
      };
    }
  }
  
  /**
   * Emergency reset for testing and debugging
   * @returns {Promise<{success: boolean, message: string}>} Result with success status
   */
  async emergencyReset() {
    console.log('AuthService - emergencyReset called');
    
    try {
      // Clear all auth-related storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      console.log('AuthService - All storage cleared in emergency reset');
      
      return {
        success: true,
        message: 'Emergency reset completed'
      };
    } catch (error) {
      console.error('AuthService - emergencyReset error:', error);
      
      return {
        success: false,
        error,
        message: 'Failed to perform emergency reset'
      };
    }
  }
}

// Create a singleton instance
const authService = new AuthService();

// Export the singleton
export default authService; 