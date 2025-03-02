// netlify/functions/add-movie.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client directly in the function
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log environment info for debugging
console.log('Function environment:', {
  supabaseUrlExists: !!supabaseUrl,
  supabaseKeyExists: !!supabaseAnonKey,
});

exports.handler = async (event, context) => {
    console.log('Function add-movie started');
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('Request body:', event.body);
        console.log('Parsed data:', data);

        const { 
            sessionId, 
            title, 
            description, 
            addedBy,  // This will be ignored if authToken is provided
            poster,
            year,
            director,
            genre,
            imdbRating,
            authToken,
            displayName // Display name from frontend
        } = data;

        if (!sessionId || !title || !description) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        // Check if authToken is provided
        if (!authToken) {
            console.log('No auth token provided, using anonymous user');
            
            // For anonymous users, addedBy is required
            if (!addedBy) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Missing addedBy field for anonymous user' })
                };
            }
        } else {
            console.log('Auth token provided, using authenticated user');
        }

        // Create a Supabase client with the auth token if provided
        const supabase = authToken 
            ? createClient(supabaseUrl, supabaseAnonKey, {
                global: {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
              })
            : createClient(supabaseUrl, supabaseAnonKey);

        // Get the user from the auth token if provided
        let userId = null;
        let userDisplayName = displayName || null;
        
        if (authToken) {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !user) {
                    console.error('Invalid authentication token:', userError);
                    return {
                        statusCode: 401,
                        body: JSON.stringify({ 
                            message: 'Invalid authentication token',
                            error: userError
                        })
                    };
                } else {
                    userId = user.id;
                    console.log('Authenticated as user:', userId);
                    console.log('User metadata:', user.user_metadata);
                    
                    // If no display name was provided, get it from user metadata
                    if (!userDisplayName) {
                        userDisplayName = user.user_metadata?.username || 
                                         user.user_metadata?.name || 
                                         user.email;
                        console.log('Using display name from metadata:', userDisplayName);
                    }
                }
            } catch (error) {
                console.error('Error authenticating user:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ 
                        message: 'Error authenticating user',
                        error: error.message 
                    })
                };
            }
        } else {
            // For anonymous users, use the provided addedBy value
            // This assumes addedBy is a valid user ID that exists in the auth.users table
            userId = addedBy;
            console.log('Using provided user ID for anonymous operation:', userId);
        }

        console.log('Preparing movie data...');

        // For anonymous users, we need to use an existing user ID
        // The addedBy field should contain a valid user ID from the users table
        
        // Convert to snake_case for Supabase
        const movieData = {
            title,
            description,
            session_id: sessionId,
            added_by: userId, // Use the verified user ID
            added_at: new Date().toISOString(),
            // Include OMDB fields if they exist
            poster: poster || null,
            year: year || null,
            director: director || null,
            genre: genre || null,
            imdb_rating: imdbRating || null,
            display_name: userDisplayName // Store the display name
        };

        console.log('Movie data being inserted:', movieData);
        console.log('Inserting data into Supabase...');
        
        const { data: result, error } = await supabase
            .from('movies')
            .insert(movieData)
            .select()
            .single();
        
        if (error) {
            console.error('Supabase insert error:', error);
            throw error;
        }
        
        console.log('Movie created successfully:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Movie added successfully',
                movie: result
            })
        };
    } catch (error) {
        console.error('Error adding movie:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error adding movie',
                error: error.message 
            })
        };
    }
};
