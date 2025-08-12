'use client';
import React, { useState, useRef } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import Swal from 'sweetalert2'; // Import SweetAlert2 for notifications
import LoadingScreen from '../LoadingScreen';

// A simple SVG spinner component for the loading animation on the button
const ButtonSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// A spinner for the dropzone area
const DropzoneSpinner = () => (
    <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ImportEmployeePage = () => {
    const [campaignName, setCampaignName] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMatching, setIsMatching] = useState(false); // This now controls the real API call loading state
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
        } else {
            Swal.fire('Invalid File', 'Please select a valid CSV file.', 'warning');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'text/csv') {
            setFile(droppedFile);
        } else {
            Swal.fire('Invalid File', 'Please drop a valid CSV file.', 'warning');
        }
    };

    // This function now makes a real API call
    const handleMatchClick = async () => {
        if (!campaignName) {
            Swal.fire('Missing Info', 'Please enter a campaign name.', 'info');
            return;
        }
        if (!file) {
            Swal.fire('Missing Info', 'Please upload a CSV file.', 'info');
            return;
        }
        
        setIsMatching(true);
        
        // Use FormData to send the file and campaign name to the API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('campaignName', campaignName);

        try {
            const response = await fetch('/api/import-employees', {
                method: 'POST',
                body: formData, // No 'Content-Type' header needed; the browser sets it for FormData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong during the import.');
            }

            Swal.fire(
                'Success!',
                `${result.usersCreated} employees have been successfully imported into the "${result.campaign.name}" campaign.`,
                'success'
            );
            // Reset form on success
            setCampaignName('');
            setFile(null);

        } catch (err) {
            Swal.fire('Import Failed', err.message, 'error');
        } finally {
            setIsMatching(false);
        }
    };

    return (
        <div className="p-8 bg-white  w-full ">
            <div className='ml-105 '>
                <h2 className="text-xl font-bold text-gray-700 ml-30 mb-6">Import the Employee</h2>

                <div className="max-w-md mb-6">
                    <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Enter your Campaign Name"
                        className="w-150 px-4 text-center align-middle py-3 -ml-20 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        disabled={isMatching}
                    />
                </div>

                <div className="max-w-md mb-8">
                    <button 
                        onClick={handleMatchClick}
                        className="w-full bg-blue-600 text-white font-bold py-3 ml-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-70"
                        disabled={isMatching}
                    >
                        {isMatching ? <ButtonSpinner /> : 'Match the field'}
                    </button>
                </div>
            </div>
            <div 
                className={`border-2 border-dashed w-200 border-gray-400 rounded-3xl p-10 text-center  mx-auto transition ${isDragging ? 'border-blue-600 bg-blue-50' : ''}`}
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
                <div className="flex flex-col items-center justify-center mt-20 h-[50vh] w-[120vw] ">
                    {isMatching ? (
                        <div className="flex flex-col items-center justify-center mb-60 -ml-330 w-150">
                            <LoadingScreen />
                            <p className="text-lg font-medium text-gray-600 mt-4">Importing employees, please wait...</p>
                        </div>
                    ) : (
                        <>
                            <div className="h-[10vh] w-[15vw] mb-60 -ml-320">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 18L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p className="text-lg font-medium -ml-328 text-gray-500">
                                {file ? `File selected: ${file.name}` : 'Drop Your CSV file here'}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportEmployeePage;
