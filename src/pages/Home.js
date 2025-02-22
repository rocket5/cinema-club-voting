import React, { useState } from 'react';
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

  return (
    <div className="container">
      <h2 className="mb-4">Popular Movies</h2>
      <MovieList movies={movies} />
    </div>
  );
}

export default Home;
