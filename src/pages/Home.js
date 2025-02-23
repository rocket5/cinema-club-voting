// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

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

    return (
        <div className="home-container">
            <h1>Welcome to Cinema Club Voting</h1>
            <button onClick={createSession}>Create New Session</button>
        </div>
    );
}

export default Home;
