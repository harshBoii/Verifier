'use client';
import React, { useState } from 'react';
import styles from './CampaignsTable.module.css';
import { FiMoreVertical } from 'react-icons/fi';
import Image from 'next/image';

const ActionMenu = () => (
    <div className={styles.actionMenu}>
        <button>Edit</button>
        <button>View Details</button>
        <button className={styles.delete}>Delete</button>
    </div>
);

// The component now only accepts 'data' as a prop and is much simpler.
const CampaignsTable = ({ data = [] }) => {
    const [activeMenu, setActiveMenu] = useState(null);

    const toggleMenu = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    return (
        <div className={styles.tableContainer}>
            <h3 className={styles.tableTitle}>Campaigns List</h3>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Campaign Name</th>
                        <th>Total Members</th>
                        <th>Verified Members</th>
                        <th>Pending Members</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((campaign, index) => (
                        <tr key={campaign.id}>
                            <td>
                                <div className={styles.userCell}>
                                    <Image 
                                        src={`https://ui-avatars.com/api/?name=${campaign.name.replace(' ', '+')}&background=random`} 
                                        alt={campaign.name} 
                                        width={30} 
                                        height={30} 
                                        className={styles.avatar}
                                        unoptimized={true}
                                    />
                                    {campaign.name}
                                </div>
                            </td>
                            <td>{campaign.totalEmployees} Members</td>
                            <td>{campaign.totalVerified} Verified</td>
                            <td>{campaign.notVerified} Pending</td>
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
