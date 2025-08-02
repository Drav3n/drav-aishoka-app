import React from 'react';
import Modal from './Modal';

interface ViewAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewAnalyticsModal: React.FC<ViewAnalyticsModalProps> = ({ isOpen, onClose }) => {
  // Mock data for analytics - in a real app, this would come from an API
  const analyticsData = {
    totalPolishes: 42,
    totalValue: 315.50,
    favoriteFinish: 'Shimmer',
    mostExpensive: { name: 'Diamond Dust', brand: 'Luxury Nails', price: 45.00 },
    recentPurchases: 3,
    brandBreakdown: [
      { brand: 'OPI', count: 15, percentage: 35.7 },
      { brand: 'Essie', count: 12, percentage: 28.6 },
      { brand: 'Sally Hansen', count: 8, percentage: 19.0 },
      { brand: 'Others', count: 7, percentage: 16.7 }
    ],
    finishBreakdown: [
      { finish: 'Shimmer', count: 18, percentage: 42.9 },
      { finish: 'Cream', count: 12, percentage: 28.6 },
      { finish: 'Glitter', count: 6, percentage: 14.3 },
      { finish: 'Matte', count: 4, percentage: 9.5 },
      { finish: 'Magnetic', count: 2, percentage: 4.8 }
    ]
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collection Analytics" size="xl">
      <div className="space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{analyticsData.totalPolishes}</div>
            <div className="text-sm text-gray-600">Total Polishes</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-green-600">${analyticsData.totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Collection Value</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{analyticsData.favoriteFinish}</div>
            <div className="text-sm text-gray-600">Favorite Finish</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{analyticsData.recentPurchases}</div>
            <div className="text-sm text-gray-600">Recent Purchases</div>
          </div>
        </div>

        {/* Most Expensive Polish */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Expensive Polish</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{analyticsData.mostExpensive.name}</div>
              <div className="text-sm text-gray-600">{analyticsData.mostExpensive.brand}</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${analyticsData.mostExpensive.price.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brands</h3>
            <div className="space-y-3">
              {analyticsData.brandBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{item.brand}</div>
                    <div className="text-sm text-gray-600">({item.count})</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Finishes</h3>
            <div className="space-y-3">
              {analyticsData.finishBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">{item.finish}</div>
                    <div className="text-sm text-gray-600">({item.count})</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-secondary-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Close
          </button>
          <button
            onClick={() => {
              // TODO: Implement export functionality
              console.log('Exporting analytics data...');
            }}
            className="btn-secondary"
          >
            Export Data
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewAnalyticsModal;