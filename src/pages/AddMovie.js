// src/pages/AddMovie.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MovieSearch from '../components/MovieSearch';
import MovieDetails from '../components/MovieDetails';
import './AddMovie.css'; // Make sure this file exists

function AddMovie() {
    const { sessionId } = useParams();
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
            const response = await fetch('/.netlify/functions/add-movie', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    addedBy,
                    poster,
                    year,
                    director,
                    genre,
                    imdbRating,
                    sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add movie');
            }

            navigate(`/session/${sessionId}`);
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    const handleManualEntry = () => {
        setViewMode('form');
    };

    return (
        <div className="add-movie-container">
            <h1>Add New Movie</h1>
            
            {viewMode === 'search' && (
                <>
                    <p className="search-instructions">
                        Search for a movie using the OMDb API or <button onClick={handleManualEntry} className="manual-entry-button">enter details manually</button>
                    </p>
                    <MovieSearch onSelectMovie={handleSelectMovie} />
                </>
            )}
            
            {viewMode === 'details' && selectedMovie && (
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
                    <button onClick={handleBackToSearch} className="back-to-search-button">
                        ← Back to Search
                    </button>
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
                        <button type="submit" className="submit-button">Add Movie</button>
                    </form>
                </>
            )}
        </div>
    );
}

export default AddMovie;
