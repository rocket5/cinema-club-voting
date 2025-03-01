import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';
import { supabase } from '../lib/supabase/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostedSessions, setHostedSessions] = useState([]);
  const [authError, setAuthError] = useState(null);

  // Fetch sessions where the user is the host
  const fetchHostedSessions = async (userId) => {
    if (!userId) return [];
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name')
        .eq('host_id', userId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching hosted sessions:', error);
      return [];
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      console.log('AuthContext - Initializing auth...');
      try {
        const { data, error } = await authService.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setAuthError(error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('AuthContext - Initial session:', data?.session ? 'Session exists' : 'No session');
        const currentUser = data?.session?.user || null;
        console.log('AuthContext - Setting initial user:', currentUser ? 'User exists' : 'No user');
        setUser(currentUser);
        
        if (currentUser) {
          const sessions = await fetchHostedSessions(currentUser.id);
          setHostedSessions(sessions);
        }
      } catch (error) {
        console.error('Exception initializing auth:', error);
        setAuthError(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    console.log('AuthContext - Setting up auth state change listener');
    let subscription;
    
    try {
      subscription = authService.onAuthStateChange(
        async (event, session) => {
          console.log('AuthContext - Auth state changed, event:', event);
          console.log('AuthContext - New session:', session ? 'Session exists' : 'No session');
          
          if (event === 'SIGNED_OUT') {
            console.log('AuthContext - User signed out, clearing state');
            setUser(null);
            setHostedSessions([]);
            return;
          }
          
          const currentUser = session?.user || null;
          console.log('AuthContext - Setting user after auth change:', currentUser ? 'User exists' : 'No user');
          setUser(currentUser);
          
          if (currentUser) {
            const sessions = await fetchHostedSessions(currentUser.id);
            setHostedSessions(sessions);
          } else {
            setHostedSessions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      setAuthError(error);
    }

    return () => {
      console.log('AuthContext - Unsubscribing from auth state changes');
      if (subscription) {
        try {
          subscription.data.subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state changes:', error);
        }
      }
    };
  }, []);

  // Check if user is host of a specific session
  const isSessionHost = (sessionId) => {
    return hostedSessions.some(session => session.id === sessionId);
  };

  // Enhanced signIn function with better error handling
  const handleSignIn = async (credentials) => {
    console.log('AuthContext - handleSignIn called');
    setAuthError(null);
    
    try {
      console.log('AuthContext - Calling authService.signIn');
      const result = await authService.signIn(credentials);
      
      console.log('AuthContext - signIn result:', result.error ? 'Error occurred' : 'Success');
      
      if (result.error) {
        console.error('AuthContext - Error from signIn:', result.error);
        setAuthError(result.error);
      } else if (result.data?.user) {
        console.log('AuthContext - Sign in successful, user:', result.data.user.id);
      } else {
        console.log('AuthContext - Sign in completed but no user data returned');
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext - Exception during sign-in:', error);
      setAuthError(error);
      
      // Return a properly structured error response
      return { 
        data: { user: null, session: null }, 
        error: error 
      };
    }
  };

  // Enhanced signOut function with explicit state clearing
  const handleSignOut = async () => {
    console.log('AuthContext - handleSignOut called');
    console.log('Current user before sign-out:', user ? 'User exists' : 'No user');
    
    // Explicitly clear user state first to ensure UI updates immediately
    setUser(null);
    setHostedSessions([]);
    console.log('AuthContext - User state explicitly cleared');
    
    try {
      console.log('AuthContext - Calling authService.signOut()');
      const result = await authService.signOut();
      
      console.log('AuthContext - signOut result:', result);
      
      if (!result.success) {
        console.error('AuthContext - Error from authService.signOut():', result.error);
        setAuthError(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext - Exception during sign-out:', error);
      setAuthError(error);
      
      return { 
        success: false, 
        error,
        message: 'Exception during sign-out' 
      };
    }
  };

  // Reset auth error
  const resetAuthError = () => {
    setAuthError(null);
  };

  // Log user state changes
  useEffect(() => {
    console.log('AuthContext - User state changed:', user ? 'User exists' : 'No user');
  }, [user]);

  const value = {
    user,
    loading,
    authError,
    resetAuthError,
    hostedSessions,
    isSessionHost,
    refreshHostedSessions: async () => {
      if (user) {
        const sessions = await fetchHostedSessions(user.id);
        setHostedSessions(sessions);
      }
    },
    signUp: (data) => authService.signUp(data),
    signIn: handleSignIn,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 