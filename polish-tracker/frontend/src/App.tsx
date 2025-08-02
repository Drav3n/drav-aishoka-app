import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallback from './components/AuthCallback';
import LoadingSpinner from './components/LoadingSpinner';
import AppWithToasts from './components/AppWithToasts';

function App() {
  return (
    <ToastProvider>
      <AppWithToasts />
    </ToastProvider>
  );
}

export default App;