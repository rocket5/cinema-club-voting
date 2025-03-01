require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { debugSessionCreation } = require('../../src/lib/supabase/debug-session');

exports.handler = async function(event, context) {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    console.log('Checking for Supabase environment variables...');
    console.log('REACT_APP_SUPABASE_URL exists:', !!process.env.REACT_APP_SUPABASE_URL);
    console.log('REACT_APP_SUPABASE_ANON_KEY exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

    try {
        // Get auth token from query parameters or Authorization header
        let authToken = null;
        
        // Check query parameters
        if (event.queryStringParameters && event.queryStringParameters.authToken) {
            authToken = event.queryStringParameters.authToken;
            console.log('Auth token found in query parameters');
            console.log('Token length:', authToken.length);
            console.log('Token prefix:', authToken.substring(0, 20) + '...');
        }
        
        // Check Authorization header
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authToken && authHeader && authHeader.startsWith('Bearer ')) {
            authToken = authHeader.substring(7);
            console.log('Auth token found in Authorization header');
            console.log('Token length:', authToken.length);
            console.log('Token prefix:', authToken.substring(0, 20) + '...');
        }
        
        if (!authToken) {
            console.log('No auth token provided');
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    message: 'Authentication required', 
                    error: 'No auth token provided' 
                })
            };
        }
        
        // Create custom Supabase client
        console.log('Creating authenticated Supabase client');
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase environment variables');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'Server configuration error', 
                    error: 'Missing Supabase environment variables' 
                })
            };
        }
        
        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Anon Key prefix:', supabaseAnonKey.substring(0, 5) + '...');
        
        // Create Supabase client with auth options
        const customSupabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        });
        
        // Verify the session is valid
        console.log('Verifying session validity');
        const { data: userData, error: userError } = await customSupabase.auth.getUser();
        
        if (userError) {
            console.error('User verification error:', userError);
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    message: 'Authentication failed', 
                    error: 'User verification error',
                    details: userError
                })
            };
        }
        
        if (!userData || !userData.user) {
            console.error('No valid user found');
            return {
                statusCode: 401,
                body: JSON.stringify({ 
                    message: 'Authentication failed', 
                    error: 'No valid user found',
                    userData: userData || 'null'
                })
            };
        }
        
        console.log('Authentication successful, user ID:', userData.user.id);

        // Run debug session creation with custom Supabase client
        const result = await debugSessionCreation(customSupabase);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Debug completed', 
                user: {
                    id: userData.user.id,
                    email: userData.user.email
                },
                result 
            })
        };
    } catch (error) {
        console.error('Error in debug-session function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error in debug function', 
                error: error.message,
                stack: error.stack
            })
        };
    }
}; 