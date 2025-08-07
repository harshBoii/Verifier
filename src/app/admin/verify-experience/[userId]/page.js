'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import styles from './VerifyExperiencePage.module.css'; // Adjust path as needed
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

// 1. Import your layout components
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';

const VerifyExperiencePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const { userId } = params;

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/profile/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user data.');
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handleVerification = async (experienceId, isVerified) => {
        try {
            const response = await fetch('/api/experience/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experienceId, isVerified }),
            });
            if (!response.ok) throw new Error('Failed to update status.');
            
            Swal.fire('Success!', 'Verification status updated.', 'success');
            // Refetch data to show the change
            fetchUserData(); 
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
    };

    // The main content of the page is now a separate block of JSX
    const pageContent = () => {
        if (loading) return <div className={styles.container}><p>Loading experiences...</p></div>;
        if (error) return <div className={styles.container}><p style={{color: 'red'}}>Error: {error}</p></div>;
        if (!user) return null;

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <Image src={`https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}&background=random`} alt={user.fullName} width={50} height={50} className={styles.avatar} unoptimized={true} />
                    <div>
                        <h1>Work Experience Verification</h1>
                        <h2>For: {user.fullName}</h2>
                    </div>
                </div>

                <div className={styles.experienceList}>
                    {user.workExperiences.map(exp => (
                        <div key={exp.id} className={styles.card}>
                            <div>
                                <h3 className={styles.role}>{exp.role} at {exp.companyName}</h3>
                                <p className={styles.duration}>{new Date(exp.startDate).getFullYear()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).getFullYear()}</p>
                                <p className={styles.description}>{exp.description}</p>
                            </div>
                            <div className={styles.actions}>
                                {exp.is_verified === true && <span className={`${styles.status} ${styles.verified}`}><FiCheck /> Verified</span>}
                                {exp.is_verified === false && <span className={`${styles.status} ${styles.declined}`}><FiX /> Declined</span>}
                                {exp.is_verified === null && <span className={`${styles.status} ${styles.pending}`}><FiClock /> Pending</span>}
                                <div className={styles.buttonGroup}>
                                    <button className={styles.acceptButton} onClick={() => handleVerification(exp.id, true)}>Accept</button>
                                    <button className={styles.declineButton} onClick={() => handleVerification(exp.id, false)}>Decline</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // 2. Return the full page layout with Sidebar, Header, and the content
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 30px 0 30px' }}>
                    {/* Assuming the Header needs a user object */}
                    <Header user={user} />
                </div>
                <main style={{ padding: '0 30px 30px 30px' }}>
                    {pageContent()}
                </main>
            </div>
        </div>
    );
};

export default VerifyExperiencePage;
