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

  try {
    console.log('Check user voted function called');

    // Get the session ID and user ID from the query parameters
    const { sessionId, userId } = event.queryStringParameters || {};
    console.log('Query parameters:', { sessionId, userId });

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    // If userId is provided, use it directly
    // This is a workaround for the authentication issue
    if (userId) {
      console.log('Using provided userId:', userId);
      
      // Check if the user has voted in this session
      const { count, error } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error checking votes:', error);
        throw error;
      }

      console.log(`Found ${count} votes for user ${userId} in session ${sessionId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hasVoted: count > 0 }),
      };
    }

    // If no userId provided, try to get from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Using token for authentication');
      
      // Use the anon key client for auth verification only
      const authClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData, error: userError } = await authClient.auth.getUser(token);
      
      if (userError || !userData?.user) {
        console.error('Auth error:', userError);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized', details: userError?.message || 'Invalid token' }),
        };
      }

      const userIdFromToken = userData.user.id;
      console.log('User ID from token:', userIdFromToken);
      
      // Check if the user has voted in this session
      const { count, error } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('user_id', userIdFromToken)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error checking votes:', error);
        throw error;
      }

      console.log(`Found ${count} votes for user ${userIdFromToken} in session ${sessionId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ hasVoted: count > 0 }),
      };
    }

    // If we get here, we don't have a user ID or valid token
    console.log('No user ID or valid token provided');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: 'Unauthorized', 
        details: 'No user ID provided and no valid authentication token found' 
      }),
    };
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to check vote status', 
        details: error.message,
        stack: error.stack 
      }),
    };
  }
}; 