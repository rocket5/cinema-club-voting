/**
 * Manual Test Runner for Supabase Authentication
 * This script allows for manual testing of Supabase authentication functions
 * with real credentials.
 * 
 * Usage:
 * 1. Update the EMAIL and PASSWORD constants with real credentials
 * 2. Run this script with Node.js: node run-auth-tests.js
 * 3. View the test results in the console
 */

// Import the auth service
const authService = require('../../services/auth.service').default;

// Test credentials - replace with real credentials provided by the user
const EMAIL = 'test@example.com'; // Replace with real email
const PASSWORD = 'password123';    // Replace with real password

// Test runner
async function runTests() {
  console.log('=== Supabase Authentication Manual Tests ===');
  console.log(`Using email: ${EMAIL}`);
  
  try {
    // Test 1: Sign In
    console.log('\n--- Test 1: Sign In ---');
    const signInResult = await authService.signIn({ email: EMAIL, password: PASSWORD });
    if (signInResult.error) {
      console.error('❌ Sign In Failed:', signInResult.error);
    } else {
      console.log('✅ Sign In Successful!');
      console.log(`User ID: ${signInResult.data.user.id}`);
      console.log(`Email: ${signInResult.data.user.email}`);
      
      // Get user session
      console.log('\n--- Test 2: Get Session ---');
      const sessionResult = await authService.getSession();
      if (sessionResult.error) {
        console.error('❌ Get Session Failed:', sessionResult.error);
      } else {
        console.log('✅ Session Retrieved!');
        console.log(`User ID from session: ${sessionResult.data.session?.user?.id}`);
      }
      
      // Get user profile
      console.log('\n--- Test 3: Get User Profile ---');
      const userId = signInResult.data.user.id;
      const profileResult = await authService.getUserProfile(userId);
      if (profileResult.error) {
        console.error('❌ Get Profile Failed:', profileResult.error);
      } else {
        console.log('✅ Profile Retrieved!');
        console.log('Profile Data:', profileResult.data);
        
        // Update user profile
        console.log('\n--- Test 4: Update User Profile ---');
        const updateData = {
          name: `Test User ${new Date().toISOString()}`,
          is_host: false
        };
        const updateResult = await authService.updateUserProfile(userId, updateData);
        if (updateResult.error) {
          console.error('❌ Update Profile Failed:', updateResult.error);
        } else {
          console.log('✅ Profile Updated!');
          console.log('Updated with:', updateData);
          
          // Verify the update
          const verifyResult = await authService.getUserProfile(userId);
          console.log('Updated Profile:', verifyResult.data);
        }
      }
      
      // Sign out
      console.log('\n--- Test 5: Sign Out ---');
      const signOutResult = await authService.signOut();
      if (!signOutResult.success) {
        console.error('❌ Sign Out Failed:', signOutResult.error);
      } else {
        console.log('✅ Sign Out Successful!');
        console.log('Message:', signOutResult.message || 'User signed out');
        
        // Verify signed out
        const checkSession = await authService.getSession();
        console.log('Session after sign out:', checkSession.data.session ? 'Still active' : 'No active session');
        if (!checkSession.data.session) {
          console.log('✅ Session correctly removed after sign out');
        } else {
          console.error('❌ Session still exists after sign out');
        }
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error during tests:', error);
  }
  
  console.log('\n=== Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
}); 