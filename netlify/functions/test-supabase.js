require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  try {
    // Initialize Supabase client directly in the function
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    // Log environment info for debugging
    console.log('Function environment:', {
      supabaseUrlExists: !!supabaseUrl,
      supabaseKeyExists: !!supabaseAnonKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'undefined',
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test the connection by fetching a simple query
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Supabase connection successful',
        data: data
      })
    };
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error testing Supabase connection',
        error: error.message
      })
    };
  }
}; 