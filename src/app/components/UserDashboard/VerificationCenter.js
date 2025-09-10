'use client';
import React, { useState } from 'react';
import { FiHome, FiDollarSign, FiShield, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import AddressVerificationModal from './AddressVerificationModal';
import BankVerificationModal from './BankVerificationModal';
import PfVerificationModal from './PfVerificationModal';

// This is a placeholder for the actual user data structure
const initialVerificationStatus = {
    address: 'PENDING',
    bank: 'PENDING',
    pf: 'VERIFIED',
};

const VerificationDashboard = () => {
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isBankModalOpen, setBankModalOpen] = useState(false);
    const [isPfModalOpen, setPfModalOpen] = useState(false);
    
    // In a real application, this status would come from props or a state management library
    const [verificationStatus, setVerificationStatus] = useState(initialVerificationStatus);

    const handleVerificationSuccess = (type) => {
        setVerificationStatus(prev => ({ ...prev, [type]: 'VERIFIED' }));
    };

    const verificationRows = [
        {
            type: 'address',
            icon: <FiHome className="text-blue-500" size={24} />,
            title: 'Address Verification',
            description: 'Verify your current residential address.',
            status: verificationStatus.address,
            action: () => setAddressModalOpen(true),
        },
        {
            type: 'bank',
            icon: <FiDollarSign className="text-green-500" size={24} />,
            title: 'Bank Account Verification',
            description: 'Verify your bank account for payouts.',
            status: verificationStatus.bank,
            action: () => setBankModalOpen(true),
        },
        {
            type: 'pf',
            icon: <FiShield className="text-purple-500" size={24} />,
            title: 'PF Verification',
            description: 'Verify your PF account via Aadhaar.',
            status: verificationStatus.pf,
            action: () => setPfModalOpen(true),
        },
    ];

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Verification</h2>
                    <p className="text-gray-500 mb-6">Secure your account by completing the following verification steps.</p>
                    
                    <div className="space-y-4">
                        {verificationRows.map((row) => (
                            <div 
                                key={row.type} 
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 rounded-full p-3">
                                        {row.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700">{row.title}</h3>
                                        <p className="text-sm text-gray-500">{row.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {row.status === 'VERIFIED' ? (
                                        <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                            <FiCheckCircle className="mr-2" />
                                            Verified
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={row.action}
                                            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                                        >
                                            Verify
                                        </button>
                                    )}
                                    {row.status !== 'VERIFIED' && <FiChevronRight className="text-gray-400" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AddressVerificationModal 
                isOpen={isAddressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                onSuccess={() => handleVerificationSuccess('address')}
            />

            <BankVerificationModal 
                isOpen={isBankModalOpen}
                onClose={() => setBankModalOpen(false)}
                onSuccess={() => handleVerificationSuccess('bank')}
            />

            <PfVerificationModal 
                isOpen={isPfModalOpen}
                onClose={() => setPfModalOpen(false)}
                onSuccess={() => handleVerificationSuccess('pf')}
            />
        </div>
    );
};

export default VerificationDashboard;
