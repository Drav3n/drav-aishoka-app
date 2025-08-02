import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const initAuth = async () => {
      const savedToken = localStorage.getItem('polish_tracker_token');
      
      if (savedToken) {
        try {
          // Verify token and get user info
          const userData = await authService.getCurrentUser(savedToken);
          setToken(savedToken);
          setUser(userData);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('polish_tracker_token');
          console.error('Token validation failed:', error);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('polish_tracker_token', newToken);
    
    // Get user info with the new token
    authService.getCurrentUser(newToken)
      .then(userData => {
        setUser(userData);
      })
      .catch(error => {
        console.error('Failed to get user info:', error);
        logout();
      });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('polish_tracker_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};