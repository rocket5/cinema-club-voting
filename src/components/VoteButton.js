import React, { useState } from 'react';

function VoteButton({ movieId, votes: initialVotes }) {
  const [votes, setVotes] = useState(initialVotes);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async () => {
    if (hasVoted) return;

    setIsVoting(true);
    try {
      // Simulate API call - we'll implement the real API call later
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVotes(prev => prev + 1);
      setHasVoted(true);

      // Store voted status in localStorage
      const votedMovies = JSON.parse(localStorage.getItem('votedMovies') || '[]');
      localStorage.setItem('votedMovies', JSON.stringify([...votedMovies, movieId]));

    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  // Check if user has already voted when component mounts
  React.useEffect(() => {
    const votedMovies = JSON.parse(localStorage.getItem('votedMovies') || '[]');
    if (votedMovies.includes(movieId)) {
      setHasVoted(true);
    }
  }, [movieId]);

  return (
    <button
      className={`btn ${hasVoted ? 'btn-success' : 'btn-outline-success'}`}
      onClick={handleVote}
      disabled={isVoting || hasVoted}
    >
      <span className="me-1">👍</span>
      {votes}
      {isVoting && (
        <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
      )}
    </button>
  );
}

export default VoteButton;
