const { 
  executeQuery, 
  getTableStructure, 
  listAllTables, 
  checkColumnExists 
} = require('../../src/lib/supabase/direct-query');

exports.handler = async (event, context) => {
  try {
    const { tableName, columnName, action, query } = event.queryStringParameters || {};
    
    let result;
    
    if (action === 'query' && query) {
      // Execute a custom query
      result = await executeQuery(query);
    } else if (action === 'structure' && tableName) {
      // Get table structure
      result = await getTableStructure(tableName);
    } else if (action === 'list') {
      // List all tables
      result = await listAllTables();
    } else if (action === 'check-column' && tableName && columnName) {
      // Check if a column exists
      result = await checkColumnExists(tableName, columnName);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid parameters',
          validActions: ['query', 'structure', 'list', 'check-column'],
          receivedParams: event.queryStringParameters
        })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Query executed',
        action: action || 'query',
        result
      })
    };
  } catch (error) {
    console.error('Error in direct-query function:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error executing query',
        error: error.message,
        stack: error.stack
      })
    };
  }
}; 