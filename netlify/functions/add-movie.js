// netlify/functions/add-movie.js
require('dotenv').config();
const { createMovie } = require('../../src/lib/fauna/movies');

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

        const { 
            sessionId, 
            title, 
            description, 
            addedBy,
            poster,
            year,
            director,
            genre,
            imdbRating 
        } = data;

        if (!sessionId || !title || !description || !addedBy) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        console.log('Preparing movie data...');

        // Build the movie object with all available fields
        const movieData = {
            sessionId,
            title,
            description,
            addedBy,
            votes: 0
        };

        // Add optional fields if they exist
        if (poster) movieData.poster = poster;
        if (year) movieData.year = year;
        if (director) movieData.director = director;
        if (genre) movieData.genre = genre;
        if (imdbRating) movieData.imdbRating = imdbRating;

        // Use the createMovie function from our FaunaDB library
        const result = await createMovie(movieData);

        console.log('Movie created:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie added successfully',
                movie: {
                    id: result.id,
                    ...movieData
                }
            })
        };
    } catch (error) {
        console.error('Error adding movie:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error adding movie',
                error: error.message 
            })
        };
    }
};
