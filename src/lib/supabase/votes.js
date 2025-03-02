const { supabase, supabaseAdmin } = require('./client');

/**
 * Get all votes or votes by session ID
 * @param {string} sessionId - Optional session ID to filter votes
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotes = async (sessionId = null) => {
  try {
    let query = supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
 * Get votes by user ID and session ID
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} - Array of vote documents
 */
const getVotesByUserAndSession = async (userId, sessionId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId);
    
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
    console.error('Error getting votes by user and session:', error);
    throw new Error(`Failed to get votes by user and session: ${error.message}`);
  }
};

/**
 * Delete votes by user ID and session ID
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteVotesByUserAndSession = async (userId, sessionId) => {
  try {
    console.log(`Deleting votes for user ${userId} in session ${sessionId}`);
    
    // Validate parameters
    if (!userId || !sessionId) {
      const missingParams = [];
      if (!userId) missingParams.push('userId');
      if (!sessionId) missingParams.push('sessionId');
      
      const errorMsg = `Missing required parameters: ${missingParams.join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // First check if any votes exist
    const { count, error: countError } = await supabaseAdmin
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('session_id', sessionId);
      
    if (countError) {
      console.error('Error counting votes to delete:', countError);
      throw countError;
    }
    
    console.log(`Found ${count} votes to delete`);
    
    // If no votes exist, return success without deleting
    if (count === 0) {
      console.log('No votes to delete, skipping delete operation');
      return true;
    }
    
    // Delete the votes
    const { error } = await supabaseAdmin
      .from('votes')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId);
    
    if (error) {
      console.error('Error deleting votes:', error);
      
      // Check for specific error types
      if (error.code === '23503') {
        throw new Error(`Foreign key violation: One of the referenced IDs does not exist`);
      } else if (error.code === '22P02') {
        throw new Error(`Invalid input syntax: Check the format of your IDs`);
      }
      
      throw error;
    }
    
    console.log(`Successfully deleted ${count} votes`);
    return true;
  } catch (error) {
    console.error('Error deleting votes by user and session:', error);
    throw new Error(`Failed to delete votes by user and session: ${error.message}`);
  }
};

/**
 * Get voting results for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} - Array of movie results with vote statistics
 */
const getSessionResults = async (sessionId) => {
  try {
    // Get all votes for this session
    const { data: votes, error: votesError } = await supabaseAdmin
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);
    
    if (votesError) {
      throw votesError;
    }
    
    // Get all movies in this session
    const { data: sessionMovies, error: moviesError } = await supabaseAdmin
      .from('session_movies')
      .select('movie_id, movies(*)')
      .eq('session_id', sessionId);
    
    if (moviesError) {
      throw moviesError;
    }
    
    // Get unique voters
    const uniqueVoters = [...new Set(votes.map(vote => vote.user_id))];
    
    // Calculate results for each movie
    const results = sessionMovies.map(sessionMovie => {
      const movie = sessionMovie.movies;
      const movieVotes = votes.filter(vote => vote.movie_id === sessionMovie.movie_id);
      const totalRank = movieVotes.reduce((sum, vote) => sum + vote.rank, 0);
      const avgRank = movieVotes.length ? totalRank / movieVotes.length : null;
      
      return {
        id: sessionMovie.movie_id,
        title: movie.title,
        posterPath: movie.poster_path,
        votes: movieVotes.length,
        avgRank: avgRank,
        // Calculate a score where lower rank is better (higher score is better)
        score: avgRank ? (movieVotes.length * (sessionMovies.length + 1 - avgRank)) : 0
      };
    });
    
    // Sort by score (higher is better)
    results.sort((a, b) => b.score - a.score);
    
    return {
      results,
      totalVoters: uniqueVoters.length
    };
  } catch (error) {
    console.error('Error getting session results:', error);
    throw new Error(`Failed to get session results: ${error.message}`);
  }
};

/**
 * Create a new vote
 * @param {Object} voteData - Vote data
 * @returns {Promise<Object>} - Created vote document
 */
const createVote = async (voteData) => {
  try {
    console.log('Creating vote with data:', voteData);
    
    // Validate required fields
    if (!voteData.sessionId || !voteData.movieId || !voteData.userId || voteData.rank === undefined) {
      const missingFields = [];
      if (!voteData.sessionId) missingFields.push('sessionId');
      if (!voteData.movieId) missingFields.push('movieId');
      if (!voteData.userId) missingFields.push('userId');
      if (voteData.rank === undefined) missingFields.push('rank');
      
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg, voteData);
      throw new Error(errorMsg);
    }
    
    // Convert to snake_case for Supabase
    const data = {
      session_id: voteData.sessionId,
      movie_id: voteData.movieId,
      user_id: voteData.userId,
      rank: voteData.rank,
      voted_at: voteData.votedAt || new Date().toISOString()
    };
    
    console.log('Inserting vote into database:', data);
    
    const { data: result, error } = await supabaseAdmin
      .from('votes')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating vote:', error);
      
      // Check for specific error types
      if (error.code === '23505') {
        throw new Error(`Duplicate vote: A vote with these details already exists`);
      } else if (error.code === '23503') {
        throw new Error(`Foreign key violation: One of the referenced IDs does not exist`);
      } else if (error.code === '22P02') {
        throw new Error(`Invalid input syntax: Check the format of your IDs`);
      }
      
      throw error;
    }
    
    console.log('Vote created successfully:', result);
    
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
    
    // Provide more context in the error message
    const errorMessage = `Failed to create vote: ${error.message}`;
    console.error(errorMessage);
    
    // Rethrow with more details
    throw new Error(errorMessage);
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
    
    const { data: result, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin
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

/**
 * Check if a user has voted in a session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} - True if user has voted in the session
 */
const hasUserVotedInSession = async (userId, sessionId) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('votes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('session_id', sessionId);
    
    if (error) {
      throw error;
    }
    
    return count > 0;
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    throw new Error(`Failed to check if user has voted: ${error.message}`);
  }
};

module.exports = {
  getVotes,
  getVotesByUser,
  getVotesByMovie,
  getVotesByUserAndSession,
  deleteVotesByUserAndSession,
  getSessionResults,
  createVote,
  updateVote,
  deleteVote,
  deleteAllVotes,
  hasUserVotedInSession
}; 