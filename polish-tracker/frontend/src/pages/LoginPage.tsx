import React from 'react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleDevLogin = async () => {
    try {
      const { token } = await authService.devLogin();
      login(token);
    } catch (error) {
      console.error('Dev login failed:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  const handleGitHubLogin = () => {
    window.location.href = authService.getGitHubLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Polish Tracker</h1>
          <p className="text-gray-600">Organize your nail polish collection</p>
        </div>

        <div className="space-y-4">
          {authService.isDevMode() && (
            <button
              onClick={handleDevLogin}
              className="w-full btn-primary py-3 text-lg"
            >
              🚀 Dev Login
            </button>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full btn-outline py-3 text-lg flex items-center justify-center space-x-2"
          >
            <span>🔍</span>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGitHubLogin}
            className="w-full btn-outline py-3 text-lg flex items-center justify-center space-x-2"
          >
            <span>🐙</span>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Secure authentication powered by OAuth 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;