'use client';
import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';

const PfVerificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState('enter-mobile'); // 'enter-mobile' or 'enter-otp'
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [clientId, setClientId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep('enter-mobile');
            setMobile('');
            setOtp('');
            setClientId(null);
            setIsSubmitting(false);
            setError('');
        }
    }, [isOpen]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/verification/pf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: 'send-otp', mobile }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to send OTP.');
            }

            setClientId(result.clientId);
            setStep('enter-otp');
            Swal.fire('OTP Sent', 'An OTP has been sent to the provided mobile number.', 'info');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/verification/pf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: 'verify-otp', otp, clientId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'PF verification failed.');
            }
            
            Swal.fire('Success!', 'PF details verified successfully!', 'success');
            onSuccess();
            onClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">PF Verification</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>

                {step === 'enter-mobile' ? (
                     <form onSubmit={handleSendOtp}>
                        <div className="p-6">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">Aadhaar-Linked Mobile Number</label>
                            <input
                                type="tel"
                                id="mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="+91 XXXXX XXXXX"
                                required
                                disabled={isSubmitting}
                            />
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                                <FiSend className="mr-2" />
                                {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="p-6">
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="6-digit OTP"
                                required
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500 mt-2">An OTP was sent to the number ending in {mobile.slice(-4)}.</p>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                             <button type="submit" disabled={isSubmitting} className="flex items-center justify-center bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
                                <FiCheck className="mr-2" />
                                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PfVerificationModal;
