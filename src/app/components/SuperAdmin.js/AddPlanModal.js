'use client';
import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

const AddPlanModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    priceMonthly: '',
    priceAnnually: '',
    hasCustomSmtp: false,
    canSetRates: false,
    hasAgentConnect: false,
    hasAdvancedStats: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,
            priceMonthly: parseFloat(formData.priceMonthly),
            priceAnnually: parseFloat(formData.priceAnnually),
        }),
      });
      if (!response.ok) throw new Error('Failed to create plan.');
      Swal.fire('Success!', 'New plan has been created.', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-sans"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Subscription Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <FiX size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Plan Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-2">Plan Name*</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                onChange={handleInputChange} 
                required 
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="priceMonthly" className="block text-sm font-medium text-gray-600 mb-2">Monthly Price ($)*</label>
                    <input 
                      type="number" 
                      id="priceMonthly" 
                      name="priceMonthly" 
                      onChange={handleInputChange} 
                      required 
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                <div>
                    <label htmlFor="priceAnnually" className="block text-sm font-medium text-gray-600 mb-2">Annual Price ($)*</label>
                    <input 
                      type="number" 
                      id="priceAnnually" 
                      name="priceAnnually" 
                      onChange={handleInputChange} 
                      required 
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Features */}
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">Features</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="hasCustomSmtp" name="hasCustomSmtp" checked={formData.hasCustomSmtp} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="hasCustomSmtp" className="ml-3 text-gray-700">Custom Mail (SMTP)</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="canSetRates" name="canSetRates" checked={formData.canSetRates} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="canSetRates" className="ml-3 text-gray-700">Set Rates</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="hasAgentConnect" name="hasAgentConnect" checked={formData.hasAgentConnect} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="hasAgentConnect" className="ml-3 text-gray-700">Agent Connect</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="hasAdvancedStats" name="hasAdvancedStats" checked={formData.hasAdvancedStats} onChange={handleInputChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="hasAdvancedStats" className="ml-3 text-gray-700">Advanced Statistics</label>
                    </div>
                </div>
            </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <FiSave /> {isSubmitting ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanModal;
