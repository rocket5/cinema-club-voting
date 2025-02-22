import React from 'react';
import MovieCard from './MovieCard';

function MovieList({ movies }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-5">
        <h3>No movies found</h3>
        <p className="text-muted">Be the first to add a movie!</p>
      </div>
    );
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {movies.map(movie => (
        <div key={movie.id} className="col">
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
}

export default MovieList;
