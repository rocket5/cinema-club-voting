// netlify/functions/delete-all-sessions.js
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
        console.log('Starting bulk delete operation for all sessions');
        
        // First, get all session documents
        const getAllSessions = await client.query(fql`
            sessions.all()
        `);
        
        if (!getAllSessions.data || !getAllSessions.data.data || !Array.isArray(getAllSessions.data.data)) {
            console.error('Unexpected response format from sessions.all():', getAllSessions);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error: Unexpected response format from database',
                    raw_response: JSON.stringify(getAllSessions)
                })
            };
        }
        
        const sessions = getAllSessions.data.data;
        console.log(`Found ${sessions.length} sessions to delete`);
        
        // For debugging, log the first session details
        if (sessions.length > 0) {
            console.log('First session details:', JSON.stringify(sessions[0]));
            console.log('Session ID type:', typeof sessions[0].id);
            console.log('Session object keys:', Object.keys(sessions[0]));
        }
        
        // Try an alternative approach first - just try to delete all sessions directly
        try {
            console.log('Attempting to delete all sessions at once via truncate...');
            const truncateResult = await client.query(fql`
                sessions.all().forEach(doc => {
                    doc.delete()
                })
            `);
            console.log('Truncate result:', truncateResult);
            
            // Check if the delete was successful
            const checkRemaining = await client.query(fql`
                sessions.all()
            `);
            
            if (!checkRemaining.data || !checkRemaining.data.data || checkRemaining.data.data.length === 0) {
                // All sessions were deleted successfully
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: `Bulk delete operation completed. ${sessions.length} sessions deleted via bulk operation.`
                    })
                };
            } else {
                console.log(`Bulk delete was not fully successful. ${checkRemaining.data.data.length} sessions remain. Falling back to individual deletion.`);
            }
        } catch (bulkError) {
            console.error('Bulk delete approach failed:', bulkError);
            console.log('Falling back to individual deletion approach...');
        }
        
        // Fallback approach: delete documents one by one
        const results = [];
        for (const session of sessions) {
            try {
                // Get a reference ID that we can use
                let sessionId;
                
                // First, try to get the document ID
                if (session.id) {
                    sessionId = session.id;
                } else if (session.ref && session.ref.id) {
                    // Some Fauna versions use ref.id
                    sessionId = session.ref.id;
                } else if (session._id) {
                    // Another possible ID format
                    sessionId = session._id;
                } else {
                    // If we can't find an ID, log the issue and skip this document
                    console.error('Cannot find ID in session object:', session);
                    results.push({ 
                        id: 'unknown', 
                        success: false, 
                        error: 'No ID found in document' 
                    });
                    continue;
                }
                
                console.log(`Attempting to delete session with ID: ${sessionId}`);
                
                // Try multiple approaches to deletion
                let deleteSuccess = false;
                let lastError = null;
                
                // Approach 1: Try direct document deletion query
                try {
                    const deleteResult1 = await client.query(fql`
                        delete(sessions.where(.id == ${sessionId}))
                    `);
                    console.log(`Delete result (approach 1):`, deleteResult1);
                    deleteSuccess = true;
                } catch (err1) {
                    console.error(`Approach 1 failed for session ${sessionId}:`, err1);
                    lastError = err1;
                    
                    // Approach 2: Try using byId().delete()
                    try {
                        const deleteResult2 = await client.query(fql`
                            let doc = sessions.byId(${sessionId})
                            doc.delete()
                        `);
                        console.log(`Delete result (approach 2):`, deleteResult2);
                        deleteSuccess = true;
                    } catch (err2) {
                        console.error(`Approach 2 failed for session ${sessionId}:`, err2);
                        lastError = err2;
                        
                        // Approach 3: Try with string ID
                        try {
                            const deleteResult3 = await client.query(fql`
                                delete(sessions.where(.id == "${sessionId}"))
                            `);
                            console.log(`Delete result (approach 3):`, deleteResult3);
                            deleteSuccess = true;
                        } catch (err3) {
                            console.error(`Approach 3 failed for session ${sessionId}:`, err3);
                            lastError = err3;
                        }
                    }
                }
                
                if (deleteSuccess) {
                    results.push({ id: sessionId, success: true });
                } else {
                    results.push({ 
                        id: sessionId, 
                        success: false, 
                        error: lastError ? lastError.message : 'All deletion approaches failed'
                    });
                }
            } catch (err) {
                console.error(`Error in deletion process for session:`, err);
                results.push({ 
                    id: session.id || 'unknown', 
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
                message: `Bulk delete operation completed. ${successCount} of ${sessions.length} sessions deleted.`,
                results
            })
        };
    } catch (error) {
        console.error('Error in bulk delete sessions operation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error deleting all sessions',
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 