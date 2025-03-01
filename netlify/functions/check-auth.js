require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the auth token from the Authorization header or cookie
    const authHeader = event.headers.authorization || event.headers.Authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // If token is provided, use it to create an authenticated client
    if (token) {
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });
    }
    
    // Get the current session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth check error:', error);
      return {
        statusCode: 401,
        body: JSON.stringify({ 
          authenticated: false, 
          error: error.message 
        })
      };
    }

    // Check if session exists and is valid
    if (data && data.session) {
      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User data error:', userError);
        return {
          statusCode: 401,
          body: JSON.stringify({ 
            authenticated: false, 
            error: userError.message 
          })
        };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          authenticated: true,
          user: userData.user,
          session: data.session
        })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          authenticated: false,
          message: 'No active session'
        })
      };
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        authenticated: false,
        error: 'Internal Server Error' 
      })
    };
  }
}; 