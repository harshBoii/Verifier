'use client';
import React, { useState } from 'react';
import styles from './AddEducationModal.module.css';
import { FiX, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';

const AddEducationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    branch: '',
    startDate: '',
    endDate: '',
    gradeInCgpa: '',
    description: '',
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
      const response = await fetch('/api/education/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add education.');
      }

      Swal.fire('Success!', 'Educational detail has been added.', 'success');
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
          <h2>Add Educational Detail</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="institution">Institution*</label>
              <input type="text" id="institution" name="institution" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="degree">Degree*</label>
              <input type="text" id="degree" name="degree" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="branch">Branch / Field of Study</label>
              <input type="text" id="branch" name="branch" onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="gradeInCgpa">Grade / CGPA</label>
              <input type="text" id="gradeInCgpa" name="gradeInCgpa" onChange={handleInputChange} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="startDate">Start Date*</label>
              <input type="date" id="startDate" name="startDate" onChange={handleInputChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" onChange={handleInputChange} />
            </div>
          </div>
          <div className={styles.inputGroupFull}>
            <label htmlFor="description">Description (Activities & Roles)</label>
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

export default AddEducationModal;
