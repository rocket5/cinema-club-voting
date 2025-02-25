require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
});

// Helper function to extract a usable date string from a FaunaDB timestamp
const extractDateString = (dateObj) => {
    // If it's null or undefined, return null
    if (dateObj == null) {
        return null;
    }
    
    try {
        // Debug log to see exactly what we're dealing with
        console.log('Raw date from FaunaDB:', dateObj, typeof dateObj);
        
        // If it's already a string, check if it's a JSON string
        if (typeof dateObj === 'string') {
            // If it looks like a JSON string, try to parse it
            if (dateObj.startsWith('{') || dateObj.startsWith('[')) {
                try {
                    const parsedObj = JSON.parse(dateObj);
                    if (parsedObj && typeof parsedObj === 'object') {
                        // Try to find a date property in the parsed object
                        if (parsedObj.isoString) return parsedObj.isoString;
                        if (parsedObj.value) return parsedObj.value;
                        if (parsedObj.timestamp) return parsedObj.timestamp;
                        if (parsedObj.time) return parsedObj.time;
                    }
                    // If parsing succeeds but no date property is found, return the string as is
                } catch (e) {
                    // If parsing fails, just return the original string
                }
            }
            return dateObj; // Return the original string
        }
        
        // If it's a Date object, convert to ISO string
        if (dateObj instanceof Date) {
            return dateObj.toISOString();
        }
        
        // If it's a FaunaDB timestamp, it might have these properties
        if (typeof dateObj === 'object') {
            // Try to extract direct string values if they exist
            if (dateObj.isoString) return dateObj.isoString;
            if (dateObj.value) return dateObj.value;
            if (dateObj.timestamp) return dateObj.timestamp;
            if (dateObj.time) return dateObj.time;
            
            // For FaunaDB Time objects
            if (dateObj['@ts']) {
                if (typeof dateObj['@ts'] === 'string') {
                    return dateObj['@ts'];
                } else if (typeof dateObj['@ts'] === 'object' && dateObj['@ts'].value) {
                    return dateObj['@ts'].value;
                }
            }
            
            // Don't return a JSON string, extract actual date values
            try {
                // Try to convert to a regular Date object first
                const date = new Date(dateObj);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            } catch (err) {
                console.error('Failed to convert to Date object:', err);
            }
            
            // Last resort: return a flattened representation with actual date value
            return JSON.stringify({ 
                isoString: dateObj.toString ? dateObj.toString() : "unknown date" 
            });
        }
        
        // If none of the above work, return the original as string
        return String(dateObj);
    } catch (err) {
        console.error('Error extracting date:', err);
        return "unknown date";
    }
};

exports.handler = async (event, context) => {
    console.log('Function get-sessions started');
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        console.log('Attempting to connect to Fauna DB...');

        // Query to get all sessions
        const result = await client.query(fql`
            sessions.all()
        `);

        console.log('FaunaDB raw response:', JSON.stringify(result));

        // Safely handle the response - avoid assuming the structure
        let sessions = [];
        
        try {
            // Check if we have the expected structure
            if (result && result.data) {
                // Handle different possible shapes of the response
                let sessionData = result.data;
                
                // If data is an array directly
                if (Array.isArray(sessionData)) {
                    console.log('Data is directly an array');
                } 
                // If data contains a nested data property that's an array
                else if (sessionData.data && Array.isArray(sessionData.data)) {
                    console.log('Data has nested data array');
                    sessionData = sessionData.data;
                }
                // If we don't recognize the structure, just log it
                else {
                    console.log('Unrecognized data structure:', sessionData);
                    sessionData = [];
                }
                
                // Map the data to our desired format, with careful error handling
                sessions = sessionData.map(session => {
                    try {
                        // Skip invalid sessions
                        if (!session || !session.id) {
                            console.log('Skipping invalid session:', session);
                            return null;
                        }
                        
                        console.log('Processing session:', session.id);
                        
                        // Log the date values for debugging
                        if (session.startDate) {
                            console.log('startDate original:', session.startDate);
                            console.log('startDate type:', typeof session.startDate);
                            console.log('startDate processed:', extractDateString(session.startDate));
                        }
                        
                        if (session.createdAt) {
                            console.log('createdAt original:', session.createdAt);
                            console.log('createdAt type:', typeof session.createdAt);
                            console.log('createdAt processed:', extractDateString(session.createdAt));
                        }
                        
                        const dateStr = extractDateString(session.startDate) || 
                                       extractDateString(session.createdAt);
                        
                        // Additional date validation for debugging
                        try {
                            if (dateStr) {
                                const testDate = new Date(dateStr);
                                if (isNaN(testDate.getTime())) {
                                    console.warn('Date is still invalid after extraction:', dateStr);
                                } else {
                                    console.log('Valid date extracted:', dateStr);
                                }
                            }
                        } catch (dateErr) {
                            console.error('Date validation error:', dateErr);
                        }
                        
                        return {
                            id: session.id,
                            // Include session name
                            sessionName: session.sessionName || null,
                            // Try to convert date objects to strings
                            startDate: dateStr,
                            status: session.status || 'active',
                            hostId: session.hostId || 'unknown',
                            winningMovie: session.winningMovie || null
                        };
                    } catch (err) {
                        console.error(`Error processing session ${session?.id}:`, err);
                        return null;
                    }
                }).filter(Boolean); // Remove any null entries
                
                // Sort sessions by date (newest first)
                sessions.sort((a, b) => {
                    const dateA = new Date(a.startDate || 0);
                    const dateB = new Date(b.startDate || 0);
                    return dateB - dateA; // Descending order (newest first)
                });
            } else {
                console.log('Response missing data property:', result);
            }
        } catch (err) {
            console.error('Error processing Fauna response:', err);
            // Continue with empty sessions array rather than failing completely
        }

        console.log('Returning sessions:', sessions);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Sessions retrieved successfully',
                sessions: sessions
            })
        };
    } catch (error) {
        console.error('Detailed error from FaunaDB query:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error retrieving sessions',
                error: error.message 
            })
        };
    }
}; 