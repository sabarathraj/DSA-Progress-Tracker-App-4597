import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthForm from './AuthForm';
import LoadingSpinner from './LoadingSpinner';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Initializing your workspace..." />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return children;
};

export default AuthGuard;