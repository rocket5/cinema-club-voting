// netlify/functions/delete-all-movies.js
require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event, context) => {
    // Only allow POST method for this endpoint
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        console.log('Starting bulk delete operation for all movies');
        
        // First, get all movie documents
        const getAllMovies = await client.query(fql`
            movies.all()
        `);
        
        if (!getAllMovies.data || !getAllMovies.data.data || !Array.isArray(getAllMovies.data.data)) {
            console.error('Unexpected response format from movies.all():', getAllMovies);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error: Unexpected response format from database',
                    raw_response: JSON.stringify(getAllMovies)
                })
            };
        }
        
        const movies = getAllMovies.data.data;
        console.log(`Found ${movies.length} movies to delete`);
        
        // For debugging, log the first movie details
        if (movies.length > 0) {
            console.log('First movie details:', JSON.stringify(movies[0]));
            console.log('Movie ID type:', typeof movies[0].id);
            console.log('Movie object keys:', Object.keys(movies[0]));
        }
        
        // Try an alternative approach first - just try to delete all movies directly
        try {
            console.log('Attempting to delete all movies at once via truncate...');
            const truncateResult = await client.query(fql`
                movies.all().forEach(doc => {
                    doc.delete()
                })
            `);
            console.log('Truncate result:', truncateResult);
            
            // Check if the delete was successful
            const checkRemaining = await client.query(fql`
                movies.all()
            `);
            
            if (!checkRemaining.data || !checkRemaining.data.data || checkRemaining.data.data.length === 0) {
                // All movies were deleted successfully
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: `Bulk delete operation completed. ${movies.length} movies deleted via bulk operation.`
                    })
                };
            } else {
                console.log(`Bulk delete was not fully successful. ${checkRemaining.data.data.length} movies remain. Falling back to individual deletion.`);
            }
        } catch (bulkError) {
            console.error('Bulk delete approach failed:', bulkError);
            console.log('Falling back to individual deletion approach...');
        }
        
        // Fallback approach: delete documents one by one
        const results = [];
        for (const movie of movies) {
            try {
                // Get a reference ID that we can use
                let movieId;
                
                // First, try to get the document ID
                if (movie.id) {
                    movieId = movie.id;
                } else if (movie.ref && movie.ref.id) {
                    // Some Fauna versions use ref.id
                    movieId = movie.ref.id;
                } else if (movie._id) {
                    // Another possible ID format
                    movieId = movie._id;
                } else {
                    // If we can't find an ID, log the issue and skip this document
                    console.error('Cannot find ID in movie object:', movie);
                    results.push({ 
                        id: 'unknown', 
                        success: false, 
                        error: 'No ID found in document' 
                    });
                    continue;
                }
                
                console.log(`Attempting to delete movie with ID: ${movieId}`);
                
                // Try multiple approaches to deletion
                let deleteSuccess = false;
                let lastError = null;
                
                // Approach 1: Try direct document deletion query
                try {
                    const deleteResult1 = await client.query(fql`
                        delete(movies.where(.id == ${movieId}))
                    `);
                    console.log(`Delete result (approach 1):`, deleteResult1);
                    deleteSuccess = true;
                } catch (err1) {
                    console.error(`Approach 1 failed for movie ${movieId}:`, err1);
                    lastError = err1;
                    
                    // Approach 2: Try using byId().delete()
                    try {
                        const deleteResult2 = await client.query(fql`
                            let doc = movies.byId(${movieId})
                            doc.delete()
                        `);
                        console.log(`Delete result (approach 2):`, deleteResult2);
                        deleteSuccess = true;
                    } catch (err2) {
                        console.error(`Approach 2 failed for movie ${movieId}:`, err2);
                        lastError = err2;
                        
                        // Approach 3: Try with string ID
                        try {
                            const deleteResult3 = await client.query(fql`
                                delete(movies.where(.id == "${movieId}"))
                            `);
                            console.log(`Delete result (approach 3):`, deleteResult3);
                            deleteSuccess = true;
                        } catch (err3) {
                            console.error(`Approach 3 failed for movie ${movieId}:`, err3);
                            lastError = err3;
                        }
                    }
                }
                
                if (deleteSuccess) {
                    results.push({ id: movieId, success: true });
                } else {
                    results.push({ 
                        id: movieId, 
                        success: false, 
                        error: lastError ? lastError.message : 'All deletion approaches failed'
                    });
                }
            } catch (err) {
                console.error(`Error in deletion process for movie:`, err);
                results.push({ 
                    id: movie.id || 'unknown', 
                    success: false, 
                    error: err.message,
                    stack: err.stack
                });
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Bulk delete operation completed. ${successCount} of ${movies.length} movies deleted.`,
                results
            })
        };
    } catch (error) {
        console.error('Error in bulk delete movies operation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting all movies',
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 