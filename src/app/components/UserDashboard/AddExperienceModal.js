'use client';
import React, { useState } from 'react';
import styles from './AddExperienceModal.module.css';
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

const AddExperienceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    role: '',
    companyName: '',
    employeeId: '',
    workType: 'FULL_TIME',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/experience/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add experience.');
      }

      Swal.fire('Success!', 'Work experience has been added.', 'success');
      onSuccess(); // This will trigger the data refetch on the parent page
      onClose(); // Close the modal

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
          <h2>Add Work Experience</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="role">Role / Position*</label>
              <input type="text" id="role" name="role" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="companyName">Company Name*</label>
              <input type="text" id="companyName" name="companyName" onChange={handleInputChange} required />
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
              <input type="text" id="location" name="location" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input type="date" id="startDate" name="startDate" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" onChange={handleInputChange} disabled={formData.currentlyWorking} />
            </div>
          </div>
          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="currentlyWorking" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleInputChange} />
            <label htmlFor="currentlyWorking">I am currently working in this role</label>
          </div>
          <div className={styles.inputGroupFull}>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="4" onChange={handleInputChange}></textarea>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              <FiSave /> {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExperienceModal;
