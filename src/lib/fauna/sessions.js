const client = require('./client');
const { fql } = require('fauna');

/**
 * Get all sessions
 * @returns {Promise<Array>} - Array of session documents
 */
const getSessions = async () => {
  try {
    const result = await client.query(fql`
      sessions.all()
    `);
    return result.data;
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

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
}; 