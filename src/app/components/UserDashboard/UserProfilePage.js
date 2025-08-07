'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import BasicProfileForm from './BasicProfileForm';
import EducationSection from './EducationSection';
import WorkExperienceSection from './WorkExperienceSection';
import SkillRepositorySection from './SkillRepository';
import Loading from '../Loading';
import { FiEdit2, FiPlus, FiCheckCircle } from 'react-icons/fi';

/**
 * Helper function to format date ranges professionally.
 * @param {string} startDateISO - An ISO date string.
 * @param {string | null} endDateISO - An ISO date string or null.
 * @param {boolean} isCurrentlyWorking - Boolean flag.
 * @returns {string} - A formatted string like "Apr 2025 - Oct 2025 | 6 mos".
 */

/**
 * The main page component, now fully synced with the Prisma API.
 */
const UserProfilePage = ({ id }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Basic Profile'); // <-- Set default to Basic Profile

    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/profile/${id}`);
        if (!response.ok) {
          throw new Error('Profile not found.');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    if (!id) return;
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/profile/${id}`);
        if (!response.ok) {
          throw new Error('Profile not found.');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  // Handle loading and error states
  if (loading) return <Loading/>;
  if (error) return <div className={styles.centeredMessage}><p style={{ color: 'red' }}>Error: {error}</p></div>;
  if (!profileData) return null;


  // Generate avatar URL dynamically from the user's name
  const avatarUrl = `https://ui-avatars.com/api/?name=${profileData.fullName.replace(' ', '+')}&background=random&color=fff&size=128`;

  // Conditionally render the main content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Work Experiences':
        return <WorkExperienceSection experiences={profileData.workExperiences} refetchData={fetchProfileData} user={profileData}/>;
      case 'Basic Profile':
        return <BasicProfileForm profileData={profileData} />;
      case 'Education':
        return <EducationSection educations={profileData.educations} refetchData={fetchProfileData} user={profileData} />;
      case 'Skill Repository':
        return <SkillRepositorySection skills={profileData.skills} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.profileLayout}>
      {/* Left Profile Sidebar */}
      <aside className={styles.profileSidebar}>
        <div className={styles.avatarSection}>
          <Image src={avatarUrl} alt={profileData.fullName} width={80} height={80} className={styles.avatar} />
          <h2 className={styles.profileName}>{profileData.fullName}</h2>
        </div>
        <nav className={styles.profileNav}>
          {['Basic Profile', 'Education', 'Work Experiences', 'Skill Repository'].map(tab => (
            <button
              key={tab}
              className={`${styles.navLink} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Right Main Content */}
      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

export default UserProfilePage;