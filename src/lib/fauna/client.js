require('dotenv').config();
const { Client } = require('fauna');

// Create a FaunaDB client instance
const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

module.exports = client; 