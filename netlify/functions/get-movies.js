require('dotenv').config();
const { getMovies } = require('../../src/lib/supabase/movies');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { sessionId } = event.queryStringParameters;

    // Validate sessionId
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' })
      };
    }

    // Use the getMovies function from our Supabase library
    const movies = await getMovies(sessionId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        movies: movies,
        count: movies.length
      })
    };

  } catch (error) {
    console.error('Error retrieving movies:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to retrieve movies',
        message: error.message
      })
    };
  }
};
