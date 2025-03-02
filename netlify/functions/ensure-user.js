require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Function to generate a UUID
const generateUUID = () => {
    return crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
};

exports.handler = async (event, context) => {
    console.log('Function ensure-user started');
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('Request body:', event.body);
        
        const { username } = data;
        
        if (!username) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing username' })
            };
        }
        
        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Check if a profiles table exists and if the user exists
        const { data: existingProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .limit(1);
        
        if (!profilesError && existingProfiles && existingProfiles.length > 0) {
            // User exists, return the ID
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'User exists',
                    userId: existingProfiles[0].id,
                    isNew: false
                })
            };
        }
        
        // If we get here, either the profiles table doesn't exist or the user doesn't exist
        // Let's try to create a user in the profiles table
        
        // Generate a UUID for the user
        const userId = generateUUID();
        
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username: username,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (createError) {
            console.error('Error creating profile:', createError);
            
            // If we can't create a profile, return a static ID that can be used
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Could not create user, using default ID',
                    userId: username, // Use the username as the ID
                    isNew: false
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User created',
                userId: newProfile.id,
                isNew: true
            })
        };
    } catch (error) {
        console.error('Error ensuring user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error ensuring user',
                error: error.message 
            })
        };
    }
}; 