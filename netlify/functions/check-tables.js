const { checkTables } = require('../../src/lib/supabase/check-tables');

exports.handler = async (event, context) => {
  try {
    const result = await checkTables();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Table check completed',
        result
      })
    };
  } catch (error) {
    console.error('Error in check-tables function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error checking tables',
        error: error.message,
        stack: error.stack
      })
    };
  }
}; 