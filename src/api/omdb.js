/**
 * OMDB API Service
 * API Documentation: https://www.omdbapi.com/
 */

// You'll need to get an API key from https://www.omdbapi.com/
// Then add it to your .env file as REACT_APP_OMDB_API_KEY
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || '';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

/**
 * Search for movies by title
 * @param {string} query - The movie title to search for
 * @param {number} page - The page number for pagination (default: 1)
 * @returns {Promise<Object>} - Search results
 */
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search movies');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

/**
 * Get detailed information about a movie by IMDB ID
 * @param {string} imdbId - The IMDB ID of the movie
 * @returns {Promise<Object>} - Detailed movie information
 */
export const getMovieById = async (imdbId) => {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Get detailed information about a movie by title
 * @param {string} title - The title of the movie
 * @param {number} year - Optional year of release
 * @returns {Promise<Object>} - Detailed movie information
 */
export const getMovieByTitle = async (title, year = '') => {
  try {
    let url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&plot=full`;
    
    if (year) {
      url += `&y=${year}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch movie details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}; 