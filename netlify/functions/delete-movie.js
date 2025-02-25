require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

exports.handler = async (event, context) => {
    console.log('Function delete-movie started');
    
    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { id } = event.queryStringParameters;
        
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Movie ID is required' })
            };
        }

        console.log('Attempting to delete movie with ID:', id);
        console.log('ID type:', typeof id);

        // Try multiple approaches to deletion
        let deleteSuccess = false;
        let lastError = null;
        let deleteResult = null;

        // Approach 1: Try using doc.delete() with the newer FQL syntax
        try {
            console.log('Trying approach 1: doc.delete()');
            deleteResult = await client.query(fql`
                let doc = movies.byId(${id})
                doc.delete()
            `);
            console.log('Delete result (approach 1):', deleteResult);
            deleteSuccess = true;
        } catch (err1) {
            console.error(`Approach 1 failed for movie ${id}:`, err1);
            lastError = err1;
            
            // Approach 2: Try using movies.delete()
            try {
                console.log('Trying approach 2: movies.delete()');
                deleteResult = await client.query(fql`
                    movies.delete(${id})
                `);
                console.log('Delete result (approach 2):', deleteResult);
                deleteSuccess = true;
            } catch (err2) {
                console.error(`Approach 2 failed for movie ${id}:`, err2);
                lastError = err2;
                
                // Approach 3: Try with string ID
                try {
                    console.log('Trying approach 3: with string ID');
                    deleteResult = await client.query(fql`
                        let doc = movies.byId("${id}")
                        doc.delete()
                    `);
                    console.log('Delete result (approach 3):', deleteResult);
                    deleteSuccess = true;
                } catch (err3) {
                    console.error(`Approach 3 failed for movie ${id}:`, err3);
                    lastError = err3;
                    
                    // Approach 4: Try with numeric ID
                    try {
                        console.log('Trying approach 4: with numeric ID');
                        const numericId = parseInt(id, 10);
                        deleteResult = await client.query(fql`
                            let doc = movies.byId(${numericId})
                            doc.delete()
                        `);
                        console.log('Delete result (approach 4):', deleteResult);
                        deleteSuccess = true;
                    } catch (err4) {
                        console.error(`Approach 4 failed for movie ${id}:`, err4);
                        lastError = err4;
                        
                        // Approach 5: Try using where clause
                        try {
                            console.log('Trying approach 5: using where clause');
                            deleteResult = await client.query(fql`
                                delete(movies.where(.id == ${id}))
                            `);
                            console.log('Delete result (approach 5):', deleteResult);
                            deleteSuccess = true;
                        } catch (err5) {
                            console.error(`Approach 5 failed for movie ${id}:`, err5);
                            lastError = err5;
                            
                            // Approach 6: Try using where clause with string ID
                            try {
                                console.log('Trying approach 6: using where clause with string ID');
                                deleteResult = await client.query(fql`
                                    delete(movies.where(.id == "${id}"))
                                `);
                                console.log('Delete result (approach 6):', deleteResult);
                                deleteSuccess = true;
                            } catch (err6) {
                                console.error(`Approach 6 failed for movie ${id}:`, err6);
                                lastError = err6;
                            }
                        }
                    }
                }
            }
        }
        
        if (deleteSuccess) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Movie deleted successfully',
                    id: id,
                    result: deleteResult
                })
            };
        } else {
            console.error('All delete approaches failed for movie ID:', id);
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'Failed to delete movie after multiple attempts',
                    error: lastError ? lastError.message : 'Unknown error',
                    id: id
                })
            };
        }
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting movie',
                error: error.message 
            })
        };
    }
}; 