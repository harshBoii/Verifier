'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './VerificationPage.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import GetVerifiedModal from './GetVerifiedModal';
import GetHrEmailModal from '../GetHrEmailModal';
import { FiCheck, FiCheckCircle, FiXCircle, FiMoreVertical } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Link from 'next/link';
import LoadingGlass from '../LoadingGlass';

const renderStatusIcon = (status) => {
    switch (status) {
        case 'verified': return <FiCheckCircle className={styles.statusVerified} />;
        case 'rejected': return <FiXCircle className={styles.statusRejected} />;
        case 'pending': return <FiCheck className={styles.statusPending} />;
        default: return null;
    }
};

const ActionMenu = ({ onVerifyClick, onGetHrEmail, user }) => (
    <div className={styles.actionMenu}>
        <button>Edit</button>
        <button onClick={onVerifyClick}>Send Verification</button>
        {/* The new link/button */}
        {/* <Link href={`/admin/verify-experience/${user.id}`} className={styles.actionButton}> */}
            <button onClick={()=>GoVerify(user.id)}>View Exp</button> 
        {/* </Link> */}
        <button onClick={onGetHrEmail}>Get HR Email</button>
        <button className={styles.delete}>Delete</button>
    </div>
);

const GoVerify=(id)=>{
    window.location.href=`/admin/verify-experience/${id}`
}

const VerificationPage = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState([]); // Default to an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDirectSendModalOpen, setIsDirectSendModalOpen] = useState(false);
    const [isHrChoiceModalOpen, setIsHrChoiceModalOpen] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/company-employees');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch employees.');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []); // Empty array ensures this runs only once on mount

    // --- EVENT HANDLERS (No changes needed here) ---
    const toggleMenu = (index) => setActiveMenu(activeMenu === index ? null : index);

    // --- NEW & UPDATED EVENT HANDLERS ---
    const handleGetHrEmailClick = (user) => {
        setSelectedUser(user);
        setIsHrChoiceModalOpen(true);
        setActiveMenu(null);
    };

    const handleRequestFromEmployee = async () => {
        if (!selectedUser) return;
        setIsHrChoiceModalOpen(false);
        try {
            const response = await fetch('/api/request-hr-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.id }),
            });
            if (!response.ok) throw new Error('Failed to send request.');
            Swal.fire('Sent!', `An email has been sent to ${selectedUser.name} asking for their HR's email.`, 'success');
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        }
        setSelectedUser(null);
    };

    const handleSendDirectly = () => {
        setIsHrChoiceModalOpen(false);
        setIsDirectSendModalOpen(true);
    };
    
    // This now opens the direct send modal
    const handleVerifyClick = (user) => {
        setSelectedUser(user);
        setIsDirectSendModalOpen(true);
        setActiveMenu(null);
    };


    return (
        <>
            <div className={styles.pageContainer}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Header user={{ name: 'Admin' }} />
                    <div className={styles.titleBar}>
                        <h2>Till Now Verified</h2>
                        <button className={styles.bulkVerifyButton}>Bulk Verify</button>
                    </div>
                    <div className={styles.tableContainer}>
                        {loading ? (
                            <LoadingGlass className='-mt-20'/>
                        ) : error ? (
                            <p style={{ color: 'red' }}>Error: {error}</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th><th>Email</th><th>Role</th><th>HR Email</th><th>Status</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td >
                                                <div className={styles.userCell}>
                                                    <Image src={`https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`} alt={user.name} width={30} height={30} className={styles.avatar} unoptimized={true} />
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{user.hrEmail || 'N/A'}</td>
                                            <td>
                                                <div className={styles.statusCell}>
                                                    {renderStatusIcon(user.status)}
                                                </div>
                                            </td>
                                            <td className={styles.actionCell}>
                                                {/* Always show action menu for dynamic data */}
                                                <div style={{ position: 'relative' }}>
                                                    <button onClick={() => toggleMenu(index)} className={styles.moreButton}><FiMoreVertical /></button>
                                                    {activeMenu === index && 
                                                        <ActionMenu 
                                                            user={user}
                                                            onVerifyClick={() => handleVerifyClick(user)}
                                                            onGetHrEmail={() => handleGetHrEmailClick(user)}
                                                        />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals remain the same */}
            <GetHrEmailModal
                isOpen={isHrChoiceModalOpen}
                onClose={() => setIsHrChoiceModalOpen(false)}
                onRequestFromEmployee={handleRequestFromEmployee}
                onSendDirectly={handleSendDirectly}
            />
            <GetVerifiedModal
                isOpen={isDirectSendModalOpen}
                onClose={() => {
                    setIsDirectSendModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </>
    );
};

export default VerificationPage;