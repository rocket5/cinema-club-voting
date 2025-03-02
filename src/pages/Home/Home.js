// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '../../context/AppModeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase/client';
import SessionsList from '../../components/SessionsList/SessionsList';
import DebugPanel from '../../components/DebugPanel/DebugPanel';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const { isHostMode } = useAppMode();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorDetails, setErrorDetails] = useState(null);
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
        setErrorDetails(null);
        try {
            const response = await fetch('/.netlify/functions/get-sessions');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                
                let errorObj;
                try {
                    errorObj = JSON.parse(errorText);
                } catch (e) {
                    errorObj = { message: errorText };
                }
                
                throw new Error(`HTTP error! status: ${response.status}`, { cause: errorObj });
            }
            
            const data = await response.json();
            
            if (!data || !data.sessions) {
                throw new Error('Invalid response format');
            }
            
            setSessions(data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            setError('Failed to load sessions');
            setErrorDetails(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async () => {
        try {
            setNameError('');
            
            if (!sessionName.trim()) {
                setNameError('Session name is required');
                return;
            }

            // Check if user is authenticated
            if (!user) {
                setError('You must be logged in to create a session');
                return;
            }

            // Get the current session to extract the auth token
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !sessionData?.session?.access_token) {
                console.error('Error getting auth token:', sessionError);
                setError('Authentication error. Please try logging in again.');
                return;
            }

            const authToken = sessionData.session.access_token;
            console.log('Creating new session...');
            
            const response = await fetch('/.netlify/functions/create-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionName: sessionName,
                    createdBy: user.id, // Use the actual user ID
                    authToken: authToken // Pass the auth token
                })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Session creation response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create session');
            }

            // Close the modal and refresh sessions
            setSessionName('');
            setShowModal(false);
            fetchSessions();
            
            // Navigate to the new session
            if (data.sessionId) {
                navigate(`/session/${data.sessionId}`);
            }
        } catch (err) {
            console.error('Error creating session:', err);
            setError('Failed to create session');
            setErrorDetails(err.message);
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
                    {errorDetails && isHostMode && (
                        <div className="error-details">
                            <h4>Error Details (Debug):</h4>
                            <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
                        </div>
                    )}
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
