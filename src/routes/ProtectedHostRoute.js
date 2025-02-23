import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMode } from '../context/AppModeContext';
import { Navigate } from 'react-router-dom';

function ProtectedHostRoute({ children }) {
  const { isHostMode } = useAppMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isHostMode) {
      navigate('/');
    }
  }, [isHostMode, navigate]);

  return isHostMode ? children : null;
}

export default ProtectedHostRoute;
