import React from 'react';
import { Link } from 'react-router-dom';
import VoteButton from './VoteButton';

function MovieCard({ movie }) {
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
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <VoteButton movieId={movie.id} votes={movie.votes} />
          <Link 
            to={`/movie/${movie.id}`} 
            className="btn btn-outline-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
