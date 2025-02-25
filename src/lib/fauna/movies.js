const client = require('./client');
const { fql } = require('fauna');

/**
 * Get all movies or movies by session ID
 * @param {string} sessionId - Optional session ID to filter movies
 * @returns {Promise<Array>} - Array of movie documents
 */
const getMovies = async (sessionId = null) => {
  try {
    let query;
    
    if (sessionId) {
      query = fql`
        movies.where(.sessionId == ${sessionId})
      `;
    } else {
      query = fql`
        movies.all()
      `;
    }
    
    const result = await client.query(query);
    return result.data;
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
    const result = await client.query(fql`
      movies.byId(${id})
    `);
    return result.data;
  } catch (error) {
    console.error('Error getting movie by ID:', error);
    throw new Error(`Failed to get movie by ID: ${error.message}`);
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
    if (!movieData.sessionId || !movieData.title || !movieData.addedBy) {
      throw new Error('Missing required fields: sessionId, title, and addedBy are required');
    }
    
    // Add timestamp
    const data = {
      ...movieData,
      createdAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      movies.create(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error creating movie:', error);
    throw new Error(`Failed to create movie: ${error.message}`);
  }
};

/**
 * Update a movie by ID
 * @param {string} id - Movie ID
 * @param {Object} movieData - Updated movie data
 * @returns {Promise<Object>} - Updated movie document
 */
const updateMovie = async (id, movieData) => {
  try {
    // Add updated timestamp
    const data = {
      ...movieData,
      updatedAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      let movie = movies.byId(${id})
      movie.update(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error updating movie:', error);
    throw new Error(`Failed to update movie: ${error.message}`);
  }
};

/**
 * Delete a movie by ID
 * @param {string} id - Movie ID
 * @returns {Promise<Object>} - Deleted movie document
 */
const deleteMovie = async (id) => {
  try {
    const result = await client.query(fql`
      let movie = movies.byId(${id})
      movie!.delete()
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw new Error(`Failed to delete movie: ${error.message}`);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
}; 