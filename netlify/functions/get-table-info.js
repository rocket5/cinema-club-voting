const { getTableInfo, listTables } = require('../../src/lib/supabase/get-table-info');

exports.handler = async (event, context) => {
  try {
    const { tableName } = event.queryStringParameters || {};
    
    if (tableName) {
      // Get info for a specific table
      const result = await getTableInfo(tableName);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Table info for ${tableName}`,
          result
        })
      };
    } else {
      // List all tables
      const result = await listTables();
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Tables list',
          result
        })
      };
    }
  } catch (error) {
    console.error('Error in get-table-info function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error getting table info',
        error: error.message,
        stack: error.stack
      })
    };
  }
}; 