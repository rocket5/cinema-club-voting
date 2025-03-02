import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from './AuthContext';
import * as votesService from '../lib/supabase/votes';

const VotingContext = createContext();

export function VotingProvider({ children }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionMovies, setSessionMovies] = useState([]);
  const [votingError, setVotingError] = useState(null);
  
  // Check if all movies have been ranked
  const allMoviesRanked = () => {
    if (!sessionMovies || sessionMovies.length === 0) return false;
    
    // Check if we have a vote for each movie
    return sessionMovies.every(movie => votes[movie.id] !== undefined);
  };
  
  // Check if a rank is already used by another movie
  const isRankUsed = (rank, movieId) => {
    return Object.entries(votes).some(([id, r]) => r === rank && id !== movieId);
  };
  
  // Set a vote for a movie
  const setVote = (movieId, rank) => {
    // If rank is already used by another movie, don't allow it
    if (isRankUsed(rank, movieId)) {
      return false;
    }
    
    setVotes(prev => ({...prev, [movieId]: rank}));
    return true;
  };
  
  // Submit votes to database
  const submitVotes = async (sessionId) => {
    if (!allMoviesRanked() || !user) {
      setVotingError('All movies must be ranked before submitting');
      return false;
    }
    
    setIsSubmitting(true);
    setVotingError(null);
    
    try {
      console.log('Preparing to submit votes for session:', sessionId);
      console.log('Current user:', user);
      
      // First try to submit votes using the Netlify function
      const votesToSubmit = Object.entries(votes).map(([movieId, rank]) => ({
        movieId,
        rank
      }));
      
      console.log('Votes to submit:', votesToSubmit);
      
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      // Prepare headers with authentication if available
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using token for authentication');
      } else {
        console.log('No token available, relying on user ID only');
      }
      
      // Prepare the request body
      const requestBody = {
        sessionId,
        votes: votesToSubmit,
        userId: user.id // Include the user ID in the request
      };
      
      console.log('Submitting votes with request body:', requestBody);
      
      // Submit votes to the Netlify function
      const response = await fetch('/.netlify/functions/submit-votes', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('Error response from submit-votes:', errorData);
          errorMessage = errorData.error || errorData.details || 'Failed to submit votes';
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log('Votes submitted successfully:', responseData);
      
      return true;
    } catch (error) {
      console.error('Error submitting votes:', error);
      setVotingError(error.message || 'Failed to submit votes');
      
      // Fallback to direct database submission if the Netlify function fails
      try {
        console.log('Falling back to direct database submission');
        // Delete any existing votes from this user for this session
        await votesService.deleteVotesByUserAndSession(user.id, sessionId);
        
        // Insert new votes
        const votesToInsert = Object.entries(votes).map(([movieId, rank]) => ({
          sessionId: sessionId,
          movieId: movieId,
          userId: user.id,
          rank: rank
        }));
        
        console.log('Inserting votes directly:', votesToInsert);
        
        // Use Promise.all to insert all votes in parallel
        await Promise.all(votesToInsert.map(vote => votesService.createVote(vote)));
        
        console.log('Direct vote submission successful');
        setVotingError(null); // Clear error since fallback succeeded
        return true;
      } catch (fallbackError) {
        console.error('Fallback submission also failed:', fallbackError);
        setVotingError(fallbackError.message || 'Failed to submit votes');
        return false;
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Load existing votes for a session
  const loadVotes = async (sessionId) => {
    if (!user) return;
    
    try {
      const userVotes = await votesService.getVotesByUserAndSession(user.id, sessionId);
      
      const loadedVotes = {};
      userVotes.forEach(vote => {
        loadedVotes[vote.movieId] = vote.rank;
      });
      
      setVotes(loadedVotes);
    } catch (error) {
      console.error('Error loading votes:', error);
      setVotingError(error.message || 'Failed to load votes');
    }
  };
  
  // Set the current session's movies
  const setMovies = (movies) => {
    setSessionMovies(movies);
  };
  
  // Clear votes (e.g., when changing sessions)
  const clearVotes = () => {
    setVotes({});
    setSessionMovies([]);
    setVotingError(null);
  };
  
  // Reset voting error
  const resetVotingError = () => {
    setVotingError(null);
  };
  
  return (
    <VotingContext.Provider value={{
      votes,
      setVote,
      submitVotes,
      loadVotes,
      clearVotes,
      setMovies,
      allMoviesRanked,
      isRankUsed,
      isSubmitting,
      votingError,
      resetVotingError
    }}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
} 