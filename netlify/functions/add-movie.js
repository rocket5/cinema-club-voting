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

        console.log('Attempting to connect to Fauna DB...');

        // Build the movie object with all available fields
        const movieData = {
            sessionId: sessionId,
            title: title,
            description: description,
            addedBy: addedBy,
            votes: 0,
            createdAt: fql`Time.now()`
        };

        // Add optional fields if they exist
        if (poster) movieData.poster = poster;
        if (year) movieData.year = year;
        if (director) movieData.director = director;
        if (genre) movieData.genre = genre;
        if (imdbRating) movieData.imdbRating = imdbRating;

        const result = await client.query(fql`
            movies.create(${movieData})
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
                    addedBy: addedBy,
                    poster: poster,
                    year: year,
                    director: director,
                    genre: genre,
                    imdbRating: imdbRating
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
