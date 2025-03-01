const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log environment info (without exposing secrets)
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

// Create a Supabase client instance with error handling
let supabase;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl.substring(0, 15) + '...');
  
  // Create the original Supabase client without any modifications
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('Supabase client initialized successfully');
  
  // Store references to original methods to ensure they're preserved
  const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
  const originalSignIn = supabase.auth.signInWithPassword.bind(supabase.auth);
  const originalSignUp = supabase.auth.signUp.bind(supabase.auth);
  const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
  const originalOnAuthStateChange = supabase.auth.onAuthStateChange.bind(supabase.auth);
  
  // Wrap signInWithPassword with better error handling
  supabase.auth.signInWithPassword = async (credentials) => {
    console.log('Enhanced signInWithPassword called');
    try {
      // Call the original method
      const result = await originalSignIn(credentials);
      console.log('signInWithPassword result:', result.error ? 'Error occurred' : 'Success');
      
      // Check for specific error conditions
      if (result.error) {
        console.error('signInWithPassword error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Exception in signInWithPassword:', error);
      // Return a properly structured error response
      return { 
        data: { user: null, session: null }, 
        error: error 
      };
    }
  };
  
  // Wrap onAuthStateChange with better error handling
  supabase.auth.onAuthStateChange = function(...args) {
    console.log('Enhanced onAuthStateChange called with', args.length, 'arguments');
    try {
      // Call the original method with the correct context
      return originalOnAuthStateChange(...args);
    } catch (error) {
      console.error('Exception in onAuthStateChange:', error);
      // Return a dummy subscription that won't break the app
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Dummy unsubscribe called');
            }
          }
        }
      };
    }
  };
  
  // Add a debug wrapper for signOut that doesn't replace the original method
  supabase.auth.debugSignOut = async () => {
    console.log('Debug: signOut called');
    try {
      const result = await originalSignOut();
      console.log('Debug: signOut result:', result);
      return result;
    } catch (error) {
      console.error('Debug: signOut error:', error);
      throw error;
    }
  };
  
  // Add a debug method to check current session
  supabase.auth.debugSession = async () => {
    try {
      const { data, error } = await originalGetSession();
      console.log('Debug: Current session:', data?.session);
      console.log('Debug: Session error:', error);
      return { data, error };
    } catch (e) {
      console.error('Debug: Error getting session:', e);
      return { error: e };
    }
  };
  
  // Debug current session on initialization
  supabase.auth.debugSession().catch(err => {
    console.error('Error during initial session check:', err);
  });
  
  // Add a global method to check auth state from anywhere
  if (typeof window !== 'undefined') {
    window.checkSupabaseAuth = async () => {
      console.log('Manual auth check triggered');
      if (supabase && supabase.auth) {
        try {
          return await supabase.auth.debugSession();
        } catch (err) {
          console.error('Error during manual auth check:', err);
          return { error: 'Error checking auth state' };
        }
      } else {
        console.error('Supabase client not available');
        return { error: 'Client not available' };
      }
    };
    
    // Add a global emergency logout method
    window.emergencyLogout = async () => {
      console.log('Emergency logout triggered');
      
      try {
        // Try the regular signOut first, but with a timeout to prevent hanging
        if (supabase && supabase.auth) {
          try {
            console.log('Attempting regular signOut...');
            
            // Create a promise that times out after 2 seconds
            const signOutWithTimeout = Promise.race([
              originalSignOut(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('SignOut timeout')), 2000)
              )
            ]);
            
            try {
              const result = await signOutWithTimeout;
              console.log('Regular signOut result:', result);
            } catch (timeoutError) {
              console.error('SignOut timed out:', timeoutError);
              // Continue with forced logout
            }
          } catch (error) {
            console.error('Regular signOut failed:', error);
            // Continue with forced logout
          }
        }
        
        // Force clear all Supabase-related localStorage items
        console.log('Clearing Supabase localStorage items...');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            console.log(`Removing localStorage item: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Clear session storage as well
        console.log('Clearing sessionStorage...');
        sessionStorage.clear();
        
        // Force clear all cookies
        console.log('Clearing cookies...');
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        console.log('Auth state forcefully cleared');
        
        // Redirect to login page
        console.log('Redirecting to login page...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return { success: true, message: 'Emergency logout completed' };
      } catch (error) {
        console.error('Emergency logout error:', error);
        
        // Even if there's an error, try to redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return { success: false, error };
      }
    };
    
    // Add a force reload method
    window.forceReload = () => {
      console.log('Force reloading page...');
      window.location.reload(true);
    };
  }
  
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a dummy client that will throw a more helpful error when used
  supabase = {
    auth: {
      signUp: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      },
      signInWithPassword: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      },
      signOut: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      },
      onAuthStateChange: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      },
      getSession: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      },
      debug: () => {
        console.error('Supabase client failed to initialize. Check environment variables and connection.');
        return Promise.resolve({ error: new Error('Client not initialized') });
      }
    },
    from: () => ({
      select: () => {
        throw new Error('Supabase client failed to initialize. Check environment variables and connection.');
      }
    })
  };
}

module.exports = { supabase };