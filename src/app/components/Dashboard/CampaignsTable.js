'use client';
import React, { useState } from 'react';
import styles from './CampaignsTable.module.css';
import { FiMoreVertical, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';
import CampaignMembersModal from './CampaignMembersModal';
import Swal from 'sweetalert2';

// A small spinner for loading states within the table
const RowSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ActionMenu = ({ onViewDetails, onEdit, onDelete }) => (
    <div className={styles.actionMenu}>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onViewDetails}>View Details</button>
        <button onClick={onDelete} className={styles.delete}>Delete</button>
    </div>
);

const CampaignsTable = ({ data = [], setData }) => {
    console.log("Data changed", data);

    const [activeMenu, setActiveMenu] = useState(null);
    const [viewingCampaign, setViewingCampaign] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(null); // Will hold the ID of the item being processed

    const toggleMenu = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    const handleViewDetails = (campaign) => {
        setViewingCampaign(campaign);
        setActiveMenu(null);
    };

    const handleEditClick = (campaign) => {
        setEditingId(campaign.id);
        setEditingName(campaign.name);
        setActiveMenu(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = async (campaignId) => {
        setIsSubmitting(campaignId); // Start loading for this specific row
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName }),
            });
            if (!response.ok) throw new Error('Failed to save changes.');

            setData(prevData => prevData.map(c => 
                c.id === campaignId ? { ...c, name: editingName } : c
            ));
            
            handleCancelEdit();
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSubmitting(null); // Stop loading
        }
    };
    
    const handleDelete = async (campaignId) => {
        setActiveMenu(null);
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setIsSubmitting(campaignId); // Start loading for this row
            try {
                const response = await fetch(`/api/campaigns/${campaignId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete campaign.');

                setData(prevData => prevData.filter(c => c.id !== campaignId));
                Swal.fire('Deleted!', 'The campaign has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            } finally {
                setIsSubmitting(null); // Stop loading
            }
        }
    };

    return (
        <>
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
                                        {editingId === campaign.id ? (
                                            <input 
                                                type="text" 
                                                value={editingName} 
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className={styles.editInput}
                                            />
                                        ) : (
                                            campaign.name
                                        )}
                                    </div>
                                </td>
                                <td>{campaign.totalEmployees} Members</td>
                                <td>{campaign.totalVerified} Verified</td>
                                <td>{campaign.notVerified} Pending</td>
                                <td className={styles.actionCell}>
                                    {isSubmitting === campaign.id ? (
                                        <RowSpinner />
                                    ) : editingId === campaign.id ? (
                                        <div className={styles.editActions}>
                                            <button onClick={() => handleSaveEdit(campaign.id)} className={styles.saveButton}><FiCheck /></button>
                                            <button onClick={handleCancelEdit} className={styles.cancelButton}><FiX /></button>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <button onClick={() => toggleMenu(index)} className={styles.moreButton} disabled={isSubmitting}>
                                                <FiMoreVertical />
                                            </button>
                                            {activeMenu === index && 
                                                <ActionMenu 
                                                    onViewDetails={() => handleViewDetails(campaign)}
                                                    onEdit={() => handleEditClick(campaign)}
                                                    onDelete={() => handleDelete(campaign.id)}
                                                />}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CampaignMembersModal 
                isOpen={!!viewingCampaign}
                onClose={() => setViewingCampaign(null)}
                campaign={viewingCampaign}
            />
        </>
    );
};

export default CampaignsTable;
