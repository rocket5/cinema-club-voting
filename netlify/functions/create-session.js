// netlify/functions/create-session.js
require('dotenv').config();
const { createSession } = require('../../src/lib/fauna/sessions');

exports.handler = async (event, context) => {
    try {
        // Parse request body to get session name
        const { sessionName, createdBy } = JSON.parse(event.body || '{}');
        
        // Validate session name
        if (!sessionName || !sessionName.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Session name is required'
                })
            };
        }

        // Prepare session data
        const sessionData = {
            sessionName: sessionName,
            hostId: createdBy || 'host',
            status: 'active',
            startDate: new Date().toISOString() // Add current date as startDate
        };

        // Use the createSession function from our FaunaDB library
        const result = await createSession(sessionData);

        console.log('Session creation result:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session created successfully',
                sessionId: result.id,
                sessionName: result.sessionName
            })
        };
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error creating session',
                error: error.message 
            })
        };
    }
};
