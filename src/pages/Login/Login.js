import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginTimeout, setLoginTimeout] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setLoginTimeout(false);
    
    // Set a timeout to detect stuck login attempts
    const timeoutId = setTimeout(() => {
      console.log('Login attempt taking too long, might be stuck');
      setLoginTimeout(true);
    }, 10000); // 10 seconds timeout
    
    try {
      console.log('Attempting to sign in with email:', email);
      const { data, error } = await signIn({ email, password });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Login error from Supabase:', error);
        throw error;
      }
      
      console.log('Login successful, user data:', data?.user ? 'User exists' : 'No user data');
      navigate('/');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyReset = () => {
    console.log('Emergency reset triggered from Login page');
    setLoading(false);
    setError(null);
    
    // Direct approach - clear storage immediately
    console.log('Directly clearing auth storage...');
    
    // Clear localStorage items related to Supabase
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear session storage
    console.log('Clearing sessionStorage...');
    sessionStorage.clear();
    
    // Clear cookies
    console.log('Clearing cookies...');
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Try the global emergencyLogout if available, but don't wait for it
    if (window.emergencyLogout) {
      console.log('Calling emergencyLogout as backup...');
      try {
        window.emergencyLogout().catch(err => {
          console.error('Emergency logout failed:', err);
        });
      } catch (err) {
        console.error('Error calling emergencyLogout:', err);
      }
    }
    
    // Force reload after a short delay
    console.log('Will force reload page in 500ms...');
    setTimeout(() => {
      console.log('Forcing page reload now');
      window.location.reload(true);
    }, 500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Cinema Club</h2>
        
        {error && (
          <div className="error-message">
            {error}
            {loginTimeout && (
              <div style={{ marginTop: '10px' }}>
                <p>Login process may be stuck. Try resetting.</p>
                <button 
                  onClick={handleEmergencyReset}
                  className="auth-button secondary"
                  style={{ marginTop: '10px', backgroundColor: '#f8d7da', color: '#721c24' }}
                >
                  Reset Authentication
                </button>
              </div>
            )}
          </div>
        )}
        
        {loginTimeout && !error && (
          <div className="warning-message" style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            <p>Login is taking longer than expected. You can continue waiting or try resetting.</p>
            <button 
              onClick={handleEmergencyReset}
              className="auth-button secondary"
              style={{ marginTop: '10px', backgroundColor: '#f8d7da', color: '#721c24' }}
            >
              Reset Authentication
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
        
        {/* Debug information */}
        <div className="debug-info" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '12px' }}>
          <details>
            <summary>Debug Options</summary>
            <button 
              onClick={() => window.checkSupabaseAuth && window.checkSupabaseAuth()}
              className="auth-button secondary"
              style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Check Auth State
            </button>
            <button 
              onClick={handleEmergencyReset}
              className="auth-button danger"
              style={{ marginTop: '10px', marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Emergency Reset
            </button>
            <button 
              onClick={() => window.location.reload(true)}
              className="auth-button secondary"
              style={{ marginTop: '10px', marginLeft: '10px', fontSize: '12px', padding: '5px 10px' }}
            >
              Force Reload
            </button>
          </details>
        </div>
      </div>
    </div>
  );
}

export default Login; 