import React, { useState, useEffect } from 'react';

function RankInput({ movieId, totalMovies, currentRank, onRankChange }) {
  // Remove local state and use currentRank directly from props
  return (
    <div className="rank-input-container">
      <label className="form-label">Rank:</label>
      <select 
        className="form-select"
        value={currentRank || 0}  // Use 0 as default when currentRank is null/undefined
        onChange={(e) => onRankChange(movieId, parseInt(e.target.value))}
      >
        <option value="0">Select rank</option>
        {[...Array(totalMovies)].map((_, index) => (
          <option key={index + 1} value={index + 1}>
            {index + 1} {index + 1 === totalMovies ? '(Best)' : index === 0 ? '(Least)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RankInput;
