import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Login from '@/components/Login';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isUrdu, setIsUrdu] = useState(false);

  const handleLogin = async (user: any) => {
    // Save user to context (simulate)
    await login({ username: user.username, password: user.password || '' });
    // Redirect based on role
    if (user.role === 'admin') {
      navigate('/dashboard', { replace: true });
    } else if (user.role === 'pharmacist') {
      navigate('/dashboard', { replace: true });
    } else if (user.role === 'cashier') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return <Login onLogin={handleLogin} isUrdu={isUrdu} setIsUrdu={setIsUrdu} />;
}
