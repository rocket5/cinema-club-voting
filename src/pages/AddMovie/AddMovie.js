// src/pages/AddMovie.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import MovieSearch from '../../components/MovieSearch/MovieSearch';
import MovieDetails from '../../components/MovieDetails/MovieDetails';
import { supabase } from '../../lib/supabase/client'; // Import supabase client
import './AddMovie.css'; // Make sure this file exists
// Import icons
import { FaArrowLeft, FaPlus, FaPencilAlt, FaFilm, FaSearch, FaEdit, FaKeyboard } from 'react-icons/fa';

// Database schema note:
// The movies table uses 'added_by' (UUID) for the user ID and 'display_name' (string)
// for the user's display name. This matches how the Sessions page displays user names.

function AddMovie() {
    const { sessionId, movieId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get the authenticated user
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [addedBy, setAddedBy] = useState('');
    const [userProfile, setUserProfile] = useState(null); // Add state for user profile
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
    const [sessionName, setSessionName] = useState(''); // Add state for session name

    // Set user information when user is available
    useEffect(() => {
        if (user) {
            console.log('User metadata:', user.user_metadata);
            // Use username from user metadata
            const username = user.user_metadata?.username || user.user_metadata?.name || user.email;
            setAddedBy(username);
            
            // Also fetch profile for additional data if needed
            fetchUserProfile();
        }
    }, [user]);

    // Fetch session data when component mounts
    useEffect(() => {
        if (sessionId) {
            fetchSessionData();
        }
    }, [sessionId]);

    // Fetch session data from the server
    const fetchSessionData = async () => {
        try {
            const response = await fetch(`/.netlify/functions/get-session?sessionId=${sessionId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received session data:', data);
            setSessionName(data.sessionName || '');
        } catch (err) {
            console.error('Error fetching session data:', err);
            // Don't set error here as we can still proceed with adding a movie
        }
    };

    // Fetch user profile from the database
    const fetchUserProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                // We already set addedBy from metadata, so no fallback needed here
            } else if (data) {
                setUserProfile(data);
                // If profile has a name, prefer it over metadata
                if (data.name) {
                    setAddedBy(data.name);
                }
            }
        } catch (err) {
            console.error('Exception fetching user profile:', err);
            // We already set addedBy from metadata, so no fallback needed here
        }
    };

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
        // Initialize the selected movie with basic details
        // and mark that we don't have full details yet
        setSelectedMovie({
            ...movie,
            fullDetails: false
        });
        setViewMode('details');
    };

    const handleBackToSearch = () => {
        setViewMode('search');
    };

    // Add a useEffect to log the sessionId when it changes
    useEffect(() => {
        console.log('Current sessionId:', sessionId);
    }, [sessionId]);

    const handleUseMovieDetails = async () => {
        if (!selectedMovie) return;
        
        try {
            setLoading(true);
            setError(null);
            
            // Check if the session exists first
            const sessionExists = await checkSessionExists();
            if (!sessionExists) {
                throw new Error(`Session with ID ${sessionId} does not exist.`);
            }
            
            // Create a minimal movie object with only essential fields
            const movieData = {
                title: selectedMovie.Title,
                description: selectedMovie.Plot || '',
                session_id: sessionId
            };
            
            // Add user ID if authenticated (required field)
            if (user) {
                movieData.added_by = user.id;
                movieData.display_name = addedBy || user.email;
            } else {
                // For anonymous users, use a placeholder UUID and the entered name
                movieData.added_by = '00000000-0000-0000-0000-000000000000';
                movieData.display_name = addedBy || 'Anonymous';
            }
            
            // Add optional fields if they exist in the schema
            if (selectedMovie.Poster && selectedMovie.Poster !== 'N/A') {
                movieData.poster = selectedMovie.Poster;
            }
            
            if (selectedMovie.Year) {
                movieData.year = selectedMovie.Year;
            }
            
            if (selectedMovie.Director && selectedMovie.Director !== 'N/A') {
                movieData.director = selectedMovie.Director;
            }
            
            if (selectedMovie.Genre && selectedMovie.Genre !== 'N/A') {
                movieData.genre = selectedMovie.Genre;
            }
            
            if (selectedMovie.imdbRating && selectedMovie.imdbRating !== 'N/A') {
                movieData.imdb_rating = selectedMovie.imdbRating;
            }
            
            console.log('Adding movie with data:', movieData);
            
            // Insert the movie directly into the database
            const { data, error: insertError } = await supabase
                .from('movies')
                .insert([movieData])
                .select();
                
            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw new Error(insertError.message);
            }
            
            console.log('Movie added successfully:', data);
            
            // Navigate back to the session page
            navigate(`/session/${sessionId}`);
            
        } catch (err) {
            console.error('Error adding movie:', err);
            setError('Failed to add movie: ' + err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Update the handleEditMovieDetails function
    const handleEditMovieDetails = () => {
        // The movie details should already be set by handleMovieDetailsLoaded
        // Just switch to the form view
        setViewMode('form');
    };

    const handleMovieDetailsLoaded = (movieDetails) => {
        if (!movieDetails) return;
        
        // Only update if we don't already have these details
        if (!selectedMovie.fullDetails) {
            // Store all the movie details for both direct add and edit flows
            setTitle(movieDetails.Title);
            setDescription(movieDetails.Plot);
            setPoster(movieDetails.Poster !== 'N/A' ? movieDetails.Poster : '');
            setYear(movieDetails.Year);
            setDirector(movieDetails.Director !== 'N/A' ? movieDetails.Director : '');
            setGenre(movieDetails.Genre !== 'N/A' ? movieDetails.Genre : '');
            setImdbRating(movieDetails.imdbRating !== 'N/A' ? movieDetails.imdbRating : '');
            
            // Update the selectedMovie with the full details and mark as loaded
            setSelectedMovie(prevMovie => ({
                ...prevMovie,
                ...movieDetails,
                fullDetails: true
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            // Check if the session exists first
            const sessionExists = await checkSessionExists();
            if (!sessionExists) {
                throw new Error(`Session with ID ${sessionId} does not exist.`);
            }
            
            // Create a minimal movie object with only essential fields
            const movieData = {
                title: title,
                description: description || '',
                session_id: sessionId
            };
            
            // Add user ID if authenticated (required field)
            if (user) {
                movieData.added_by = user.id;
                movieData.display_name = addedBy || user.email;
            } else {
                // For anonymous users, use a placeholder UUID and the entered name
                movieData.added_by = '00000000-0000-0000-0000-000000000000';
                movieData.display_name = addedBy || 'Anonymous';
            }
            
            // Add optional fields if they have values
            if (poster) {
                movieData.poster = poster;
            }
            
            if (year) {
                movieData.year = year;
            }
            
            if (director) {
                movieData.director = director;
            }
            
            if (genre) {
                movieData.genre = genre;
            }
            
            if (imdbRating) {
                movieData.imdb_rating = imdbRating;
            }
            
            console.log('Submitting movie with data:', movieData);
            
            let result;
            
            if (isEditing && movieId) {
                // Update existing movie
                const { data, error: updateError } = await supabase
                    .from('movies')
                    .update(movieData)
                    .eq('id', movieId)
                    .select();
                    
                if (updateError) {
                    console.error('Supabase update error:', updateError);
                    throw new Error(updateError.message);
                }
                
                result = data;
                console.log('Movie updated successfully:', result);
            } else {
                // Insert new movie
                const { data, error: insertError } = await supabase
                    .from('movies')
                    .insert([movieData])
                    .select();
                    
                if (insertError) {
                    console.error('Supabase insert error:', insertError);
                    throw new Error(insertError.message);
                }
                
                result = data;
                console.log('Movie added successfully:', result);
            }
            
            // Navigate back to the session page
            navigate(`/session/${sessionId}`);
            
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} movie:`, err);
            setError(`Failed to ${isEditing ? 'update' : 'add'} movie: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleManualEntry = () => {
        setViewMode('form');
    };

    // Add a function to fetch and log the database schema
    const fetchDatabaseSchema = async () => {
        try {
            console.log('Fetching database schema...');
            
            // Get the schema for the movies table
            const { data, error } = await supabase
                .from('movies')
                .select('*')
                .limit(1);
                
            if (error) {
                console.error('Error fetching schema:', error);
            } else {
                console.log('Sample movie data:', data);
                if (data && data.length > 0) {
                    console.log('Available columns:', Object.keys(data[0]));
                    
                    // Log the types of each field
                    const movie = data[0];
                    Object.entries(movie).forEach(([key, value]) => {
                        console.log(`Field: ${key}, Type: ${typeof value}, Value: ${value}`);
                    });
                } else {
                    // If no movies exist, try to get the schema from the API
                    console.log('No movies found, trying to get schema from API...');
                    
                    // Try to get the schema from the sessions table instead
                    const { data: sessionData, error: sessionError } = await supabase
                        .from('sessions')
                        .select('*')
                        .limit(1);
                        
                    if (sessionError) {
                        console.error('Error fetching sessions schema:', sessionError);
                    } else if (sessionData && sessionData.length > 0) {
                        console.log('Sample session data:', sessionData);
                        console.log('Available session columns:', Object.keys(sessionData[0]));
                    }
                }
            }
        } catch (err) {
            console.error('Exception fetching schema:', err);
        }
    };
    
    // Call the function when the component mounts
    useEffect(() => {
        fetchDatabaseSchema();
    }, []);

    // Add a function to check if the session exists
    const checkSessionExists = async () => {
        if (!sessionId) return false;
        
        try {
            console.log('Checking if session exists:', sessionId);
            
            const { data, error } = await supabase
                .from('sessions')
                .select('id')
                .eq('id', sessionId)
                .single();
                
            if (error) {
                console.error('Error checking session:', error);
                return false;
            }
            
            console.log('Session check result:', data);
            return !!data;
        } catch (err) {
            console.error('Exception checking session:', err);
            return false;
        }
    };
    
    // Check if the session exists when the component mounts
    useEffect(() => {
        if (sessionId) {
            checkSessionExists().then(exists => {
                if (!exists) {
                    console.warn('Session does not exist:', sessionId);
                    setError(`Session with ID ${sessionId} does not exist.`);
                }
            });
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div className="add-movie-container">
                <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading movie data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="add-movie-container">
                <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
                <div className="error-container">
                    <p>{error}</p>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate(`/session/${sessionId}`)}
                    >
                        <FaArrowLeft className="btn-icon" /> Back to Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="add-movie-container">
            <h1 className="page-title">
                {isEditing ? 'Edit Movie' : 'Add A New Movie'}
                {sessionName && <span className="session-subtitle"> {sessionName}</span>}
            </h1>
            
            {viewMode === 'search' && !isEditing && (
                <div className="search-section">
                    <p className="search-instructions">
                        <FaSearch className="instruction-icon" /> Search for a movie or <button onClick={handleManualEntry} className="btn-text"><FaKeyboard className="btn-text-icon" /> enter details manually</button>
                    </p>
                    <MovieSearch onSelectMovie={handleSelectMovie} />
                </div>
            )}
            
            {viewMode === 'details' && selectedMovie && !isEditing && (
                <div className="details-section">
                    <div className="action-buttons">
                        <button onClick={handleBackToSearch} className="btn-secondary">
                            <FaArrowLeft className="btn-icon" /> Back to Search
                        </button>
                        <div className="action-buttons-right">
                            <button onClick={handleEditMovieDetails} className="btn-secondary">
                                <FaPencilAlt className="btn-icon" /> Edit Details
                            </button>
                            <button onClick={handleUseMovieDetails} className="btn-primary">
                                <FaPlus className="btn-icon" /> Add Movie
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading movie data...</p>
                        </div>
                    ) : (
                        <MovieDetails 
                            movieId={selectedMovie.imdbID} 
                            onBack={handleBackToSearch}
                            onDetailsLoaded={handleMovieDetailsLoaded}
                        />
                    )}
                </div>
            )}
            
            {viewMode === 'form' && (
                <div className="form-section">
                    {!isEditing && (
                        <button onClick={handleBackToSearch} className="btn-secondary back-button">
                            <FaArrowLeft className="btn-icon" /> Back to Search
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
                                placeholder="Enter movie title"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Enter movie description or plot"
                            />
                        </div>
                        <div className="form-group">
                            <label>Poster URL:</label>
                            <input
                                type="text"
                                value={poster}
                                onChange={(e) => setPoster(e.target.value)}
                                className="form-input"
                                placeholder="Enter URL to movie poster image"
                            />
                            {poster && (
                                <div className="poster-preview">
                                    <img src={poster} alt="Movie poster preview" />
                                </div>
                            )}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Year:</label>
                                <input
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="form-input"
                                    placeholder="Release year"
                                />
                            </div>
                            <div className="form-group">
                                <label>Director:</label>
                                <input
                                    type="text"
                                    value={director}
                                    onChange={(e) => setDirector(e.target.value)}
                                    className="form-input"
                                    placeholder="Movie director"
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
                                    placeholder="Movie genre(s)"
                                />
                            </div>
                            <div className="form-group">
                                <label>IMDB Rating:</label>
                                <input
                                    type="text"
                                    value={imdbRating}
                                    onChange={(e) => setImdbRating(e.target.value)}
                                    className="form-input"
                                    placeholder="Rating (e.g. 8.5)"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Added By:</label>
                            <input
                                type="text"
                                value={user ? (user.user_metadata?.username || user.user_metadata?.name || user.email) : addedBy}
                                onChange={(e) => setAddedBy(e.target.value)}
                                required
                                className="form-input"
                                disabled={!!user} // Disable the field if user is authenticated
                                placeholder="Your name"
                            />
                            {user && (
                                <small className="form-text text-muted">
                                    Using your account information
                                </small>
                            )}
                        </div>
                        <button 
                            type="submit" 
                            className="btn-primary submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div> 
                                    {isEditing ? 'Updating...' : 'Adding...'}
                                </>
                            ) : isEditing ? (
                                <>
                                    <FaPencilAlt className="btn-icon" /> Update Movie
                                </>
                            ) : (
                                <>
                                    <FaFilm className="btn-icon" /> Add Movie
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddMovie;
