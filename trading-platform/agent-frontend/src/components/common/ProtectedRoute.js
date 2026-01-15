import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAgentAuthenticated, isAdmin } from '../../services/auth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuth = isAgentAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;