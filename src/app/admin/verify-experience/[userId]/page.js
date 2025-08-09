'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

// 1. Import your layout components
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Header from '@/app/components/Dashboard/Header';
import LoadingGlass from '@/app/components/LoadingGlass';

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

    const ActionButton = ({ isVerified, onClick }) => {
        const baseClasses = "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
        if (isVerified === true) {
            return (
                <button onClick={onClick} className={`${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`}>
                    <FiX /> Decline
                </button>
            );
        }
        return (
            <button onClick={onClick} className={`${baseClasses} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`}>
                <FiCheck /> Accept
            </button>
        );
    };

    const pageContent = () => {
        if (loading) return <LoadingGlass className="h-40 w-50"/>;
        if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
        if (!user) return null;

        return (
            <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm sm:p-8">
                {/* Page Header */}
                <div className="mb-8 flex items-center gap-4 border-b border-gray-200 pb-6">
                    <Image 
                        src={`https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}&background=random&color=fff&bold=true`} 
                        alt={user.fullName} 
                        width={64} 
                        height={64} 
                        className="rounded-full" 
                        unoptimized={true} 
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Work Experience Verification</h1>
                        <h2 className="text-md text-gray-600">For: {user.fullName}</h2>
                    </div>
                </div>

                {/* Experience List */}
                <div className="flex flex-col gap-6 mt-20">
                    {user.workExperiences.length > 0 ? (
                        user.workExperiences.map(exp => (
                            <div key={exp.id} className="flex flex-col gap-4 rounded-md border border-gray-200 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-800">{exp.role} at {exp.companyName}</h3>
                                    <p className="text-sm text-gray-500">{new Date(exp.startDate).getFullYear()} - {exp.currentlyWorking ? 'Present' : new Date(exp.endDate).getFullYear()}</p>
                                    <p className="mt-2 text-gray-700">{exp.description}</p>
                                </div>
                                <div className="flex flex-col items-start gap-3 sm:items-end">
                                    <StatusBadge status={exp.is_verified} />
                                    <ActionButton 
                                        isVerified={exp.is_verified}
                                        onClick={() => handleVerification(exp.id, exp.is_verified !== true)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No work experiences to verify.</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col">
                <div className="px-4 py-6 sm:px-8">
                    <Header user={user} />
                </div>
                <main className="flex-1 px-4 pb-8 sm:px-8">
                    {pageContent()}
                </main>
            </div>
        </div>
    );
};

export default VerifyExperiencePage;
