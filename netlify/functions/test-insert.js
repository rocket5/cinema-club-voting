const { testInsertSession } = require('../../src/lib/supabase/test-insert');

exports.handler = async (event, context) => {
  try {
    const result = await testInsertSession();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Test insert completed',
        result
      })
    };
  } catch (error) {
    console.error('Error in test-insert function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error testing insert',
        error: error.message,
        stack: error.stack
      })
    };
  }
}; 