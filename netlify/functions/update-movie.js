require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

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
        
        // Add updatedAt timestamp
        movieData.updatedAt = new Date().toISOString();

        console.log('Movie data to update:', movieData);

        // Simpler approach using Document.update
        try {
            const result = await client.query(
                fql`
                    let doc = movies.byId(${id})
                    doc.update({
                        data: ${movieData}
                    })
                `
            );

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
            
            // Try an alternative approach if the first one fails
            try {
                console.log('Trying alternative update approach...');
                
                // Get the document first
                const getResult = await client.query(
                    fql`movies.byId(${id})`
                );
                
                console.log('Retrieved movie:', getResult);
                
                if (!getResult) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Movie not found' })
                    };
                }
                
                // Update using a different syntax
                const updateResult = await client.query(
                    fql`
                        movies.update(${id}, {
                            data: ${movieData}
                        })
                    `
                );
                
                console.log('Movie updated with alternative approach:', updateResult);
                
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
            } catch (altError) {
                console.error('Error with alternative update approach:', altError);
                
                // One last attempt with a different ID format
                try {
                    console.log('Trying numeric ID approach...');
                    const numericId = parseInt(id, 10);
                    
                    const finalResult = await client.query(
                        fql`
                            let doc = movies.byId(${numericId})
                            doc.update({
                                data: ${movieData}
                            })
                        `
                    );
                    
                    console.log('Movie updated with numeric ID:', finalResult);
                    
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
                } catch (finalError) {
                    console.error('All update attempts failed:', finalError);
                    throw new Error(`Failed to update movie after multiple attempts: ${finalError.message}`);
                }
            }
        }
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error updating movie',
                error: error.message 
            })
        };
    }
}; 