'use client';

import React, { useState, useRef } from 'react';
import { Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import Modal from '@/app/settings/components/modal';
import { FiUploadCloud } from 'react-icons/fi';
import { useMemo } from 'react';

// A new component for the mapping UI inside the modal
// A new, more robust component for the mapping UI inside the modal
const ColumnMapping = ({ headers, onMappingConfirm }) => {
    // These are the fields your API expects
    const requiredFields = ['fullName', 'email', 'password'];
    const optionalFields = ['position'];
    const allFields = [...requiredFields, ...optionalFields];

    // --- THIS IS THE FIX ---
    // Process the headers to ensure they are a clean array of strings.
    const processedHeaders = useMemo(() => {
        if (!headers || !Array.isArray(headers)) return [];
        // This handles cases like [["col1", "col2"]] or a single string "col1,col2"
        return headers.flat().join(',').split(',').map(h => h.trim());
    }, [headers]);

    // State to hold the current mapping selections
    const [mapping, setMapping] = useState({});

    const handleSelectChange = (targetField, csvHeader) => {
        setMapping(prev => ({ ...prev, [targetField]: csvHeader }));
    };

    const handleConfirm = () => {
        // Validate that all required fields have been mapped
        for (const field of requiredFields) {
            if (!mapping[field]) {
                Swal.fire('Incomplete Mapping', `Please map the required field: "${field}"`, 'warning');
                return;
            }
        }
        onMappingConfirm(mapping);
    };

    return (
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Map Your Columns</h3>
            <p className="text-sm text-gray-500 mb-6">
                Match the columns from your CSV file to the required fields for import.
            </p>
            <div className="space-y-4">
                {allFields.map(field => (
                    <div key={field} className="grid grid-cols-3 items-center gap-4">
                        <label className="font-semibold text-gray-700 text-right">
                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            {requiredFields.includes(field) && <span className="text-red-500">*</span>}
                        </label>
                        <svg className="text-gray-400 justify-self-center h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <select
                            onChange={(e) => handleSelectChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select CSV Column...</option>
                            {/* Map over the PROCESSED headers */}
                            {processedHeaders.map(header => (
                                <option key={header} value={header}>{header}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-right">
                <button
                    onClick={handleConfirm}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Confirm Mapping
                </button>
            </div>
        </div>
    );
};


// The main component with the new workflow logic
export default function ImportEmployeePage() {
    const [campaignName, setCampaignName] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // General loading state
    const fileInputRef = useRef(null);

    // State for the new mapping workflow
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);

    const handleFileSelect = (selectedFile) => {
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
        } else {
            Swal.fire('Invalid File', 'Please select a valid CSV file.', 'warning');
            setFile(null); // Clear invalid file
        }
    };

    const handleFileChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    // Step 1: Extract headers
    const handleExtractHeaders = async () => {
        if (!campaignName) { Swal.fire('Missing Info', 'Please enter a campaign name.', 'info'); return; }
        if (!file) { Swal.fire('Missing Info', 'Please upload a CSV file.', 'info'); return; }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/import-employees/extract-headers', { method: 'POST', body: formData });
            const result = await response.json();
            console.log(result)
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to extract headers.');
            }
            
            setCsvHeaders(result.headers); // The API returns an array containing one array of headers
            setIsMappingModalOpen(true); // Open the mapping modal

        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Final import with mapping
    const handleFinalImport = async (mapping) => {
        setIsMappingModalOpen(false); // Close the mapping modal
        setIsLoading(true); // Show loading screen in the dropzone
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('campaignName', campaignName);
            formData.append('mapping', JSON.stringify(mapping)); // Send the mapping object

            const response = await fetch('/api/import-employees', { method: 'POST', body: formData });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong during the import.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Import Successful!',
                text: `${result.usersCreated} employees have been imported into the "${result.campaign.name}" campaign.`,
            });
            // Reset the entire form on success
            setCampaignName('');
            setFile(null);
            setCsvHeaders([]);

        } catch (err) {
            Swal.fire('Import Failed', err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Import a New Campaign</h2>
                    <p className="text-gray-500 mb-8">Start by giving your campaign a name and uploading your employee CSV file.</p>
                    <div className="mb-6">
                        <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder="Enter your Campaign Name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="w-full lg:w-3/5">
                    <div 
                        className={`relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center h-[50vh] flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-blue-600 bg-blue-50' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={handleDrop}
                        onClick={() => !isLoading && fileInputRef.current.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept=".csv"
                            disabled={isLoading}
                        />
                        
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center">
                                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                                <p className="text-lg font-medium text-gray-600 mt-4">Processing, please wait...</p>
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

                    <div className="mt-6">
                        <button 
                            onClick={handleExtractHeaders}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={isLoading || !file || !campaignName}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Match Fields & Import'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isMappingModalOpen} onClose={() => setIsMappingModalOpen(false)}>
                <ColumnMapping
                    headers={csvHeaders}
                    onMappingConfirm={handleFinalImport}
                />
            </Modal>
        </>
    );
};
