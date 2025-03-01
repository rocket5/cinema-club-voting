const { supabase } = require('./client');

/**
 * Get the schema of a table by trying to insert with different column names
 * @param {string} tableName - The name of the table to check
 * @returns {Promise<Object>} - Table schema information
 */
const getTableSchema = async (tableName) => {
  try {
    console.log(`Getting schema for table: ${tableName}`);
    
    // Common column names to try
    const possibleColumns = [
      'id',
      'name',
      'session_name',
      'title',
      'description',
      'status',
      'host_id',
      'user_id',
      'created_at',
      'updated_at',
      'start_date',
      'end_date'
    ];
    
    const columnResults = {};
    
    // Try to insert a row with each column to see if it exists
    for (const column of possibleColumns) {
      const testObj = {};
      testObj[column] = column === 'id' ? '00000000-0000-0000-0000-000000000000' : 'test_value';
      
      // For special types
      if (column.includes('_id')) {
        testObj[column] = '00000000-0000-0000-0000-000000000000';
      } else if (column.includes('date')) {
        testObj[column] = new Date().toISOString();
      } else if (column === 'status') {
        testObj[column] = 'active';
      }
      
      const { error } = await supabase
        .from(tableName)
        .insert(testObj)
        .select();
      
      // If the error is not about the column not existing, it might exist
      columnResults[column] = {
        exists: !error || !error.message.includes(`Could not find the '${column}' column`),
        error: error ? error.message : null
      };
    }
    
    // Try to select with each column to confirm
    for (const column of possibleColumns) {
      if (columnResults[column].exists) {
        const selectObj = {};
        selectObj[column] = column;
        
        const { error } = await supabase
          .from(tableName)
          .select(column)
          .limit(1);
        
        // Update existence based on select result
        columnResults[column].exists = !error || !error.message.includes(`Could not find the '${column}' column`);
        columnResults[column].selectError = error ? error.message : null;
      }
    }
    
    // Try to get all columns by selecting *
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    let allColumns = [];
    if (data && data.length > 0) {
      allColumns = Object.keys(data[0]);
    }
    
    return {
      success: true,
      tableName,
      possibleColumns: columnResults,
      confirmedColumns: allColumns,
      selectError: error
    };
  } catch (error) {
    console.error(`Error in getTableSchema for ${tableName}:`, error);
    return {
      success: false,
      message: `Error getting table schema for ${tableName}`,
      error: error.message,
      stack: error.stack
    };
  }
};

module.exports = { getTableSchema }; 