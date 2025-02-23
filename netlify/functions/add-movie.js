// netlify/functions/add-movie.js
require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event, context) => {
    console.log('Function add-movie started');
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('Request body:', event.body);
        console.log('Parsed data:', data);

        const { sessionId, title, description, addedBy } = data;

        if (!sessionId || !title || !description || !addedBy) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        console.log('Attempting to connect to Fauna DB...');

        const result = await client.query(fql`
            movies.create({
                sessionId: ${sessionId},
                title: ${title},
                description: ${description},
                addedBy: ${addedBy},
                votes: 0,
                createdAt: Time.now()
            })
        `);

        console.log('Movie created:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie added successfully',
                movie: {
                    id: result.data.id,
                    title: title,
                    description: description,
                    addedBy: addedBy
                }
            })
        };
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error adding movie',
                error: error.message 
            })
        };
    }
};
