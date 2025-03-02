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
  const profileFetchTimerRef = useRef(null);

  // Debug log when component mounts
  useEffect(() => {
    console.log('Profile component mounted');
    console.log('Initial user state:', user);
    console.log('Initial loading state:', loading);
    
    return () => {
      console.log('Profile component unmounting');
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

  console.log('Rendering Profile component with state:', { user, loading, userData });

  if (!user) {
    console.log('No user available, showing loading spinner');
    return (
      <div className="loading-container">
        <div className="spinner-container">
          <i className="bi bi-arrow-repeat spinning"></i>
        </div>
        <p>Waiting for user data...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <div className="profile-info-section">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {userData.name ? userData.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-details-container">
            <div className="profile-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            
            <div className="profile-info-item">
              <span className="info-label">Username</span>
              <span className="info-value">{userData.name || 'Not set'}</span>
              {userData.isHost && !userData.name && (
                <div className="warning-message">Please set a username for host mode</div>
              )}
            </div>
            
            <div className="profile-info-item">
              <span className="info-label">Account Type</span>
              <span className="info-value">
                <span className={`status-badge ${userData.isHost ? 'host' : 'regular'}`}>
                  {userData.isHost ? 'Host' : 'Regular User'}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner-container">
              <i className="bi bi-arrow-repeat spinning"></i>
            </div>
            <p>Loading profile data...</p>
            {profileFetchAttempts > 1 && (
              <button 
                onClick={handleRetryFetch} 
                className="profile-button secondary"
                style={{ marginTop: '10px' }}
              >
                <i className="bi bi-arrow-clockwise"></i> Retry
              </button>
            )}
          </div>
        )}
        
        {!loading && isEditMode ? (
          <form onSubmit={handleUpdateProfile} className="edit-profile-form">
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
                {loading ? 'Saving...' : <><i className="bi bi-check-lg"></i> Save Changes</>}
              </button>
              <button 
                type="button" 
                className="profile-button secondary"
                onClick={() => setIsEditMode(false)}
                disabled={loading}
              >
                <i className="bi bi-x-lg"></i> Cancel
              </button>
            </div>
          </form>
        ) : !loading && (
          <div className="profile-actions-container">
            <button 
              className="profile-button primary"
              onClick={() => setIsEditMode(true)}
              disabled={loading}
            >
              <i className="bi bi-pencil-square"></i> Edit Profile
            </button>
            <button 
              className="profile-button toggle-host"
              onClick={toggleHostMode}
              disabled={loading || (userData.isHost === false && !userData.name.trim())}
            >
              {loading ? 'Updating...' : userData.isHost ? 
                <><i className="bi bi-person"></i> Switch to Regular User</> : 
                <><i className="bi bi-person-badge"></i> Switch to Host Mode</>}
            </button>
            <button 
              className="profile-button logout"
              onClick={handleLogout}
              disabled={loading}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
            {!userData.isHost && !userData.name.trim() && (
              <div className="info-message">Set a username to enable host mode</div>
            )}
          </div>
        )}
        
        {/* Debug information */}
        <div className="debug-info">
          <details>
            <summary><i className="bi bi-bug"></i> Debug Info</summary>
            <div className="debug-content">
              <p><strong>User ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Loading:</strong> {loading.toString()}</p>
              <p><strong>Fetch Attempts:</strong> {profileFetchAttempts}</p>
              <p><strong>User Data:</strong> {JSON.stringify(userData)}</p>
              <div className="debug-actions">
                <button 
                  onClick={handleRetryFetch}
                  className="profile-button secondary"
                >
                  <i className="bi bi-arrow-clockwise"></i> Retry Fetch
                </button>
                <button 
                  onClick={() => window.checkSupabaseAuth && window.checkSupabaseAuth()}
                  className="profile-button secondary"
                >
                  <i className="bi bi-shield-check"></i> Check Auth
                </button>
                <button 
                  onClick={handleEmergencyLogout}
                  className="profile-button danger"
                >
                  <i className="bi bi-exclamation-triangle"></i> Emergency Logout
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default Profile; 