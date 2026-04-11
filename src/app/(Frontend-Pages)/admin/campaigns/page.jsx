'use client'; // 1. Declare as a Client Component

// 2. Import useEffect for side effects (data fetching)
import React, { useState, useEffect } from 'react';

// Import your components. Adjust the paths if they are different.
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';
import SubAlert from '@/app/components/Dashboard/SubAlert';
import CampaignsTable from '@/app/components/Dashboard/CampaignsTable';
import { Loader2 } from 'lucide-react'; // A nice loading icon

// A simple loading component to show while data is being fetched
const LoadingState = () => (
    <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-gray-600">Loading Campaigns...</p>
    </div>
);

export default function ImportEmployee() {
    // 3. Initialize state correctly. `null` indicates data hasn't been fetched yet.
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // 4. Use useEffect to fetch data when the component mounts
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await fetch('/api/campaigns');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // 5. Correctly await the JSON data from the response
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                console.error("Failed to fetch campaigns:", err);
                setError(err.message);
                setData([]); // Set to empty array on error to prevent crashes
            }
        };

        fetchCampaigns();
    }, []); // The empty array ensures this runs only once

    // 6. Handle loading and error states before rendering the table
    const renderContent = () => {
        if (data === null) {
            return <LoadingState />;
        }
        if (error) {
            return <p className="text-center text-red-500">Error: {error}</p>;
        }
        // Pass both `data` and `setData` to the table if it needs to modify the state
        return <CampaignsTable data={data} setData={setData} />;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FBFBFB' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 30px 0 30px' }}>
                    <Header user={{ name: 'Admin' }} />
                </div>
                <SubAlert />
                <div style={{ padding: '0 30px 30px 30px' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
