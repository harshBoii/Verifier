'use client';
import React, { useState, useEffect } from 'react';
import styles from './CampaignsTable.module.css';
import { FiMoreVertical } from 'react-icons/fi';
import Image from 'next/image';
import LoadingGlass from '../LoadingGlass';

const ActionMenu = () => (
    <div className={styles.actionMenu}>
        <button>Edit</button>
        <button>Verify</button>
        <button>Bulk Verify</button>
        <button className={styles.delete}>Delete</button>
    </div>
);

const CampaignsTable = () => {
    // 1. ADD STATE FOR DATA, LOADING, AND ERRORS
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);

    // 2. FETCH DATA WHEN THE COMPONENT LOADS
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/campaigns');
                if (!response.ok) {
                    throw new Error('Failed to fetch campaign data');
                }
                const data = await response.json();
                setCampaigns(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []); // Empty array ensures this runs once

    const toggleMenu = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    // 3. HANDLE LOADING AND ERROR STATES
    if (loading) return <LoadingGlass/>;
    if (error) return <div className={styles.tableContainer}><p style={{ color: 'red' }}>Error: {error}</p></div>;

    return (
        <div className={styles.tableContainer}>
            <h3 className={styles.tableTitle}>Campaigns List</h3>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Employees</th>
                        <th>Total Verified</th>
                        <th>Not Verified</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 4. MAP OVER THE FETCHED DATA */}
                    {campaigns.map((campaign, index) => (
                        <tr key={campaign.id}>
                            <td>
                                <div className={styles.userCell}>
                                    <Image 
                                        src={`https://ui-avatars.com/api/?name=${campaign.name.replace(' ', '+')}&background=random`} 
                                        alt={campaign.name} 
                                        width={30} 
                                        height={30} 
                                        className={styles.avatar}
                                    />
                                    {campaign.name}
                                </div>
                            </td>
                            <td>{campaign.totalEmployees} Employees</td>
                            <td>{campaign.totalVerified} Employees</td>
                            <td>{campaign.notVerified} Employees</td>
                            <td className={styles.actionCell}>
                                <button onClick={() => toggleMenu(index)} className={styles.moreButton}>
                                    <FiMoreVertical />
                                </button>
                                {activeMenu === index && <ActionMenu />}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignsTable;