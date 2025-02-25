// netlify/functions/get-session-movies.js
require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event, context) => {
    const sessionId = event.queryStringParameters.sessionId;
    console.log('Fetching movies for session:', sessionId);

    if (!sessionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Session ID is required' })
        };
    }

    try {
        const result = await client.query(fql`
            movies.where(.sessionId == ${sessionId})
        `);

        console.log('Raw Fauna result:', result);
        
        // Extract the actual movie documents from the Page
        const moviesArray = result.data.data.map(doc => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            addedBy: doc.addedBy,
            votes: doc.votes || 0,
            sessionId: doc.sessionId,
            // Include OMDB fields if they exist
            poster: doc.poster || null,
            year: doc.year || null,
            director: doc.director || null,
            genre: doc.genre || null,
            imdbRating: doc.imdbRating || null
        }));

        console.log('Processed movies array:', moviesArray);

        return {
            statusCode: 200,
            body: JSON.stringify({
                movies: moviesArray
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error fetching movies',
                error: error.message 
            })
        };
    }
};
