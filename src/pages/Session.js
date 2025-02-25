// src/pages/Session.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppMode } from '../context/AppModeContext';
import MovieList from '../components/MovieList';
import './Session.css';

function Session() {
    const { sessionId } = useParams();
    const { isHostMode } = useAppMode();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankings, setRankings] = useState({});
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const response = await fetch(`/.netlify/functions/get-session?sessionId=${sessionId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received session data:', data);
                setSessionData(data);
            } catch (err) {
                console.error('Error fetching session data:', err);
                // Don't set error here, as we'll still try to fetch movies
            }
        };

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

        fetchSessionData();
        fetchMovies();
    }, [sessionId]);

    const handleRankChange = (movieId, newRank) => {
        setRankings(prev => ({
            ...prev,
            [movieId]: newRank
        }));
    };

    const handleDeleteMovie = async (movieId) => {
        if (window.confirm('Are you sure you want to remove this movie?')) {
            try {
                const response = await fetch(`/.netlify/functions/movies?id=${movieId}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Remove the movie from the local state
                setMovies(movies.filter(movie => movie.id !== movieId));
            } catch (err) {
                console.error('Error deleting movie:', err);
                alert(`Failed to delete movie: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
    
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1>{sessionData?.sessionName || 'Movie Voting Session'}</h1>
                    <p className="text-muted">Session ID: {sessionId}</p>
                </div>
                
                {isHostMode && (
                    <Link to={`/session/${sessionId}/add`} className="btn btn-primary">
                        Add New Movie
                    </Link>
                )}
            </div>

            {error ? (
                <div className="alert alert-danger">
                    <p>Error loading movies: {error}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-danger mt-2">
                        Retry
                    </button>
                </div>
            ) : (
                <MovieList 
                    movies={movies}
                    totalMovies={movies.length}
                    rankings={rankings}
                    onRankChange={handleRankChange}
                    isHostMode={isHostMode}
                    onDelete={handleDeleteMovie}
                />
            )}
        </div>
    );
}

export default Session;
