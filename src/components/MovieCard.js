import React from 'react';
import { Link } from 'react-router-dom';
import RankInput from './RankInput';

function MovieCard({ movie, totalMovies, onRankChange, currentRank }) {
  return (
    <div className="card h-100 shadow-sm">
      <img 
        src={movie.imageUrl || 'https://via.placeholder.com/300x450'} 
        className="card-img-top" 
        alt={movie.title}
        style={{ height: '300px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>
        <p className="card-text text-muted mb-2">{movie.releaseYear}</p>
        <p className="card-text flex-grow-1">
          {movie.description?.substring(0, 100)}
          {movie.description?.length > 100 ? '...' : ''}
        </p>
        <div className="mt-auto">
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
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
