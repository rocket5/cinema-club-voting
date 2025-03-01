const { supabase } = require('./client');

/**
 * Check if the tables exist and have the correct structure
 * @returns {Promise<Object>} - Table information
 */
const checkTables = async () => {
  try {
    console.log('Checking tables...');
    
    // Check if the sessions table exists
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.error('Error checking sessions table:', sessionsError);
      return { 
        success: false, 
        message: 'Error checking sessions table',
        error: sessionsError 
      };
    }
    
    // Check if the movies table exists
    const { data: moviesData, error: moviesError } = await supabase
      .from('movies')
      .select('*')
      .limit(1);
    
    if (moviesError) {
      console.error('Error checking movies table:', moviesError);
      return { 
        success: false, 
        message: 'Error checking movies table',
        error: moviesError 
      };
    }
    
    // Check if the votes table exists
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError) {
      console.error('Error checking votes table:', votesError);
      return { 
        success: false, 
        message: 'Error checking votes table',
        error: votesError 
      };
    }
    
    // Try a direct insert to the sessions table
    const testSession = {
      name: 'Test Session',
      host_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      status: 'active'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert(testSession)
      .select();
    
    if (insertError) {
      console.error('Error inserting test session:', insertError);
      return { 
        success: false, 
        message: 'Error inserting test session',
        error: insertError,
        tables: {
          sessions: sessionsData ? true : false,
          movies: moviesData ? true : false,
          votes: votesData ? true : false
        }
      };
    }
    
    // If we got here, the insert was successful, so delete the test session
    const { error: deleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.error('Error deleting test session:', deleteError);
    }
    
    return {
      success: true,
      message: 'All tables exist and have the correct structure',
      tables: {
        sessions: true,
        movies: true,
        votes: true
      },
      testInsert: insertData
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return { 
      success: false, 
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = { checkTables }; 