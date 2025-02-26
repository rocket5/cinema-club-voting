require('dotenv').config();
const { Client } = require('fauna');

// Log environment info (without exposing secrets)
console.log('Node environment:', process.env.NODE_ENV);
console.log('FaunaDB key exists:', !!process.env.FAUNA_SECRET_KEY);

// Create a FaunaDB client instance with error handling
let client;
try {
  if (!process.env.FAUNA_SECRET_KEY) {
    throw new Error('FAUNA_SECRET_KEY environment variable is not set');
  }
  
  client = new Client({
    secret: process.env.FAUNA_SECRET_KEY,
    // Add timeout to prevent hanging connections
    timeout: 10000, // 10 seconds
  });
  
  console.log('FaunaDB client initialized successfully');
} catch (error) {
  console.error('Error initializing FaunaDB client:', error);
  // Create a dummy client that will throw a more helpful error when used
  client = {
    query: () => {
      throw new Error('FaunaDB client failed to initialize. Check environment variables and connection.');
    }
  };
}

module.exports = client; 