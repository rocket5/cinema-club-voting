// src/pages/AddMovie.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddMovie.css';

function AddMovie() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/.netlify/functions/addmovie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          title,
          description,
          addedBy: 'User' // TODO: Replace with actual user info when authentication is added
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add movie');
      }

      const result = await response.json();
      console.log('Movie added:', result);
      
      // Navigate back to the session page
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error adding movie:', error);
      // TODO: Add proper error handling/user feedback
    }
  };

  return (
    <div className="add-movie-container">
      <h2>Add a Movie</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Movie Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Movie</button>
      </form>
    </div>
  );
}

export default AddMovie;
