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

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie fetched successfully',
                movie: movie
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