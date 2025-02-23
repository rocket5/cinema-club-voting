// netlify/functions/create-session.js
require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event, context) => {
    try {
        const result = await client.query(fql`
            sessions.create({
                createdAt: Time.now(),
                status: "active"
            })
        `);

        console.log('Session creation result:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session created successfully',
                sessionId: result.data.id  // Using data.id instead of just id
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
