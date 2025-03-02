const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Use service key if available, otherwise fall back to anon key
const apiKey = supabaseServiceKey || supabaseAnonKey;
console.log('Using API key type:', supabaseServiceKey ? 'service role key' : 'anon key');

// Initialize Supabase client with available key
const supabase = createClient(supabaseUrl, apiKey);

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
    console.log('Get session results function called');
    
    // Get the session ID and optional userId from the query parameters
    const { sessionId, userId } = event.queryStringParameters || {};
    console.log('Query parameters:', { sessionId, userId });

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }

    // User identification - either from userId in query params or from JWT token
    let userIdToUse = null;

    // If userId is provided in the query parameters, use it directly
    if (userId) {
      console.log('Using provided userId:', userId);
      userIdToUse = userId;
    } else {
      // Otherwise, get the user from the JWT token
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized - No authentication provided' }),
        };
      }

      const token = authHeader.split(' ')[1];
      console.log('Using token for authentication');
      
      // Use the anon key client for auth verification only
      const authClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: userData, error: userError } = await authClient.auth.getUser(token);

      if (userError || !userData?.user) {
        console.error('Auth error:', userError);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        };
      }

      userIdToUse = userData.user.id;
      console.log('User ID from token:', userIdToUse);
    }

    // Get all votes for this session
    console.log('Fetching votes for session:', sessionId);
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);
    
    if (votesError) {
      console.error('Error fetching votes:', votesError);
      throw votesError;
    }
    
    console.log(`Found ${votes.length} votes for session ${sessionId}`);
    
    // Get all movies in this session directly from the movies table
    console.log('Fetching movies for session:', sessionId);
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('*')
      .eq('session_id', sessionId);
    
    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
      throw moviesError;
    }
    
    console.log(`Found ${movies.length} movies for session ${sessionId}`);
    
    // If no movies found, return empty results
    if (movies.length === 0) {
      console.log('No movies found for this session');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          results: [],
          totalVoters: 0,
          hasVoted: false
        }),
      };
    }
    
    // Get unique voters
    const uniqueVoters = [...new Set(votes.map(vote => vote.user_id))];
    console.log('Unique voters:', uniqueVoters);
    
    // Calculate results for each movie
    const results = movies.map(movie => {
      const movieVotes = votes.filter(vote => vote.movie_id === movie.id);
      const totalRank = movieVotes.reduce((sum, vote) => sum + vote.rank, 0);
      const avgRank = movieVotes.length ? totalRank / movieVotes.length : null;
      
      return {
        id: movie.id,
        title: movie.title || 'Unknown Movie',
        posterPath: movie.poster_path,
        imageUrl: movie.poster || movie.imageUrl,
        votes: movieVotes.length,
        avgRank: avgRank,
        // Calculate a score where lower rank is better (higher score is better)
        score: avgRank ? (movieVotes.length * (movies.length + 1 - avgRank)) : 0
      };
    });
    
    // Sort by score (higher is better)
    results.sort((a, b) => b.score - a.score);

    // Check if the user has voted in this session
    console.log('Checking if user has voted. User ID:', userIdToUse);
    console.log('Vote user_ids:', votes.map(v => v.user_id));
    const hasVoted = votes.some(vote => vote.user_id === userIdToUse);
    console.log('Has user voted:', hasVoted);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        totalVoters: uniqueVoters.length,
        hasVoted
      }),
    };
  } catch (error) {
    console.error('Error getting session results:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get session results', 
        details: error.message,
        stack: error.stack
      }),
    };
  }
}; 