import React from 'react';
import { LoginForm } from '../../components/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export const Login = () => {
  const { login } = useAuth();

  return <LoginForm onSubmit={login} />;
};
