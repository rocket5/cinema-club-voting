import React from 'react';
import { useNavigate } from 'react-router-dom';

function SessionsList({ sessions, loading, error, isHostMode }) {
    const navigate = useNavigate();
    
    if (loading) {
        return <div className="loading">Loading sessions...</div>;
    }
    
    if (error) {
        return <div className="error">Error: {error}</div>;
    }
    
    if (!sessions || sessions.length === 0) {
        return <div className="no-sessions">No sessions available</div>;
    }
    
    const formatDate = (dateValue) => {
        // If null or undefined, return unknown
        if (dateValue === null || dateValue === undefined) {
            return 'Unknown date';
        }
        
        try {
            // Now convert to string if it's not already
            const dateString = typeof dateValue === 'string' 
                ? dateValue 
                : String(dateValue);
                
            // Handle empty string
            if (!dateString.trim()) {
                return 'Unknown date';
            }
            
            // Try to parse as ISO string or other format
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (err) {
            console.error('Error formatting date:', err);
            return 'Unknown date';
        }
    };
    
    const handleSessionClick = (sessionId) => {
        navigate(`/session/${sessionId}`);
    };
    
    return (
        <div className="sessions-list">
            <h2>{isHostMode ? 'Manage Sessions' : 'Available Sessions'}</h2>
            {sessions.map(session => {
                // Skip rendering if session is invalid
                if (!session || !session.id) {
                    return null;
                }
                
                return (
                    <div 
                        key={session.id} 
                        className="session-card"
                        onClick={() => handleSessionClick(session.id)}
                    >
                        <div className="session-info">
                            <h3 className="session-title">
                                {session.sessionName || `Session ${session.id.substring(0, 8)}...`}
                            </h3>
                            <p className="session-meta">
                                Created: {formatDate(session.startDate || session.createdAt)}
                            </p>
                            <p className="session-creator text-muted small">
                                <strong>Created by:</strong> {session.displayName || 'Unknown User'}
                            </p>
                        </div>
                        <span className={`session-status status-${session.status || 'active'}`}>
                            {session.status || 'active'}
                        </span>
                        {isHostMode && (
                            <div className="session-host-actions">
                                <span className="manage-session-label">Manage Movies</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default SessionsList; 