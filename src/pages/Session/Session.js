// src/pages/Session.js
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppMode } from '../../context/AppModeContext';
import MovieList from '../../components/MovieList/MovieList';
import './Session.css';

function Session() {
    const { sessionId } = useParams();
    const { isHostMode } = useAppMode();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankings, setRankings] = useState({});
    const [sessionData, setSessionData] = useState(null);
    const navigate = useNavigate();

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

    useEffect(() => {
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
        if (window.confirm("Are you sure you want to delete this movie?")) {
            try {
                const response = await fetch(`/.netlify/functions/delete-movie?id=${movieId}`, {
                    method: 'DELETE',
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    console.log('Movie deleted successfully:', data);
                    // Refresh the movie list
                    fetchMovies();
                } else {
                    console.error('Failed to delete movie:', data);
                    alert(`Failed to delete movie: ${data.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting movie:', error);
                alert(`Error deleting movie: ${error.message || 'Unknown error'}`);
            }
        }
    };

    const handleEditMovie = (movieId) => {
        // Navigate to the AddMovie page with the movie ID for editing
        navigate(`/session/${sessionId}/edit/${movieId}`);
    };

    if (loading) return <div className="container mt-4"><div className="text-center">Loading...</div></div>;
    
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1>{sessionData?.sessionName || 'Movie Voting Session'}</h1>
                    <p className="text-muted">
                        Session ID: {sessionId}
                        {sessionData?.displayName && (
                            <span> | Created by: {sessionData.displayName}</span>
                        )}
                    </p>
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
                    onEdit={handleEditMovie}
                />
            )}
        </div>
    );
}

export default Session;
