import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppMode } from '../context/AppModeContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isHostMode, toggleMode } = useAppMode();

  const handleModeSwitch = () => {
    if (!isHostMode) {
      // If switching to host mode, navigate to home
      navigate('/');
    }
    toggleMode();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🎬 Movie Ranker
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
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                {isHostMode ? 'Manage Movies' : 'Vote'}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <div className="mode-indicator me-3">
              <span className={`badge ${isHostMode ? 'bg-warning' : 'bg-success'}`}>
                {isHostMode ? 'Host Mode' : 'Voting Mode'}
              </span>
            </div>
            <button 
              className="btn btn-outline-light"
              onClick={handleModeSwitch}
            >
              Switch to {isHostMode ? 'Voting' : 'Host'} Mode
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
