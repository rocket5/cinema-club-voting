// src/components/MovieCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import RankInput from './RankInput';

function MovieCard({ 
  movie, 
  totalMovies, 
  currentRank, 
  onRankChange, 
  isHostMode,
  onDelete 
}) {
  return (
    <div className="card h-100 shadow-sm">
      <img 
        src={movie.poster || movie.imageUrl || 'https://via.placeholder.com/300x450'} 
        className="card-img-top" 
        alt={movie.title}
        style={{ height: '300px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>
        <div className="movie-meta mb-2">
          {movie.year || movie.releaseYear ? (
            <span className="badge bg-secondary me-2">{movie.year || movie.releaseYear}</span>
          ) : null}
          {movie.imdbRating ? (
            <span className="badge bg-warning text-dark me-2">
              <i className="bi bi-star-fill me-1"></i>
              {movie.imdbRating}
            </span>
          ) : null}
          {movie.genre ? (
            <span className="badge bg-info text-dark">{movie.genre.split(',')[0]}</span>
          ) : null}
        </div>
        {movie.director && (
          <p className="card-text text-muted small mb-2">
            <strong>Director:</strong> {movie.director}
          </p>
        )}
        <p className="card-text flex-grow-1">
          {movie.description?.substring(0, 100)}
          {movie.description?.length > 100 ? '...' : ''}
        </p>
        <div className="mt-auto">
          {isHostMode ? (
            <div className="d-flex gap-2">
              <Link 
                to={`/movie/${movie.id}`} 
                className="btn btn-outline-primary flex-grow-1"
              >
                Edit
              </Link>
              <button 
                onClick={() => onDelete?.(movie.id)} 
                className="btn btn-outline-danger"
              >
                Delete
              </button>
            </div>
          ) : (
            <>
              <RankInput 
                movieId={movie.id}
                totalMovies={totalMovies}
                currentRank={currentRank}
                onRankChange={onRankChange}
              />
              <Link 
                to={`/movie/${movie.id}`} 
                className="btn btn-outline-primary mt-2 w-100"
              >
                View Details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
