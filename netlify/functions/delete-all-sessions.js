// netlify/functions/delete-all-sessions.js
require('dotenv').config();
const { deleteAllSessions } = require('../../src/lib/fauna/sessions');

exports.handler = async (event, context) => {
    // Only allow POST method for this endpoint
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        console.log('Starting bulk delete operation for all sessions');
        
        // Use the deleteAllSessions function from our FaunaDB library
        const result = await deleteAllSessions();
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: result.message,
                deletedCount: result.deletedCount,
                results: result.results
            })
        };
    } catch (error) {
        console.error('Error in bulk delete sessions operation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting all sessions',
                error: error.message
            })
        };
    }
}; 