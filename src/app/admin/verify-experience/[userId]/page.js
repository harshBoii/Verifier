'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import styles from './VerifyExperiencePage.module.css';
import { FiCheck, FiX, FiClock, FiMail } from 'react-icons/fi';
import LoadingGlass from '@/app/components/LoadingGlass';
import SubAlert from '@/app/components/Dashboard/SubAlert';
import Link from 'next/link';

// 1. Import all necessary components
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';
import GetVerifiedModal from '@/app/components/Dashboard/GetVerifiedModal';
import GetHrEmailModal from '@/app/components/GetHrEmailModal';
import { Router } from 'next/router';

const VerifyExperiencePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const { userId } = params;

    // State for modals
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [isHrChoiceModalOpen, setIsHrChoiceModalOpen] = useState(false);
    const [isDirectSendModalOpen, setIsDirectSendModalOpen] = useState(false);

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
            fetchUserData(); 
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
    };

    // Event handlers for the HR email flow
    const handleGetHrEmailClick = (experience) => {
        setSelectedExperience(experience);
        setIsHrChoiceModalOpen(true);
    };

    const handleRequestFromEmployee = async () => {
        if (!selectedExperience) return;
        setIsHrChoiceModalOpen(false);
        try {
            const response = await fetch(`/api/experience/${selectedExperience.id}/request-hr-email`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to send request.');
            Swal.fire('Sent!', 'An email has been sent to the user.', 'success');
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        }
        setSelectedExperience(null);
    };

    const handleSendDirectly = () => {
        setIsHrChoiceModalOpen(false);
        setIsDirectSendModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const baseClasses = "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium";
        if (status === true) {
            return <span className={`${baseClasses} bg-green-100 text-green-800`}><FiCheck /> Verified</span>;
        }
        if (status === false) {
            return <span className={`${baseClasses} bg-red-100 text-red-800`}><FiX /> Declined</span>;
        }
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><FiClock /> Pending</span>;
    };

    const pageContent = () => {
        if (loading) return <LoadingGlass className='ml-[13vw]'/>;
        if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
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
                            <Link href={`/admin/experience/${exp.id}`}>
                            <div>
                                <h3 className={styles.role}>{exp.role} at {exp.companyName}</h3>
                                <p className={styles.duration}>{new Date(exp.startDate).getFullYear()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).getFullYear()}</p>
                                <p className={styles.description}>{exp.description}</p>
                            </div>
                            </Link>
                            <div className={styles.actions}>
                                <StatusBadge status={exp.is_verified} />
                                <div className={styles.buttonGroup}>
                                    <button className={styles.greenButton} onClick={() => handleGetHrEmailClick(exp)}>
                                        <FiMail /> 
                                    </button>
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

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <div className="px-4 py-6 sm:px-8 ">
                        <Header user={user} />
                        <SubAlert/>
                    </div>
                    <main className="flex-1 px-4 pb-8 sm:px-8 ">
                        {pageContent()}
                    </main>
                </div>
            </div>
            {/* Render the new modals */}
            <GetHrEmailModal
                isOpen={isHrChoiceModalOpen}
                onClose={() => setIsHrChoiceModalOpen(false)}
                onRequestFromEmployee={handleRequestFromEmployee}
                onSendDirectly={handleSendDirectly}
            />

            <GetVerifiedModal
                isOpen={isDirectSendModalOpen}
                onClose={() => setIsDirectSendModalOpen(false)}
                user={user}
                experience={selectedExperience}
            />
        </>
    );
};

export default VerifyExperiencePage;
