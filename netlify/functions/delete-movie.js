require('dotenv').config();
const { deleteMovie } = require('../../src/lib/supabase/movies');

exports.handler = async (event, context) => {
    console.log('Function delete-movie started');
    
    if (event.httpMethod !== 'DELETE') {
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

        console.log('Attempting to delete movie with ID:', id);
        
        // Use the deleteMovie function from our Supabase library
        const result = await deleteMovie(id);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie deleted successfully',
                id: id,
                result: result
            })
        };
    } catch (error) {
        console.error('Error deleting movie:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting movie',
                error: error.message 
            })
        };
    }
}; 