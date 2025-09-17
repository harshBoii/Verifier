'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import { FaPaperPlane } from 'react-icons/fa';
import LoadingGlass from '@/app/components/LoadingGlass';
import ProgressStepper from '@/app/components/Dashboard/ProgressStepper';
import GetVerifiedModal from '@/app/components/Dashboard/GetVerifiedModal';
import GetHrEmailModal from '@/app/components/GetHrEmailModal';
import styles from './VerifyExperiencePage.module.css';

const VerifyExperiencePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userId } = useParams();

  const [isOpen, setIsOpen] = useState(false);

  // Modals
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isHrChoiceModalOpen, setIsHrChoiceModalOpen] = useState(false);
  const [isDirectSendModalOpen, setIsDirectSendModalOpen] = useState(false);

  // Fetch user data
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
    if (userId) fetchUserData();
  }, [userId]);

  // Verify an experience
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

  // Employee verify (whole profile)
  const handleVerifyEmployee = async () => {
    try {
      const res = await fetch('/api/employee/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: data.message || 'Something went wrong',
          confirmButtonColor: '#d33',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Verified!',
          text: 'Employee verified successfully ✅',
          confirmButtonColor: '#3085d6',
        });
        fetchUserData();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Please check your connection and try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // HR email flow
  const handleGetHrEmailClick = (experience) => {
    setSelectedExperience(experience);
    setIsHrChoiceModalOpen(true);
  };

  const handleRequestFromEmployee = async () => {
    if (!selectedExperience) return;
    setIsHrChoiceModalOpen(false);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/experience/${selectedExperience.id}/request-hr-email`,
        { method: 'POST' }
      );
      if (!response.ok) throw new Error('Failed to send request.');
      Swal.fire('Sent!', 'An email has been sent to the user.', 'success');
    } catch (err) {
      Swal.fire('Error!', err.message, 'error');
    } finally {
      setLoading(false);
      setSelectedExperience(null);
    }
  };

  const handleSendDirectly = () => {
    setIsHrChoiceModalOpen(false);
    setIsDirectSendModalOpen(true);
  };

  // Status badge
  const StatusBadge = ({ status }) => {
    const baseClasses =
      'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium';
    if (status === true) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <FiCheck /> Verified
        </span>
      );
    }
    if (status === false) {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <FiX /> Declined
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
        <FiClock /> Pending
      </span>
    );
  };

  // Page content
  const pageContent = () => {
    if (loading) return <LoadingGlass className="ml-[13vw]" />;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!user) return null;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Image
            src={`https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}&background=random`}
            alt={user.fullName}
            width={50}
            height={50}
            className={styles.avatar}
            unoptimized
          />
          <div>
            <h1>Work Experience Verification</h1>
            <h2>For: {user.fullName}</h2>
          </div>
          <button onClick={handleVerifyEmployee} className="ml-auto bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg">
            <FiCheck />
          </button>
        </div>

        {user.workExperiences.length > 0 ? (
          <div className={styles.experienceList}>
            {user.workExperiences.map((exp) => (
              <div key={exp.id} className="border border-zinc-300 rounded-2xl mb-6">
                <div className={styles.card}>
                  <Link href={`/admin/experience/${exp.id}`}>
                    <div>
                      <h3 className={styles.role}>
                        {exp.role} at {exp.companyName}
                      </h3>
                      <p className={styles.duration}>
                        {new Date(exp.startDate).getFullYear()} -{' '}
                        {exp.currentlyWorking
                          ? 'Present'
                          : new Date(exp.endDate).getFullYear()}
                      </p>
                      <p className={styles.description}>{exp.description}</p>
                    </div>
                  </Link>

                  <div className={styles.actions}>
                    <StatusBadge status={exp.is_verified} />
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.greenButton}
                        onClick={() => handleGetHrEmailClick(exp)}
                      >
                        <FaPaperPlane />
                      </button>
                      <button
                        className={styles.acceptButton}
                        onClick={() => handleVerification(exp.id, true)}
                      >
                        Accept
                      </button>
                      <button
                        className={styles.declineButton}
                        onClick={() => handleVerification(exp.id, false)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress section */}
                <div className="mt-4 text-center bg-white rounded-3xl p-3">
                  <button
                    className="text-zinc-600 px-4 py-2 w-full rounded-md text-xl font-bold hover:text-blue-600 bg-zinc-100 hover:bg-zinc-300"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? 'Hide' : 'Track Progress'}
                  </button>
                  <div
                    className={`transition-max-height duration-500 overflow-hidden ${
                      isOpen ? 'max-h-150' : 'max-h-0'
                    }`}
                  >
                    <div className="mt-3 bg-gray-100 p-3 rounded-md">
                      <ProgressStepper
                        currentProgress={exp.progress}
                        apollo_used={exp.apollo_used}
                        chat_started={exp.chat_started}
                        chat_finished={exp.chat_finished}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No work experiences found.</div>
        )}
      </div>
    );
  };

  return (
    <>
      {pageContent()}
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
          setSelectedExperience(null);
        }}
        user={user}
      />
    </>
  );
};

export default VerifyExperiencePage;
