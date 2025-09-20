'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Loader2, PlayCircle, Zap, CheckCircle } from 'lucide-react'; // Added icons for status
import { FiX } from 'react-icons/fi';

// A reusable button component for the status selector
const StatusButton = ({ text, icon, isActive, onClick, disabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border transition-colors
            ${isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        `}
    >
        {icon}
        <span className="ml-2">{text}</span>
    </button>
);


export default function EditCampaignModal({ campaign, onClose, onSuccess }) {
    // State to manage form inputs
    const [name, setName] = useState('');
    const [status, setStatus] = useState('ACTIVE'); // Add state for status
    
    // State to manage loading during API calls
    const [isSubmitting, setIsSubmitting] = useState(false);

    // When the campaign prop is passed or changes, update the form's state
    useEffect(() => {
        if (campaign) {
            setName(campaign.name);
            setStatus(campaign.status || 'ACTIVE'); // Set status from prop, default to 'ACTIVE'
        }
    }, [campaign]);

    if (!campaign) return null;

    // --- API HANDLERS ---

    // Handles saving the updated campaign name and status
    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            Swal.fire('Validation Error', 'Campaign name cannot be empty.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/campaigns/${campaign.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Send both name and status in the request body
                body: JSON.stringify({ name, status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update campaign.');
            }

            Swal.fire('Saved!', 'The campaign has been updated successfully.', 'success');
            onSuccess(); // Notify parent to refetch data
            onClose();   // Close the modal

        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handles deleting the campaign (no changes needed here)
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This will permanently delete the campaign: "${campaign.name}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6e7881',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setIsSubmitting(true);
            try {
                const response = await fetch(`/api/campaigns/${campaign.id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete campaign.');
                Swal.fire('Deleted!', 'The campaign has been deleted.', 'success');
                onSuccess();
                onClose();
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Campaign</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-700" disabled={isSubmitting}>
                        <FiX size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-6">
                        {/* Campaign Name Input */}
                        <div>
                            <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-2">
                                Campaign Name
                            </label>
                            <input
                                id="campaignName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        {/* --- NEW: Campaign Status Selector --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className="flex items-center space-x-2">
                                <StatusButton text="Active" icon={<PlayCircle size={16}/>} isActive={status === 'Active'} onClick={() => setStatus('Active')} disabled={isSubmitting} />
                                <StatusButton text="Upcoming" icon={<Zap size={16}/>} isActive={status === 'Upcoming'} onClick={() => setStatus('Upcoming')} disabled={isSubmitting} />
                                <StatusButton text="Finished" icon={<CheckCircle size={16}/>} isActive={status === 'Finished'} onClick={() => setStatus('Finished')} disabled={isSubmitting} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        <button type="button" className="px-4 py-2 text-sm font-medium text-red-600 bg-transparent rounded-md hover:bg-red-50 disabled:text-gray-400" onClick={handleDelete} disabled={isSubmitting}>
                            Delete Campaign
                        </button>
                        <div className="space-x-3">
                            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:bg-gray-200" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="submit" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-400" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
