const { supabase } = require('./client');

/**
 * Get all movies or movies by session ID
 * @param {string} sessionId - Optional session ID to filter movies
 * @returns {Promise<Array>} - Array of movie documents
 */
const getMovies = async (sessionId = null) => {
  try {
    let query = supabase
      .from('movies')
      .select('*');
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform data to match the expected format
    return data.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.description || null,
      imageUrl: movie.image_url || null,
      sessionId: movie.session_id,
      addedBy: movie.added_by,
      addedAt: movie.added_at,
      // Include OMDB fields if they exist
      poster: movie.poster || null,
      year: movie.year || null,
      director: movie.director || null,
      genre: movie.genre || null,
      imdbRating: movie.imdb_rating || null
    }));
  } catch (error) {
    console.error('Error getting movies:', error);
    throw new Error(`Failed to get movies: ${error.message}`);
  }
};

/**
 * Get a movie by ID
 * @param {string} id - Movie ID
 * @returns {Promise<Object>} - Movie document
 */
const getMovieById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || null,
      imageUrl: data.image_url || null,
      sessionId: data.session_id,
      addedBy: data.added_by,
      addedAt: data.added_at,
      // Include OMDB fields if they exist
      poster: data.poster || null,
      year: data.year || null,
      director: data.director || null,
      genre: data.genre || null,
      imdbRating: data.imdb_rating || null
    };
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    throw new Error(`Failed to get movie: ${error.message}`);
  }
};

/**
 * Create a new movie
 * @param {Object} movieData - Movie data
 * @returns {Promise<Object>} - Created movie document
 */
const createMovie = async (movieData) => {
  try {
    // Validate required fields
    if (!movieData.title || !movieData.sessionId || !movieData.addedBy) {
      throw new Error('Missing required fields: title, sessionId, and addedBy are required');
    }
    
    // Convert to snake_case for Supabase
    const data = {
      title: movieData.title,
      description: movieData.description || null,
      image_url: movieData.imageUrl || null,
      session_id: movieData.sessionId,
      added_by: movieData.addedBy,
      added_at: movieData.addedAt || new Date().toISOString(),
      // Include OMDB fields if they exist
      poster: movieData.poster || null,
      year: movieData.year || null,
      director: movieData.director || null,
      genre: movieData.genre || null,
      imdb_rating: movieData.imdbRating || null
    };
    
    const { data: result, error } = await supabase
      .from('movies')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: result.id,
      title: result.title,
      description: result.description || null,
      imageUrl: result.image_url || null,
      sessionId: result.session_id,
      addedBy: result.added_by,
      addedAt: result.added_at,
      // Include OMDB fields if they exist
      poster: result.poster || null,
      year: result.year || null,
      director: result.director || null,
      genre: result.genre || null,
      imdbRating: result.imdb_rating || null
    };
  } catch (error) {
    console.error('Error creating movie:', error);
    throw new Error(`Failed to create movie: ${error.message}`);
  }
};

/**
 * Update a movie
 * @param {string} id - Movie ID
 * @param {Object} movieData - Movie data to update
 * @returns {Promise<Object>} - Updated movie document
 */
const updateMovie = async (id, movieData) => {
  try {
    // Convert to snake_case for Supabase
    const data = {};
    
    if (movieData.title !== undefined) data.title = movieData.title;
    if (movieData.description !== undefined) data.description = movieData.description;
    if (movieData.imageUrl !== undefined) data.image_url = movieData.imageUrl;
    if (movieData.sessionId !== undefined) data.session_id = movieData.sessionId;
    if (movieData.addedBy !== undefined) data.added_by = movieData.addedBy;
    if (movieData.addedAt !== undefined) data.added_at = movieData.addedAt;
    
    // Include OMDB fields if they exist
    if (movieData.poster !== undefined) data.poster = movieData.poster;
    if (movieData.year !== undefined) data.year = movieData.year;
    if (movieData.director !== undefined) data.director = movieData.director;
    if (movieData.genre !== undefined) data.genre = movieData.genre;
    if (movieData.imdbRating !== undefined) data.imdb_rating = movieData.imdbRating;
    
    // Add updated timestamp
    data.updated_at = new Date().toISOString();
    
    const { data: result, error } = await supabase
      .from('movies')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: result.id,
      title: result.title,
      description: result.description || null,
      imageUrl: result.image_url || null,
      sessionId: result.session_id,
      addedBy: result.added_by,
      addedAt: result.added_at,
      // Include OMDB fields if they exist
      poster: result.poster || null,
      year: result.year || null,
      director: result.director || null,
      genre: result.genre || null,
      imdbRating: result.imdb_rating || null
    };
  } catch (error) {
    console.error('Error updating movie:', error);
    throw new Error(`Failed to update movie: ${error.message}`);
  }
};

/**
 * Delete a movie
 * @param {string} id - Movie ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteMovie = async (id) => {
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw new Error(`Failed to delete movie: ${error.message}`);
  }
};

/**
 * Delete all movies
 * @returns {Promise<boolean>} - Success status
 */
const deleteAllMovies = async () => {
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .neq('id', '0'); // Delete all movies (dummy condition to delete all)
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all movies:', error);
    throw new Error(`Failed to delete all movies: ${error.message}`);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  deleteAllMovies
}; 