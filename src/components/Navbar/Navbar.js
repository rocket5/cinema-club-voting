import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppMode } from '../../context/AppModeContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isHostMode, toggleMode } = useAppMode();
  const { user, signOut } = useAuth();

  // Add debugging to show current user when component mounts or user changes
  useEffect(() => {
    console.log('Navbar - Current user:', user);
  }, [user]);

  const handleModeSwitch = () => {
    if (!isHostMode) {
      // If switching to host mode, navigate to home
      navigate('/');
    }
    toggleMode();
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    console.log('Current user before logout:', user);
    
    try {
      // First try the regular signOut
      console.log('Calling signOut function...');
      const result = await signOut();
      console.log('signOut result:', result);
      
      if (result.success) {
        console.log('Regular signOut successful, navigating to login page...');
        navigate('/login');
        console.log('Navigation complete');
        return;
      }
      
      console.log('Regular signOut was not successful, trying force logout...');
      
      // If regular signOut fails, try a more aggressive approach
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
      
      // Force navigation to login page
      console.log('Force navigating to login page...');
      window.location.href = '/login';
    } catch (error) {
      console.error('Exception during logout:', error);
      alert('Logout failed. Please try emergency logout from console or refresh the page.');
      console.log('Try using window.emergencyLogout() from the browser console');
      console.log('Or use window.forceReload() to refresh the page');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🎬 Cinema Club
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  to="/"
                >
                  {isHostMode ? 'Manage Movies' : 'Vote'}
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <div className="mode-indicator me-3">
                  <span className={`badge ${isHostMode ? 'bg-warning' : 'bg-success'}`}>
                    {isHostMode ? 'Host Mode' : 'Voting Mode'}
                  </span>
                </div>
                <button 
                  className="btn btn-outline-light me-3"
                  onClick={handleModeSwitch}
                >
                  Switch to {isHostMode ? 'Voting' : 'Host'} Mode
                </button>
                <Link 
                  to="/profile" 
                  className={`btn ${location.pathname === '/profile' ? 'btn-light' : 'btn-outline-light'} me-3`}
                >
                  Profile
                </Link>
                <button 
                  className="btn btn-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`btn ${location.pathname === '/login' ? 'btn-light' : 'btn-outline-light'} me-2`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className={`btn ${location.pathname === '/signup' ? 'btn-light' : 'btn-outline-light'}`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
