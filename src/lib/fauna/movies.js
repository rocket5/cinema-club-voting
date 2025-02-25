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
    console.log('Raw FaunaDB result in getMovies:', result);
    
    // Handle different response structures from FaunaDB
    if (!result) return [];
    
    // Check if data is directly an array
    if (Array.isArray(result.data)) {
      return result.data;
    }
    
    // Check if data is nested in data.data
    if (result.data && Array.isArray(result.data.data)) {
      return result.data.data;
    }
    
    // If data is a single object, wrap it in an array
    if (result.data && typeof result.data === 'object') {
      return [result.data];
    }
    
    // Default to empty array if no valid data structure is found
    return [];
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
      movie!.update(${data})
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

/**
 * Delete all movies
 * @returns {Promise<Object>} - Result of the bulk delete operation
 */
const deleteAllMovies = async () => {
  try {
    console.log('Starting bulk delete operation for all movies');
    
    // First, get all movie documents
    const movies = await getMovies();
    console.log(`Found ${movies.length} movies to delete`);
    
    // Try bulk deletion first
    try {
      console.log('Attempting to delete all movies at once via forEach...');
      const bulkResult = await client.query(fql`
        movies.all().forEach(doc => {
          doc.delete()
        })
      `);
      console.log('Bulk delete result:', bulkResult);
      
      // Check if the delete was successful
      const remainingMovies = await getMovies();
      
      if (remainingMovies.length === 0) {
        // All movies were deleted successfully
        return {
          success: true,
          message: `Bulk delete operation completed. ${movies.length} movies deleted via bulk operation.`,
          deletedCount: movies.length
        };
      } else {
        console.log(`Bulk delete was not fully successful. ${remainingMovies.length} movies remain. Falling back to individual deletion.`);
      }
    } catch (bulkError) {
      console.error('Bulk delete approach failed:', bulkError);
      console.log('Falling back to individual deletion approach...');
    }
    
    // Fallback approach: delete documents one by one
    const results = [];
    let successCount = 0;
    
    for (const movie of movies) {
      try {
        if (!movie.id) {
          console.error('Cannot find ID in movie object:', movie);
          results.push({ 
            id: 'unknown', 
            success: false, 
            error: 'No ID found in document' 
          });
          continue;
        }
        
        console.log(`Attempting to delete movie with ID: ${movie.id}`);
        await deleteMovie(movie.id);
        
        results.push({ id: movie.id, success: true });
        successCount++;
      } catch (err) {
        console.error(`Error deleting movie ${movie.id}:`, err);
        results.push({ 
          id: movie.id || 'unknown', 
          success: false, 
          error: err.message
        });
      }
    }
    
    return {
      success: true,
      message: `Bulk delete operation completed. ${successCount} of ${movies.length} movies deleted.`,
      deletedCount: successCount,
      results
    };
  } catch (error) {
    console.error('Error in bulk delete movies operation:', error);
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