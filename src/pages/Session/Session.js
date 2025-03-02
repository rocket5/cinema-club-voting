// src/pages/Session.js
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppMode } from '../../context/AppModeContext';
import { useVoting } from '../../context/VotingContext';
import { useAuth } from '../../context/AuthContext';
import MovieList from '../../components/MovieList/MovieList';
import VotingResults from '../../components/VotingResults/VotingResults';
import DebugInfo from '../../components/DebugInfo/DebugInfo';
import { supabase } from '../../lib/supabase/client';
import './Session.css';

function Session() {
    const { sessionId } = useParams();
    const { isHostMode } = useAppMode();
    const { user } = useAuth();
    const { 
        votes, 
        loadVotes, 
        submitVotes, 
        allMoviesRanked, 
        setMovies, 
        clearVotes,
        isSubmitting,
        votingError,
        resetVotingError
    } = useVoting();
    const [movies, setMoviesState] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankings, setRankings] = useState({});
    const [sessionData, setSessionData] = useState(null);
    const [sortByRank, setSortByRank] = useState(false);
    const [voteSubmitted, setVoteSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Always show results in host mode
    useEffect(() => {
        if (isHostMode) {
            setShowResults(true);
        }
    }, [isHostMode]);

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
            const moviesData = data.movies || [];
            setMoviesState(moviesData);
            setMovies(moviesData); // Set movies in VotingContext
            setLoading(false);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Check if the user has already voted in this session
    const checkVoteStatus = async () => {
        try {
            // Create headers with auth token if available
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            console.log('Checking vote status for session:', sessionId);
            
            // Pass the user ID as a query parameter
            const response = await fetch(`/.netlify/functions/check-user-voted?sessionId=${sessionId}&userId=${user.id}`, {
                headers
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Vote status check failed:', response.status, errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Vote status result:', data);
            setVoteSubmitted(data.hasVoted);
            // If the user has already voted, show the results by default
            if (data.hasVoted) {
                setShowResults(true);
            }
        } catch (err) {
            console.error('Error checking vote status:', err);
            // Don't set error state here, just log the error
            // The user can still interact with the voting interface even if
            // the check fails
        }
    };

    const retryVoteCheck = () => {
        if (user) {
            checkVoteStatus();
        }
    };

    useEffect(() => {
        fetchSessionData();
        fetchMovies();
        loadVotes(sessionId);
        if (user) {
            checkVoteStatus();
        }

        return () => {
            clearVotes();
        };
    }, [sessionId, user, location.key]);

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

    const handleSubmitVotes = async () => {
        if (!allMoviesRanked()) {
            alert('Please rank all movies before submitting your vote.');
            return;
        }

        try {
            console.log('Submitting votes for session:', sessionId);
            console.log('Current user:', user);
            
            const success = await submitVotes(sessionId);
            
            if (success) {
                console.log('Vote submission successful');
                setVoteSubmitted(true);
                setShowResults(true);
                alert('Your votes have been submitted successfully!');
            } else {
                console.error('Vote submission failed:', votingError);
                alert(votingError || 'Failed to submit votes. Please try again.');
            }
        } catch (error) {
            console.error('Exception during vote submission:', error);
            alert(`Error submitting votes: ${error.message}`);
        }
    };

    const handleToggleSortByRank = () => {
        setSortByRank(prev => !prev);
    };

    const handleToggleResults = () => {
        setShowResults(prev => !prev);
    };

    // Toggle debug info display
    const toggleDebugInfo = () => {
        setShowDebugInfo(prev => !prev);
    };

    // Sort movies by rank if sortByRank is true
    const displayMovies = sortByRank 
        ? [...movies].sort((a, b) => {
            const rankA = votes[a.id] || Number.MAX_SAFE_INTEGER;
            const rankB = votes[b.id] || Number.MAX_SAFE_INTEGER;
            return rankA - rankB;
        })
        : movies;

    if (loading) {
        return (
            <div className="session-container">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner-border loading-spinner text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="session-container">
            <div className="container">
                <div className="session-header">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="session-title">{sessionData?.sessionName || 'Movie Voting Session'}</h1>
                            <div className="session-meta">
                                {sessionData?.displayName && (
                                    <span>Created by: {sessionData.displayName}</span>
                                )}
                                {movies.length > 0 && (
                                    <>
                                        {sessionData?.displayName && <span className="separator"></span>}
                                        <span>{movies.length} movie{movies.length !== 1 ? 's' : ''}</span>
                                    </>
                                )}
                                <button 
                                    className="btn btn-sm btn-link text-muted ms-2 debug-toggle"
                                    onClick={toggleDebugInfo}
                                    title="Toggle Debug Info"
                                >
                                    <i className="bi bi-bug"></i>
                                </button>
                            </div>
                        </div>
                        
                        {isHostMode ? (
                            <div className="d-flex">
                                <Link to={`/session/${sessionId}/add`} className="btn btn-primary add-movie-btn me-2">
                                    <i className="bi bi-plus-lg"></i>
                                    Add New Movie
                                </Link>
                                <button 
                                    className="btn btn-outline-info results-btn"
                                    onClick={handleToggleResults}
                                >
                                    {showResults ? 'Hide Results' : 'Show Results'}
                                </button>
                            </div>
                        ) : (
                            <div className="voting-controls">
                                {!voteSubmitted ? (
                                    <button 
                                        className={`btn btn-primary submit-vote-btn ${!allMoviesRanked() ? 'disabled' : ''}`}
                                        onClick={handleSubmitVotes}
                                        disabled={!allMoviesRanked() || isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit My Vote'}
                                    </button>
                                ) : (
                                    <div className="vote-submitted-message">
                                        <i className="bi bi-check-circle-fill text-success"></i>
                                        <span>Vote Submitted</span>
                                    </div>
                                )}
                                
                                <button 
                                    className="btn btn-outline-secondary sort-btn"
                                    onClick={handleToggleSortByRank}
                                >
                                    {sortByRank ? 'Show Original Order' : 'Sort by My Ranking'}
                                </button>

                                {voteSubmitted && (
                                    <button 
                                        className="btn btn-outline-info results-btn"
                                        onClick={handleToggleResults}
                                    >
                                        {showResults ? 'Hide Results' : 'Show Results'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {showDebugInfo && user && (
                    <div className="debug-section mb-4">
                        <DebugInfo />
                    </div>
                )}

                {!isHostMode && !voteSubmitted && !allMoviesRanked() && (
                    <div className="alert alert-info voting-hint" role="alert">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Please rank all movies to enable submission. Each movie must have a unique rank.
                    </div>
                )}

                {votingError && (
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {votingError}
                        <button 
                            type="button" 
                            className="btn-close float-end" 
                            onClick={resetVotingError}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {error ? (
                    <div className="error-container">
                        <h4 className="text-danger mb-3">Error Loading Movies</h4>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="btn btn-danger retry-btn">
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {showResults ? (
                            <VotingResults sessionId={sessionId} />
                        ) : (
                            <div className="movies-grid">
                                <MovieList 
                                    movies={displayMovies}
                                    totalMovies={movies.length}
                                    rankings={rankings}
                                    onRankChange={handleRankChange}
                                    isHostMode={isHostMode}
                                    onDelete={handleDeleteMovie}
                                    onEdit={handleEditMovie}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Session;
