const { getVotes, getVotesByUser, getVotesByMovie, createVote, updateVote, deleteVote } = require('../votes');
const client = require('../client');

// Mock the FaunaDB client
jest.mock('../client', () => ({
  query: jest.fn()
}));

// Mock console.error
console.error = jest.fn();

describe('Votes FaunaDB Library', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getVotes', () => {
    it('should get all votes when no sessionId is provided', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
          { id: '2', sessionId: 'session2', movieId: 'movie2', userId: 'user2', rank: 2 }
        ]
      });

      const result = await getVotes();

      // Verify the result
      expect(result).toEqual([
        { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
        { id: '2', sessionId: 'session2', movieId: 'movie2', userId: 'user2', rank: 2 }
      ]);

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should get votes filtered by sessionId when provided', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 }
        ]
      });

      const result = await getVotes('session1');

      // Verify the result
      expect(result).toEqual([
        { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 }
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
      await expect(getVotes()).rejects.toThrow('Failed to get votes: Query failed');
    });
  });

  describe('getVotesByUser', () => {
    it('should get votes by user ID', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
          { id: '3', sessionId: 'session3', movieId: 'movie3', userId: 'user1', rank: 3 }
        ]
      });

      const result = await getVotesByUser('user1');

      // Verify the result
      expect(result).toEqual([
        { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
        { id: '3', sessionId: 'session3', movieId: 'movie3', userId: 'user1', rank: 3 }
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
      await expect(getVotesByUser('user1')).rejects.toThrow('Failed to get votes by user: Query failed');
    });
  });

  describe('getVotesByMovie', () => {
    it('should get votes by movie ID', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
          { id: '4', sessionId: 'session1', movieId: 'movie1', userId: 'user2', rank: 2 }
        ]
      });

      const result = await getVotesByMovie('movie1');

      // Verify the result
      expect(result).toEqual([
        { id: '1', sessionId: 'session1', movieId: 'movie1', userId: 'user1', rank: 1 },
        { id: '4', sessionId: 'session1', movieId: 'movie1', userId: 'user2', rank: 2 }
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
      await expect(getVotesByMovie('movie1')).rejects.toThrow('Failed to get votes by movie: Query failed');
    });
  });

  describe('createVote', () => {
    it('should create a vote with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          sessionId: 'session1',
          movieId: 'movie1',
          userId: 'user1',
          rank: 1,
          votedAt: '2023-01-01T00:00:00Z'
        }
      });

      const voteData = {
        sessionId: 'session1',
        movieId: 'movie1',
        userId: 'user1',
        rank: 1
      };

      const result = await createVote(voteData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        sessionId: 'session1',
        movieId: 'movie1',
        userId: 'user1',
        rank: 1,
        votedAt: '2023-01-01T00:00:00Z'
      });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when required fields are missing', async () => {
      const invalidData = {
        sessionId: 'session1',
        movieId: 'movie1',
        userId: 'user1'
        // Missing rank
      };

      // Verify that the function throws an error
      await expect(createVote(invalidData)).rejects.toThrow(
        'Missing required fields: sessionId, movieId, userId, and rank are required'
      );

      // Verify that client.query was not called
      expect(client.query).not.toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      const voteData = {
        sessionId: 'session1',
        movieId: 'movie1',
        userId: 'user1',
        rank: 1
      };

      // Verify that the function throws an error
      await expect(createVote(voteData)).rejects.toThrow('Failed to create vote: Query failed');
    });
  });

  describe('updateVote', () => {
    it('should update a vote with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          sessionId: 'session1',
          movieId: 'movie1',
          userId: 'user1',
          rank: 2,
          updatedAt: '2023-01-01T00:00:00Z'
        }
      });

      const voteData = {
        rank: 2
      };

      const result = await updateVote('1', voteData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        sessionId: 'session1',
        movieId: 'movie1',
        userId: 'user1',
        rank: 2,
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

      const voteData = {
        rank: 2
      };

      // Verify that the function throws an error
      await expect(updateVote('1', voteData)).rejects.toThrow('Failed to update vote: Query failed');
    });
  });

  describe('deleteVote', () => {
    it('should delete a vote by ID', async () => {
      // Mock implementation
      client.query.mockResolvedValueOnce({ 
        data: { id: '123', movieId: 'movie1', userId: 'user1' } 
      });
      
      const result = await deleteVote('123');
      
      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function)
        })
      );
      expect(result).toEqual({ id: '123', movieId: 'movie1', userId: 'user1' });
    });
    
    it('should handle errors when the query fails', async () => {
      // Mock implementation for error case
      const error = new Error('Query failed');
      client.query.mockRejectedValueOnce(error);
      
      await expect(deleteVote('123')).rejects.toThrow('Failed to delete vote: Query failed');
      expect(console.error).toHaveBeenCalledWith('Error deleting vote:', error);
    });
  });
}); 