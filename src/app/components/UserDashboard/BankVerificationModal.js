'use client';
import React, { useState, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import Swal from 'sweetalert2';

const BankVerificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setAccountNumber('');
            setIfsc('');
            setIsSubmitting(false);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/verification/bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountNumber, ifsc }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Bank verification failed.');
            }

            Swal.fire('Success!', `Bank Account verified successfully. Holder: ${result.data.accountHolderName}`, 'success');
            onSuccess();
            onClose();

        } catch (err) {
            // Using Swal for error display as it's a single-step form
            Swal.fire('Error!', err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Bank Account Verification</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                            <input
                                type="text"
                                id="accountNumber"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                            <input
                                type="text"
                                id="ifsc"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                         <button type="submit" disabled={isSubmitting} className="flex items-center justify-center bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                            <FiCheck className="mr-2" />
                            {isSubmitting ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BankVerificationModal;
