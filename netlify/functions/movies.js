const { client, q } = require('./fauna-client');

exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event;

  console.log('Request method:', httpMethod);
  console.log('Request body:', body);
  console.log('Query parameters:', queryStringParameters);

  try {
    switch (httpMethod) {
      case 'GET':
        const sessionId = queryStringParameters?.sessionId;
        return await getMovies(sessionId);
      case 'POST':
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Request body is required' })
          };
        }
        const movieData = JSON.parse(body);
        if (!movieData.title || !movieData.sessionId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Title and sessionId are required' })
          };
        }
        return await createMovie(movieData);
      case 'PUT':
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Request body is required' })
          };
        }
        const { id, ...updateData } = JSON.parse(body);
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Movie ID is required' })
          };
        }
        return await updateMovie(id, updateData);
      case 'DELETE':
        const movieId = queryStringParameters?.id;
        if (!movieId) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Movie ID is required' })
          };
        }
        return await deleteMovie(movieId);
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: 'Error processing request'
      })
    };
  }
};

async function getMovies(sessionId) {
  try {
    let query;
    if (sessionId) {
      query = q.Map(
        q.Paginate(q.Match(q.Index('movies_by_session'), sessionId)),
        q.Lambda('ref', q.Get(q.Var('ref')))
      );
    } else {
      query = q.Map(
        q.Paginate(q.Documents(q.Collection('movies'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      );
    }

    const result = await client.query(query);
    return {
      statusCode: 200,
      body: JSON.stringify(result.data)
    };
  } catch (error) {
    console.error('Error getting movies:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function createMovie(data) {
    try {
      console.log('Creating movie with data:', JSON.stringify(data));
      
      // First, test a simple query
      try {
        const testResult = await client.query(
          q.Do(q.Get(q.Identity()))
        );
        console.log('Test query successful:', testResult);
      } catch (error) {
        console.error('Test query failed:', error);
      }
  
      // Then try the actual creation
      const result = await client.query(
        q.Create(
          q.Collection('movies'),
          {
            data: {
              sessionId: data.sessionId,
              title: data.title,
              description: data.description,
              imageUrl: data.imageUrl,
              addedBy: data.addedBy,
              addedAt: new Date().toISOString()
            }
          }
        )
      );
  
      console.log('Created movie result:', JSON.stringify(result));
      return {
        statusCode: 201,
        body: JSON.stringify(result)
      };
    } catch (error) {
      console.error('Error creating movie:', error);
      console.error('Error stack:', error.stack);
      console.error('Error description:', error.description);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: error.message,
          description: error.description,
          stack: error.stack
        })
      };
    }
  }
  
  

async function updateMovie(id, data) {
  try {
    const result = await client.query(
      q.Update(q.Ref(q.Collection('movies'), id), {
        data: {
          ...data,
          updatedAt: new Date().toISOString()
        }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error updating movie:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

async function deleteMovie(id) {
  try {
    const result = await client.query(
      q.Delete(q.Ref(q.Collection('movies'), id))
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error deleting movie:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
