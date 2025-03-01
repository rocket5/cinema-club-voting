import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase/client';
import '../Login/Login.css'; // Reusing the same styles

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Sign up the user
      const { data, error } = await signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username // Store username in auth metadata
          }
        }
      });
      
      if (error) throw error;
      
      // Create a profile for the user
      if (data?.user) {
        try {
          console.log('Creating profile for new user:', data.user.id);
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              name: username, // Set the name field to the username
              is_host: false,
              created_at: new Date(),
              updated_at: new Date()
            });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Continue with signup even if profile creation fails
            // The profile will be created later when they access the Profile page
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileError) {
          console.error('Exception creating profile:', profileError);
          // Continue with signup even if profile creation fails
        }
      }
      
      setMessage('Registration successful! Please check your email for confirmation.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {message && (
          <div className="success-message">
            {message}
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              minLength="3"
              maxLength="30"
            />
            <small className="form-text text-muted">
              Your username will be visible to others when you host sessions.
            </small>
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
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup; 