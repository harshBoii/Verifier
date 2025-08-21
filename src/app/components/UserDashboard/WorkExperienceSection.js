'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import { FiEdit2, FiPlus, FiCheckCircle, FiUserPlus } from 'react-icons/fi';
import AddExperienceModal from './AddExperienceModal';
import UserGetVerifiedModal from './UserGetVerifiedModal';
import VerifierModal from './VerifierModal'; // 1. Import the VerifierModal
import Swal from 'sweetalert2';

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
const ExperienceCard = ({ experience, onVerifyClick, onAddVerifierClick }) => {
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
                {/* <a href="#"> ...read more</a> */}
            </p>
            <div className={styles.cardSkills}>
                {experience.skills.map(({ skill, verificationStatus }) => (
                <span key={skill.id} className={styles.skillTag} data-verified={verificationStatus === 'VERIFIED'}>
                    {skill.name}
                </span>
                ))}
            </div>
        </div>
        
        {/* Button container */}

          <div className='flex  flex-row'>
            {/* --- THIS IS THE UPDATED LOGIC --- */}
            {/* The "Add Verifier" button is now only shown if the experience is not verified and no mail has been sent. */}
            {!experience.is_verified && !experience.mail_sent && (
                <button className={styles.GetverifierButton} onClick={() => onAddVerifierClick(experience)}>
                    <FiUserPlus size={14} /> Add Verifier
                </button>
            )}

            {/* && !experience.mail_sent */}

            {!experience.is_verified && experience.mail_sent && (
                <button className={styles.GetverifierButton} onClick={() => onAddVerifierClick(experience)}>
                    <FiUserPlus size={14} /> Change Verifier
                </button>
            )}


            {experience.is_verified ? (
              <span className="group relative cursor-pointer">
                <FiCheckCircle /> 
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                      opacity-0 group-hover:opacity-100 transition 
                      bg-black text-white text-sm rounded-lg px-2 py-1">
                      Verified
                    </div>
              </span>
            ) : (
              <button className={styles.verifyButton} onClick={() => onVerifyClick(experience)}>
                {experience.mail_sent ? 'Resend' : 'Verify'}
              </button>
            )}
            </div>
        </div>

    </div>
  );
};

const WorkExperienceSection = ({ experiences = [], refetchData, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState(false); // State for the Verifier modal

  const handleVerifyClick = (experience) => {
    // Logic to open the GetVerifiedModal
    // This needs to be distinct from the VerifierModal logic
    setSelectedExperience(experience);
    setIsVerifierModalOpen(false); // Ensure verifier modal is closed
  };
  
  const handleAddVerifierClick = (experience) => {
    setSelectedExperience(experience);
    setIsVerifierModalOpen(true);
  };

  const handleVerifierSelect = async (email) => {
    if (!selectedExperience) return;
    try {
        const response = await fetch(`/api/experience/${selectedExperience.id}/update-hr-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hrEmail: email }),
        });
        if (!response.ok) throw new Error('Failed to update verifier email.');
        Swal.fire('Success!', 'Verifier email has been updated.', 'success');
        refetchData(); // Refetch all data to show the update
    } catch (error) {
        Swal.fire('Error!', error.message, 'error');
    }
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
          <ExperienceCard 
            key={exp.id} 
            experience={exp} 
            onVerifyClick={handleVerifyClick}
            onAddVerifierClick={handleAddVerifierClick} // Pass the new handler
          />
        ))}
      </div>

      <AddExperienceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetchData}
      />

      <UserGetVerifiedModal
        isOpen={!!selectedExperience && !isVerifierModalOpen} // Only open if verifier modal is not
        onClose={() => setSelectedExperience(null)}
        user={user}
        experience={selectedExperience}
      />

      {/* Render the new VerifierModal */}
      <VerifierModal
        isOpen={isVerifierModalOpen}
        onClose={() => setIsVerifierModalOpen(false)}
        onVerifierSelect={handleVerifierSelect}
      />
    </div>
  );
};

export default WorkExperienceSection;
