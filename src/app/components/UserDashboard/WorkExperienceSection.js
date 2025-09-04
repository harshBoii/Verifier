'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import { FiEdit2, FiPlus, FiCheckCircle, FiUserPlus , FiX } from 'react-icons/fi';
import AddExperienceModal from './AddExperienceModal';
import EditExperienceModal from './editExperienceModal';
import UserGetVerifiedModal from './UserGetVerifiedModal';
import VerifierModal from './VerifierModal';
import Swal from 'sweetalert2';
import ProgressStepper from '../Dashboard/ProgressStepper';

// formatDateRange function (No changes needed)
const formatDateRange = (startDateISO, endDateISO, isCurrentlyWorking) => {
    // ... (Your existing formatDateRange function code) ...
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

// ExperienceCard sub-component (Updated)
const ExperienceCard = ({ experience, onEditClick, onVerifyClick, onAddVerifierClick }) => { // 2. Add onEditClick prop
  const logoUrl = `https://placehold.co/40x40/3F51B5/FFFFFF?text=${experience.companyName.charAt(0)}`;
  const isRoleVerified = experience.skills.some(s => s.verificationStatus === 'VERIFIED');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=' border-1 border-zinc-500 rounded-2xl'>
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
        {/* 3. Wire up the onClick handler for the edit button */}
        <button className={styles.editButton} onClick={onEditClick}><FiEdit2 /></button>
      </div>
      <div className={styles.cardBody}>
        <div>
            <p className={styles.cardDescription}>{experience.description}</p>
            <div className={styles.cardSkills}>
                {experience.skills.map(({ skill, verificationStatus }) => (
                <span key={skill.id} className={styles.skillTag} data-verified={verificationStatus === 'VERIFIED'}>
                    {skill.name}
                </span>
                ))}
            </div>
        </div>
          <div className='flex  flex-row'>
            {!experience.is_verified && !experience.mail_sent && (
                <button className={styles.GetverifierButton} onClick={() => onAddVerifierClick(experience)}>
                    <FiUserPlus size={14} /> Add Verifier
                </button>
            )}
            {!experience.is_verified && experience.mail_sent && (
                <button className={styles.GetverifierButton} onClick={() => onAddVerifierClick(experience)}>
                    <FiUserPlus size={14} /> Change Verifier
                </button>
            )}
            {experience.is_verified ? (
              <span className="group relative cursor-pointer"><FiCheckCircle /> 
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm rounded-lg px-2 py-1">Verified</div>
              </span>
            ) : (
              <button className={styles.verifyButton} onClick={() => onVerifyClick(experience)}>
                {experience.mail_sent ? 'Resend' : 'Verify'}
              </button>
            )}
            </div>
        </div>
    </div>
      <div className="mt-4 text-center bg-white rounded-3xl p-3 ">
      <button
        className="text-zinc-600 px-4 py-2 w-full  rounded-md text-xl font-extrabold align-middle hover:text-md hover:text-blue-600 bg-zinc-100 hover:bg-zinc-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Hide":"Track Progress" }
      </button>
      <div
        className={`transition-max-height duration-500 overflow-hidden ${
          isOpen ? "max-h-150" : "max-h-0"
        }`}
      >
        <div className="mt-3 bg-gray-100 p-3 rounded-md">
          <ProgressStepper currentProgress={experience.progress} apollo_used={experience.apollo_used} chat_started={experience.chat_started} chat_finished={experience.chat_finished} />
        </div>
      </div>
      </div>    
    </div>
  );
};


const WorkExperienceSection = ({ experiences = [], refetchData, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState(false);

  // 4. Add state to control the new Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // This handler will be passed to the card to open the Edit Modal
  const handleEditClick = (experience) => {
    setSelectedExperience(experience); // Set the experience to be edited
    setIsEditModalOpen(true);         // Open the modal
  };

  const handleVerifyClick = (experience) => {
    setSelectedExperience(experience);
    setIsVerifierModalOpen(false); 
  };
  
  const handleAddVerifierClick = (experience) => {
    setSelectedExperience(experience);
    setIsVerifierModalOpen(true);
  };

  const handleVerifierSelect = async (data) => {
    if (!selectedExperience) return;
    try {
        const response = await fetch(`/api/experience/${selectedExperience.id}/update-hr-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data:data }),
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
            onEditClick={() => handleEditClick(exp)} // 5. Pass the handler to each card
            onVerifyClick={handleVerifyClick}
            onAddVerifierClick={handleAddVerifierClick}
          />
        ))}
      </div>

      <AddExperienceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetchData}
      />
      
      {/* 6. Render the new EditExperienceModal */}
      <EditExperienceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={refetchData}
        experience={selectedExperience} // Pass the selected experience data to the modal
      />

      <UserGetVerifiedModal
        isOpen={!!selectedExperience && !isVerifierModalOpen && !isEditModalOpen} // Ensure it doesn't open with other modals
        onClose={() => setSelectedExperience(null)}
        user={user}
        experience={selectedExperience}
      />
      <VerifierModal
        isOpen={isVerifierModalOpen}
        onClose={() => setIsVerifierModalOpen(false)}
        onVerifierSelect={handleVerifierSelect}
        experience={selectedExperience}

      />
    </div>
  );
};

export default WorkExperienceSection;
