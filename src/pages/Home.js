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
    const [showModal, setShowModal] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [nameError, setNameError] = useState('');

    // Fetch sessions in both Host and Vote mode
    useEffect(() => {
        fetchSessions();
    }, []);

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
                // Sort sessions by date (newest first)
                const sortedSessions = [...data.sessions].sort((a, b) => {
                    const dateA = new Date(a.startDate || a.createdAt || 0);
                    const dateB = new Date(b.startDate || b.createdAt || 0);
                    return dateB - dateA; // Descending order (newest first)
                });
                setSessions(sortedSessions);
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
            if (!sessionName.trim()) {
                setNameError('Session name is required');
                return;
            }

            console.log('Creating new session...');
            const response = await fetch('/.netlify/functions/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionName: sessionName,
                    createdBy: 'host' // You might want to replace this with actual user ID if available
                })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Session creation response:', data);

            if (data.sessionId) {
                console.log('Navigating to session:', data.sessionId);
                // Reset form state
                setSessionName('');
                setShowModal(false);
                navigate(`/session/${data.sessionId}`);
            } else {
                console.error('No sessionId in response');
            }
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setNameError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSessionName('');
        setNameError('');
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
                        ? "You're in Host mode. Create a new voting session or manage existing ones." 
                        : "You're in Vote mode. Join an existing session to vote on movies."}
                </p>
            </div>

            {isHostMode && (
                <button onClick={handleOpenModal} className="create-session-btn">
                    Create New Session
                </button>
            )}

            {/* Session Creation Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Session</h2>
                        <div className="form-group">
                            <label htmlFor="sessionName">Session Name (required)</label>
                            <input
                                type="text"
                                id="sessionName"
                                value={sessionName}
                                onChange={(e) => {
                                    setSessionName(e.target.value);
                                    if (e.target.value.trim()) {
                                        setNameError('');
                                    }
                                }}
                                placeholder="Enter a name for your session"
                                className={nameError ? 'input-error' : ''}
                            />
                            {nameError && <p className="error-message">{nameError}</p>}
                        </div>
                        <div className="modal-actions">
                            <button onClick={handleCloseModal} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={createSession} className="create-btn">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                isHostMode={isHostMode} 
            />
            
            {/* Only show debug panel in Host mode */}
            {isHostMode && <DebugPanel />}
        </div>
    );
}

export default Home;
