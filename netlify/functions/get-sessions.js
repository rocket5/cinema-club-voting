require('dotenv').config();
const { getSessions } = require('../../src/lib/fauna/sessions');

exports.handler = async (event, context) => {
    console.log('Function get-sessions started');
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        console.log('Fetching sessions from FaunaDB...');

        // Use the getSessions function from our FaunaDB library
        const sessions = await getSessions();

        console.log('Returning sessions:', sessions);

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