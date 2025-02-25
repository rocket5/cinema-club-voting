// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '../context/AppModeContext';
import SessionsList from '../components/SessionsList';
import DebugPanel from '../components/DebugPanel';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const { isHostMode } = useAppMode();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch sessions only in Vote mode
    useEffect(() => {
        if (!isHostMode) {
            fetchSessions();
        } else {
            // Reset state when switching to Host mode
            setSessions([]);
            setError(null);
        }
    }, [isHostMode]);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching sessions...');
            const response = await fetch('/.netlify/functions/get-sessions');
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text(); // Get raw text first
            console.log('Raw response:', text);
            
            let data;
            try {
                // Try to parse JSON
                data = JSON.parse(text);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                throw new Error(`Failed to parse response as JSON: ${text.substring(0, 100)}...`);
            }
            
            console.log('Parsed sessions data:', data);
            
            if (data && Array.isArray(data.sessions)) {
                setSessions(data.sessions);
            } else {
                console.warn('Unexpected data format:', data);
                setSessions([]);
            }
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(`${err.message}. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async () => {
        try {
            console.log('Creating new session...');
            const response = await fetch('/.netlify/functions/create-session', {
                method: 'POST'
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Session creation response:', data);

            if (data.sessionId) {
                console.log('Navigating to session:', data.sessionId);
                navigate(`/session/${data.sessionId}`);
            } else {
                console.error('No sessionId in response');
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleRetry = () => {
        fetchSessions();
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <h1>Welcome to Cinema Club Voting</h1>
                <p>
                    {isHostMode 
                        ? "You're in Host mode. Create a new voting session to get started." 
                        : "You're in Vote mode. Join an existing session to vote on movies."}
                </p>
            </div>

            {isHostMode ? (
                <button onClick={createSession} className="create-session-btn">
                    Create New Session
                </button>
            ) : (
                <>
                    {error && (
                        <div className="error-container">
                            <p>{error}</p>
                            <button onClick={handleRetry} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    )}
                    <SessionsList 
                        sessions={sessions} 
                        loading={loading} 
                        error={error} 
                    />
                </>
            )}
            
            {/* Only show debug panel in Host mode */}
            {isHostMode && <DebugPanel />}
        </div>
    );
}

export default Home;
