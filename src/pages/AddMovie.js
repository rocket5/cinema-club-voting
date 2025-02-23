// src/pages/AddMovie.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AddMovie.css'; // Make sure this file exists

function AddMovie() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [addedBy, setAddedBy] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/.netlify/functions/add-movie', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    addedBy,
                    sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add movie');
            }

            navigate(`/session/${sessionId}`);
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    return (
        <div className="add-movie-container">
            <h1>Add New Movie</h1>
            <form onSubmit={handleSubmit} className="add-movie-form">
                <div className="form-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Added By:</label>
                    <input
                        type="text"
                        value={addedBy}
                        onChange={(e) => setAddedBy(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button type="submit" className="submit-button">Add Movie</button>
            </form>
        </div>
    );
}

export default AddMovie;
