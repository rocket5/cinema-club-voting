import React, { useState } from 'react';
import './DebugPanel.css';

function DebugPanel() {
    const [moviesDeleteStatus, setMoviesDeleteStatus] = useState(null);
    const [sessionsDeleteStatus, setSessionsDeleteStatus] = useState(null);
    const [loading, setLoading] = useState({
        movies: false,
        sessions: false
    });
    const [expanded, setExpanded] = useState(false);

    const handleDeleteAllMovies = async () => {
        if (!window.confirm('Are you sure you want to delete ALL movies? This cannot be undone!')) {
            return;
        }
        
        setLoading(prev => ({ ...prev, movies: true }));
        setMoviesDeleteStatus(null);
        
        try {
            const response = await fetch('/.netlify/functions/delete-all-movies', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setMoviesDeleteStatus({
                    success: true,
                    message: data.message
                });
            } else {
                setMoviesDeleteStatus({
                    success: false,
                    message: data.message || 'An error occurred while deleting movies'
                });
            }
        } catch (error) {
            console.error('Error deleting all movies:', error);
            setMoviesDeleteStatus({
                success: false,
                message: error.message || 'Failed to delete movies'
            });
        } finally {
            setLoading(prev => ({ ...prev, movies: false }));
        }
    };

    const handleDeleteAllSessions = async () => {
        if (!window.confirm('Are you sure you want to delete ALL sessions? This cannot be undone!')) {
            return;
        }
        
        setLoading(prev => ({ ...prev, sessions: true }));
        setSessionsDeleteStatus(null);
        
        try {
            const response = await fetch('/.netlify/functions/delete-all-sessions', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSessionsDeleteStatus({
                    success: true,
                    message: data.message
                });
            } else {
                setSessionsDeleteStatus({
                    success: false,
                    message: data.message || 'An error occurred while deleting sessions'
                });
            }
        } catch (error) {
            console.error('Error deleting all sessions:', error);
            setSessionsDeleteStatus({
                success: false,
                message: error.message || 'Failed to delete sessions'
            });
        } finally {
            setLoading(prev => ({ ...prev, sessions: false }));
        }
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={`debug-panel ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="debug-panel-header" onClick={toggleExpanded}>
                <h3>Debug Tools {expanded ? '▼' : '▶'}</h3>
            </div>
            
            {expanded && (
                <div className="debug-panel-content">
                    <div className="debug-section">
                        <h4>Database Operations</h4>
                        <div className="debug-buttons">
                            <button 
                                className="btn btn-danger" 
                                onClick={handleDeleteAllMovies}
                                disabled={loading.movies}
                            >
                                {loading.movies ? 'Deleting...' : 'Delete All Movies'}
                            </button>
                            
                            <button 
                                className="btn btn-danger" 
                                onClick={handleDeleteAllSessions}
                                disabled={loading.sessions}
                            >
                                {loading.sessions ? 'Deleting...' : 'Delete All Sessions'}
                            </button>
                        </div>
                        
                        {moviesDeleteStatus && (
                            <div className={`alert ${moviesDeleteStatus.success ? 'alert-success' : 'alert-danger'}`}>
                                {moviesDeleteStatus.message}
                            </div>
                        )}
                        
                        {sessionsDeleteStatus && (
                            <div className={`alert ${sessionsDeleteStatus.success ? 'alert-success' : 'alert-danger'}`}>
                                {sessionsDeleteStatus.message}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DebugPanel; 