'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FiUploadCloud } from 'react-icons/fi'; // Using a different icon for the dropzone
import LoadingScreen from '../LoadingScreen';

// A new ProgressBar component
const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const ImportEmployeePage = () => {
    const [campaignName, setCampaignName] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [progress, setProgress] = useState(0); // State for the progress bar
    const fileInputRef = useRef(null);
    const progressIntervalRef = useRef(null); // Ref to hold the interval ID

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
        } else {
            alert('Please select a valid CSV file.');
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
            alert('Please drop a valid CSV file.');
        }
    };

    const handleMatchClick = () => {
        if (!campaignName) {
            alert('Please enter a campaign name.');
            return;
        }
        if (!file) {
            alert('Please upload a CSV file.');
            return;
        }
        
        setIsMatching(true);
        setProgress(0); // Reset progress
    };

    // Effect to handle the progress bar animation
    useEffect(() => {
        if (isMatching) {
            progressIntervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressIntervalRef.current);
                        setIsMatching(false); // Stop loading animation
                        console.log('Matching fields for campaign:', campaignName, 'with file:', file.name);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 900); // Update progress every 300ms
        }

        // Cleanup function to clear the interval if the component unmounts
        return () => {
            clearInterval(progressIntervalRef.current);
        };
    }, [isMatching, campaignName, file]);


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
                        {isMatching ? 'Matching...' : 'Match the field'}
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
                            <LoadingScreen className='h-20 w-30'/>
                            <ProgressBar progress={progress} className='max-w-80 w-60' />
                            <p className="text-lg font-medium text-gray-600 mt-4">Matching fields... {progress}%</p>
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
