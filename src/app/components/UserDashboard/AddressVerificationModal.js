'use client';
import React, { useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';

const AddressVerificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [aadhaar, setAadhaar] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Verifying Aadhaar:', aadhaar);
        
        setIsSubmitting(false);
        onClose();
        onSuccess();
        Swal.fire('Success!', 'Address verification request submitted!', 'success');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Address Verification</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                            Aadhaar Number
                        </label>
                        <input
                            type="text"
                            id="aadhaar"
                            value={aadhaar}
                            onChange={(e) => setAadhaar(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="xxxx xxxx xxxx"
                            required
                            pattern="\d{4}\s?\d{4}\s?\d{4}"
                            title="Please enter a valid 12-digit Aadhaar number"
                        />
                        <p className="text-xs text-gray-500 mt-2">Your information is encrypted and secure.</p>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all disabled:bg-blue-300"
                        >
                            <FiCheck className="mr-2" />
                            {isSubmitting ? 'Verifying...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressVerificationModal;
