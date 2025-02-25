require('dotenv').config();
const { updateMovie } = require('../../src/lib/fauna/movies');

exports.handler = async (event, context) => {
    console.log('Function update-movie started');
    
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
            id,
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

        if (!id || !title || !description) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields (id, title, description)' })
            };
        }

        console.log('Attempting to update movie with ID:', id);

        // Build the movie object with all available fields
        const movieData = {};
        
        // Only include fields that are provided
        if (title) movieData.title = title;
        if (description) movieData.description = description;
        if (addedBy) movieData.addedBy = addedBy;
        if (poster) movieData.poster = poster;
        if (year) movieData.year = year;
        if (director) movieData.director = director;
        if (genre) movieData.genre = genre;
        if (imdbRating) movieData.imdbRating = imdbRating;
        
        // Use the updateMovie function from our FaunaDB library
        const result = await updateMovie(id, movieData);
        
        console.log('Movie updated successfully:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie updated successfully',
                movie: {
                    id: id,
                    ...movieData
                }
            })
        };
    } catch (error) {
        console.error('Error updating movie:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error updating movie',
                error: error.message 
            })
        };
    }
}; 