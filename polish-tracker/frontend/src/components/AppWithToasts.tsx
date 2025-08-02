import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import Layout from './Layout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CollectionPage from '../pages/CollectionPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SettingsPage from '../pages/SettingsPage';
import AuthCallback from './AuthCallback';
import LoadingSpinner from './LoadingSpinner';
import ToastContainer from './ToastContainer';

const AppWithToasts: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toasts, removeToast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        {user ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default AppWithToasts;