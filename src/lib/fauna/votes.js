const client = require('./client');
const { fql } = require('fauna');

/**
 * Get all votes or votes by session ID
 * @param {string} sessionId - Optional session ID to filter votes
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotes = async (sessionId = null) => {
  try {
    let query;
    
    if (sessionId) {
      query = fql`
        votes.where(.sessionId == ${sessionId})
      `;
    } else {
      query = fql`
        votes.all()
      `;
    }
    
    const result = await client.query(query);
    return result.data;
  } catch (error) {
    console.error('Error getting votes:', error);
    throw new Error(`Failed to get votes: ${error.message}`);
  }
};

/**
 * Get votes by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotesByUser = async (userId) => {
  try {
    const result = await client.query(fql`
      votes.where(.userId == ${userId})
    `);
    return result.data;
  } catch (error) {
    console.error('Error getting votes by user:', error);
    throw new Error(`Failed to get votes by user: ${error.message}`);
  }
};

/**
 * Get votes for a specific movie
 * @param {string} movieId - Movie ID
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotesByMovie = async (movieId) => {
  try {
    const result = await client.query(fql`
      votes.where(.movieId == ${movieId})
    `);
    return result.data;
  } catch (error) {
    console.error('Error getting votes by movie:', error);
    throw new Error(`Failed to get votes by movie: ${error.message}`);
  }
};

/**
 * Create a new vote
 * @param {Object} voteData - Vote data
 * @returns {Promise<Object>} - Created vote document
 */
const createVote = async (voteData) => {
  try {
    // Validate required fields
    if (!voteData.sessionId || !voteData.movieId || !voteData.userId || voteData.rank === undefined) {
      throw new Error('Missing required fields: sessionId, movieId, userId, and rank are required');
    }
    
    // Add timestamp
    const data = {
      ...voteData,
      votedAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      votes.create(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error creating vote:', error);
    throw new Error(`Failed to create vote: ${error.message}`);
  }
};

/**
 * Update a vote by ID
 * @param {string} id - Vote ID
 * @param {Object} voteData - Updated vote data
 * @returns {Promise<Object>} - Updated vote document
 */
const updateVote = async (id, voteData) => {
  try {
    // Add updated timestamp
    const data = {
      ...voteData,
      updatedAt: fql`Time.now()`
    };
    
    const result = await client.query(fql`
      let vote = votes.byId(${id})
      vote.update(${data})
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error updating vote:', error);
    throw new Error(`Failed to update vote: ${error.message}`);
  }
};

/**
 * Delete a vote by ID
 * @param {string} id - Vote ID
 * @returns {Promise<Object>} - Deleted vote document
 */
const deleteVote = async (id) => {
  try {
    const result = await client.query(fql`
      let vote = votes.byId(${id})
      vote!.delete()
    `);
    
    return result.data;
  } catch (error) {
    console.error('Error deleting vote:', error);
    throw new Error(`Failed to delete vote: ${error.message}`);
  }
};

module.exports = {
  getVotes,
  getVotesByUser,
  getVotesByMovie,
  createVote,
  updateVote,
  deleteVote
}; 