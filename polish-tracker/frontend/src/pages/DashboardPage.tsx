import React, { useState, useEffect } from 'react';
import AddPolishModal from '../components/AddPolishModal';
import ViewAnalyticsModal from '../components/ViewAnalyticsModal';
import BrowseCollectionModal from '../components/BrowseCollectionModal';

interface DashboardStats {
  totalPolishes: number;
  collectionValue: number;
  favorites: number;
  brands: number;
}

const DashboardPage: React.FC = () => {
  const [isAddPolishModalOpen, setIsAddPolishModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPolishes: 0,
    collectionValue: 0,
    favorites: 0,
    brands: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch dashboard statistics
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in a real app, this would come from an API
        const mockStats: DashboardStats = {
          totalPolishes: 42,
          collectionValue: 315.50,
          favorites: 8,
          brands: 12
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Keep default values on error
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Polishes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.totalPolishes.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Collection Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? (
                  <span className="animate-pulse">$--</span>
                ) : (
                  formatCurrency(stats.collectionValue)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Favorites</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.favorites.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🏷️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Brands</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoadingStats ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats.brands.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
          <p className="text-sm mt-2">Start by adding some polishes to your collection!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            className="btn-primary p-4 text-left"
            onClick={() => setIsAddPolishModalOpen(true)}
          >
            <div className="text-lg mb-2">➕</div>
            <div className="font-medium">Add Polish</div>
            <div className="text-sm opacity-75">Add a new polish to your collection</div>
          </button>
          
          <button
            className="btn-secondary p-4 text-left"
            onClick={() => setIsAnalyticsModalOpen(true)}
          >
            <div className="text-lg mb-2">📊</div>
            <div className="font-medium">View Analytics</div>
            <div className="text-sm opacity-75">See insights about your collection</div>
          </button>
          
          <button
            className="btn-outline p-4 text-left"
            onClick={() => setIsBrowseModalOpen(true)}
          >
            <div className="text-lg mb-2">🔍</div>
            <div className="font-medium">Browse Collection</div>
            <div className="text-sm opacity-75">Explore your polish collection</div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddPolishModal
        isOpen={isAddPolishModalOpen}
        onClose={() => setIsAddPolishModalOpen(false)}
      />
      <ViewAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />
      <BrowseCollectionModal
        isOpen={isBrowseModalOpen}
        onClose={() => setIsBrowseModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;