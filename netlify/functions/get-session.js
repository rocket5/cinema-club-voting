require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

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

    const result = await client.query(fql`
      sessions.byId(${sessionId})
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.data)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve session' })
    };
  }
};
