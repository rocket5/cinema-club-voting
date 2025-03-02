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
            // Check if dateValue is an object with a specific date property
            // This handles FaunaDB timestamp objects
            if (typeof dateValue === 'object' && dateValue !== null) {
                console.log('Date object properties:', Object.keys(dateValue));
                
                // Try to find a timestamp property
                if (dateValue.value) {
                    console.log('Found value property:', dateValue.value);
                    dateValue = dateValue.value;
                } else if (dateValue.timestamp) {
                    console.log('Found timestamp property:', dateValue.timestamp);
                    dateValue = dateValue.timestamp;
                } else if (dateValue.time) {
                    console.log('Found time property:', dateValue.time);
                    dateValue = dateValue.time;
                } else if (dateValue.isoString) {
                    console.log('Found isoString property:', dateValue.isoString);
                    dateValue = dateValue.isoString;
                } else {
                    // If we don't find a usable property, convert to ISO string if possible
                    try {
                        if (dateValue instanceof Date) {
                            return dateValue.toISOString();
                        } else {
                            console.warn('Unrecognized date object format:', dateValue);
                            return 'Unknown date format';
                        }
                    } catch (err) {
                        console.error('Error converting date object:', err);
                        return 'Unknown date';
                    }
                }
            }
            
            // If the value is a string that looks like JSON, try to parse it
            if (typeof dateValue === 'string' && 
                (dateValue.startsWith('{') || dateValue.startsWith('['))) {
                try {
                    console.log('Trying to parse JSON string:', dateValue);
                    const parsedValue = JSON.parse(dateValue);
                    
                    // Check if the parsed object has a date property
                    if (parsedValue && typeof parsedValue === 'object') {
                        if (parsedValue.isoString) {
                            console.log('Found isoString in parsed JSON:', parsedValue.isoString);
                            dateValue = parsedValue.isoString;
                        } else if (parsedValue.value) {
                            console.log('Found value in parsed JSON:', parsedValue.value);
                            dateValue = parsedValue.value;
                        } else if (parsedValue.timestamp) {
                            console.log('Found timestamp in parsed JSON:', parsedValue.timestamp);
                            dateValue = parsedValue.timestamp;
                        } else {
                            console.warn('JSON parsed but no date property found:', parsedValue);
                        }
                    }
                } catch (jsonError) {
                    console.warn('Failed to parse as JSON:', jsonError);
                    // Continue with the original value if parsing fails
                }
            }
            
            // Now convert to string if it's not already
            const dateString = typeof dateValue === 'string' 
                ? dateValue 
                : String(dateValue);
                
            console.log('Date value type after processing:', typeof dateValue);
            console.log('Date string after processing:', dateString);
            
            // Handle empty string
            if (!dateString.trim()) {
                return 'Unknown date';
            }
            
            // Try to parse as ISO string or other format
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date after processing:', dateString);
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
    
    // Debug log all sessions
    console.log('All sessions:', sessions);
    
    return (
        <div className="sessions-list">
            <h2>{isHostMode ? 'Manage Sessions' : 'Available Sessions'}</h2>
            {sessions.map(session => {
                // Skip rendering if session is invalid
                if (!session || !session.id) {
                    console.warn('Skipping invalid session:', session);
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
                                {session.hostUsername && (
                                    <span className="session-host">
                                        {' '}by {session.hostUsername}
                                    </span>
                                )}
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