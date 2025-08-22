'use client';

import React, { useState } from 'react';
import { FiX, FiSearch, FiMail } from 'react-icons/fi';
import RelationshipModal from './RelationshipModal'; // Import the new modal

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function VerifierModal({ isOpen, onClose, onVerifierSelect }) {
    const [mode, setMode] = useState('direct');
    const [directEmail, setDirectEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [seniors, setSeniors] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- NEW STATE FOR THE SECOND MODAL ---
    const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);

    const handleFindSeniors = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/find-verifiers?website=${website.replace(/^(https?:\/\/)?(www\.)?/, '')}`);
            if (!response.ok) throw new Error('Could not find company.');
            const data = await response.json();
            setSeniors(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // This function now just prepares for the second step
    const handleEmailSelect = (email) => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        setSelectedEmail(email);      // Store the selected email
        setIsRelationshipModalOpen(true); // Open the relationship modal
    };

    // This is the final confirmation handler passed to the RelationshipModal
    const handleRelationshipConfirm = ({ verifierEmail, relation }) => {
        // Now call the original parent handler with the complete data object
        onVerifierSelect({ verifier_email: verifierEmail, ver_relation: relation });
        // Close both modals
        setIsRelationshipModalOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-sans p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Add Verifier Details</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 p-4 font-semibold text-sm transition-colors ${mode === 'direct' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setMode('direct')}
                        >
                            I have the email
                        </button>
                        <button
                            className={`flex-1 p-4 font-semibold text-sm transition-colors ${mode === 'find' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            onClick={() => setMode('find')}
                        >
                            Find a verifier
                        </button>
                    </div>

                    <div className="p-6">
                        {mode === 'direct' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">Enter the verifier's email address directly.</p>
                                <input
                                    type="email"
                                    value={directEmail}
                                    onChange={(e) => setDirectEmail(e.target.value)}
                                    placeholder="e.g., hr@company.com"
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                                <button
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
                                    onClick={() => handleEmailSelect(directEmail)}
                                >
                                    <FiMail /> Next: Select Relationship
                                </button>
                            </div>
                        )}

                        {mode === 'find' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">Enter the company's website to find potential verifiers.</p>
                                <div className="flex gap-2">
                                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g., company.com" className="flex-grow px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                    <button onClick={handleFindSeniors} className="p-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition" disabled={loading}>
                                        {loading ? <Spinner /> : <FiSearch />}
                                    </button>
                                </div>
                                {seniors.length > 0 && (
                                    <ul className="mt-4 border-t border-gray-200 divide-y divide-gray-200">
                                        {seniors.map(senior => (
                                            <li
                                                key={senior.id}
                                                onClick={() => handleEmailSelect(senior.email)}
                                                className="p-3 hover:bg-blue-50 cursor-pointer rounded-md"
                                            >
                                                <p className="font-semibold text-gray-800">{senior.name} <span className="font-normal text-gray-500">({senior.position})</span></p>
                                                <p className="text-sm text-blue-600">{senior.email}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Render the second modal when it's time */}
            <RelationshipModal
                isOpen={isRelationshipModalOpen}
                onClose={() => setIsRelationshipModalOpen(false)}
                verifierEmail={selectedEmail}
                onConfirm={handleRelationshipConfirm}
            />
        </>
    );
};
