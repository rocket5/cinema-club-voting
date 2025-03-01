// netlify/functions/get-session-movies.js
require('dotenv').config();
const { getMovies } = require('../../src/lib/supabase/movies');

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
        // Use the getMovies function from our Supabase library with sessionId filter
        const movies = await getMovies(sessionId);
        
        console.log('Movies retrieved:', movies);
        console.log('Movies type:', typeof movies);
        console.log('Is array:', Array.isArray(movies));

        // Ensure movies is an array before mapping
        const moviesArray = Array.isArray(movies) 
            ? movies.map(doc => ({
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
              }))
            : [];

        console.log('Processed movies array:', moviesArray);

        return {
            statusCode: 200,
            body: JSON.stringify({
                movies: moviesArray
            })
        };
    } catch (error) {
        console.error('Error fetching movies:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error fetching movies',
                error: error.message 
            })
        };
    }
};
