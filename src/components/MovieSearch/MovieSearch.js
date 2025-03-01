import React, { useState, useEffect } from 'react';
import { searchMovies } from '../../api/omdb';
import './MovieSearch.css';

function MovieSearch({ onSelectMovie }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Validate that the search field is filled
    if (!query.trim()) {
      setError('Please enter a movie title to search');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const results = await searchMovies(query, 1);
      
      if (results.Response === 'True') {
        setSearchResults(results.Search);
        setTotalResults(parseInt(results.totalResults, 10));
        setPage(1);
      } else {
        setSearchResults([]);
        setError(results.Error || 'No results found');
        setTotalResults(0);
      }
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = async () => {
    if (loading || searchResults.length >= totalResults) return;
    
    const nextPage = page + 1;
    setLoading(true);
    
    try {
      const results = await searchMovies(query, nextPage);
      
      if (results.Response === 'True') {
        setSearchResults([...searchResults, ...results.Search]);
        setPage(nextPage);
      }
    } catch (err) {
      setError('Failed to load more results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie) => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  return (
    <div className="movie-search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-fields">
          <div className="search-field">
            <label htmlFor="title-search">Movie Title</label>
            <input
              id="title-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter movie title..."
              className="search-input"
            />
          </div>
        </div>

        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="search-error">{error}</div>}

      {searchResults.length > 0 && (
        <div className="search-results-count">
          Found {searchResults.length} {searchResults.length === 1 ? 'movie' : 'movies'}
          {totalResults > searchResults.length && ` (of ${totalResults} total)`}
        </div>
      )}

      <div className="search-results">
        {searchResults.map((movie) => (
          <div key={movie.imdbID} className="movie-card" onClick={() => handleSelect(movie)}>
            <div className="movie-poster">
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <img src={movie.Poster} alt={`${movie.Title} poster`} />
              ) : (
                <div className="no-poster">No Poster</div>
              )}
            </div>
            <div className="movie-info">
              <h3>{movie.Title}</h3>
              <p className="movie-year">{movie.Year}</p>
              <p className="movie-type">{movie.Type}</p>
            </div>
          </div>
        ))}
      </div>

      {searchResults.length > 0 && searchResults.length < totalResults && (
        <button 
          onClick={loadMoreResults} 
          className="load-more-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {searchResults.length === 0 && !loading && !error && (
        <div className="search-empty-state">
          <p>Enter a movie title to search</p>
        </div>
      )}
    </div>
  );
}

export default MovieSearch; 