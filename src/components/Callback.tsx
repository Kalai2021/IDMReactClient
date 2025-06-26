import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import customAuthService from '../services/customAuthService';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { clearUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (handledRef.current) return;
      handledRef.current = true;
      try {
        const user = await customAuthService.signinRedirectCallback();
        console.log('Authentication successful:', user);
        //navigate('/dashboard');
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Authentication callback error:', error);
        setError('Authentication failed. Please try again.');
        clearUser();
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };
    handleCallback();
    return () => { handledRef.current = true; };
  }, [navigate, clearUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-2 text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-gray-600">Please wait while we complete your sign-in.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Callback; 