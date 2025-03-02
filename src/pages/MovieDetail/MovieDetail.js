import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteButton from '../../components/RankInput/RankInput';
import './MovieDetail.css';
// Import icons
import { FaArrowLeft, FaPencilAlt } from 'react-icons/fa';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching movie details for ID:', id);
        const response = await fetch(`/.netlify/functions/get-movie?id=${id}`);
        
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch movie details (${response.status})`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          throw new Error('Invalid response format');
        }
        
        console.log('Parsed data:', data);
        
        if (!data.movie) {
          throw new Error('Movie data not found in response');
        }
        
        setMovie(data.movie);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError(`Failed to load movie details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id]);
  
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger the effect
    const fetchData = async () => {
      try {
        const response = await fetch(`/.netlify/functions/get-movie?id=${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMovie(data.movie);
        setLoading(false);
      } catch (error) {
        console.error('Error retrying fetch:', error);
        setError(`Failed to load movie details: ${error.message}`);
        setLoading(false);
      }
    };
    fetchData();
  };
  
  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="movie-detail-container">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <div className="action-buttons">
            <button 
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="btn-icon" />
              Back to Search
            </button>
            <button 
              className="btn-primary"
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise btn-icon"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no movie data is available yet, use fallback data for display
  if (!movie) {
    return (
      <div className="movie-detail-container">
        <div className="error-container">
          <h3>Movie Not Found</h3>
          <p>The movie may have been deleted or the ID is invalid.</p>
          <button 
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft className="btn-icon" />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-container">
      <div className="action-buttons">
        <button 
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="btn-icon" />
          Back to Search
        </button>
        <div className="action-buttons-right">
          {movie.sessionId && (
            <button 
              className="btn-primary"
              onClick={() => navigate(`/session/${movie.sessionId}/edit/${id}`)}
            >
              <FaPencilAlt className="btn-icon" />
              Edit Details
            </button>
          )}
        </div>
      </div>
      
      <div className="details-section">
        <div className="movie-header">
          <h1 className="movie-title">
            {movie.title} 
            {movie.year && <span className="movie-year">({movie.year})</span>}
          </h1>
          
          <div className="movie-meta-info">
            <div className="movie-rating-container">
              {movie.imdbRating && (
                <div className="rating">
                  <span className="rating-source">Internet Movie Database:</span>
                  <span className="rating-value">{movie.imdbRating}/10</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="movie-content-grid">
          <div className="movie-poster-container">
            {movie.poster && movie.poster !== 'N/A' ? (
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="movie-poster"
              />
            ) : (
              <div className="no-poster-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>
          
          <div className="movie-details">
            <div className="movie-info-section">
              <div className="movie-info-grid">
                {movie.runtime && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Runtime:</span>
                    <span className="movie-info-value">{movie.runtime}</span>
                  </div>
                )}
                
                {movie.rated && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Rated:</span>
                    <span className="movie-info-value">{movie.rated}</span>
                  </div>
                )}
                
                {movie.released && (
                  <div className="movie-info-item">
                    <span className="movie-info-label">Released:</span>
                    <span className="movie-info-value">{movie.released}</span>
                  </div>
                )}
              </div>
              
              {movie.genre && (
                <div className="movie-info-item genre-container">
                  <span className="movie-info-label">Genre:</span>
                  <div className="genre-badges">
                    {movie.genre.split(',').map((genre, index) => (
                      <span key={index} className="genre-badge">{genre.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {movie.director && (
                <div className="movie-info-item">
                  <span className="movie-info-label">Director:</span>
                  <span className="movie-info-value">{movie.director}</span>
                </div>
              )}
              
              {movie.actors && (
                <div className="movie-info-item">
                  <span className="movie-info-label">Cast:</span>
                  <span className="movie-info-value">{movie.actors}</span>
                </div>
              )}
              
              {movie.description && (
                <div className="movie-info-item description-container">
                  <h3 className="section-title">Plot</h3>
                  <p className="movie-description">{movie.description}</p>
                </div>
              )}
              
              {movie.awards && (
                <div className="movie-info-item">
                  <h3 className="section-title">Awards</h3>
                  <p className="movie-awards">{movie.awards}</p>
                </div>
              )}
            </div>
            
            <div className="added-by">
              <span>Added by: {movie.displayName || movie.addedBy || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
