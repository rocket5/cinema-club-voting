const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Use service key if available, otherwise fall back to anon key
const apiKey = supabaseServiceKey || supabaseAnonKey;
console.log('Using API key type:', supabaseServiceKey ? 'service role key' : 'anon key');

// Initialize Supabase client with available key
const supabase = createClient(supabaseUrl, apiKey);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Received submit votes request');
    
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { sessionId, votes, userId } = requestBody;

    if (!sessionId || !votes || !Array.isArray(votes) || votes.length === 0) {
      console.log('Invalid request parameters:', { sessionId, votes: votes ? `Array(${votes?.length})` : 'undefined' });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID and votes array are required' }),
      };
    }

    // User identification - either from userId in request body or from JWT token
    let userIdToUse = null;

    // If userId is provided in the request body, use it directly
    if (userId) {
      console.log('Using provided userId:', userId);
      userIdToUse = userId;
    } else {
      // Otherwise, get the user from the JWT token
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid authorization header found');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized - No authentication provided' }),
        };
      }

      const token = authHeader.split(' ')[1];
      console.log('Using token for authentication');
      
      try {
        // Use the anon key client for auth verification only
        const authClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: userData, error: userError } = await authClient.auth.getUser(token);

        if (userError) {
          console.error('Error getting user from token:', userError);
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized', details: userError.message }),
          };
        }

        if (!userData?.user) {
          console.error('No user found in token data');
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized - No user found' }),
          };
        }

        userIdToUse = userData.user.id;
        console.log('User ID from token:', userIdToUse);
      } catch (authError) {
        console.error('Exception during authentication:', authError);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Authentication error', details: authError.message }),
        };
      }
    }

    // First delete any existing votes from this user for this session
    console.log(`Deleting existing votes for user ${userIdToUse} in session ${sessionId}`);
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', userIdToUse)
      .eq('session_id', sessionId);

    if (deleteError) {
      console.error('Error deleting existing votes:', deleteError);
      throw deleteError;
    }

    // Prepare votes for insertion
    const votesToInsert = votes.map(vote => ({
      session_id: sessionId,
      movie_id: vote.movieId,
      user_id: userIdToUse,
      rank: vote.rank,
      voted_at: new Date().toISOString()
    }));

    console.log(`Inserting ${votesToInsert.length} votes for user ${userIdToUse}`);
    console.log('Votes to insert:', JSON.stringify(votesToInsert, null, 2));

    // Insert new votes
    const { data: insertedVotes, error: insertError } = await supabase
      .from('votes')
      .insert(votesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting votes:', insertError);
      throw insertError;
    }

    console.log(`Successfully inserted ${insertedVotes.length} votes`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Votes submitted successfully',
        votes: insertedVotes.map(vote => ({
          id: vote.id,
          sessionId: vote.session_id,
          movieId: vote.movie_id,
          userId: vote.user_id,
          rank: vote.rank,
          votedAt: vote.voted_at
        }))
      }),
    };
  } catch (error) {
    console.error('Error submitting votes:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to submit votes', 
        details: error.message,
        stack: error.stack
      }),
    };
  }
}; 