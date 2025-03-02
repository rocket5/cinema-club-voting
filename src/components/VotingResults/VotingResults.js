import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase/client';
import './VotingResults.css';

function VotingResults({ sessionId }) {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchResults = async () => {
    if (!sessionId) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching results for session: ${sessionId} (Attempt ${retryCount + 1})`);
      console.log('Current user:', user);
      
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
      
      // For users not logged in or when in host mode, we might not have a user object
      const userId = user?.id || 'guest';
      console.log('Using user ID for results:', userId);
      
      // Build the URL with query parameters
      const url = `/.netlify/functions/get-session-results?sessionId=${encodeURIComponent(sessionId)}&userId=${encodeURIComponent(userId)}`;
      console.log('Fetching from URL:', url);
      
      // Include the user ID as a query parameter
      const response = await fetch(url, {
        headers,
        method: 'GET'
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage += `, message: ${errorData.error || 'Unknown error'}`;
          errorDetails = errorData.details || '';
          
          // Check specifically for the session_movies relationship error
          if (errorDetails && errorDetails.includes('session_movies')) {
            errorMessage = 'Unable to load results due to a database schema error. The development team has been notified.';
            console.error('Schema relationship error detected:', errorDetails);
          }
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Received results data:', data);
      setResults(data.results || []);
      setTotalVoters(data.totalVoters || 0);
      setHasVoted(data.hasVoted || false);
      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching voting results:', error);
      setError(error.message || 'Failed to load voting results');
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchResults();
  }, [sessionId, user]);
  
  const handleRetry = () => {
    fetchResults();
  };
  
  if (loading) {
    return (
      <div className="voting-results-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
        <p className="mt-2">Loading results, please wait...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="voting-results-error alert alert-danger">
        <h4>Error Loading Results</h4>
        <p>{error}</p>
        {retryCount > 2 && (
          <p className="text-muted small">
            Persistent errors? Try refreshing the page or coming back later.
            {error.includes('database') && ' The database may be experiencing issues.'}
          </p>
        )}
        <button 
          className="btn btn-outline-danger"
          onClick={handleRetry}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Retry ({retryCount})
        </button>
      </div>
    );
  }
  
  if (!hasVoted && results.length === 0) {
    return (
      <div className="voting-results-empty">
        <h3>No Results Yet</h3>
        <p>Be the first to vote in this session!</p>
      </div>
    );
  }
  
  return (
    <div className="voting-results">
      <div className="voting-results-header">
        <h3>Voting Results</h3>
        <div className="voting-stats">
          <span>{totalVoters} {totalVoters === 1 ? 'person has' : 'people have'} voted</span>
          {hasVoted && <span className="user-voted-badge">You voted</span>}
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="no-results">
          <p>No results available yet.</p>
        </div>
      ) : (
        <div className="results-list">
          {results.map((movie, index) => (
            <div key={movie.id} className="result-item">
              <div className="result-rank">#{index + 1}</div>
              <div className="result-poster">
                <img 
                  src={movie.imageUrl || (movie.posterPath ? `https://image.tmdb.org/t/p/w200${movie.posterPath}` : '/placeholder.png')} 
                  alt={movie.title} 
                />
              </div>
              <div className="result-info">
                <h4>{movie.title}</h4>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Average Rank:</span>
                    <span className="stat-value">{movie.avgRank ? movie.avgRank.toFixed(1) : 'No votes'}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Votes:</span>
                    <span className="stat-value">{movie.votes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VotingResults; 