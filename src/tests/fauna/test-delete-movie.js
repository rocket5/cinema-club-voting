require('dotenv').config();
const { deleteMovie, getMovies, getMovieById } = require('./src/lib/fauna/movies');
const faunadb = require('fauna');

// The movie ID to delete
const movieId = '423897398521102404';

async function testDeleteMovie() {
  console.log('Starting delete test...');
  
  // Check if FaunaDB secret key exists
  const faunaSecret = process.env.FAUNA_SECRET_KEY;
  console.log('FaunaDB Secret Key exists:', !!faunaSecret);
  
  try {
    // First, let's try to get the specific movie by ID
    console.log(`Checking if movie with ID ${movieId} exists...`);
    try {
      const movie = await getMovieById(movieId);
      console.log('Movie found:', movie ? JSON.stringify(movie, null, 2) : 'null');
      
      if (!movie) {
        console.log('Movie not found by ID. Cannot delete a non-existent movie.');
        return;
      }
    } catch (error) {
      console.log(`Error getting movie by ID: ${error.message}`);
      console.log('Movie might not exist with this ID.');
      
      // Let's try to get all movies to see what's in the database
      try {
        console.log('Fetching all movies to check available IDs...');
        const movies = await getMovies();
        
        if (!movies || movies.length === 0) {
          console.log('No movies found in the database.');
          return;
        }
        
        console.log(`Found ${movies.length} movies in the database.`);
        console.log('Available movie IDs:');
        movies.forEach(movie => {
          console.log(`- ID: ${movie.id}, Title: ${movie.title}, Type of ID: ${typeof movie.id}`);
        });
        
        return;
      } catch (listError) {
        console.log(`Error listing all movies: ${listError.message}`);
      }
      
      return;
    }
    
    // If we get here, the movie exists and we can try to delete it
    console.log(`Attempting to delete movie with ID: ${movieId}`);
    const result = await Promise.race([
      deleteMovie(movieId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete operation timed out after 10 seconds')), 10000)
      )
    ]);
    
    console.log('Delete successful:', result);
  } catch (error) {
    console.error('Error during delete operation:', error);
    
    // Log the detailed error information
    if (error.queryInfo) {
      console.log('Query Info:', JSON.stringify(error.queryInfo, null, 2));
    }
  }
  
  console.log('Test completed');
}

testDeleteMovie(); 