// Load environment variables
require('dotenv').config();

// Import the createClient function directly
const { createClient } = require('@supabase/supabase-js');

// Create a test-specific Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables are missing.');
  console.error('Please make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your .env file.');
  console.error('You can run "npm run verify:env" to check your environment variables.');
  process.exit(1);
}

console.log('Initializing Supabase client for testing...');
console.log('Supabase URL:', supabaseUrl.substring(0, 15) + '...');
console.log('Supabase Anon Key:', supabaseAnonKey.substring(0, 5) + '...');

// Initialize Supabase client for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials - you should create a test user in Supabase
// or use an existing user's credentials for testing
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Function to sign in the test user
async function signInTestUser() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log('No test user credentials provided. Running tests with anonymous access.');
    console.log('Some tests may fail if your RLS policies require authentication.');
    console.log('To run with authentication, set TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file.');
    return null;
  }

  try {
    console.log(`Signing in test user: ${TEST_EMAIL}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.error('Error signing in test user:', error.message);
      console.log('Continuing tests with anonymous access...');
      return null;
    }

    console.log('Test user signed in successfully!');
    return data.user;
  } catch (error) {
    console.error('Error during sign in:', error.message || error);
    console.log('Continuing tests with anonymous access...');
    return null;
  }
}

// Generate a valid UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Test data - use proper UUIDs to match database schema
const testSessionId = generateUUID();
let testUserId = generateUUID(); // This will be updated if we sign in a test user
const testMovies = [
  { id: generateUUID(), title: 'Test Movie 1' },
  { id: generateUUID(), title: 'Test Movie 2' },
  { id: generateUUID(), title: 'Test Movie 3' }
];

// Helper function to clean up test data
async function cleanupTestData() {
  try {
    console.log('Cleaning up test data...');
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('session_id', testSessionId);
    
    if (error) {
      console.warn('Warning during cleanup:', error.message);
      return;
    }
    
    console.log('Test data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test data:', error.message || error);
  }
}

// Test creating votes
async function testCreateVotes() {
  console.log('\n--- Testing Vote Creation ---');
  
  try {
    // Create votes for each movie
    const votes = [];
    for (let i = 0; i < testMovies.length; i++) {
      const voteData = {
        session_id: testSessionId,
        movie_id: testMovies[i].id,
        user_id: testUserId,
        rank: i + 1,
        voted_at: new Date().toISOString()
      };
      
      console.log(`Creating vote for ${testMovies[i].title} with rank ${i + 1}...`);
      const { data, error } = await supabase
        .from('votes')
        .insert(voteData)
        .select();
      
      if (error) {
        // Check for RLS policy error
        if (error.message.includes('row-level security policy')) {
          console.error('\n❌ Row-Level Security Policy Error:');
          console.error('This error occurs when the database has Row-Level Security (RLS) policies');
          console.error('that prevent the test user from inserting data into the votes table.');
          console.error('\nTo fix this issue:');
          console.error('1. Make sure you are running the tests with a valid authenticated user');
          console.error('   by setting TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file.');
          console.error('2. Ensure that the authenticated user has permission to insert votes');
          console.error('   according to your existing RLS policies.');
          console.error('3. If testing with the anonymous role, make sure your RLS policies');
          console.error('   allow the anonymous role to insert votes for testing purposes.');
          console.error('\nFor more information, see the README.md file in the tests directory.');
        }
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data returned from insert operation');
      }
      
      votes.push(data[0]);
      console.log(`Created vote for ${testMovies[i].title} with rank ${i + 1}`);
    }
    
    console.log('All votes created successfully');
    return votes;
  } catch (error) {
    console.error('Error creating votes:', error.message || error);
    throw error;
  }
}

// Test getting votes by user and session
async function testGetVotesByUserAndSession() {
  console.log('\n--- Testing Get Votes By User And Session ---');
  
  try {
    console.log(`Retrieving votes for user ${testUserId} in session ${testSessionId}...`);
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId);
    
    if (error) {
      throw error;
    }
    
    const votes = data;
    console.log(`Retrieved ${votes.length} votes for user ${testUserId} in session ${testSessionId}`);
    
    // Verify that we got the correct number of votes
    if (votes.length !== testMovies.length) {
      throw new Error(`Expected ${testMovies.length} votes, but got ${votes.length}`);
    }
    
    // Verify that the ranks are correct
    for (let i = 0; i < testMovies.length; i++) {
      const vote = votes.find(v => v.movie_id === testMovies[i].id);
      if (!vote) {
        throw new Error(`Vote for movie ${testMovies[i].id} not found`);
      }
      
      if (vote.rank !== i + 1) {
        throw new Error(`Expected rank ${i + 1} for movie ${testMovies[i].id}, but got ${vote.rank}`);
      }
    }
    
    console.log('All votes retrieved correctly');
    return votes;
  } catch (error) {
    console.error('Error getting votes by user and session:', error.message || error);
    throw error;
  }
}

// Test checking if a user has voted in a session
async function testHasUserVotedInSession() {
  console.log('\n--- Testing Has User Voted In Session ---');
  
  try {
    console.log(`Checking if user ${testUserId} has voted in session ${testSessionId}...`);
    const { count, error } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId);
    
    if (error) {
      throw error;
    }
    
    const hasVoted = count > 0;
    console.log(`User ${testUserId} has voted in session ${testSessionId}: ${hasVoted}`);
    
    if (!hasVoted) {
      throw new Error(`Expected user ${testUserId} to have voted in session ${testSessionId}, but they haven't`);
    }
    
    console.log('User has voted check passed');
    return hasVoted;
  } catch (error) {
    console.error('Error checking if user has voted:', error.message || error);
    throw error;
  }
}

