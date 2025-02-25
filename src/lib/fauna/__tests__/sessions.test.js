const { getSessions, getSessionById, createSession, updateSession, deleteSession } = require('../sessions');
const client = require('../client');

// Mock the FaunaDB client
jest.mock('../client', () => ({
  query: jest.fn()
}));

// Mock console.error
console.error = jest.fn();

describe('Sessions FaunaDB Library', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSessions', () => {
    it('should get all sessions', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: [
          { id: '1', startDate: '2023-01-01', hostId: 'host1', status: 'active' },
          { id: '2', startDate: '2023-01-02', hostId: 'host2', status: 'pending' }
        ]
      });

      const result = await getSessions();

      // Verify the result
      expect(result).toEqual([
        { id: '1', startDate: '2023-01-01', hostId: 'host1', status: 'active' },
        { id: '2', startDate: '2023-01-02', hostId: 'host2', status: 'pending' }
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
      await expect(getSessions()).rejects.toThrow('Failed to get sessions: Query failed');
    });
  });

  describe('getSessionById', () => {
    it('should get a session by ID', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: { id: '1', startDate: '2023-01-01', hostId: 'host1', status: 'active' }
      });

      const result = await getSessionById('1');

      // Verify the result
      expect(result).toEqual({ id: '1', startDate: '2023-01-01', hostId: 'host1', status: 'active' });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      // Verify that the function throws an error
      await expect(getSessionById('1')).rejects.toThrow('Failed to get session by ID: Query failed');
    });
  });

  describe('createSession', () => {
    it('should create a session with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          startDate: '2023-01-01',
          hostId: 'host1',
          status: 'active',
          createdAt: '2023-01-01T00:00:00Z'
        }
      });

      const sessionData = {
        startDate: '2023-01-01',
        hostId: 'host1',
        status: 'active'
      };

      const result = await createSession(sessionData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        startDate: '2023-01-01',
        hostId: 'host1',
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z'
      });

      // Verify that client.query was called with the correct query
      expect(client.query).toHaveBeenCalledTimes(1);
      // We can't easily check the exact FQL template, but we can check it was called
      expect(client.query).toHaveBeenCalled();
    });

    it('should throw an error when required fields are missing', async () => {
      const invalidData = {
        startDate: '2023-01-01'
        // Missing hostId and status
      };

      // Verify that the function throws an error
      await expect(createSession(invalidData)).rejects.toThrow(
        'Missing required fields: startDate, hostId, and status are required'
      );

      // Verify that client.query was not called
      expect(client.query).not.toHaveBeenCalled();
    });

    it('should throw an error when the query fails', async () => {
      // Mock the client.query to throw an error
      client.query.mockRejectedValueOnce(new Error('Query failed'));

      const sessionData = {
        startDate: '2023-01-01',
        hostId: 'host1',
        status: 'active'
      };

      // Verify that the function throws an error
      await expect(createSession(sessionData)).rejects.toThrow('Failed to create session: Query failed');
    });
  });

  describe('updateSession', () => {
    it('should update a session with valid data', async () => {
      // Mock the client.query response
      client.query.mockResolvedValueOnce({
        data: {
          id: '1',
          startDate: '2023-01-01',
          hostId: 'host1',
          status: 'completed',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      });

      const sessionData = {
        status: 'completed'
      };

      const result = await updateSession('1', sessionData);

      // Verify the result
      expect(result).toEqual({
        id: '1',
        startDate: '2023-01-01',
        hostId: 'host1',
        status: 'completed',
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

      const sessionData = {
        status: 'completed'
      };

      // Verify that the function throws an error
      await expect(updateSession('1', sessionData)).rejects.toThrow('Failed to update session: Query failed');
    });
  });

  describe('deleteSession', () => {
    it('should delete a session by ID', async () => {
      // Mock implementation
      client.query.mockResolvedValueOnce({ data: { id: '123', startDate: '2023-01-01' } });
      
      const result = await deleteSession('123');
      
      expect(client.query).toHaveBeenCalledWith(
        expect.objectContaining({
          toString: expect.any(Function)
        })
      );
      expect(result).toEqual({ id: '123', startDate: '2023-01-01' });
    });
    
    it('should handle errors when the query fails', async () => {
      // Mock implementation for error case
      const error = new Error('Query failed');
      client.query.mockRejectedValueOnce(error);
      
      await expect(deleteSession('123')).rejects.toThrow('Failed to delete session: Query failed');
      expect(console.error).toHaveBeenCalledWith('Error deleting session:', error);
    });
  });
}); 