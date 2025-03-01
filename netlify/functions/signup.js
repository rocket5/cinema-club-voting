require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

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
    // Parse request body
    const { email, password, userData } = JSON.parse(event.body);
    
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Sign up with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message })
      };
    }

    // Create user profile if needed
    if (data.user && userData) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: userData.username || email.split('@')[0],
              full_name: userData.full_name || '',
              avatar_url: userData.avatar_url || '',
              updated_at: new Date()
            }
          ]);

        if (profileError) {
          console.warn('Error creating user profile:', profileError);
          // Continue anyway, as the user was created successfully
        }
      } catch (profileErr) {
        console.warn('Exception creating user profile:', profileErr);
        // Continue anyway, as the user was created successfully
      }
    }

    // Return user and session data
    return {
      statusCode: 200,
      body: JSON.stringify({
        user: data.user,
        session: data.session,
        message: 'User created successfully'
      })
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
}; 