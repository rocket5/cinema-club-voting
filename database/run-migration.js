require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'add-username-to-profiles.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

async function runMigration() {
  console.log('Running migration to add username column to profiles table...');
  
  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error running migration:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the column was added
    const { data, error: verifyError } = await supabase
      .from('profiles')
      .select('username')
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
      return;
    }
    
    console.log('Username column verified:', data);
  } catch (err) {
    console.error('Exception running migration:', err);
  }
}

runMigration(); 