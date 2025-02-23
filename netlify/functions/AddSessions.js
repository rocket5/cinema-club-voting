require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { sessionName, createdBy } = JSON.parse(event.body);

    // Validate required fields
    if (!sessionName || !createdBy) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const result = await client.query(fql`
      sessions.create({
        sessionName: ${sessionName},
        createdBy: ${createdBy},
        createdAt: Time.now()
      })
    `);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Session created successfully',
        sessionId: result.data.id,
        sessionName: result.data.sessionName
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create session' })
    };
  }
};
