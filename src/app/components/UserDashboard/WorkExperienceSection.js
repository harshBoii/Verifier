'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import { FiEdit2, FiPlus, FiCheckCircle } from 'react-icons/fi';
import AddExperienceModal from './AddExperienceModal';
import UserGetVerifiedModal from './UserGetVerifiedModal'; // Import the verification modal

const formatDateRange = (startDateISO, endDateISO, isCurrentlyWorking) => {
  const options = { year: 'numeric', month: 'short' };
  const startDate = new Date(startDateISO);
  const endDate = isCurrentlyWorking ? new Date() : (endDateISO ? new Date(endDateISO) : null);

  const startFormatted = new Intl.DateTimeFormat('en-US', options).format(startDate);
  const endFormatted = isCurrentlyWorking ? 'Present' : (endDate ? new Intl.DateTimeFormat('en-US', options).format(endDate) : '');
  
  if (!endDate) return startFormatted;

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months -= startDate.getMonth();
  months += endDate.getMonth();
  months = months <= 0 ? 0 : months + 1;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let durationStr = '';
  if (years > 0) durationStr += `${years} yr `;
  if (remainingMonths > 0) durationStr += `${remainingMonths} mos`;

  return `${startFormatted} - ${endFormatted} | ${durationStr.trim()}`;
};

/**
 * A sub-component for rendering a single work experience card.
 */
const ExperienceCard = ({ experience, onVerifyClick }) => {
  const logoUrl = `https://placehold.co/40x40/3F51B5/FFFFFF?text=${experience.companyName.charAt(0)}`;
  const isRoleVerified = experience.skills.some(s => s.verificationStatus === 'VERIFIED');
  
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Image src={logoUrl} alt={`${experience.companyName} logo`} width={40} height={40} className={styles.companyLogo} unoptimized={true}/>
        <div className={styles.cardHeaderText}>
          <h4 className={styles.cardRole}>
            {experience.role}
            {isRoleVerified && <FiCheckCircle className={styles.verifiedIcon} />}
          </h4>
          <p className={styles.cardCompany}>{experience.companyName} | {experience.location}</p>
          <p className={styles.cardDuration}>
            {formatDateRange(experience.startDate, experience.endDate, experience.currentlyWorking)}
          </p>
        </div>
        <button className={styles.editButton}><FiEdit2 /></button>
      </div>
      <div className={styles.cardBody}>
        <div>
            <p className={styles.cardDescription}>
                {experience.description}
                <a href="#"> ...read more</a>
            </p>
            <div className={styles.cardSkills}>
                {experience.skills.map(({ skill, verificationStatus }) => (
                <span key={skill.id} className={styles.skillTag} data-verified={verificationStatus === 'VERIFIED'}>
                    {skill.name}
                </span>
                ))}
            </div>
        </div>
        {/* New Verify Button */}
        <button className={styles.verifyButton} onClick={onVerifyClick}>
            Verify
        </button>
      </div>
    </div>
  );
};

const WorkExperienceSection = ({ experiences = [], refetchData, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State for the verification modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handleVerifyClick = () => {
    setIsVerifyModalOpen(true);
  };

  return (
    <div>
      <div className={styles.contentHeader}>
        <h3>Work Experiences & Internships</h3>
        <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
          <FiPlus /> Add Experience
        </button>
      </div>
      <div className={styles.cardContainer}>
        {experiences.map(exp => (
          <ExperienceCard key={exp.id} experience={exp} onVerifyClick={handleVerifyClick} />
        ))}
      </div>

      <AddExperienceModal
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

export default WorkExperienceSection;