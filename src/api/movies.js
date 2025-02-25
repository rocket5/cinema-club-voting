const API_ENDPOINT = '/.netlify/functions';

export const getMovies = async (sessionId = null) => {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  try {
    const response = await fetch(`${API_ENDPOINT}/get-movies?sessionId=${sessionId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch movies');
    }
    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const getMovie = async (id) => {
  if (!id) {
    throw new Error('Movie ID is required');
  }
  
  try {
    const response = await fetch(`${API_ENDPOINT}/get-movie?id=${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch movie');
    }
    const data = await response.json();
    return data.movie;
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw error;
  }
};

export const createMovie = async (movieData) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/add-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create movie');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating movie:', error);
    throw error;
  }
};

export const updateMovie = async (id, movieData) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/update-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...movieData }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update movie');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
};

export const deleteMovie = async (id) => {
  try {
    const response = await fetch(`${API_ENDPOINT}/delete-movie?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete movie');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
};

export const deleteAllMovies = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/delete-all-movies`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete all movies');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting all movies:', error);
    throw error;
  }
};

export const getSessionMovies = async (sessionId) => {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  try {
    const response = await fetch(`${API_ENDPOINT}/get-session-movies?sessionId=${sessionId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch session movies');
    }
    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error('Error fetching session movies:', error);
    throw error;
  }
};
