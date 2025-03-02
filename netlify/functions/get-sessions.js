require('dotenv').config();
const { getSessions } = require('../../src/lib/supabase/sessions');

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
        console.log('Fetching sessions from Supabase...');
        console.log('REACT_APP_SUPABASE_URL exists:', !!process.env.REACT_APP_SUPABASE_URL);
        console.log('REACT_APP_SUPABASE_ANON_KEY exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
        
        // Use the getSessions function from our Supabase library
        const sessions = await getSessions();
        
        console.log(`Retrieved ${sessions ? sessions.length : 0} sessions`);
        
        if (sessions && sessions.length > 0) {
            console.log('First session sample:', {
                id: sessions[0].id,
                sessionName: sessions[0].sessionName,
                hostId: sessions[0].hostId,
                hostUsername: sessions[0].hostUsername,
                displayName: sessions[0].displayName
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Sessions retrieved successfully',
                sessions: sessions
            })
        };
    } catch (error) {
        console.error('Error retrieving sessions:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error retrieving sessions',
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 