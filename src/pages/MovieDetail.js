import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoteButton from '../components/VoteButton';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // For now, we'll use hardcoded data. Later, we'll fetch this from our backend
  const movie = {
    id: parseInt(id),
    title: "The Shawshank Redemption",
    releaseYear: 1994,
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    votes: 15,
    director: "Frank Darabont",
    genre: "Drama"
  };

  return (
    <div className="container py-4">
      <button 
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      
      <div className="row">
        <div className="col-md-4 mb-4">
          <img 
            src={movie.imageUrl} 
            alt={movie.title}
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-8">
          <h1 className="mb-3">{movie.title}</h1>
          <div className="mb-3">
            <VoteButton movieId={movie.id} votes={movie.votes} />
          </div>
          <p className="text-muted">
            {movie.releaseYear} | {movie.genre} | Directed by {movie.director}
          </p>
          <h5>Description</h5>
          <p>{movie.description}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
