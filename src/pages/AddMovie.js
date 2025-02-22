import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddMovie() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    description: '',
    imageUrl: '',
    director: '',
    genre: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.title || !formData.releaseYear || !formData.description) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // For now, we'll just console.log the data
      // Later, we'll implement the API call
      console.log('Submitting movie:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and redirect
      setFormData({
        title: '',
        releaseYear: '',
        description: '',
        imageUrl: '',
        director: '',
        genre: ''
      });
      navigate('/');
    } catch (err) {
      setError('Failed to add movie. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Add New Movie</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="needs-validation">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title *</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="releaseYear" className="form-label">Release Year *</label>
          <input
            type="number"
            className="form-control"
            id="releaseYear"
            name="releaseYear"
            value={formData.releaseYear}
            onChange={handleChange}
            min="1888"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description *</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="imageUrl" className="form-label">Image URL</label>
          <input
            type="url"
            className="form-control"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/movie-image.jpg"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="director" className="form-label">Director</label>
          <input
            type="text"
            className="form-control"
            id="director"
            name="director"
            value={formData.director}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="genre" className="form-label">Genre</label>
          <input
            type="text"
            className="form-control"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Movie...' : 'Add Movie'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMovie;
