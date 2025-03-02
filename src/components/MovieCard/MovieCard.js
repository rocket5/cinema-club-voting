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

  // Prevent event propagation when interacting with the RankInput
  const handleRankInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="movie-card card h-100" onClick={handleView} style={{ cursor: 'pointer' }}>
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
              {/* Host mode buttons removed as requested */}
            </div>
          ) : (
            <div className="voter-actions" onClick={handleRankInputClick}>
              <RankInput 
                movieId={movie.id}
                totalMovies={totalMovies}
                currentRank={currentRank}
                onRankChange={onRankChange}
              />
              {/* View Details button removed in vote mode as requested */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
