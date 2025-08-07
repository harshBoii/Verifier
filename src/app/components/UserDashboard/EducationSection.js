'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import { FiEdit2, FiPlus, FiCheckCircle } from 'react-icons/fi';
import AddEducationModal from './AddEducationModal';
import UserGetVerifiedModal from './UserGetVerifiedModal';

const EducationCard = ({ education, onVerifyClick }) => {
  const logoUrl = `https://placehold.co/40x40/7E57C2/FFFFFF?text=${education.institution.charAt(0)}`;
  const isVerified = true;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Image 
          src={logoUrl} 
          alt={`${education.institution} logo`} 
          width={40} 
          height={40} 
          className={styles.companyLogo}
          unoptimized={true}
        />
        <div className={styles.cardHeaderText}>
          <h4 className={styles.cardRole}>
            {education.institution}
            {isVerified && <FiCheckCircle className={styles.verifiedIcon} />}
          </h4>
          <p className={styles.cardCompany}>{education.degree}{education.branch && `, ${education.branch}`}</p>
          <p className={styles.cardDuration}>
            {new Date(education.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {education.endDate ? new Date(education.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
          </p>
        </div>
        <button className={styles.editButton}><FiEdit2 /></button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>
          {education.description}
          <a href="#"> ...read more</a>
        </p>
        {/* New Verify Button */}
        {/* <button className={styles.verifyButton} onClick={onVerifyClick}>
          Verify
        </button> */}
      </div>
    </div>
  );
};

const EducationSection = ({ educations = [], refetchData, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State for the verification modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleVerifyClick = () => {
    setIsVerifyModalOpen(true);
  };

  return (
    <div>
      <div className={styles.contentHeader}>
        <h3>Educational Details</h3>
        <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
          <FiPlus /> Add Education
        </button>
      </div>
      <div className={styles.cardContainer}>
        {educations.map(edu => (
          <EducationCard key={edu.id} education={edu} onVerifyClick={handleVerifyClick} />
        ))}
      </div>

      <AddEducationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetchData}
      />
      
      {/* Render the UserGetVerifiedModal */}
      <UserGetVerifiedModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        user={user} // Pass the main user object to the modal
      />
    </div>
  );
};

export default EducationSection;
