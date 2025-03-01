// src/pages/AddMovie.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MovieSearch from '../../components/MovieSearch/MovieSearch';
import MovieDetails from '../../components/MovieDetails/MovieDetails';
import './AddMovie.css'; // Make sure this file exists

function AddMovie() {
    const { sessionId, movieId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [addedBy, setAddedBy] = useState('');
    const [poster, setPoster] = useState('');
    const [year, setYear] = useState('');
    const [director, setDirector] = useState('');
    const [genre, setGenre] = useState('');
    const [imdbRating, setImdbRating] = useState('');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [viewMode, setViewMode] = useState('search'); // 'search', 'details', 'form'
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check if we're in edit mode and fetch the movie data if needed
    useEffect(() => {
        if (movieId) {
            setIsEditing(true);
            setViewMode('form');
            fetchMovieData();
        }
    }, [movieId]);

    const fetchMovieData = async () => {
        if (!movieId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/.netlify/functions/get-movie?id=${movieId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.movie) {
                const movie = data.movie;
                setTitle(movie.title || '');
                setDescription(movie.description || '');
                setAddedBy(movie.addedBy || '');
                setPoster(movie.poster || '');
                setYear(movie.year || '');
                setDirector(movie.director || '');
                setGenre(movie.genre || '');
                setImdbRating(movie.imdbRating || '');
            } else {
                throw new Error('Movie not found');
            }
        } catch (err) {
            console.error('Error fetching movie data:', err);
            setError(`Failed to load movie data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMovie = (movie) => {
        setSelectedMovie(movie);
        setViewMode('details');
    };

    const handleBackToSearch = () => {
        setViewMode('search');
    };

    const handleUseMovieDetails = () => {
        if (selectedMovie) {
            setTitle(selectedMovie.Title);
            setYear(selectedMovie.Year);
            setPoster(selectedMovie.Poster);
            // The director, genre, and plot will be populated from the detailed view
            setViewMode('form');
        }
    };

    const handleMovieDetailsLoaded = (movieDetails) => {
        if (movieDetails) {
            setDescription(movieDetails.Plot);
            setDirector(movieDetails.Director);
            setGenre(movieDetails.Genre);
            setImdbRating(movieDetails.imdbRating);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isEditing 
                ? '/.netlify/functions/update-movie' 
                : '/.netlify/functions/add-movie';
                
            const movieData = {
                title,
                description,
                addedBy,
                poster,
                year,
                director,
                genre,
                imdbRating,
                sessionId
            };
            
            // If editing, include the movie ID
            if (isEditing && movieId) {
                movieData.id = movieId;
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(movieData)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'add'} movie`);
            }

            navigate(`/session/${sessionId}`);
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} movie:`, error);
            alert(`Failed to ${isEditing ? 'update' : 'add'} movie: ${error.message}`);
        }
    };

    const handleManualEntry = () => {
        setViewMode('form');
    };

    if (loading) {
        return (
            <div className="add-movie-container">
                <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="add-movie-container">
                <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button 
                        className="btn btn-danger mt-3"
                        onClick={() => navigate(`/session/${sessionId}`)}
                    >
                        Back to Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="add-movie-container">
            <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
            
            {viewMode === 'search' && !isEditing && (
                <>
                    <p className="search-instructions">
                        Search for a movie using the OMDb API or <button onClick={handleManualEntry} className="manual-entry-button">enter details manually</button>
                    </p>
                    <MovieSearch onSelectMovie={handleSelectMovie} />
                </>
            )}
            
            {viewMode === 'details' && selectedMovie && !isEditing && (
                <>
                    <MovieDetails 
                        movieId={selectedMovie.imdbID} 
                        onBack={handleBackToSearch}
                        onDetailsLoaded={handleMovieDetailsLoaded}
                    />
                    <div className="details-actions">
                        <button onClick={handleUseMovieDetails} className="use-details-button">
                            Use This Movie
                        </button>
                    </div>
                </>
            )}
            
            {viewMode === 'form' && (
                <>
                    {!isEditing && (
                        <button onClick={handleBackToSearch} className="back-to-search-button">
                            ← Back to Search
                        </button>
                    )}
                    <form onSubmit={handleSubmit} className="add-movie-form">
                        <div className="form-group">
                            <label>Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Added By:</label>
                            <input
                                type="text"
                                value={addedBy}
                                onChange={(e) => setAddedBy(e.target.value)}
                                required
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Poster URL:</label>
                            <input
                                type="text"
                                value={poster}
                                onChange={(e) => setPoster(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Year:</label>
                                <input
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Director:</label>
                                <input
                                    type="text"
                                    value={director}
                                    onChange={(e) => setDirector(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Genre:</label>
                                <input
                                    type="text"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>IMDB Rating:</label>
                                <input
                                    type="text"
                                    value={imdbRating}
                                    onChange={(e) => setImdbRating(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-button">
                            {isEditing ? 'Update Movie' : 'Add Movie'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}

export default AddMovie;
