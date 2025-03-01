const { getTableSchema } = require('../../src/lib/supabase/get-schema');

exports.handler = async (event, context) => {
  try {
    const { tableName } = event.queryStringParameters || {};
    
    if (!tableName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing tableName parameter',
          example: '/.netlify/functions/get-schema?tableName=sessions'
        })
      };
    }
    
    const result = await getTableSchema(tableName);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Schema for ${tableName}`,
        result
      })
    };
  } catch (error) {
    console.error('Error in get-schema function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error getting schema',
        error: error.message,
        stack: error.stack
      })
    };
  }
};