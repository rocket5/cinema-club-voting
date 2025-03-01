const { supabase } = require('./client');

/**
 * Get all votes or votes by session ID
 * @param {string} sessionId - Optional session ID to filter votes
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotes = async (sessionId = null) => {
  try {
    let query = supabase
      .from('votes')
      .select('*');
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform data to match the expected format
    return data.map(vote => ({
      id: vote.id,
      sessionId: vote.session_id,
      movieId: vote.movie_id,
      userId: vote.user_id,
      rank: vote.rank,
      votedAt: vote.voted_at
    }));
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
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Transform data to match the expected format
    return data.map(vote => ({
      id: vote.id,
      sessionId: vote.session_id,
      movieId: vote.movie_id,
      userId: vote.user_id,
      rank: vote.rank,
      votedAt: vote.voted_at
    }));
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
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('movie_id', movieId);
    
    if (error) {
      throw error;
    }
    
    // Transform data to match the expected format
    return data.map(vote => ({
      id: vote.id,
      sessionId: vote.session_id,
      movieId: vote.movie_id,
      userId: vote.user_id,
      rank: vote.rank,
      votedAt: vote.voted_at
    }));
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
    
    // Convert to snake_case for Supabase
    const data = {
      session_id: voteData.sessionId,
      movie_id: voteData.movieId,
      user_id: voteData.userId,
      rank: voteData.rank,
      voted_at: voteData.votedAt || new Date().toISOString()
    };
    
    const { data: result, error } = await supabase
      .from('votes')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: result.id,
      sessionId: result.session_id,
      movieId: result.movie_id,
      userId: result.user_id,
      rank: result.rank,
      votedAt: result.voted_at
    };
  } catch (error) {
    console.error('Error creating vote:', error);
    throw new Error(`Failed to create vote: ${error.message}`);
  }
};

/**
 * Update a vote
 * @param {string} id - Vote ID
 * @param {Object} voteData - Vote data to update
 * @returns {Promise<Object>} - Updated vote document
 */
const updateVote = async (id, voteData) => {
  try {
    // Convert to snake_case for Supabase
    const data = {};
    
    if (voteData.sessionId !== undefined) data.session_id = voteData.sessionId;
    if (voteData.movieId !== undefined) data.movie_id = voteData.movieId;
    if (voteData.userId !== undefined) data.user_id = voteData.userId;
    if (voteData.rank !== undefined) data.rank = voteData.rank;
    if (voteData.votedAt !== undefined) data.voted_at = voteData.votedAt;
    
    // Add updated timestamp
    data.updated_at = new Date().toISOString();
    
    const { data: result, error } = await supabase
      .from('votes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: result.id,
      sessionId: result.session_id,
      movieId: result.movie_id,
      userId: result.user_id,
      rank: result.rank,
      votedAt: result.voted_at
    };
  } catch (error) {
    console.error('Error updating vote:', error);
    throw new Error(`Failed to update vote: ${error.message}`);
  }
};

/**
 * Delete a vote
 * @param {string} id - Vote ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteVote = async (id) => {
  try {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting vote:', error);
    throw new Error(`Failed to delete vote: ${error.message}`);
  }
};

/**
 * Delete all votes
 * @returns {Promise<boolean>} - Success status
 */
const deleteAllVotes = async () => {
  try {
    const { error } = await supabase
      .from('votes')
      .delete()
      .neq('id', '0'); // Delete all votes (dummy condition to delete all)
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all votes:', error);
    throw new Error(`Failed to delete all votes: ${error.message}`);
  }
};

module.exports = {
  getVotes,
  getVotesByUser,
  getVotesByMovie,
  createVote,
  updateVote,
  deleteVote,
  deleteAllVotes
}; 