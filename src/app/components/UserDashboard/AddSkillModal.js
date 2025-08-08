'use client';
import React, { useState } from 'react';
import styles from './AddSkillModal.module.css';
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

const AddSkillModal = ({ isOpen, onClose, onSuccess, workExperiences = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'DEVELOPMENT_AND_TECH',
    skillType: 'ROLE',
    workExperienceId: workExperiences[0]?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/skills/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add skill.');
      }

      Swal.fire('Success!', 'New skill has been added.', 'success');
      onSuccess(); // Refetch data on the parent page
      onClose();   // Close the modal

    } catch (error) {
      Swal.fire('Error!', error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Skill</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Skill Name*</label>
            <input type="text" id="name" name="name" onChange={handleInputChange} required />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="category">Category*</label>
              <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
                <option value="DEVELOPMENT_AND_TECH">Development & Tech</option>
                <option value="DESIGN">Design</option>
                <option value="MARKETING">Marketing</option>
                <option value="BUSINESS">Business</option>
                {/* Add other categories from your enum */}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="skillType">Skill Type*</label>
              <select id="skillType" name="skillType" value={formData.skillType} onChange={handleInputChange}>
                <option value="ROLE">Role Based</option>
                <option value="INTEREST">Interest Based</option>
              </select>
            </div>
          </div>

          {/* Conditional Work Experience Dropdown */}
          {formData.skillType === 'ROLE' && (
            <div className={styles.inputGroupFull}>
              <label htmlFor="workExperienceId">Associate with Work Experience*</label>
              <select id="workExperienceId" name="workExperienceId" value={formData.workExperienceId} onChange={handleInputChange} required>
                {workExperiences.map(exp => (
                  <option key={exp.id} value={exp.id}>
                    {exp.role} at {exp.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              <FiSave /> {isSubmitting ? 'Saving...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;
