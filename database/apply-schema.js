require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      console.error('Required: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_KEY (or REACT_APP_SUPABASE_ANON_KEY)');
      process.exit(1);
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema to Supabase...');
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Execute the SQL statement
        const { error } = await supabase.rpc('execute_sql', { sql_query: stmt });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', stmt);
          
          // If the error is about the execute_sql function not existing, create it
          if (error.message.includes('function execute_sql') && error.message.includes('does not exist')) {
            console.log('Creating execute_sql function...');
            
            // Create the execute_sql function
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
            
            // Execute the create function statement directly using pg
            const { data, error: funcError } = await supabase.rpc('execute_sql', { sql_query: createFunctionSQL });
            
            if (funcError) {
              console.error('Error creating execute_sql function:', funcError);
              console.log('You may need to create this function manually in the Supabase SQL editor:');
              console.log(createFunctionSQL);
              process.exit(1);
            }
            
            console.log('execute_sql function created successfully');
            
            // Retry the original statement
            console.log('Retrying statement...');
            const { error: retryError } = await supabase.rpc('execute_sql', { sql_query: stmt });
            
            if (retryError) {
              console.error(`Error executing statement ${i + 1} (retry):`, retryError);
              console.error('Statement:', stmt);
            } else {
              console.log(`Statement ${i + 1} executed successfully (retry)`);
            }
          }
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
        console.error('Statement:', stmt);
      }
    }
    
    console.log('Schema application completed');
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  }
}

// Run the function
applySchema(); 