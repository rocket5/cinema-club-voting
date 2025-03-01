import React from 'react';
import { Link } from 'react-router-dom';
import './EmailConfirmation.css';

function EmailConfirmation() {
  return (
    <div className="email-confirmation-container">
      <div className="email-confirmation-card">
        <div className="email-icon">
          <i className="fas fa-envelope"></i>
        </div>
        
        <h2>Check Your Email</h2>
        
        <p className="confirmation-message">
          We've sent a confirmation link to your email address.
        </p>
        
        <p className="instructions">
          Please check your inbox and click the link to activate your account.
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="what-next">
          <h3>What's Next?</h3>
          <ul>
            <li>Confirm your email by clicking the link we sent you</li>
            <li>Once confirmed, you can log in to your account</li>
            <li>Start enjoying Cinema Club with your friends!</li>
          </ul>
        </div>
        
        <div className="action-links">
          <Link to="/login" className="login-link">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmation; 