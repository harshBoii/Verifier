'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddExperienceModal.module.css'; // You can reuse the same CSS module for consistent styling
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

// A helper function to format date strings for the date input
const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toISOString().split('T')[0];
};

export default function EditEducationModal({ isOpen, onClose, onSuccess, education }) {
  // State for the form, initialized as an empty object
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect populates the form with the education record's data when the modal opens
  useEffect(() => {
    if (education) {
      setFormData({
        degree: education.degree || '',
        institution: education.institution || '',
        branch: education.branch || '',
        rollNumber: education.rollNumber || '',
        startDate: formatDateForInput(education.startDate),
        endDate: formatDateForInput(education.endDate),
        gradeInCgpa: education.gradeInCgpa || '',
        description: education.description || '',
      });
    }
  }, [education]); // This effect runs whenever the 'education' prop changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!education) return;

    setIsSubmitting(true);
    try {
      // Send a PUT request to update the specific education record
      const response = await fetch(`/api/education/${education.id}`, { // Using a dynamic ID
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update education record.');
      }

      Swal.fire('Success!', 'Education record has been updated.', 'success');
      onSuccess(); // Trigger a data refetch on the parent component
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
          <h2>Edit Education Record</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Fields specific to Education */}
            <div className={styles.inputGroup}>
              <label htmlFor="degree">Degree*</label>
              <input type="text" id="degree" name="degree" value={formData.degree} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="institution">Institution*</label>
              <input type="text" id="institution" name="institution" value={formData.institution} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="branch">Branch / Field of Study</label>
              <input type="text" id="branch" name="branch" value={formData.branch} onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="rollNumber">Roll Number</label>
              <input type="text" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="gradeInCgpa">Grade / CGPA</label>
              <input type="number" step="0.01" id="gradeInCgpa" name="gradeInCgpa" value={formData.gradeInCgpa} onChange={handleInputChange} />
            </div>
          </div>
          <div className={styles.inputGroupFull}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} rows="3" onChange={handleInputChange}></textarea>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              <FiSave /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
