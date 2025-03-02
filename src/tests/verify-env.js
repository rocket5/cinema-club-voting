// Load environment variables
require('dotenv').config();

// Import the createClient function directly
const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are available
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL;
const testUserPassword = process.env.TEST_USER_PASSWORD;

console.log('Verifying environment variables...');

if (!supabaseUrl) {
  console.error('❌ Error: REACT_APP_SUPABASE_URL is not set');
  console.error('Please add REACT_APP_SUPABASE_URL to your .env file');
  process.exit(1);
} else {
  console.log('✅ REACT_APP_SUPABASE_URL is set:', supabaseUrl.substring(0, 15) + '...');
}

if (!supabaseAnonKey) {
  console.error('❌ Error: REACT_APP_SUPABASE_ANON_KEY is not set');
  console.error('Please add REACT_APP_SUPABASE_ANON_KEY to your .env file');
  process.exit(1);
} else {
  console.log('✅ REACT_APP_SUPABASE_ANON_KEY is set:', supabaseAnonKey.substring(0, 5) + '...');
}

// Check for test user credentials (optional)
if (!testUserEmail || !testUserPassword) {
  console.log('⚠️ Warning: TEST_USER_EMAIL and/or TEST_USER_PASSWORD are not set');
  console.log('This is optional, but may be required if your RLS policies restrict access.');
  console.log('If tests fail due to RLS policies, consider adding these to your .env file.');
} else {
  console.log('✅ Test user credentials are set');
}

// Initialize Supabase client
console.log('\nInitializing Supabase client...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection by making a simple query
async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    
    // Try to get the database schema
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Votes table exists and is accessible');
    
    // Check the structure of the votes table
    console.log('\nVerifying votes table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'votes' });
    
    if (tableError) {
      console.warn('⚠️ Could not verify votes table structure:', tableError.message);
      console.warn('This is not critical, but you might want to check your database setup');
    } else if (tableInfo) {
      console.log('✅ Votes table structure verified');
    }
    
    // Try to authenticate with test user if credentials are provided
    if (testUserEmail && testUserPassword) {
      console.log('\nTesting authentication with test user...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUserEmail,
        password: testUserPassword,
      });
      
      if (authError) {
        console.warn('⚠️ Could not authenticate with test user:', authError.message);
        console.warn('This may cause tests to fail if your RLS policies require authentication.');
        console.warn('Please check your test user credentials.');
      } else {
        console.log('✅ Successfully authenticated with test user!');
        console.log(`✅ User ID: ${authData.user.id}`);
        
        // Sign out after testing
        await supabase.auth.signOut();
      }
    }
    
    console.log('\n✅ All environment variables are set correctly!');
    console.log('✅ Supabase connection is working!');
    console.log('\nYou can now run the voting tests with:');
    console.log('  npm run test:voting');
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message || error);
    console.error('\nPlease check your Supabase URL and Anon Key in the .env file');
    console.error('Also make sure your Supabase project is running and accessible');
    process.exit(1);
  }
}

// Run the test
testConnection().then(() => {
  setTimeout(() => process.exit(0), 500);
}); 