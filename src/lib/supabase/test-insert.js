const { supabase } = require('./client');

/**
 * Test inserting a session into the sessions table
 * @returns {Promise<Object>} - Result of the insert operation
 */
const testInsertSession = async () => {
  try {
    console.log('Testing session insert...');
    
    // First, let's check what columns the table has
    const { data: tableData, error: tableError } = await supabase
      .from('sessions')
      .select()
      .limit(1);
    
    console.log('Table query result:', tableData, tableError);
    
    // Create a test session with minimal required fields
    const testSession = {
      name: 'Test Session',
      host_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      status: 'active'
    };
    
    console.log('Attempting to insert session:', testSession);
    
    // Try to insert the session
    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert(testSession)
      .select();
    
    console.log('Insert result:', insertData, insertError);
    
    if (insertError) {
      // If the first insert failed, try with different field names
      const alternativeSession = {
        session_name: 'Test Session Alt',
        host_id: '00000000-0000-0000-0000-000000000000',
        status: 'active'
      };
      
      console.log('Attempting alternative insert:', alternativeSession);
      
      const { data: altData, error: altError } = await supabase
        .from('sessions')
        .insert(alternativeSession)
        .select();
      
      console.log('Alternative insert result:', altData, altError);
      
      if (altError) {
        return {
          success: false,
          message: 'Both insert attempts failed',
          firstError: insertError,
          secondError: altError
        };
      }
      
      return {
        success: true,
        message: 'Alternative insert succeeded',
        data: altData
      };
    }
    
    return {
      success: true,
      message: 'Insert succeeded',
      data: insertData
    };
  } catch (error) {
    console.error('Error in testInsertSession:', error);
    return {
      success: false,
      message: 'Error testing session insert',
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = { testInsertSession }; 