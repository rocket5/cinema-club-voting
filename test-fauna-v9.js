require('dotenv').config();
const { Client, fql } = require('fauna');

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY,
});

async function testFauna() {
  try {
    console.log('Testing Fauna connection...');

    // Test creating a movie
    const createResult = await client.query(fql`
      movies.create({
        sessionId: "test-session-1",
        title: "Test Movie",
        description: "A test movie",
        addedBy: "test-user"
      })
    `);
    console.log('Created movie:', createResult);

    // Test querying movies by session
    const queryResult = await client.query(fql`
      movies.firstWhere(.sessionId == "test-session-1")
    `);
    console.log('Query result:', queryResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

testFauna();
