const { supabase } = require('./client');
const https = require('https');

/**
 * Execute a direct SQL query using Supabase
 * @param {string} query - The SQL query to execute
 * @returns {Promise<Object>} - Query results
 */
const executeQuery = async (query) => {
  try {
    console.log(`Executing query: ${query}`);
    
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      console.error('Error executing query:', error);
      
      // Try a simpler approach - just query the table directly
      if (query.includes('information_schema.columns') && query.includes('table_name')) {
        // Extract table name from the query
        const tableNameMatch = query.match(/table_name\s*=\s*'([^']+)'/);
        const tableName = tableNameMatch ? tableNameMatch[1] : null;
        
        if (tableName) {
          const { data: tableData, error: tableError } = await supabase
            .from(tableName)
            .select()
            .limit(1);
          
          if (tableError) {
            return {
              success: false,
              message: `Table ${tableName} query failed`,
              error: tableError
            };
          }
          
          // If we can query the table, it exists
          // Return the keys of the first row as column names
          if (tableData && tableData.length > 0) {
            const columns = Object.keys(tableData[0]).map(column_name => ({
              column_name,
              data_type: typeof tableData[0][column_name],
              is_nullable: 'YES' // We don't know for sure, so assume nullable
            }));
            
            return {
              success: true,
              data: columns
            };
          }
        }
      }
      
      return {
        success: false,
        message: 'Failed to execute query',
        error
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in executeQuery:', error);
    return {
      success: false,
      message: 'Error executing query',
      error: error.message,
      stack: error.stack
    };
  }
};

/**
 * Get table structure using a direct SQL query
 * @param {string} tableName - The name of the table to check
 * @returns {Promise<Object>} - Table structure information
 */
const getTableStructure = async (tableName) => {
  try {
    // Try a direct approach first
    const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select()
      .limit(1);
    
    if (tableError) {
      console.error(`Error querying table ${tableName}:`, tableError);
      return {
        success: false,
        message: `Error querying table ${tableName}`,
        error: tableError
      };
    }
    
    // If we can query the table, it exists
    // Return the keys of the first row as column names
    if (tableData && tableData.length > 0) {
      const columns = Object.keys(tableData[0]).map(column_name => ({
        column_name,
        data_type: typeof tableData[0][column_name],
        is_nullable: 'YES' // We don't know for sure, so assume nullable
      }));
      
      return {
        success: true,
        data: columns
      };
    }
    
    // If no rows, try to get the structure from the API
    const { data: emptyData, error: emptyError } = await supabase
      .from(tableName)
      .select();
    
    if (emptyError) {
      return {
        success: false,
        message: `Error querying empty table ${tableName}`,
        error: emptyError
      };
    }
    
    return {
      success: true,
      message: `Table ${tableName} exists but is empty`,
      data: []
    };
  } catch (error) {
    console.error(`Error in getTableStructure for ${tableName}:`, error);
    return {
      success: false,
      message: `Error getting table structure for ${tableName}`,
      error: error.message,
      stack: error.stack
    };
  }
};

/**
 * List all tables in the public schema
 * @returns {Promise<Object>} - List of tables
 */
const listAllTables = async () => {
  try {
    // Try to query common tables to see which ones exist
    const commonTables = ['sessions', 'movies', 'votes', 'users'];
    const existingTables = [];
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (!error) {
          existingTables.push({ table_name: tableName });
        }
      } catch (err) {
        console.log(`Table ${tableName} check error:`, err);
      }
    }
    
    return {
      success: true,
      data: existingTables
    };
  } catch (error) {
    console.error('Error in listAllTables:', error);
    return {
      success: false,
      message: 'Error listing tables',
      error: error.message,
      stack: error.stack
    };
  }
};

/**
 * Check if a specific column exists in a table
 * @param {string} tableName - The name of the table
 * @param {string} columnName - The name of the column
 * @returns {Promise<Object>} - Column existence information
 */
const checkColumnExists = async (tableName, columnName) => {
  try {
    // Try to query the table with a filter on the column
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error) {
      return {
        success: false,
        message: `Error querying table ${tableName}`,
        error
      };
    }
    
    // If we got data, check if the column exists in the first row
    if (data && data.length > 0) {
      const columnExists = Object.keys(data[0]).includes(columnName);
      return {
        success: true,
        data: [{ column_exists: columnExists }]
      };
    }
    
    // If no rows, we can't determine if the column exists
    return {
      success: false,
      message: `Table ${tableName} is empty, cannot determine if column ${columnName} exists`
    };
  } catch (error) {
    console.error(`Error in checkColumnExists for ${tableName}.${columnName}:`, error);
    return {
      success: false,
      message: `Error checking if column ${columnName} exists in table ${tableName}`,
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = {
  executeQuery,
  getTableStructure,
  listAllTables,
  checkColumnExists
}; 