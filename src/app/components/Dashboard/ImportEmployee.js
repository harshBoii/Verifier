'use client';

import React, { useState, useRef } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingScreen from '../LoadingScreen';

// --- Helper Components (No Changes Needed) ---
const ButtonSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function ImportEmployeePage() {
    const [campaignName, setCampaignName] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const fileInputRef = useRef(null);

    // --- All your handler functions remain exactly the same ---
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') { setFile(selectedFile); }
        else { Swal.fire('Invalid File', 'Please select a valid CSV file.', 'warning'); }
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false);
        const droppedFile = e.dataTransfer.files;
        if (droppedFile && droppedFile.type === 'text/csv') { setFile(droppedFile); }
        else { Swal.fire('Invalid File', 'Please drop a valid CSV file.', 'warning'); }
    };
    const handleMatchClick = async () => {
        if (!campaignName) { Swal.fire('Missing Info', 'Please enter a campaign name.', 'info'); return; }
        if (!file) { Swal.fire('Missing Info', 'Please upload a CSV file.', 'info'); return; }
        setIsMatching(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('campaignName', campaignName);
        try {
            const response = await fetch('/api/import-employees', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.error || 'Something went wrong during the import.'); }
            Swal.fire('Success!', `${result.usersCreated} employees have been successfully imported into the "${result.campaign.name}" campaign.`, 'success');
            setCampaignName(''); setFile(null);
        } catch (err) {
            Swal.fire('Import Failed', err.message, 'error');
        } finally {
            setIsMatching(false);
        }
    };

    return (
        // --- NEW CENTERED LAYOUT ---
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white p-4 sm:p-6 md:p-8">

            <div className="w-full max-w-3xl text-center">
                {/* 1. Text above the input box */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Import a New Campaign</h2>
                <p className="text-gray-500 mb-8">Start by giving your campaign a name and uploading your employee CSV file.</p>

                {/* 2. Input box for campaign name */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Enter your Campaign Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={isMatching}
                    />
                </div>
            </div>

            {/* 3. The upload section, taking up 60% of the screen width on larger screens */}
            <div className="w-full lg:w-3/5">
                <div 
                    className={`relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center h-[50vh] flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-blue-600 bg-blue-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isMatching && fileInputRef.current.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".csv"
                        disabled={isMatching}
                    />
                    
                    {/* Content inside the dropzone */}
                    {isMatching ? (
                        <div className="flex flex-col items-center justify-center">
                            <LoadingScreen />
                            <p className="text-lg font-medium text-gray-600 mt-4">Importing employees, please wait...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <FiUploadCloud className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-lg font-medium text-gray-600">
                                {file ? (
                                    <>
                                        <span className="text-blue-600">File selected:</span> {file.name}
                                    </>
                                ) : (
                                    <>
                                        <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                                    </>
                                )}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">CSV files only</p>
                        </div>
                    )}
                </div>

                {/* Submit Button - Placed below the dropzone for a clear workflow */}
                <div className="mt-6">
                    <button 
                        onClick={handleMatchClick}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isMatching || !file || !campaignName}
                    >
                        {isMatching ? <ButtonSpinner /> : 'Import and Match Fields'}
                    </button>
                </div>
            </div>
        </div>
    );
};
