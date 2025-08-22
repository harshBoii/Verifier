'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function RelationshipModal({ isOpen, onClose, verifierEmail, onConfirm }) {
    // State to hold the selected relationship
    const [relation, setRelation] = useState('same_team'); // Default value

    if (!isOpen) return null;

    const handleConfirmClick = () => {
        if (!relation) {
            Swal.fire('Selection Required', 'Please select your relationship with the verifier.', 'warning');
            return;
        }
        // Pass both the email and the selected relation back to the parent
        onConfirm({ verifierEmail, relation });
        onClose(); // Close this modal
    };
    
    // The options match the `Relation` enum in your Prisma schema
    const relationshipOptions = [
        { value: 'same_team', label: 'Same Team' },
        { value: 'team_leader', label: 'Team Leader' },
        { value: 'managed_me_directly', label: 'Managed Me Directly' },
        { value: 'ex_cxo_VP', label: 'Ex-CXO or VP' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 font-sans p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Your Relationship</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 text-center">
                        You have selected <strong className="text-blue-600">{verifierEmail}</strong>.
                        <br />
                        What is your professional relationship with them?
                    </p>
                    
                    {/* Relationship Radio Buttons */}
                    <div className="space-y-3">
                        {relationshipOptions.map(opt => (
                            <label key={opt.value} className="flex items-center p-3 border border-gray-200 rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 cursor-pointer transition-all">
                                <input
                                    type="radio"
                                    name="relationship"
                                    value={opt.value}
                                    checked={relation === opt.value}
                                    onChange={(e) => setRelation(e.target.value)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
                    <button
                        onClick={handleConfirmClick}
                        className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        Confirm and Add Verifier
                    </button>
                </div>
            </div>
        </div>
    );
}
