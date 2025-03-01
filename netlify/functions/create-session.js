// netlify/functions/create-session.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { createSession } = require('../../src/lib/supabase/sessions');

exports.handler = async (event, context) => {
    try {
        // Parse request body to get session name and auth token
        const { sessionName, createdBy, authToken } = JSON.parse(event.body || '{}');
        
        // Validate session name
        if (!sessionName || !sessionName.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Session name is required'
                })
            };
        }

        // Validate auth token
        if (!authToken) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Authentication token is required'
                })
            };
        }

        // Create a new Supabase client with the provided auth token
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        });

        // Get the user from the auth token
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Invalid authentication token',
                    error: userError?.message
                })
            };
        }

        // Prepare session data
        const sessionData = {
            sessionName: sessionName,
            hostId: user.id, // Use the authenticated user's ID
            status: 'active',
            startDate: new Date().toISOString() // Add current date as startDate
        };

        // Use the createSession function with the authenticated Supabase client
        const result = await createSession(sessionData, supabase);

        console.log('Session creation result:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Session created successfully',
                sessionId: result.id,
                sessionName: result.sessionName
            })
        };
    } catch (error) {
        console.error('Error creating session:', error);
        console.error('Detailed error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error creating session',
                error: error.message 
            })
        };
    }
};
