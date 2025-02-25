import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteButton from '../components/RankInput';
import './MovieDetail.css';

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
      <div className="container py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <p>{error}</p>
          <button 
            className="btn btn-danger mt-2"
            onClick={handleRetry}
          >
            Retry
          </button>
          <button 
            className="btn btn-outline-secondary mt-2 ms-2"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // If no movie data is available yet, use fallback data for display
  if (!movie) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning" role="alert">
          <p>Movie not found. The movie may have been deleted or the ID is invalid.</p>
          <button 
            className="btn btn-outline-secondary mt-2"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button 
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          {movie.poster && movie.poster !== 'N/A' ? (
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="img-fluid rounded shadow movie-poster"
            />
          ) : (
            <div className="no-poster-placeholder">
              <span>No Image Available</span>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h1 className="mb-3">{movie.title} {movie.year && <span className="text-muted">({movie.year})</span>}</h1>
          
          <div className="movie-meta mb-4">
            {movie.genre && <span className="badge bg-secondary me-2">{movie.genre}</span>}
            {movie.director && <p className="mb-1"><strong>Director:</strong> {movie.director}</p>}
            {movie.imdbRating && (
              <div className="imdb-rating mb-2">
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-star-fill me-1"></i> 
                  {movie.imdbRating}/10
                </span>
              </div>
            )}
          </div>
          
          <h5>Description</h5>
          <p className="movie-description">{movie.description}</p>
          
          <div className="added-by mt-4">
            <small className="text-muted">Added by: {movie.addedBy || 'Unknown'}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
