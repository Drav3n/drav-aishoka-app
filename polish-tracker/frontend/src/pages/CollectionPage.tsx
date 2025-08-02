import React, { useState } from 'react';
import AddPolishModal from '../components/AddPolishModal';

const CollectionPage: React.FC = () => {
  const [isAddPolishModalOpen, setIsAddPolishModalOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
        <button
          className="btn-primary"
          onClick={() => setIsAddPolishModalOpen(true)}
        >
          ➕ Add Polish
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search polishes..."
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <select className="input">
              <option value="">All Brands</option>
            </select>
            <select className="input">
              <option value="">All Finishes</option>
              <option value="cream">Cream</option>
              <option value="shimmer">Shimmer</option>
              <option value="glitter">Glitter</option>
              <option value="matte">Matte</option>
              <option value="magnetic">Magnetic</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No polishes yet</h3>
        <p className="text-gray-500 mb-6">Start building your collection by adding your first polish!</p>
        <button
          className="btn-primary"
          onClick={() => setIsAddPolishModalOpen(true)}
        >
          Add Your First Polish
        </button>
      </div>

      {/* Modal */}
      <AddPolishModal
        isOpen={isAddPolishModalOpen}
        onClose={() => setIsAddPolishModalOpen(false)}
      />
    </div>
  );
};

export default CollectionPage;