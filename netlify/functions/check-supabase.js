require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Missing Supabase environment variables',
          env: {
            supabaseUrl: !!supabaseUrl,
            supabaseAnonKey: !!supabaseAnonKey
          }
        })
      };
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Check if we have an auth token
    let authToken = null;
    let authenticatedClient = null;
    
    // Check query parameters
    if (event.queryStringParameters && event.queryStringParameters.authToken) {
      authToken = event.queryStringParameters.authToken;
    }
    
    // Check Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authToken && authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }
    
    // Check connection to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('sessions')
      .select('count')
      .limit(1)
      .single();
    
    const results = {
      success: !connectionError,
      connection: {
        success: !connectionError,
        error: connectionError ? connectionError.message : null,
        data: connectionTest
      },
      auth: {
        tokenProvided: !!authToken
      },
      environment: {
        supabaseUrl: supabaseUrl.substring(0, 20) + '...',
        supabaseAnonKey: supabaseAnonKey.substring(0, 5) + '...'
      }
    };
    
    // If we have an auth token, check if it's valid
    if (authToken) {
      // Create authenticated client
      authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      });
      
      // Check if the token is valid
      const { data: userData, error: userError } = await authenticatedClient.auth.getUser();
      
      results.auth.valid = !userError && userData && userData.user;
      results.auth.error = userError ? userError.message : null;
      
      if (userData && userData.user) {
        results.auth.user = {
          id: userData.user.id,
          email: userData.user.email
        };
      }
      
      // Check if we can access the sessions table with the authenticated client
      const { data: authTest, error: authError } = await authenticatedClient
        .from('sessions')
        .select('id, name, host_id')
        .limit(1);
      
      results.auth.tableAccess = {
        success: !authError,
        error: authError ? authError.message : null,
        data: authTest
      };
    }
    
    // Check for the get_table_schema function
    const { data: schemaTest, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'sessions' });
    
    results.schema = {
      functionExists: !schemaError || !schemaError.message.includes('does not exist'),
      error: schemaError ? schemaError.message : null,
      data: schemaTest
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.error('Error checking Supabase:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error checking Supabase',
        error: error.message
      })
    };
  }
}; 