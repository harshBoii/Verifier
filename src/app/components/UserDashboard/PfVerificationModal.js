'use client';
import React, { useState } from 'react';
import { FiX, FiCheck, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';

const PfVerificationModal = ({ isOpen, onClose, onSuccess }) => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call to send OTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Sending OTP to:', mobile);
        
        setIsSubmitting(false);
        setOtpSent(true);
        Swal.fire('OTP Sent!', 'An OTP has been sent to your Aadhaar-linked mobile number.', 'info');
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call to verify OTP
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Verifying OTP:', otp);
        
        setIsSubmitting(false);
        onClose();
        onSuccess();
        Swal.fire('Success!', 'PF account has been verified!', 'success');
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">PF Verification</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>

                {!otpSent ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="p-6">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                                Aadhaar-Linked Mobile Number
                            </label>
                            <input
                                type="tel"
                                id="mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="+91 XXXXX XXXXX"
                                required
                            />
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-purple-300"
                            >
                                <FiSend className="mr-2" />
                                {isSubmitting ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="p-6">
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="6-digit OTP"
                                required
                            />
                             <p className="text-xs text-gray-500 mt-2">
                                An OTP was sent to the number ending in {mobile.slice(-4)}.
                             </p>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                             <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center justify-center bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-purple-300"
                            >
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
