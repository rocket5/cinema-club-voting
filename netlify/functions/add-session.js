require('dotenv').config();
const { createSession } = require('../../src/lib/supabase/sessions');

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

    // Prepare session data
    const sessionData = {
      sessionName: sessionName,
      hostId: createdBy,
      status: 'active',
      startDate: new Date().toISOString()
    };

    // Use the createSession function from our Supabase library
    const result = await createSession(sessionData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Session created successfully',
        sessionId: result.id,
        sessionName: result.sessionName
      })
    };

  } catch (error) {
    console.error('Error creating session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create session',
        message: error.message
      })
    };
  }
};
