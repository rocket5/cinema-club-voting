import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase/client';

function DebugInfo() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDebugInfo = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      // Prepare headers with authentication if available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Call the debug endpoint
      const response = await fetch(`/.netlify/functions/debug-user?userId=${encodeURIComponent(user.id)}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      console.error('Error fetching debug info:', err);
      setError(err.message || 'Failed to fetch debug info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  if (!user) {
    return <div className="alert alert-warning">No user logged in</div>;
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>Error</h5>
        <p>{error}</p>
        <button className="btn btn-sm btn-outline-danger" onClick={fetchDebugInfo}>Retry</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Debug Information</h5>
      </div>
      <div className="card-body">
        <h6>User Information</h6>
        <pre className="bg-light p-3 rounded">
          {JSON.stringify({
            id: user.id,
            email: user.email,
            aud: user.aud,
            role: user.role
          }, null, 2)}
        </pre>
        
        {debugInfo && (
          <>
            <h6>Debug API Response</h6>
            <pre className="bg-light p-3 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </>
        )}
        
        <button className="btn btn-primary" onClick={fetchDebugInfo}>Refresh Debug Info</button>
      </div>
    </div>
  );
}

export default DebugInfo; 