const { supabase } = require('./client');
const { createSession } = require('./sessions');

/**
 * Debug function to test session creation
 * @param {Object} [customSupabase] - Optional custom Supabase client with authentication
 * @returns {Promise<Object>} - Debug information
 */
const debugSessionCreation = async (customSupabase) => {
  try {
    console.log('Starting session creation debug...');
    
    // Use the provided Supabase client or fall back to the default one
    const client = customSupabase || supabase;
    
    // Check if user is authenticated
    console.log('Checking authentication...');
    const { data: { user }, error: authError } = await client.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return { 
        success: false, 
        message: 'Authentication error',
        error: authError 
      };
    }
    
    if (!user) {
      console.error('No user found');
      return { 
        success: false, 
        message: 'User is not authenticated. Please sign in first.',
        error: 'No user found' 
      };
    }
    
    console.log('User is authenticated:', user.id);
    console.log('User email:', user.email);
    
    // Check Supabase connection with a simpler query
    console.log('Checking Supabase connection...');
    const { data: connectionTest, error: connectionError } = await client
      .from('sessions')
      .select('count')
      .limit(1)
      .single();
    
    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      return { 
        success: false, 
        message: 'Failed to connect to Supabase',
        error: connectionError 
      };
    }
    
    console.log('Supabase connection successful:', connectionTest);
    
    // Try a direct SQL query to check if the table exists
    console.log('Checking if sessions table exists...');
    const { data: tableExists, error: tableExistsError } = await client
      .from('sessions')
      .select('id, name')
      .limit(1);
    
    if (tableExistsError) {
      console.error('Error checking if table exists:', tableExistsError);
      return { 
        success: false, 
        message: 'Error checking if sessions table exists',
        error: tableExistsError 
      };
    }
    
    console.log('Sessions table exists, sample data:', tableExists);
    
    // Get the table schema
    console.log('Checking sessions table schema...');
    const { data: tableSchema, error: tableSchemaError } = await client
      .rpc('get_table_schema', { table_name: 'sessions' })
      .single();
    
    if (tableSchemaError) {
      console.log('Error getting table schema using RPC, trying direct query...');
      
      // Try a direct insert to see what columns are available
      const testData = {
        name: 'Debug Test Session',
        host_id: user.id,
        start_date: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
      };
      
      const { data: insertResult, error: insertError } = await client
        .from('sessions')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.error('Direct insert error:', insertError);
        return { 
          success: false, 
          message: 'Failed to insert test session',
          error: insertError,
          testData: testData
        };
      }
      
      console.log('Direct insert successful:', insertResult);
      return {
        success: true,
        message: 'Session creation successful via direct insert',
        directInsert: insertResult
      };
    }
    
    console.log('Table schema:', tableSchema);
    
    // Try creating a test session with direct insert
    console.log('Attempting direct insert...');
    const testData = {
      name: 'Debug Test Session',
      host_id: user.id,
      start_date: new Date().toISOString(),
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await client
      .from('sessions')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('Direct insert error:', insertError);
      return { 
        success: false, 
        message: 'Failed to insert test session',
        error: insertError,
        testData: testData
      };
    }
    
    console.log('Direct insert successful:', insertResult);
    
    // Try using the service function
    console.log('Attempting to create session using service function...');
    const testSession = {
      sessionName: 'Service Test Session',
      hostId: user.id, // Use actual user ID instead of 'current-user'
      startDate: new Date().toISOString()
    };
    
    const session = await createSession(testSession, client);
    console.log('Session created successfully using service:', session);
    
    return { 
      success: true, 
      message: 'Session creation successful',
      directInsert: insertResult,
      serviceResult: session,
      user: {
        id: user.id,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error in debug session creation:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = { debugSessionCreation }; 