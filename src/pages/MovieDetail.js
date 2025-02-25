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
        // In a real implementation, this would fetch from your actual API
        const response = await fetch(`/.netlify/functions/get-movie?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        
        const data = await response.json();
        setMovie(data.movie);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id]);
  
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
          {error}
        </div>
      </div>
    );
  }
  
  // If no movie data is available yet, use fallback data for display
  if (!movie) {
    movie = {
      id: parseInt(id),
      title: "Movie Not Found",
      description: "Sorry, we couldn't find information for this movie.",
      addedBy: "Unknown",
      votes: 0
    };
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
          <div className="mb-3">
            <VoteButton movieId={movie.id} votes={movie.votes} />
          </div>
          
          <div className="movie-meta mb-4">
            {movie.genre && <span className="badge bg-secondary me-2">{movie.genre}</span>}
            {movie.director && <p className="mb-1"><strong>Director:</strong> {movie.director}</p>}
            {movie.imdbRating && (
              <div className="imdb-rating mb-2">
                <span className="badge bg-warning text-dark">
                  <i className="fas fa-star me-1"></i> 
                  {movie.imdbRating}/10
                </span>
              </div>
            )}
          </div>
          
          <h5>Description</h5>
          <p className="movie-description">{movie.description}</p>
          
          <div className="added-by mt-4">
            <small className="text-muted">Added by: {movie.addedBy}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
