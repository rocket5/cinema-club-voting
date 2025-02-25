require('dotenv').config();
const { getSessionById } = require('../../src/lib/fauna/sessions');

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

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Session ID is required' })
      };
    }

    // Use the getSessionById function from our FaunaDB library
    const session = await getSessionById(sessionId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(session)
    };

  } catch (error) {
    console.error('Error retrieving session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to retrieve session',
        message: error.message 
      })
    };
  }
};
