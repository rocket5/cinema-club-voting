import React from 'react';
import { useVoting } from '../../context/VotingContext';
import './RankInput.css';

function RankInput({ movieId, totalMovies, currentRank, onRankChange }) {
  const { votes, setVote, isRankUsed } = useVoting();
  
  const handleRankChange = (e) => {
    const newRank = parseInt(e.target.value, 10);
    
    // If the rank is already used by another movie, show an alert
    if (newRank !== 0 && isRankUsed(newRank, movieId)) {
      alert(`Rank ${newRank} is already assigned to another movie. Each movie needs a unique rank.`);
      return;
    }
    
    // Set the vote in context
    const success = setVote(movieId, newRank);
    
    // Call the parent component's onRankChange if provided
    if (success && onRankChange) {
      onRankChange(movieId, newRank);
    }
  };
  
  // Use the rank from the voting context if available, otherwise use the currentRank prop
  const displayRank = votes[movieId] !== undefined ? votes[movieId] : (currentRank || 0);
  
  return (
    <div className="rank-input-container">
      <label className="form-label">Rank:</label>
      <select 
        className="form-select"
        value={displayRank}
        onChange={handleRankChange}
      >
        <option value="0">Select rank</option>
        {[...Array(totalMovies)].map((_, index) => {
          const rank = index + 1;
          const isUsed = isRankUsed(rank, movieId);
          
          return (
            <option 
              key={rank} 
              value={rank}
              disabled={isUsed}
            >
              {rank} {rank === totalMovies ? '(Best)' : rank === 1 ? '(Least)' : ''}
              {isUsed ? ' (Used)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default RankInput;
