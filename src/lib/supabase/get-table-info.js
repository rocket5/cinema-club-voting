const { supabase } = require('./client');

/**
 * Get detailed information about a table's structure
 * @param {string} tableName - The name of the table to check
 * @returns {Promise<Object>} - Table structure information
 */
const getTableInfo = async (tableName) => {
  try {
    console.log(`Getting information for table: ${tableName}`);
    
    // Query to get column information from PostgreSQL information schema
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: tableName })
      .select('*');
    
    if (error) {
      console.error(`Error getting column information for ${tableName}:`, error);
      
      // Try a direct query to information_schema as fallback
      const { data: columnsData, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', tableName);
      
      if (columnsError) {
        console.error(`Error querying information_schema for ${tableName}:`, columnsError);
        
        // Try a raw SQL query as a last resort
        const { data: rawData, error: rawError } = await supabase
          .rpc('execute_sql', { 
            sql_query: `SELECT column_name, data_type, is_nullable 
                       FROM information_schema.columns 
                       WHERE table_name = '${tableName}'` 
          });
        
        if (rawError) {
          console.error(`Error executing raw SQL for ${tableName}:`, rawError);
          return { 
            success: false, 
            message: `Failed to get column information for ${tableName}`,
            error: rawError 
          };
        }
        
        return {
          success: true,
          tableName,
          columns: rawData
        };
      }
      
      return {
        success: true,
        tableName,
        columns: columnsData
      };
    }
    
    return {
      success: true,
      tableName,
      columns: data
    };
  } catch (error) {
    console.error(`Error in getTableInfo for ${tableName}:`, error);
    return { 
      success: false, 
      message: `Error getting table info for ${tableName}`,
      error: error.message,
      stack: error.stack
    };
  }
};

/**
 * Get a list of all tables in the public schema
 * @returns {Promise<Object>} - List of tables
 */
const listTables = async () => {
  try {
    console.log('Listing all tables...');
    
    // Try to use a stored procedure first
    const { data, error } = await supabase
      .rpc('list_tables')
      .select('*');
    
    if (error) {
      console.error('Error listing tables:', error);
      
      // Try a direct query to information_schema as fallback
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('Error querying information_schema for tables:', tablesError);
        
        // Try a raw SQL query as a last resort
        const { data: rawData, error: rawError } = await supabase
          .rpc('execute_sql', { 
            sql_query: `SELECT table_name 
                       FROM information_schema.tables 
                       WHERE table_schema = 'public'` 
          });
        
        if (rawError) {
          console.error('Error executing raw SQL for tables:', rawError);
          return { 
            success: false, 
            message: 'Failed to list tables',
            error: rawError 
          };
        }
        
        return {
          success: true,
          tables: rawData
        };
      }
      
      return {
        success: true,
        tables: tablesData
      };
    }
    
    return {
      success: true,
      tables: data
    };
  } catch (error) {
    console.error('Error in listTables:', error);
    return { 
      success: false, 
      message: 'Error listing tables',
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = { getTableInfo, listTables }; 