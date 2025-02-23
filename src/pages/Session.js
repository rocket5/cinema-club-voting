// src/pages/Session.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function Session() {
    const { sessionId } = useParams();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-session-movies?sessionId=${sessionId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received movies data:', data);
                setMovies(data.movies || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching movies:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchMovies();
    }, [sessionId]);

    if (loading) return <div>Loading...</div>;
    if (error) return (
        <div>
            <p>Error loading movies: {error}</p>
            <Link to={`/session/${sessionId}/add`} className="add-movie-button">
                Add New Movie
            </Link>
        </div>
    );

    return (
        <div className="session-container">
            <h1>Movie Voting Session</h1>
            <p>Session ID: {sessionId}</p>
            
            <Link to={`/session/${sessionId}/add`} className="add-movie-button">
                Add New Movie
            </Link>

            <div className="movies-list">
                <h2>Movies</h2>
                {movies.length === 0 ? (
                    <p>No movies added yet. Be the first to add one!</p>
                ) : (
                    <ul>
                        {movies.map(movie => (
                            <li key={movie.id} className="movie-item">
                                <h3>{movie.title}</h3>
                                <p>{movie.description}</p>
                                <div className="movie-meta">
                                    <span>Added by: {movie.addedBy}</span>
                                    <span>Votes: {movie.votes}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Session;
