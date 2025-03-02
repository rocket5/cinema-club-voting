import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase/client';
import './Profile.css';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    isHost: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const [initialLoadTimeout, setInitialLoadTimeout] = useState(false);
  const [forceRecovery, setForceRecovery] = useState(false);
  const userCheckTimerRef = useRef(null);
  const profileFetchTimerRef = useRef(null);

  // Set a timeout for initial loading
  useEffect(() => {
    console.log('Setting up initial load timeout');
    const timeoutId = setTimeout(() => {
      console.log('Initial load timeout triggered');
      setInitialLoadTimeout(true);
    }, 5000); // 5 seconds timeout
    
    // Set a longer timeout for forced recovery
    const recoveryTimeoutId = setTimeout(() => {
      console.log('Force recovery timeout triggered');
      setForceRecovery(true);
      // If we still don't have user data after 15 seconds, set default values
      if (!user) {
        console.log('No user data after extended timeout, setting defaults');
        setUserData({
          name: '',
          isHost: false
        });
        setLoading(false);
      }
    }, 15000); // 15 seconds timeout
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(recoveryTimeoutId);
    };
  }, []);

  // Debug log when component mounts
  useEffect(() => {
    console.log('Profile component mounted');
    console.log('Initial user state:', user);
    console.log('Initial loading state:', loading);
    
    // Set up a timer to periodically check for user
    userCheckTimerRef.current = setInterval(() => {
      console.log('Periodic user check:', user);
      if (user && loading) {
        console.log('User available but still loading, retrying fetch');
        fetchUserProfile();
      }
    }, 3000); // Check every 3 seconds
    
    return () => {
      console.log('Profile component unmounting');
      clearInterval(userCheckTimerRef.current);
      clearTimeout(profileFetchTimerRef.current);
    };
  }, []);

  // Debug log when user changes
  useEffect(() => {
    console.log('User state changed in Profile component:', user);
    
    if (user) {
      console.log('User is available, fetching profile');
      fetchUserProfile();
    } else {
      console.log('No user available in Profile component');
    }
  }, [user]);

  const fetchUserProfile = async () => {
    // Clear any existing fetch timers
    if (profileFetchTimerRef.current) {
      clearTimeout(profileFetchTimerRef.current);
    }
    
    const attemptNumber = profileFetchAttempts + 1;
    setProfileFetchAttempts(attemptNumber);
    
    console.log(`Fetching user profile (attempt ${attemptNumber})`);
    console.log('Current user ID:', user?.id);
    
    // Don't proceed if we don't have a user
    if (!user || !user.id) {
      console.log('No user ID available, aborting profile fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a promise that times out after 10 seconds
      const fetchWithTimeout = Promise.race([
        (async () => {
          // Debug: Check if profiles table exists
          try {
            console.log('Checking if profiles table exists...');
            const { error: tableCheckError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1);
            
            if (tableCheckError) {
              console.error('Error checking profiles table:', tableCheckError);
            } else {
              console.log('Profiles table exists');
            }
          } catch (tableCheckError) {
            console.error('Exception checking profiles table:', tableCheckError);
          }
          
          console.log('Querying profile for user ID:', user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          console.log('Profile query result:', { data, error });
          
          if (error) {
            console.log('Error fetching profile:', error);
            
            // If the profile doesn't exist, create one
            if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST116') {
              console.log('Creating new profile for user:', user.id);
              
              // Extract username from user metadata if available
              const username = user.user_metadata?.username || user.email?.split('@')[0] || '';
              
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  name: user.user_metadata?.name || username || '',
                  username: username,
                  is_host: false,
                  created_at: new Date(),
                  updated_at: new Date()
                })
                .select();
              
              console.log('Profile creation result:', { newProfile, createError });
              
              if (createError) {
                console.error('Error creating profile:', createError);
                throw createError;
              }
              
              // If we successfully created the profile but didn't get data back,
              // set default values
              console.log('Setting default user data');
              setUserData({
                name: '',
                isHost: false
              });
              
              return { success: true };
            }
            
            throw error;
          }
          
          if (data) {
            console.log('Profile data received:', data);
            setUserData({
              name: data.name || '',
              isHost: data.is_host || false
            });
            return { success: true, data };
          } else {
            console.log('No profile data received');
            return { success: false, error: new Error('No profile data received') };
          }
        })(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        )
      ]);
      
      await fetchWithTimeout;
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (error.message === 'Profile fetch timeout') {
        setError('Profile fetch timed out. Please try again or use the retry button.');
      } else {
        setError('Failed to load profile data. Please try again later.');
      }
      
      // If we've tried multiple times and still failing, set default values
      if (attemptNumber >= 2) {
        console.log('Multiple fetch attempts failed, setting default values');
        setUserData({
          name: user?.user_metadata?.name || '',
          isHost: false
        });
        
        // Try to create a profile with default values as a fallback
        try {
          console.log('Attempting to create default profile as fallback');
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name: user?.user_metadata?.name || '',
              is_host: false,
              created_at: new Date(),
              updated_at: new Date()
            });
        } catch (fallbackError) {
          console.error('Fallback profile creation failed:', fallbackError);
        }
      }
      
      // Schedule another attempt if we haven't tried too many times
      if (attemptNumber < 3) {
        console.log(`Scheduling retry attempt ${attemptNumber + 1} in 3 seconds`);
        profileFetchTimerRef.current = setTimeout(() => {
          fetchUserProfile();
        }, 3000);
      }
    } finally {
      console.log('Fetch profile completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    console.log('Updating profile with data:', userData);
    
    // Validate username is not empty when in host mode
    if (userData.isHost && !userData.name.trim()) {
      console.log('Validation failed: Username required for host mode');
      setError('Username is required for host mode.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      console.log('Sending profile update to Supabase');
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: userData.name,
          is_host: userData.isHost,
          updated_at: new Date()
        });
      
      console.log('Profile update result:', { error });
      
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleHostMode = async () => {
    console.log('Toggling host mode, current status:', userData.isHost);
    
    // Validate username is not empty when switching to host mode
    if (!userData.isHost && !userData.name.trim()) {
      console.log('Validation failed: Username required for host mode');
      setError('Username is required for host mode. Please set your username first.');
      setIsEditMode(true);
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const newHostStatus = !userData.isHost;
      console.log('Setting host status to:', newHostStatus);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_host: newHostStatus,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      console.log('Host status update result:', { error });
      
      if (error) throw error;
      
      setUserData({
        ...userData,
        isHost: newHostStatus
      });
      
      setMessage(`You are now ${newHostStatus ? 'a host' : 'a regular user'}`);
    } catch (error) {
      console.error('Error toggling host mode:', error);
      setError(error.message || 'Failed to update host status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Profile - Logout button clicked');
    try {
      console.log('Profile - Calling signOut function');
      const result = await signOut();
      console.log('Profile - signOut result:', result);
      console.log('Profile - Navigating to login page');
      navigate('/login');
    } catch (error) {
      console.error('Profile - Error signing out:', error);
      setError('Failed to sign out');
      
      // Force navigation to login page if signOut fails
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }
  };

  const handleEmergencyLogout = async () => {
    console.log('Emergency logout triggered from Profile page');
    try {
      if (window.emergencyLogout) {
        console.log('Using window.emergencyLogout()...');
        await Promise.race([
          window.emergencyLogout(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Emergency logout timeout')), 3000)
          )
        ]);
      } else {
        console.log('window.emergencyLogout not available, using fallback approach...');
        
        // Try regular signOut first
        try {
          await Promise.race([
            signOut(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('SignOut timeout')), 3000)
            )
          ]);
        } catch (e) {
          console.error('Regular signOut failed:', e);
        }
        
        // Force clear all Supabase-related localStorage items
        console.log('Clearing Supabase localStorage items...');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            console.log(`Removing localStorage item: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Clear session storage
        console.log('Clearing sessionStorage...');
        sessionStorage.clear();
      }
      
      // Force navigation to login page
      console.log('Forcing navigation to login page');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during emergency logout:', error);
      
      // Last resort: force page reload
      alert('Logout failed. Forcing page reload...');
      window.location.reload(true);
    }
  };

  // Debug loading state
  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

  // Add a retry button for debugging
  const handleRetryFetch = () => {
    console.log('Manually retrying profile fetch');
    fetchUserProfile();
  };

  // Force recovery if needed
  useEffect(() => {
    if (forceRecovery && loading) {
      console.log('Force recovery triggered while still loading');
      setLoading(false);
      
      if (user) {
        console.log('User exists but profile fetch failed, setting default values');
        setUserData({
          name: user?.user_metadata?.name || '',
          isHost: false
        });
      }
    }
  }, [forceRecovery, loading, user]);

  console.log('Rendering Profile component with state:', { user, loading, userData, forceRecovery });

  // If we're in force recovery mode and have a user, show the profile with default values
  if (forceRecovery && user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>User Profile (Recovery Mode)</h2>
          
          <div className="warning-message" style={{ marginBottom: '20px' }}>
            Profile data could not be loaded completely. Some features may be limited.
          </div>
          
          <div className="profile-header">
            <div className="profile-email">{user.email}</div>
            <div className="profile-status">
              Status: Regular User
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="profile-button primary"
              onClick={handleRetryFetch}
            >
              Retry Loading Profile
            </button>
            <button 
              className="profile-button danger"
              onClick={handleEmergencyLogout}
            >
              Emergency Logout
            </button>
          </div>
          
          <div className="profile-footer">
            <button 
              className="profile-button secondary"
              onClick={() => window.location.reload(true)}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user available, showing loading spinner');
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Waiting for user data...</p>
        {initialLoadTimeout && (
          <div>
            <p style={{ color: '#721c24', marginTop: '20px' }}>
              Loading is taking longer than expected. You can wait or try to reset.
            </p>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="profile-button secondary"
              style={{ marginTop: '10px' }}
            >
              Return to Login
            </button>
            <button 
              onClick={handleEmergencyLogout} 
              className="profile-button danger"
              style={{ marginTop: '10px', marginLeft: '10px' }}
            >
              Emergency Reset
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <div className="profile-header">
          <div className="profile-email">{user.email}</div>
          <div className="profile-status">
            Status: {userData.isHost ? 'Host' : 'Regular User'}
          </div>
        </div>
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading profile data...</p>
            {profileFetchAttempts > 1 && (
              <button 
                onClick={handleRetryFetch} 
                className="profile-button secondary"
                style={{ marginTop: '10px' }}
              >
                Retry
              </button>
            )}
            {initialLoadTimeout && (
              <button 
                onClick={handleEmergencyLogout} 
                className="profile-button danger"
                style={{ marginTop: '10px', marginLeft: '10px' }}
              >
                Emergency Reset
              </button>
            )}
          </div>
        )}
        
        {!loading && isEditMode ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="name">Username {userData.isHost && <span className="required">*</span>}</label>
              <input
                type="text"
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                disabled={loading}
                required={userData.isHost}
                placeholder="Enter your username"
                minLength="3"
                maxLength="30"
              />
              {userData.isHost && <small className="form-text text-muted">Username is required for host mode and will be visible on sessions you create.</small>}
            </div>
            
            <div className="profile-actions">
              <button 
                type="submit" 
                className="profile-button primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                className="profile-button secondary"
                onClick={() => setIsEditMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : !loading && (
          <div className="profile-details">
            <div className="profile-field">
              <strong>Username:</strong> {userData.name || 'Not set'}
              {userData.isHost && !userData.name && (
                <div className="warning-message">Please set a username for host mode</div>
              )}
            </div>
            
            <div className="profile-actions">
              <button 
                className="profile-button primary"
                onClick={() => setIsEditMode(true)}
                disabled={loading}
              >
                Edit Profile
              </button>
              <button 
                className="profile-button toggle-host"
                onClick={toggleHostMode}
                disabled={loading || (userData.isHost === false && !userData.name.trim())}
              >
                {loading ? 'Updating...' : userData.isHost ? 'Switch to Regular User' : 'Switch to Host Mode'}
              </button>
              {!userData.isHost && !userData.name.trim() && (
                <div className="info-message">Set a username to enable host mode</div>
              )}
            </div>
          </div>
        )}
        
        <div className="profile-footer">
          <button 
            className="profile-button danger"
            onClick={handleLogout}
            disabled={loading}
          >
            Logout
          </button>
          <button 
            className="profile-button danger"
            onClick={handleEmergencyLogout}
            disabled={loading}
          >
            Emergency Logout
          </button>
        </div>
        
        {/* Debug information */}
        <div className="debug-info" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '12px' }}>
          <details>
            <summary>Debug Info</summary>
            <p>User ID: {user?.id}</p>
            <p>Email: {user?.email}</p>
            <p>Loading: {loading.toString()}</p>
            <p>Fetch Attempts: {profileFetchAttempts}</p>
            <p>Force Recovery: {forceRecovery.toString()}</p>
            <p>User Data: {JSON.stringify(userData)}</p>
            <button 
              onClick={handleRetryFetch}
              className="profile-button secondary"
              style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Retry Fetch
            </button>
            <button 
              onClick={() => window.checkSupabaseAuth && window.checkSupabaseAuth()}
              className="profile-button secondary"
              style={{ marginTop: '10px', marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Check Auth
            </button>
            <button 
              onClick={handleEmergencyLogout}
              className="profile-button danger"
              style={{ marginTop: '10px', marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Emergency Logout
            </button>
          </details>
        </div>
      </div>
    </div>
  );
}

export default Profile; 