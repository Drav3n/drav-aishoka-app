import React, { useState } from 'react';
import { useToastContext } from '../contexts/ToastContext';

const SettingsPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToastContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      showSuccess(
        'Data Exported Successfully!',
        'Your collection data has been exported and downloaded.'
      );
    } catch (error) {
      showError(
        'Export Failed',
        'Failed to export your collection data. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random success/failure
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        showWarning(
          'All Data Deleted',
          'Your collection data has been permanently deleted.'
        );
      } else {
        throw new Error('Database error occurred');
      }
    } catch (error) {
      showError(
        'Delete Failed',
        'Failed to delete your data. Please try again or contact support.'
      );
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input type="text" className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input type="email" className="input" placeholder="your@email.com" disabled />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default View
            </label>
            <select className="input">
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per Page
            </label>
            <select className="input">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Data Management</h2>
        <div className="space-y-4">
          <button
            className="btn-secondary"
            onClick={handleExportData}
            disabled={isExporting || isDeleting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export Collection Data'
            )}
          </button>
          <button
            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDeleteAllData}
            disabled={isExporting || isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete All Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;