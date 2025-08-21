'use client';

import React, { useState, useEffect } from 'react';
import styles from './AddExperienceModal.module.css'; // You can reuse the same CSS module
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

// A helper function to format date strings for the date input
const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toISOString().split('T')[0];
};

export default function EditExperienceModal({ isOpen, onClose, onSuccess, experience }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs when the modal is opened or the 'experience' prop changes.
  // It populates the form with the existing data of the experience being edited.
  useEffect(() => {
    if (experience) {
      setFormData({
        role: experience.role || '',
        companyName: experience.companyName || '',
        employeeId: experience.employeeId || '',
        workType: experience.workType || 'FULL_TIME',
        location: experience.location || '',
        startDate: formatDateForInput(experience.startDate),
        endDate: formatDateForInput(experience.endDate),
        currentlyWorking: experience.currentlyWorking || false,
        description: experience.description || '',
      });
    }
  }, [experience]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!experience) return;

    setIsSubmitting(true);
    try {
      // Send a PUT request to update the specific experience
      const response = await fetch(`/api/experience/${experience.id}`, { // Using a dynamic ID
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update experience.');
      }

      Swal.fire('Success!', 'Work experience has been updated.', 'success');
      onSuccess(); // Trigger the data refetch on the parent page
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
          <h2>Edit Work Experience</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="role">Role / Position*</label>
              <input type="text" id="role" name="role" value={formData.role} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="companyName">Company Name*</label>
              <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="workType">Work Type*</label>
              <select id="workType" name="workType" value={formData.workType} onChange={handleInputChange}>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT_BASED">Contract</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="location">Location*</label>
              <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} disabled={formData.currentlyWorking} />
            </div>
          </div>
          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="currentlyWorking" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleInputChange} />
            <label htmlFor="currentlyWorking">I am currently working in this role</label>
          </div>
          <div className={styles.inputGroupFull}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} rows="4" onChange={handleInputChange}></textarea>
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
