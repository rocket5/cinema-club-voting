// src/components/MovieCard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RankInput from '../RankInput/RankInput';
import './MovieCard.css'; // Add CSS import

function MovieCard({ 
  movie, 
  totalMovies, 
  currentRank, 
  onRankChange, 
  isHostMode,
  onDelete,
  onEdit
}) {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(movie.id);
    } else {
      // Fallback to direct navigation if no onEdit handler is provided
      navigate(`/movie/${movie.id}/edit`);
    }
  };

  const handleView = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card card h-100">
      <div className="poster-container">
        {movie.poster || movie.imageUrl ? (
          <img 
            src={movie.poster || movie.imageUrl} 
            className="card-img-top" 
            alt={movie.title}
          />
        ) : (
          <div className="no-poster-placeholder">
            <span>No Image Available</span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>
        <div className="movie-meta mb-2">
          {movie.year || movie.releaseYear ? (
            <span className="year-badge me-2">{movie.year || movie.releaseYear}</span>
          ) : null}
          {movie.genre ? (
            <span className="genre-badge">{movie.genre.split(',')[0]}</span>
          ) : null}
          {movie.imdbRating ? (
            <span className="rating-badge-inline me-2">
              <i className="bi bi-star-fill me-1"></i>
              {movie.imdbRating}
            </span>
          ) : null}
        </div>
        {movie.director && (
          <p className="card-text text-muted small mb-2">
            <strong>Director:</strong> {movie.director}
          </p>
        )}
        <p className="card-text text-muted small mb-2">
          <strong>Added by:</strong> {movie.displayName || movie.addedBy}
        </p>
        <p className="card-text flex-grow-1 movie-description">
          {movie.description?.substring(0, 100)}
          {movie.description?.length > 100 ? '...' : ''}
        </p>
        <div className="mt-auto">
          {isHostMode ? (
            <div className="d-flex gap-2">
              <button 
                onClick={handleView} 
                className="btn btn-outline-primary flex-grow-1"
                title="View movie details"
              >
                <i className="bi bi-eye"></i>
              </button>
              <button 
                onClick={handleEdit} 
                className="btn btn-outline-secondary flex-grow-1"
                title="Edit movie"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button 
                onClick={() => onDelete?.(movie.id)} 
                className="btn btn-outline-danger"
                title="Delete movie"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ) : (
            <div className="voter-actions">
              <RankInput 
                movieId={movie.id}
                totalMovies={totalMovies}
                currentRank={currentRank}
                onRankChange={onRankChange}
              />
              <button 
                onClick={handleView} 
                className="btn btn-primary mt-2 w-100"
              >
                <i className="bi bi-eye me-2"></i> View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
