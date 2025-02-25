// netlify/functions/create-session.js
require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

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

        const result = await client.query(fql`
            sessions.create({
                sessionName: ${sessionName},
                createdBy: ${createdBy || 'host'},
                createdAt: Time.now(),
                status: "active"
            })
        `);

        console.log('Session creation result:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session created successfully',
                sessionId: result.data.id,  // Using data.id instead of just id
                sessionName: result.data.sessionName
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