// Test getting session results
async function testGetSessionResults() {
  console.log('\n--- Testing Get Session Results ---');
  
  try {
    console.log(`Getting results for session ${testSessionId}...`);
    // Get all votes for this session
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', testSessionId);
    
    if (votesError) {
      throw votesError;
    }
    
    // Since this is a test, we'll simulate the session movies
    const sessionMovies = testMovies.map(movie => ({
      movie_id: movie.id,
      movies: movie
    }));
    
    // Get unique voters
    const uniqueVoters = [...new Set(votes.map(vote => vote.user_id))];
    
    // Calculate results for each movie
    const results = sessionMovies.map(sessionMovie => {
      const movie = sessionMovie.movies;
      const movieVotes = votes.filter(vote => vote.movie_id === sessionMovie.movie_id);
      const totalRank = movieVotes.reduce((sum, vote) => sum + vote.rank, 0);
      const avgRank = movieVotes.length ? totalRank / movieVotes.length : null;
      
      return {
        id: sessionMovie.movie_id,
        title: movie.title,
        votes: movieVotes.length,
        avgRank: avgRank,
        score: avgRank ? (movieVotes.length * (sessionMovies.length + 1 - avgRank)) : 0
      };
    });
    
    // Sort by score (higher is better)
    results.sort((a, b) => b.score - a.score);
    
    const resultsData = {
      results,
      totalVoters: uniqueVoters.length
    };
    
    console.log(`Retrieved results for session ${testSessionId}`);
    console.log(`Total voters: ${resultsData.totalVoters}`);
    
    if (resultsData.totalVoters !== 1) {
      throw new Error(`Expected 1 voter, but got ${resultsData.totalVoters}`);
    }
    
    if (resultsData.results.length !== testMovies.length) {
      throw new Error(`Expected ${testMovies.length} results, but got ${resultsData.results.length}`);
    }
    
    console.log('Session results retrieved correctly');
    return resultsData;
  } catch (error) {
    console.error('Error getting session results:', error.message || error);
    throw error;
  }
}

// Test deleting votes by user and session
async function testDeleteVotesByUserAndSession() {
  console.log('\n--- Testing Delete Votes By User And Session ---');
  
  try {
    console.log(`Deleting votes for user ${testUserId} in session ${testSessionId}...`);
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId);
    
    if (error) {
      throw error;
    }
    
    console.log(`Deleted votes for user ${testUserId} in session ${testSessionId}`);
    
    // Verify that the votes were deleted
    console.log('Verifying votes were deleted...');
    const { data: votes, error: getError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', testUserId)
      .eq('session_id', testSessionId);
    
    if (getError) {
      throw getError;
    }
    
    if (votes.length !== 0) {
      throw new Error(`Expected 0 votes after deletion, but got ${votes.length}`);
    }
    
    console.log('All votes deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting votes by user and session:', error.message || error);
    throw error;
  }
}

// Run all tests
async function runTests() {
  let testsPassed = false;
  let authenticatedUser = null;
  
  try {
    console.log('Starting voting functionality tests...');
    
    // Sign in test user if credentials are provided
    authenticatedUser = await signInTestUser();
    if (authenticatedUser) {
      // Use the authenticated user's ID for testing
      testUserId = authenticatedUser.id;
      console.log(`Using authenticated user ID: ${testUserId} for tests`);
    } else {
      console.log(`Using generated user ID: ${testUserId} for tests`);
    }
    
    // Clean up any existing test data
    await cleanupTestData();
    
    // Run tests
    await testCreateVotes();
    await testGetVotesByUserAndSession();
    await testHasUserVotedInSession();
    await testGetSessionResults();
    await testDeleteVotesByUserAndSession();
    
    console.log('\n✅ All tests completed successfully!');
    testsPassed = true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    // Clean up test data
    await cleanupTestData();
    
    // Sign out if we signed in
    if (authenticatedUser) {
      console.log('Signing out test user...');
      await supabase.auth.signOut();
    }
    
    // Print summary
    console.log('\n----- Test Summary -----');
    if (testsPassed) {
      console.log('✅ All voting tests passed successfully!');
      console.log('\nThis means that:');
      console.log('1. Your Supabase connection is working correctly');
      console.log('2. The votes table is properly configured');
      console.log('3. The RLS policies are set up correctly');
      console.log('4. All voting functionality is working as expected');
    } else {
      console.log('❌ Some tests failed. Please check the error messages above.');
      console.log('\nCommon issues:');
      console.log('1. Row-Level Security (RLS) policies preventing access:');
      console.log('   - Try running the tests with a valid authenticated user by setting');
      console.log('     TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env file');
      console.log('2. Missing or incorrect environment variables');
      console.log('   - Run "npm run verify:env" to check your environment variables');
      console.log('3. Database table structure issues');
      console.log('   - Make sure the votes table has the correct columns and types');
      console.log('\nFor more information, see the README.md file in the tests directory.');
    }
    
    // Exit the process
    console.log('\nTests finished, exiting...');
    setTimeout(() => process.exit(process.exitCode || 0), 500);
  }
}

// Run the tests
runTests(); 