require('dotenv').config();
const { getMovieById } = require('../../src/lib/supabase/movies');

exports.handler = async (event, context) => {
    console.log('Function get-movie started');
    
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { id } = event.queryStringParameters;
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Movie ID is required' })
            };
        }

        console.log('Fetching movie with ID:', id);

        // Use the getMovieById function from our Supabase library
        const movie = await getMovieById(id);

        console.log('Movie fetched:', movie);

        if (!movie) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Movie not found' })
            };
        }

        // Transform the movie object to include all necessary fields
        const movieResponse = {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            addedBy: movie.addedBy,
            displayName: movie.displayName || movie.addedBy, // Include display name
            sessionId: movie.sessionId,
            // Include OMDB fields if they exist
            poster: movie.poster || null,
            year: movie.year || null,
            director: movie.director || null,
            genre: movie.genre || null,
            imdbRating: movie.imdbRating || null
        };

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie fetched successfully',
                movie: movieResponse
            })
        };
    } catch (error) {
        console.error('Error fetching movie:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error fetching movie',
                error: error.message 
            })
        };
    }
}; 