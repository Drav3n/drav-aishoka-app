import React from 'react';

const DashboardPage: React.FC = () => {
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
              <p className="text-2xl font-semibold text-gray-900">--</p>
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
              <p className="text-2xl font-semibold text-gray-900">$--</p>
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
              <p className="text-2xl font-semibold text-gray-900">--</p>
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
              <p className="text-2xl font-semibold text-gray-900">--</p>
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
          <button className="btn-primary p-4 text-left">
            <div className="text-lg mb-2">➕</div>
            <div className="font-medium">Add Polish</div>
            <div className="text-sm opacity-75">Add a new polish to your collection</div>
          </button>
          
          <button className="btn-secondary p-4 text-left">
            <div className="text-lg mb-2">📊</div>
            <div className="font-medium">View Analytics</div>
            <div className="text-sm opacity-75">See insights about your collection</div>
          </button>
          
          <button className="btn-outline p-4 text-left">
            <div className="text-lg mb-2">🔍</div>
            <div className="font-medium">Browse Collection</div>
            <div className="text-sm opacity-75">Explore your polish collection</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;