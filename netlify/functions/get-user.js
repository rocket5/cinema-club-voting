require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event, context) => {
    console.log('Function get-user started');
    console.log('Query parameters:', event.queryStringParameters);
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
    
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { userId } = event.queryStringParameters;
        
        if (!userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User ID is required' })
            };
        }

        console.log('Fetching user with ID:', userId);
        
        // Create Supabase client with service role key if available
        const supabase = supabaseServiceKey 
            ? createClient(supabaseUrl, supabaseServiceKey)
            : createClient(supabaseUrl, supabaseAnonKey);
        
        // First try to get from profiles table
        console.log('Trying to fetch from profiles table...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, name, avatar_url')
            .eq('id', userId)
            .single();
        
        if (profileError) {
            console.log('Error fetching from profiles:', profileError.message);
        } else {
            console.log('Profile data:', profile);
        }
        
        if (!profileError && profile) {
            const userData = {
                id: profile.id,
                username: profile.username || profile.name || 'Unknown User',
                avatarUrl: profile.avatar_url
            };
            console.log('Returning user data from profiles:', userData);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'User found',
                    user: userData
                })
            };
        }
        
        // If service role key is available, try to get from auth.users
        if (supabaseServiceKey) {
            console.log('Trying to fetch from auth.users...');
            const { data, error } = await supabase.auth.admin.getUserById(userId);
            
            if (error) {
                console.log('Error fetching from auth.users:', error.message);
            } else {
                console.log('Auth user data:', data);
            }
            
            if (!error && data && data.user) {
                const user = data.user;
                const userData = {
                    id: user.id,
                    username: user.user_metadata?.username || 
                             user.user_metadata?.name || 
                             user.email || 'Unknown User',
                    email: user.email
                };
                console.log('Returning user data from auth.users:', userData);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'User found',
                        user: userData
                    })
                };
            }
        } else {
            console.log('No service role key available, cannot access auth.users');
        }
        
        // If we get here, we couldn't find the user
        // Return a default username to avoid breaking the UI
        console.log('User not found, returning default data');
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'User not found, using default',
                user: {
                    id: userId,
                    username: 'Unknown User'
                }
            })
        };
    } catch (error) {
        console.error('Error getting user:', error);
        // Return a default username to avoid breaking the UI
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Error getting user, using default',
                user: {
                    id: event.queryStringParameters?.userId || 'unknown',
                    username: 'Unknown User'
                },
                error: error.message 
            })
        };
    }
}; 