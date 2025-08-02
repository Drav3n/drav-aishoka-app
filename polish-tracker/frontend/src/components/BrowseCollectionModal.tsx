import React, { useState } from 'react';
import Modal from './Modal';

interface BrowseCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Polish {
  id: number;
  name: string;
  brand: string;
  color: string;
  finish: string;
  price: number;
  isFavorite: boolean;
}

const BrowseCollectionModal: React.FC<BrowseCollectionModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - in a real app, this would come from an API
  const mockPolishes: Polish[] = [
    { id: 1, name: 'Ruby Red', brand: 'OPI', color: '#DC143C', finish: 'cream', price: 12.99, isFavorite: true },
    { id: 2, name: 'Midnight Blue', brand: 'Essie', color: '#191970', finish: 'shimmer', price: 9.99, isFavorite: false },
    { id: 3, name: 'Golden Glitter', brand: 'Sally Hansen', color: '#FFD700', finish: 'glitter', price: 7.99, isFavorite: true },
    { id: 4, name: 'Matte Black', brand: 'OPI', color: '#000000', finish: 'matte', price: 14.99, isFavorite: false },
    { id: 5, name: 'Pink Shimmer', brand: 'Essie', color: '#FFC0CB', finish: 'shimmer', price: 10.99, isFavorite: true },
    { id: 6, name: 'Purple Magic', brand: 'Magnetic Nails', color: '#800080', finish: 'magnetic', price: 18.99, isFavorite: false },
  ];

  const brands = Array.from(new Set(mockPolishes.map(p => p.brand)));
  const finishes = Array.from(new Set(mockPolishes.map(p => p.finish)));

  const filteredPolishes = mockPolishes.filter(polish => {
    const matchesSearch = polish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         polish.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !selectedBrand || polish.brand === selectedBrand;
    const matchesFinish = !selectedFinish || polish.finish === selectedFinish;
    
    return matchesSearch && matchesBrand && matchesFinish;
  });

  const toggleFavorite = (id: number) => {
    // TODO: Implement API call to toggle favorite
    console.log('Toggling favorite for polish ID:', id);
  };

  const PolishCard = ({ polish }: { polish: Polish }) => (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div 
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: polish.color }}
        ></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 truncate">{polish.name}</h4>
            <button
              onClick={() => toggleFavorite(polish.id)}
              className={`text-lg ${polish.isFavorite ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
            >
              ⭐
            </button>
          </div>
          <p className="text-sm text-gray-600">{polish.brand}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
              {polish.finish}
            </span>
            <span className="text-sm font-medium text-green-600">
              ${polish.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const PolishListItem = ({ polish }: { polish: Polish }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div 
        className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0"
        style={{ backgroundColor: polish.color }}
      ></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{polish.name}</h4>
            <p className="text-sm text-gray-600">{polish.brand}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
              {polish.finish}
            </span>
            <span className="text-sm font-medium text-green-600">
              ${polish.price.toFixed(2)}
            </span>
            <button
              onClick={() => toggleFavorite(polish.id)}
              className={`text-lg ${polish.isFavorite ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
            >
              ⭐
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Browse Collection" size="xl">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search polishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedBrand} 
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select 
              value={selectedFinish} 
              onChange={(e) => setSelectedFinish(e.target.value)}
              className="input"
            >
              <option value="">All Finishes</option>
              {finishes.map(finish => (
                <option key={finish} value={finish} className="capitalize">{finish}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredPolishes.length} polish{filteredPolishes.length !== 1 ? 'es' : ''} found
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Polish Collection */}
        <div className="max-h-96 overflow-y-auto">
          {filteredPolishes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">💅</div>
              <p>No polishes found matching your criteria</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPolishes.map(polish => (
                <PolishCard key={polish.id} polish={polish} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPolishes.map(polish => (
                <PolishListItem key={polish.id} polish={polish} />
              ))}
            </div>
          )}
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
              // TODO: Navigate to full collection page
              console.log('Opening full collection page...');
              onClose();
            }}
            className="btn-primary"
          >
            View Full Collection
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BrowseCollectionModal;