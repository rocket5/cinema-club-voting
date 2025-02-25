require('dotenv').config();
const { updateMovie, getMovies, getMovieById } = require('./src/lib/fauna/movies');
const faunadb = require('fauna');

// The movie ID to update
const movieId = '423903888114974785'; // Replace with an actual movie ID from your database

async function testUpdateMovie() {
  console.log('Starting update test...');
  
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
        console.log('Movie not found by ID. Cannot update a non-existent movie.');
        
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
            console.log(`- ID: ${movie.id}, Title: ${movie.title}, Type of ID: ${typeof movie.id}, Current addedBy: ${movie.addedBy}`);
          });
          
          // If there are movies, suggest using the first one
          if (movies.length > 0) {
            console.log(`\nSuggestion: Try running this script again with movieId = '${movies[0].id}'`);
          }
          
          return;
        } catch (listError) {
          console.log(`Error listing all movies: ${listError.message}`);
        }
        
        return;
      }
      
      // If we get here, the movie exists and we can try to update it
      console.log(`Attempting to update movie with ID: ${movieId}`);
      
      // Prepare update data - setting addedBy to "test user 001"
      const updateData = {
        addedBy: "test user 001"
      };
      
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const result = await Promise.race([
        updateMovie(movieId, updateData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Update operation timed out after 10 seconds')), 10000)
        )
      ]);
      
      console.log('Update successful:', JSON.stringify(result, null, 2));
      
      // Verify the update by fetching the movie again
      console.log('\nVerifying update...');
      const updatedMovie = await getMovieById(movieId);
      console.log('Updated movie:', updatedMovie ? JSON.stringify(updatedMovie, null, 2) : 'null');
      
      if (updatedMovie && updatedMovie.addedBy === "test user 001") {
        console.log('\nSUCCESS: Movie was updated correctly with addedBy = "test user 001"');
      } else {
        console.log('\nWARNING: Movie update verification failed');
        if (updatedMovie) {
          console.log(`Expected addedBy: "test user 001", Actual addedBy: "${updatedMovie.addedBy}"`);
        }
      }
      
    } catch (error) {
      console.log(`Error getting movie by ID: ${error.message}`);
      console.log('Movie might not exist with this ID.');
      return;
    }
  } catch (error) {
    console.error('Error during update operation:', error);
    
    // Log the detailed error information
    if (error.queryInfo) {
      console.log('Query Info:', JSON.stringify(error.queryInfo, null, 2));
    }
  }
  
  console.log('Test completed');
}

testUpdateMovie(); 