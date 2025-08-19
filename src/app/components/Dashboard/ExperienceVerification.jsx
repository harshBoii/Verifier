'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { FiUser, FiBriefcase, FiCheck, FiX, FiAward, FiMessageSquare } from 'react-icons/fi';

// Spinner component for loading states
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ExperienceVerificationPage = () => {
    const [experience, setExperience] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const router = useRouter();
    const { experienceId } = params;

    useEffect(() => {
        if (experienceId) {
            const fetchExperience = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/experience/${experienceId}`);
                    if (!response.ok) throw new Error('Could not find the verification record.');
                    const data = await response.json();
                    setExperience(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchExperience();
        }
    }, [experienceId]);

    const handleVerification = async (isVerified) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/experience/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experienceId: experience.id, isVerified }),
            });
            if (!response.ok) throw new Error('Failed to update status.');
            
            await Swal.fire({
                title: isVerified ? 'Verified!' : 'Action Recorded',
                text: `The experience has been marked as ${isVerified ? 'verified' : 'failed'}.`,
                icon: 'success',
                confirmButtonColor: '#3B82F6'
            });

            // Optionally redirect after success
            router.push('/dashboard'); 

        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Loading Verification Details...</p></div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p className="text-red-500">{error}</p></div>;
    }

    if (!experience) return null;

    const { user } = experience;

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
                <header className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex flex-col sm:flex-row items-center gap-6">
                    <Image 
                        src={`https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}&background=EBF4FF&color=1D4ED8&size=128&bold=true`}
                        alt={user.fullName}
                        width={100}
                        height={100}
                        className="rounded-full border-4 border-white shadow-md"
                        unoptimized={true}
                    />
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">{user.fullName}</h1>
                        <p className="text-lg text-blue-200">{user.position || 'Employee'}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-8 space-y-8">
                    {/* Work Experience Details */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                            <FiBriefcase className="text-blue-500" />
                            Work Experience to Verify
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-gray-900">{experience.role}</h3>
                            <p className="text-md font-medium text-gray-700">{experience.companyName}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(experience.startDate).getFullYear()} - {experience.currentlyWorking ? 'Present' : new Date(experience.endDate).getFullYear()}</p>
                            <p className="mt-4 text-gray-600 leading-relaxed">{experience.description}</p>
                        </div>
                    </section>

                    {/* Skills Section */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                            <FiAward className="text-blue-500" />
                            Skills Utilized
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {experience.skills.map(({ skill }) => (
                                <span key={skill.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* HR Comment Section */}
                    {experience.hr_comment && (
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                                <FiMessageSquare className="text-blue-500" />
                                Previous Verifier's Comment
                            </h2>
                            <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                                <p className="text-gray-600 italic">"{experience.hr_comment}"</p>
                            </blockquote>
                        </section>
                    )}
                </main>

                {/* Action Footer */}
                <footer className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4">
                    <p className="text-sm text-gray-500">Please confirm the details of this experience.</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => handleVerification(false)} 
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            <FiX /> {isSubmitting ? 'Submitting...' : 'Fail'}
                        </button>
                        <button 
                            onClick={() => handleVerification(true)} 
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? <Spinner /> : <><FiCheck /> Verify</>}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ExperienceVerificationPage;
