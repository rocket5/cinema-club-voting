const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    // Get the user ID from the query parameters
    const { userId } = event.queryStringParameters || {};
    console.log('Query parameters:', { userId });

    // Get auth header if available
    const authHeader = event.headers.authorization || event.headers.Authorization;
    let tokenInfo = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Token provided:', token ? 'Yes (truncated)' : 'No');
      
      if (token) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          tokenInfo = {
            success: !error,
            user: error ? null : {
              id: data?.user?.id,
              email: data?.user?.email,
              // Include other non-sensitive fields
            },
            error: error ? error.message : null
          };
        } catch (e) {
          tokenInfo = {
            success: false,
            error: e.message
          };
        }
      }
    }

    // Check if the user exists in the database
    let userExists = false;
    let userInfo = null;
    
    if (userId) {
      try {
        // Check votes table
        const { count: votesCount, error: votesError } = await supabase
          .from('votes')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .limit(1);
          
        // Check sessions table
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from('sessions')
          .select('id', { count: 'exact' })
          .eq('host_id', userId)
          .limit(1);
          
        userExists = (votesCount > 0 || sessionsCount > 0);
        userInfo = {
          votesCount,
          votesError: votesError ? votesError.message : null,
          sessionsCount,
          sessionsError: sessionsError ? sessionsError.message : null
        };
      } catch (e) {
        userInfo = {
          error: e.message
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Debug information',
        userId,
        userExists,
        userInfo,
        tokenInfo,
        headers: {
          // Include only non-sensitive headers
          contentType: event.headers['content-type'] || event.headers['Content-Type'],
          hasAuthorization: !!authHeader
        }
      }),
    };
  } catch (error) {
    console.error('Error in debug-user function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Debug function failed', 
        details: error.message,
        stack: error.stack
      }),
    };
  }
}; 