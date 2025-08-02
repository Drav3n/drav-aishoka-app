import React, { useState } from 'react';
import Modal from './Modal';
import { useToastContext } from '../contexts/ToastContext';

interface AddPolishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPolishModal: React.FC<AddPolishModalProps> = ({ isOpen, onClose }) => {
  const { showSuccess, showError } = useToastContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    color: '#000000',
    finish: 'cream',
    price: '',
    purchaseDate: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        showSuccess(
          'Polish Added Successfully!',
          `${formData.name} by ${formData.brand} has been added to your collection.`
        );
        
        // Reset form and close modal
        setFormData({
          name: '',
          brand: '',
          color: '#000000',
          finish: 'cream',
          price: '',
          purchaseDate: '',
          notes: ''
        });
        onClose();
      } else {
        throw new Error('Failed to save polish to database');
      }
    } catch (error) {
      showError(
        'Failed to Add Polish',
        error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      brand: '',
      color: '#000000',
      finish: 'cream',
      price: '',
      purchaseDate: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Polish" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Polish Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Polish Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., Ruby Red"
              required
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="input"
              placeholder="e.g., OPI, Essie, Sally Hansen"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="input flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Finish */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finish
            </label>
            <select
              name="finish"
              value={formData.finish}
              onChange={handleInputChange}
              className="input"
            >
              <option value="cream">Cream</option>
              <option value="shimmer">Shimmer</option>
              <option value="glitter">Glitter</option>
              <option value="matte">Matte</option>
              <option value="magnetic">Magnetic</option>
              <option value="thermal">Thermal</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="input"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              className="input"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="input"
            rows={3}
            placeholder="Any additional notes about this polish..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Polish...
              </>
            ) : (
              'Add Polish'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPolishModal;