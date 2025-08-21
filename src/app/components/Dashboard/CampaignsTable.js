'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import CampaignInsightsModal from './CampaignMembersModal';
import styles from './CampaignsTable.module.css';
import { Search } from 'lucide-react'; // A nice search icon

export default function CampaignsTable({ data = [] }) {
    const [viewingCampaign, setViewingCampaign] = useState(null);
    // 1. Add state to manage the search input's value
    const [searchQuery, setSearchQuery] = useState('');

    // 2. Filter the data based on the search query before rendering
    //    useMemo will prevent re-filtering on every render unless data or searchQuery changes.
    const filteredData = useMemo(() => {
        if (!searchQuery) {
            return data; // If search is empty, return all data
        }
        return data.filter(campaign =>
            campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [data, searchQuery]);

    return (
        <>
            <div className={styles.tableContainer}>
                <div className="md:flex md:items-center md:justify-between mb-4">
                    {/* Left side: Title and description */}
                    <div>
                        <h3 className={styles.tableTitle}>Campaigns List</h3>
                        <p className="text-sm text-gray-500">
                            Search for a campaign or click a row to view insights.
                        </p>
                    </div>

                    {/* 3. Add the search bar component */}
                    <div className="relative mt-4 md:mt-0 border-2 border-black">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Total Members</th>
                            <th>Verified</th>
                            <th>Pending</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 4. Map over the `filteredData` instead of the original `data` */}
                        {filteredData.length > 0 ? (
                            filteredData.map((campaign) => (
                                <tr 
                                    key={campaign.id} 
                                    className={`${styles.clickableRow} hover:bg-gray-50 transition-colors duration-150`}
                                    onClick={() => setViewingCampaign(campaign)}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && setViewingCampaign(campaign)}
                                >
                                    <td>
                                        <div className={styles.userCell}>
                                            <Image 
                                                src={`https://ui-avatars.com/api/?name=${campaign.name.replace(/\s+/g, '+')}&background=random`} 
                                                alt={`${campaign.name} logo`}
                                                width={32} 
                                                height={32} 
                                                className={styles.avatar}
                                                unoptimized={true}
                                            />
                                            <span className="font-medium text-gray-800">{campaign.name}</span>
                                        </div>
                                    </td>
                                    {/* The calculation for total members is now more robust */}
                                    <td>{Number(campaign.totalVerified) + Number(campaign.notVerified)} Members</td>
                                    <td className="text-green-600 font-semibold">{campaign.totalVerified} Verified</td>
                                    <td className="text-amber-600 font-semibold">{campaign.notVerified} Pending</td>
                                </tr>
                            ))
                        ) : (
                            // 5. Provide a more helpful "no results" message
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                    {searchQuery ? `No campaigns found for "${searchQuery}"` : "No campaigns found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewingCampaign && (
                <CampaignInsightsModal 
                    campaignId={viewingCampaign.id}
                    onClose={() => setViewingCampaign(null)}
                />
            )}
        </>
    );
};
