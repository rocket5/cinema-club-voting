import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppMode } from '../context/AppModeContext';

function HostRoute({ children, sessionIdParam }) {
  const { user, loading, isSessionHost } = useAuth();
  const { isHostMode } = useAppMode();
  const params = useParams();
  
  // Get sessionId from params if not provided directly
  const sessionId = sessionIdParam || params.sessionId;
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If not in host mode or not the host of this session, redirect
  if (!isHostMode || (sessionId && !isSessionHost(sessionId))) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default HostRoute; 