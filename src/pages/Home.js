import React, { useState, useEffect } from 'react';
import MovieList from '../components/MovieList';

function Home() {
  const [movies] = useState([
    {
      id: 1,
      title: "The Shawshank Redemption",
      releaseYear: 1994,
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      imageUrl: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
      votes: 15
    },
    {
      id: 2,
      title: "The Godfather",
      releaseYear: 1972,
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      imageUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      votes: 12
    },
    {
      id: 3,
      title: "The Dark Knight",
      releaseYear: 2008,
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      imageUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      votes: 18
    }
  ]);

  const [rankings, setRankings] = useState({});
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    const savedRankings = localStorage.getItem('movieRankings');
    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    }
  }, []);

  const handleRankChange = (movieId, rank) => {
    setRankings(prevRankings => {
      const updatedRankings = { ...prevRankings };
      
      if (rank === 0) {
        delete updatedRankings[movieId];
      } else {
        Object.entries(updatedRankings).forEach(([key, value]) => {
          if (value === rank) {
            delete updatedRankings[key];
          }
        });
        updatedRankings[movieId] = rank;
      }
      
      localStorage.setItem('movieRankings', JSON.stringify(updatedRankings));
      return updatedRankings;
    });
  };

  const handleSort = () => {
    setIsSorted(!isSorted);
  };

  // Get movies in correct order based on sort state
  const getDisplayedMovies = () => {
    if (!isSorted) return movies;

    return [...movies].sort((a, b) => {
      const rankA = rankings[a.id] || 0;
      const rankB = rankings[b.id] || 0;
      return rankB - rankA;
    });
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rank Your Favorite Movies</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={handleSort}
        >
          {isSorted ? "Show Original Order" : "Sort by Rank"}
        </button>
      </div>
      
      <div className="alert alert-info mb-4">
        Rank movies from 1 to {movies.length}, with {movies.length} being your favorite.
      </div>
      
      <MovieList 
        movies={getDisplayedMovies()}
        totalMovies={movies.length}
        rankings={rankings}
        onRankChange={handleRankChange}
      />
    </div>
  );
}

export default Home;