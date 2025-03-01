require('dotenv').config();
const faunadb = require('faunadb');
const q = faunadb.query;

// First, let's verify the secret key
console.log('Using Fauna secret key:', process.env.FAUNA_SECRET_KEY ? 'Key exists' : 'Key missing');

const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  domain: 'db.fauna.com',
  headers: {
    'X-Fauna-Version': '9'
  }
});

async function testFauna() {
  try {
    console.log('Testing Fauna connection...');

    // First, let's test if we can connect at all
    console.log('Testing basic connection...');
    const connectionTest = await client.query(
      q.Do(true)
    );
    console.log('Basic connection test result:', connectionTest);

    // Test if the collection exists
    console.log('\nChecking if movies collection exists...');
    try {
      const collectionExists = await client.query(
        q.Exists(q.Collection('movies'))
      );
      console.log('Movies collection exists:', collectionExists);
    } catch (error) {
      console.log('Collection check failed:', error.description);
    }

    // Only proceed with creation if previous tests pass
    const movieData = {
      title: "Test Movie",
      sessionId: "test-session-1",
      description: "A test movie",
      addedBy: "test-user"
    };

    console.log('\nAttempting to create a movie...');
    const createResult = await client.query(
      q.Create(
        q.Collection('movies'),
        { 
          data: movieData 
        }
      )
    );
    console.log('Created movie:', createResult);

  } catch (error) {
    console.error('Error:', error);
    console.error('Error details:', error.description || error.message);
  }
}

testFauna();
