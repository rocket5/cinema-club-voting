// src/components/MovieList.js
import React from 'react';
import MovieCard from './MovieCard';

function MovieList({ 
  movies, 
  totalMovies, 
  rankings, 
  onRankChange, 
  isHostMode, 
  onDelete 
}) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-5">
        <h3>No movies found</h3>
        <p className="text-muted">
          {isHostMode 
            ? "Add some movies for the next voting session!" 
            : "No movies available for voting yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {movies.map(movie => (
        <div key={movie.id} className="col">
          <MovieCard 
            movie={movie}
            totalMovies={totalMovies}
            currentRank={rankings ? rankings[movie.id] : undefined}
            onRankChange={onRankChange}
            isHostMode={isHostMode}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}

export default MovieList;
