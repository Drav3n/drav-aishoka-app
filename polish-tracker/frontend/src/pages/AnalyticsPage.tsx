import React from 'react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-semibold text-gray-900">$0.00</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
          <p className="text-2xl font-semibold text-gray-900">$0.00</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Most Used</h3>
          <p className="text-2xl font-semibold text-gray-900">--</p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500">Never Used</h3>
          <p className="text-2xl font-semibold text-gray-900">0</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Brand Distribution</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No data available</p>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Finish Types</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No data available</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Collection Growth</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;