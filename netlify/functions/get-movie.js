require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

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

        // Try to get the movie by ID
        const result = await client.query(fql`
            let movie = movies.byId(${id})
            movie
        `);

        console.log('Movie fetch result:', result);

        if (!result) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Movie not found' })
            };
        }

        // Extract the movie data
        const movieData = {
            id: result.id,
            ...result.data
        };

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie fetched successfully',
                movie: movieData
            })
        };
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error fetching movie',
                error: error.message 
            })
        };
    }
}; 