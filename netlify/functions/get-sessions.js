require('dotenv').config();
const { getSessions } = require('../../src/lib/supabase/sessions');

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        // Use the getSessions function from our Supabase library
        const sessions = await getSessions();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Sessions retrieved successfully',
                sessions: sessions
            })
        };
    } catch (error) {
        console.error('Error retrieving sessions:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error retrieving sessions',
                error: error.message
            })
        };
    }
}; 