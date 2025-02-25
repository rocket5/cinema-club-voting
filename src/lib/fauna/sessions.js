const client = require('./client');
const { fql } = require('fauna');

/**
 * Extract a usable date string from a FaunaDB timestamp
 * @param {any} dateObj - Date object from FaunaDB
 * @returns {string|null} - ISO date string or null if invalid
 */
const extractDateString = (dateObj) => {
  // If it's null or undefined, return null
  if (dateObj == null) {
    return null;
  }
  
  try {
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
      
      // Try to convert to a regular Date object
      try {
        const date = new Date(dateObj);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (err) {
        // Ignore conversion errors
      }
    }
    
    // If none of the above work, return null
    return null;
  } catch (err) {
    console.error('Error extracting date:', err);
    return null;
  }
};

/**
 * Get all sessions
 * @returns {Promise<Array>} - Array of session documents
 */
const getSessions = async () => {
  try {
    const result = await client.query(fql`
      sessions.all()
    `);
    
    console.log('Raw FaunaDB result in getSessions:', result);
    
    // Handle different response structures from FaunaDB
    if (!result) return [];
    
    let sessionData;
    
    // Check if data is directly an array
    if (Array.isArray(result.data)) {
      sessionData = result.data;
    }
    // Check if data is nested in data.data
    else if (result.data && Array.isArray(result.data.data)) {
      sessionData = result.data.data;
    }
    // If data is a single object, wrap it in an array
    else if (result.data && typeof result.data === 'object') {
      sessionData = [result.data];
    }
    // Default to empty array if no valid data structure is found
    else {
      return [];
    }
    
    // Process each session to ensure consistent structure
    const sessions = sessionData.map(session => {
      if (!session || !session.id) return null;
      
      // Extract date from either startDate or createdAt
      const dateStr = extractDateString(session.startDate) || 
                     extractDateString(session.createdAt);
      
      return {
        id: session.id,
        sessionName: session.sessionName || null,
        startDate: dateStr,
        status: session.status || 'active',
        hostId: session.hostId || 'unknown',
        winningMovie: session.winningMovie || null
      };
    }).filter(Boolean); // Remove any null entries
    
    // Sort sessions by date (newest first)
    sessions.sort((a, b) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    return sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw new Error(`Failed to get sessions: ${error.message}`);
  }
};

/**
 * Get a session by ID
 * @param {string} id - Session ID
 * @returns {Promise<Object>} - Session document
 */
const getSessionById = async (id) => {
  try {
    const result = await client.query(fql`
      sessions.byId(${id})
    `);
    return result.data;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    throw new Error(`Failed to get session by ID: ${error.message}`);
  }
};

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} - Created session document
 */
const createSession = async (sessionData) => {
  try {
    // Validate required fields
    if (!sessionData.startDate || !sessionData.hostId || !sessionData.status) {
      throw new Error('Missing required fields: startDate, hostId, and status are required');
    }
    
    // Add timestamp
    const data = {
      ...sessionData,
      createdAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      sessions.create(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

/**
 * Update a session by ID
 * @param {string} id - Session ID
 * @param {Object} sessionData - Updated session data
 * @returns {Promise<Object>} - Updated session document
 */
const updateSession = async (id, sessionData) => {
  try {
    // Add updated timestamp
    const data = {
      ...sessionData,
      updatedAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      let session = sessions.byId(${id})
      session.update(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
};

/**
 * Delete a session by ID
 * @param {string} id - Session ID
 * @returns {Promise<Object>} - Deleted session document
 */
const deleteSession = async (id) => {
  try {
    const result = await client.query(fql`
      let session = sessions.byId(${id})
      session!.delete()
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
};

/**
 * Delete all sessions from the database
 * @returns {Promise<Object>} - Result of the bulk delete operation
 */
const deleteAllSessions = async () => {
  try {
    console.log('Starting bulk delete operation for all sessions');
    
    // First, get all session documents
    const sessions = await getSessions();
    console.log(`Found ${sessions.length} sessions to delete`);
    
    // Try bulk deletion first
    try {
      console.log('Attempting to delete all sessions at once via bulk operation...');
      const truncateResult = await client.query(fql`
        sessions.all().forEach(doc => {
          doc.delete()
        })
      `);
      console.log('Bulk delete result:', truncateResult);
      
      // Check if the delete was successful
      const remainingSessions = await getSessions();
      
      if (remainingSessions.length === 0) {
        // All sessions were deleted successfully
        return {
          message: `Bulk delete operation completed. ${sessions.length} sessions deleted via bulk operation.`,
          deletedCount: sessions.length,
          results: sessions.map(session => ({ id: session.id, success: true }))
        };
      } else {
        console.log(`Bulk delete was not fully successful. ${remainingSessions.length} sessions remain. Falling back to individual deletion.`);
      }
    } catch (bulkError) {
      console.error('Bulk delete approach failed:', bulkError);
      console.log('Falling back to individual deletion approach...');
    }
    
    // Fallback approach: delete documents one by one
    const results = [];
    for (const session of sessions) {
      try {
        if (!session.id) {
          console.error('Cannot find ID in session object:', session);
          results.push({ 
            id: 'unknown', 
            success: false, 
            error: 'No ID found in document' 
          });
          continue;
        }
        
        console.log(`Attempting to delete session with ID: ${session.id}`);
        
        // Try to delete the session using our existing function
        try {
          await deleteSession(session.id);
          results.push({ id: session.id, success: true });
        } catch (err) {
          console.error(`Failed to delete session ${session.id}:`, err);
          results.push({ 
            id: session.id, 
            success: false, 
            error: err.message
          });
        }
      } catch (err) {
        console.error(`Error in deletion process for session:`, err);
        results.push({ 
          id: session.id || 'unknown', 
          success: false, 
          error: err.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      message: `Bulk delete operation completed. ${successCount} of ${sessions.length} sessions deleted.`,
      deletedCount: successCount,
      results
    };
  } catch (error) {
    console.error('Error in bulk delete sessions operation:', error);
    throw new Error(`Failed to delete all sessions: ${error.message}`);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  deleteAllSessions
}; 