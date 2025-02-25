const { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require('../movies');
const client = require('../client');

// Mock the FaunaDB client
jest.mock('../client', () => ({
  query: jest.fn()
}));

// Mock console.error
console.error = jest.fn();

describe('Movies FaunaDB Library', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getMovies', () => {
    it('should get all movies when no sessionId is provided', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', title: 'Movie 1', sessionId: 'session1' },
          { id: '2', title: 'Movie 2', sessionId: 'session2' }
        ]
      });

      const result = await getMovies();

      // Verify the result
      expect(result).toEqual([
        { id: '1', title: 'Movie 1', sessionId: 'session1' },
        { id: '2', title: 'Movie 2', sessionId: 'session2' }
      ]);

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should get movies filtered by sessionId when provided', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', title: 'Movie 1', sessionId: 'session1' }
        ]
      });

      const result = await getMovies('session1');

      // Verify the result
      expect(result).toEqual([
        { id: '1', title: 'Movie 1', sessionId: 'session1' }
      ]);

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      // Verify that the function throws an error
      await expect(getMovies()).rejects.toThrow('Failed to get movies: Query failed');
    });
  });

  describe('getMovieById', () => {
    it('should get a movie by ID', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: { id: '1', title: 'Movie 1', sessionId: 'session1' }
      });

      const result = await getMovieById('1');

      // Verify the result
      expect(result).toEqual({ id: '1', title: 'Movie 1', sessionId: 'session1' });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      // Verify that the function throws an error
      await expect(getMovieById('1')).rejects.toThrow('Failed to get movie by ID: Query failed');
    });
  });

  describe('createMovie', () => {
    it('should create a movie with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          title: 'New Movie',
          sessionId: 'session1',
          addedBy: 'user1',
          createdAt: '2023-01-01T00:00:00Z'
        }
      });

      const movieData = {
        title: 'New Movie',
        sessionId: 'session1',
        addedBy: 'user1'
      };

      const result = await createMovie(movieData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        title: 'New Movie',
        sessionId: 'session1',
        addedBy: 'user1',
        createdAt: '2023-01-01T00:00:00Z'
      });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when required fields are missing', async () => {
      const invalidData = {
        title: 'New Movie'
        // Missing sessionId and addedBy
      };

      // Verify that the function throws an error
      await expect(createMovie(invalidData)).rejects.toThrow(
        'Missing required fields: sessionId, title, and addedBy are required'
      );

      // Verify that client.query was not called
      expect(client.query).not.toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      const movieData = {
        title: 'New Movie',
        sessionId: 'session1',
        addedBy: 'user1'
      };

      // Verify that the function throws an error
      await expect(createMovie(movieData)).rejects.toThrow('Failed to create movie: Query failed');
    });
  });

  describe('updateMovie', () => {
    it('should update a movie with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          title: 'Updated Movie',
          sessionId: 'session1',
          addedBy: 'user1',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      });

      const movieData = {
        title: 'Updated Movie'
      };

      const result = await updateMovie('1', movieData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        title: 'Updated Movie',
        sessionId: 'session1',
        addedBy: 'user1',
        updatedAt: '2023-01-01T00:00:00Z'
      });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      const movieData = {
        title: 'Updated Movie'
      };

      // Verify that the function throws an error
      await expect(updateMovie('1', movieData)).rejects.toThrow('Failed to update movie: Query failed');
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie by ID', async () => {
      // Mock implementation
      client.query.mockResolvedValueOnce({ data: { id: '123', title: 'Test Movie' } });
      
      const result = await deleteMovie('123');
      
      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function)
        })
      );
      expect(result).toEqual({ id: '123', title: 'Test Movie' });
    });
    
    it('should handle errors when the query fails', async () => {
      // Mock implementation for error case
      const error = new Error('Query failed');
      client.query.mockRejectedValueOnce(error);
      
      await expect(deleteMovie('123')).rejects.toThrow('Failed to delete movie: Query failed');
      expect(console.error).toHaveBeenCalledWith('Error deleting movie:', error);
    });
  });
}); 