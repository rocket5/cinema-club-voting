const API_ENDPOINT = '/.netlify/functions';

export const getMovies = async (sessionId = null) => {
  const url = sessionId 
    ? `${API_ENDPOINT}/movies?sessionId=${sessionId}`
    : `${API_ENDPOINT}/movies`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch movies');
  return response.json();
};

export const createMovie = async (movieData) => {
  const response = await fetch(`${API_ENDPOINT}/movies`, {
    method: 'POST',
    body: JSON.stringify(movieData),
  });
  if (!response.ok) throw new Error('Failed to create movie');
  return response.json();
};

export const updateMovie = async (id, movieData) => {
  const response = await fetch(`${API_ENDPOINT}/movies`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...movieData }),
  });
  if (!response.ok) throw new Error('Failed to update movie');
  return response.json();
};

export const deleteMovie = async (id) => {
  const response = await fetch(`${API_ENDPOINT}/movies?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete movie');
  return response.json();
};
