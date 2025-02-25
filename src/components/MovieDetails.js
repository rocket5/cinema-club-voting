import React, { useState, useEffect } from 'react';
import { getMovieById } from '../api/omdb';
import './MovieDetails.css';

function MovieDetails({ movieId, onBack, onDetailsLoaded }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getMovieById(movieId);
        if (data.Response === 'True') {
          setMovie(data);
          if (onDetailsLoaded) {
            onDetailsLoaded(data);
          }
        } else {
          setError(data.Error || 'Failed to load movie details');
        }
      } catch (err) {
        setError('An error occurred while fetching movie details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [movieId, onDetailsLoaded]);

  if (loading) {
    return <div className="movie-details-loading">Loading movie details...</div>;
  }

  if (error) {
    return <div className="movie-details-error">{error}</div>;
  }

  if (!movie) {
    return null;
  }

  return (
    <div className="movie-details-container">
      <button onClick={onBack} className="back-button">← Back to Search</button>
      
      <div className="movie-details-content">
        <div className="movie-details-poster">
          {movie.Poster && movie.Poster !== 'N/A' ? (
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
          ) : (
            <div className="no-poster">No Poster Available</div>
          )}
        </div>
        
        <div className="movie-details-info">
          <h1>{movie.Title} <span className="movie-year">({movie.Year})</span></h1>
          
          <div className="movie-meta">
            <span>{movie.Rated}</span>
            <span>{movie.Runtime}</span>
            <span>{movie.Genre}</span>
            <span>Released: {movie.Released}</span>
          </div>
          
          <div className="movie-ratings">
            {movie.Ratings && movie.Ratings.map((rating, index) => (
              <div key={index} className="rating">
                <span className="rating-source">{rating.Source}:</span>
                <span className="rating-value">{rating.Value}</span>
              </div>
            ))}
          </div>
          
          <div className="movie-plot">
            <h3>Plot</h3>
            <p>{movie.Plot}</p>
          </div>
          
          <div className="movie-people">
            <div className="movie-person">
              <h3>Director</h3>
              <p>{movie.Director}</p>
            </div>
            
            <div className="movie-person">
              <h3>Writer</h3>
              <p>{movie.Writer}</p>
            </div>
            
            <div className="movie-person">
              <h3>Actors</h3>
              <p>{movie.Actors}</p>
            </div>
          </div>
          
          {movie.Awards !== 'N/A' && (
            <div className="movie-awards">
              <h3>Awards</h3>
              <p>{movie.Awards}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails; 