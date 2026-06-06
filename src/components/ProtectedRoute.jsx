import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  if (user === null) {
    // Optional: Could add a toast or alert here before redirecting
    // or navigate to a dedicated /login route
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
