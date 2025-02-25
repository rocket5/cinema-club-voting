// netlify/functions/delete-all-movies.js
require('dotenv').config();
const { deleteAllMovies } = require('../../src/lib/fauna/movies');

exports.handler = async (event, context) => {
    // Only allow POST method for this endpoint
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        console.log('Starting bulk delete operation for all movies');
        
        // Use the deleteAllMovies function from our FaunaDB library
        const result = await deleteAllMovies();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: result.message,
                deletedCount: result.deletedCount,
                results: result.results
            })
        };
    } catch (error) {
        console.error('Error in bulk delete movies operation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting all movies',
                error: error.message
            })
        };
    }
}; 