require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Missing Supabase environment variables',
          env: {
            supabaseUrl: !!supabaseUrl,
            supabaseServiceKey: !!supabaseServiceKey
          }
        })
      };
    }
    
    // Check for authentication
    let authToken = null;
    
    // Check Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // If we have an auth token, verify it's valid
    if (authToken) {
      const { data: userData, error: userError } = await supabase.auth.getUser(authToken);
      
      if (userError || !userData || !userData.user) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            success: false,
            message: 'Authentication failed',
            error: userError ? userError.message : 'Invalid token'
          })
        };
      }
    }
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/supabase-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Schema file not found',
          path: schemaPath
        })
      };
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Check if the execute_sql function exists
    const { data: funcExists, error: funcError } = await supabase
      .rpc('execute_sql', { sql_query: 'SELECT 1' });
    
    // If the function doesn't exist, create it
    if (funcError && funcError.message.includes('function execute_sql') && funcError.message.includes('does not exist')) {
      console.log('Creating execute_sql function...');
      
      // Create the execute_sql function directly using the REST API
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE sql_query;
          result := '{"success": true}'::JSONB;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'detail', SQLSTATE
          );
          RETURN result;
        END;
        $$;
      `;
      
      // Execute the SQL directly using the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: createFunctionSQL
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            message: 'Failed to create execute_sql function',
            error: errorText
          })
        };
      }
      
      console.log('execute_sql function created successfully');
    }
    
    // Execute each statement
    const results = [];
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Execute the SQL statement
        const { data, error } = await supabase.rpc('execute_sql', { sql_query: stmt });
        
        results.push({
          statement: i + 1,
          success: !error,
          error: error ? error.message : null
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
        results.push({
          statement: i + 1,
          success: false,
          error: err.message
        });
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Schema application completed',
        statements: statements.length,
        results: results
      })
    };
  } catch (error) {
    console.error('Error applying schema:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Error applying schema',
        error: error.message
      })
    };
  }
}; 