'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './UserProfile.module.css';
import { FiEdit2, FiPlus, FiCheckCircle } from 'react-icons/fi';
import AddEducationModal from './AddEducationModal';
import EditEducationModal from './editEducationModal';
import UserGetVerifiedModal from './UserGetVerifiedModal';
import WrapButton from '@/components/ui/wrap-button';



const EducationCard = ({ education, onEditClick, onVerifyClick }) => {
  const logoUrl = `https://placehold.co/40x40/7E57C2/FFFFFF?text=${education.institution.charAt(0)}`;
  // This should eventually come from your data, but is hardcoded for now.
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
        {/* 2. The edit button now triggers the onEditClick handler */}
        <button className={styles.editButton} onClick={onEditClick}>
          <FiEdit2 />
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>
          {education.description}
          {/* The read more link can be implemented if descriptions are long */}
          {/* <a href="#"> ...read more</a> */}
        </p>
        {/* The Verify button logic can be re-enabled here if needed */}
        {/* <button className={styles.verifyButton} onClick={onVerifyClick}>Verify</button> */}
      </div>
    </div>
  );
};


// --- Main EducationSection Component (Updated) ---
const EducationSection = ({ educations = [], refetchData, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  // --- NEW STATE FOR EDITING ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null); // To hold the data for the record being edited

  // This handler will be passed to each card to initiate editing
  const handleEditClick = (education) => {
    setSelectedEducation(education); // Set the specific education record to be edited
    setIsEditModalOpen(true);        // Open the edit modal
  };

  const handleVerifyClick = () => {
    setIsVerifyModalOpen(true);
  };

  // A new success handler to close the modal and refetch data
  const handleEditSuccess = () => {
    setIsEditModalOpen(false); // Close the modal
    refetchData();             // Refetch all data to show the update
  };
  
  const handleAddSuccess = () => {
    setIsAddModalOpen(false); // Close the modal
    refetchData();            // Refetch all data
  }

  return (
    <div>
      <div className={styles.contentHeader}>
        <h3>Educational Details</h3>
        <WrapButton onClick={() => setIsAddModalOpen(true)}>
           Add Education
        </WrapButton>
      </div>
      <div className={styles.cardContainer}>
        {educations.map(edu => (
          <EducationCard 
            key={edu.id} 
            education={edu} 
            onEditClick={() => handleEditClick(edu)} // 3. Pass the handler to the card
            onVerifyClick={handleVerifyClick} 
          />
        ))}
      </div>

      {/* Add Modal */}
      <AddEducationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      
      {/* 4. Render the new EditEducationModal */}
      <EditEducationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        education={selectedEducation} // Pass the selected education data to the modal
      />

      {/* Verification Modal */}
      <UserGetVerifiedModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default EducationSection;
