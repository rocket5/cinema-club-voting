// netlify/functions/create-session.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Preflight call successful' }),
        };
    }

    try {
        console.log('Create session function called');
        
        // Get Authorization header
        const authHeader = event.headers.authorization || event.headers.Authorization;
        console.log('Auth header present:', !!authHeader);
        
        // Parse request body to get session name and auth token
        const { sessionName, createdBy, authToken } = JSON.parse(event.body || '{}');
        console.log('Request data:', { 
            sessionName, 
            hasCreatedBy: !!createdBy, 
            hasAuthToken: !!authToken,
            authTokenLength: authToken ? authToken.length : 0
        });
        
        // Validate session name
        if (!sessionName || !sessionName.trim()) {
            console.error('Session name is required');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Session name is required'
                })
            };
        }

        // Extract token from header or body
        let token = null;
        
        // Try to extract token from Authorization header first
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7); // Remove "Bearer " prefix
            console.log('Using token from Authorization header');
        } 
        // Fall back to token from request body
        else if (authToken) {
            token = authToken;
            console.log('Using token from request body');
        }
        
        // Validate auth token
        if (!token) {
            console.error('Authentication token is required');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    message: 'Authentication token is required'
                })
            };
        }
        
        console.log('Token length:', token.length);
        console.log('Token prefix:', token.substring(0, 10) + '...');

        // Initialize Supabase client
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        console.log('Supabase configuration:', { 
            hasUrl: !!supabaseUrl, 
            hasAnonKey: !!supabaseAnonKey
        });
        
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase configuration is missing');
        }
        
        // Create the Supabase client with the user's auth token
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });
        
        // Verify the user identity
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            console.error('Failed to get user from token:', userError);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    message: 'Invalid authentication token',
                    error: userError?.message || 'User not found'
                })
            };
        }

        console.log('Authenticated user:', { id: user.id, email: user.email });

        // Prepare session data for DB
        const dbData = {
            name: sessionName,
            host_id: user.id,
            status: 'active',
            start_date: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        
        console.log('Insert data:', dbData);
        
        // Insert the session directly
        const { data: result, error: insertError } = await supabaseClient
            .from('sessions')
            .insert(dbData)
            .select()
            .single();
        
        if (insertError) {
            console.error('Error inserting session:', insertError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    message: 'Failed to create session',
                    error: insertError.message
                })
            };
        }
        
        console.log('Session created successfully:', result);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Session created successfully',
                sessionId: result.id,
                sessionName: result.name
            })
        };
    } catch (error) {
        console.error('Error creating session:', error);
        console.error('Detailed error:', error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                message: 'Error creating session',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
