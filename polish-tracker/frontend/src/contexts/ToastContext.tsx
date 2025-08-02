import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';

interface ToastContextType {
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  showWarning: (title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastHook = useToast();

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};