const { supabase, supabaseAdmin } = require('./client');

/**
 * Extract a usable date string from a timestamp
 * @param {any} dateObj - Date object
 * @returns {string|null} - ISO date string or null if invalid
 */
const extractDateString = (dateObj) => {
  // If it's null or undefined, return null
  if (dateObj == null) {
    return null;
  }
  
  try {
    // If it's already a string, return it
    if (typeof dateObj === 'string') {
      return dateObj;
    }
    
    // If it's a Date object, convert to ISO string
    if (dateObj instanceof Date) {
      return dateObj.toISOString();
    }
    
    // Default to null if no valid format is found
    return null;
  } catch (error) {
    console.error('Error extracting date string:', error);
    return null;
  }
};

/**
 * Get all sessions
 * @returns {Promise<Array>} - Array of session documents
 */
const getSessions = async () => {
  try {
    // Get all sessions from the database
    const { data: sessionsData, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
    
    if (!sessionsData || sessionsData.length === 0) {
      return [];
    }
    
    // Convert snake_case to camelCase
    const sessions = sessionsData.map(session => ({
      id: session.id,
      sessionName: session.name,
      startDate: extractDateString(session.start_date),
      endDate: extractDateString(session.end_date),
      status: session.status || 'active',
      hostId: session.host_id,
      winningMovie: session.winning_movie,
      createdAt: extractDateString(session.created_at)
    }));
    
    // Process each session to include host information
    for (const session of sessions) {
      try {
        if (session.hostId) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, name, username')
            .eq('id', session.hostId)
            .single();
          
          if (profileError) {
            const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
            session.hostUsername = `User ${shortId}`;
            session.displayName = session.hostUsername;
          } else if (profile) {
            // Use name or username, with fallback to user ID
            if (profile.name) {
              session.hostUsername = profile.name;
              session.displayName = profile.name;
            } else if (profile.username) {
              session.hostUsername = profile.username;
              session.displayName = profile.username;
            } else {
              const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
              session.hostUsername = `User ${shortId}`;
              session.displayName = session.hostUsername;
            }
          } else {
            const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
            session.hostUsername = `User ${shortId}`;
            session.displayName = session.hostUsername;
          }
        } else {
          session.hostUsername = 'Unknown User';
          session.displayName = 'Unknown User';
        }
      } catch (err) {
        console.error(`Error processing host data for session ${session.id}:`, err);
        const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
        session.hostUsername = `User ${shortId}`;
        session.displayName = session.hostUsername;
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Error in getSessions:', error);
    throw error;
  }
};

/**
 * Get a session by ID
 * @param {string} id - Session ID
 * @returns {Promise<Object>} - Session document
 */
const getSessionById = async (id) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    const session = {
      id: data.id,
      sessionName: data.name || null,
      startDate: extractDateString(data.start_date),
      endDate: extractDateString(data.end_date),
      status: data.status || 'active',
      hostId: data.host_id || 'unknown',
      winningMovie: data.winning_movie || null
    };
    
    // Try to get the host's username
    try {
      if (session.hostId) {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, name, username')
          .eq('id', session.hostId)
          .single();
        
        if (profileError) {
          const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
          session.hostUsername = `User ${shortId}`;
          session.displayName = session.hostUsername;
        } else if (profile) {
          // Use name or username, with fallback to user ID
          if (profile.name) {
            session.hostUsername = profile.name;
            session.displayName = profile.name;
          } else if (profile.username) {
            session.hostUsername = profile.username;
            session.displayName = profile.username;
          } else {
            const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
            session.hostUsername = `User ${shortId}`;
            session.displayName = session.hostUsername;
          }
        } else {
          const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
          session.hostUsername = `User ${shortId}`;
          session.displayName = session.hostUsername;
        }
      } else {
        session.hostUsername = 'Unknown User';
        session.displayName = 'Unknown User';
      }
    } catch (err) {
      console.error('Error fetching host data for session:', session.id, err);
      const shortId = session.hostId ? session.hostId.substring(0, 8) : 'unknown';
      session.hostUsername = `User ${shortId}`;
      session.displayName = session.hostUsername;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    throw new Error(`Failed to get session: ${error.message}`);
  }
};

/**
 * Create a new session
 * @param {Object} sessionData - Session data
 * @param {Object} [customSupabase] - Optional custom Supabase client with authentication
 * @returns {Promise<Object>} - Created session document
 */
const createSession = async (sessionData, customSupabase) => {
  try {
    // Use the provided Supabase client, or fall back to the admin client, or finally the default client
    const client = customSupabase || supabaseAdmin || supabase;
    
    console.log('Creating session with client type:', 
      customSupabase ? 'custom client' : 
      (client === supabaseAdmin ? 'admin client' : 'default client'));
    
    // Log client availability to debug
    console.log('Client check:', { 
      hasCustomClient: !!customSupabase,
      hasAdminClient: !!supabaseAdmin,
      hasDefaultClient: !!supabase
    });
    
    // Validate required fields
    if (!sessionData.hostId) {
      throw new Error('Missing required field: hostId is required');
    }
    
    // Check if we're using a non-custom client that needs authentication
    if (!customSupabase && client === supabase) {
      console.log('Using default client, checking authentication');
      const { data: { user }, error: authError } = await client.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error in createSession:', authError);
        throw new Error('User is not authenticated. Please sign in first.');
      }
      
      // Ensure the hostId matches the authenticated user
      const hostId = sessionData.hostId === 'current-user' ? user.id : sessionData.hostId;
      sessionData.hostId = hostId;
      console.log('Using hostId:', hostId);
    }
    
    // Log whether the client has direct DB access
    console.log('Using client with direct DB access:', client === supabaseAdmin);
    
    // Convert to snake_case for Supabase
    const data = {
      name: sessionData.sessionName || null,
      start_date: sessionData.startDate || new Date().toISOString(),
      end_date: sessionData.endDate || null,
      status: sessionData.status || 'active',
      host_id: sessionData.hostId,
      winning_movie: sessionData.winningMovie || null,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting session data:', data);
    
    // First try creating the session with normal RLS
    let result, error;
    try {
      console.log('Attempting to insert session with standard permissions');
      const response = await client
        .from('sessions')
        .insert(data)
        .select()
        .single();
      
      result = response.data;
      error = response.error;
      
      if (error) {
        console.warn('Standard permission insert failed:', error);
      } else {
        console.log('Standard permission insert succeeded');
      }
    } catch (insertError) {
      console.error('Error during insert attempt:', insertError);
      error = insertError;
    }
    
    // If RLS blocks it, try with admin client as fallback
    if (error && client !== supabaseAdmin && supabaseAdmin) {
      console.log('Falling back to admin client for insert');
      const adminResponse = await supabaseAdmin
        .from('sessions')
        .insert(data)
        .select()
        .single();
      
      result = adminResponse.data;
      error = adminResponse.error;
      
      if (error) {
        console.error('Admin fallback insert also failed:', error);
      } else {
        console.log('Admin fallback insert succeeded');
      }
    }
    
    // Final error check
    if (error) {
      console.error('Error inserting session:', error);
      throw error;
    }
    
    console.log('Session created successfully:', result);
    
    return {
      id: result.id,
      sessionName: result.name || null,
      startDate: extractDateString(result.start_date),
      endDate: extractDateString(result.end_date),
      status: result.status || 'active',
      hostId: result.host_id,
      winningMovie: result.winning_movie || null
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
};

/**
 * Update a session
 * @param {string} id - Session ID
 * @param {Object} sessionData - Session data to update
 * @returns {Promise<Object>} - Updated session document
 */
const updateSession = async (id, sessionData) => {
  try {
    // Convert to snake_case for Supabase
    const data = {};
    
    if (sessionData.sessionName !== undefined) data.name = sessionData.sessionName;
    if (sessionData.startDate !== undefined) data.start_date = sessionData.startDate;
    if (sessionData.endDate !== undefined) data.end_date = sessionData.endDate;
    if (sessionData.status !== undefined) data.status = sessionData.status;
    if (sessionData.hostId !== undefined) data.host_id = sessionData.hostId;
    if (sessionData.winningMovie !== undefined) data.winning_movie = sessionData.winningMovie;
    
    // Add updated timestamp
    data.updated_at = new Date().toISOString();
    
    const { data: result, error } = await supabaseAdmin
      .from('sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: result.id,
      sessionName: result.name || null,
      startDate: extractDateString(result.start_date),
      endDate: extractDateString(result.end_date),
      status: result.status || 'active',
      hostId: result.host_id,
      winningMovie: result.winning_movie || null
    };
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
};

/**
 * Delete a session
 * @param {string} id - Session ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteSession = async (id) => {
  try {
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
};

/**
 * Delete all sessions
 * @returns {Promise<boolean>} - Success status
 */
const deleteAllSessions = async () => {
  try {
    const { error } = await supabaseAdmin
      .from('sessions')
      .delete()
      .neq('id', '0'); // Delete all sessions (dummy condition to delete all)
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    throw new Error(`Failed to delete all sessions: ${error.message}`);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  deleteAllSessions
}; 