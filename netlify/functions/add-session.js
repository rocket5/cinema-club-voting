require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createSession } = require('../../src/lib/supabase/sessions');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Add session function called');
    const { sessionName, createdBy } = JSON.parse(event.body);
    console.log('Request data:', { sessionName, hasCreatedBy: !!createdBy });

    // Validate required fields
    if (!sessionName || !createdBy) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl) {
      console.error('Missing Supabase URL');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: Missing Supabase URL' })
      };
    }
    
    if (!supabaseAnonKey && !supabaseServiceKey) {
      console.error('Missing both Supabase keys');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: Missing both Supabase keys' })
      };
    }
    
    // Use service key if available, otherwise fall back to anon key
    const apiKey = supabaseServiceKey || supabaseAnonKey;
    console.log('Using API key type:', supabaseServiceKey ? 'service role key' : 'anon key');
    
    // Create client for database operations
    const supabaseClient = createClient(supabaseUrl, apiKey);
    console.log('Supabase client initialized');

    // Prepare session data
    const sessionData = {
      sessionName: sessionName,
      hostId: createdBy,
      status: 'active',
      startDate: new Date().toISOString()
    };

    console.log('Creating session with data:', sessionData);

    // Use the createSession function with the client
    const result = await createSession(sessionData, supabaseClient);
    console.log('Session creation result:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Session created successfully',
        sessionId: result.id,
        sessionName: result.sessionName
      })
    };

  } catch (error) {
    console.error('Error creating session:', error);
    console.error('Detailed error:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create session',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
