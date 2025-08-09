'use client';
import React, { useState, useEffect } from 'react';
import styles from './UserProfile.module.css';
import { FiSave, FiLinkedin, FiGithub, FiGlobe, FiEdit3, FiEdit, FiLock } from 'react-icons/fi';
import WrapButton from '@/components/ui/wrap-button';
import SocialMediaModal from './SocialMediaModal';
import Swal from 'sweetalert2'; // Import SweetAlert2

// --- Helper Components (FormInput, FormSelectGender) ---
// These remain unchanged. For brevity, they are included but not detailed again.
const FormInput = ({ label, name, value, placeholder, type = 'text', disabled = false, icon, onChange }) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name}>{label}</label>
    <div className={icon ? styles.inputWithIcon : ''}>
      {icon}
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        className={styles.formInput}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  </div>
);

const FormSelectGender = ({ label, name, value, options, icon, onChange }) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name}>{label}</label>
    <div className={icon ? styles.inputWithIcon : ''}>
      {icon}
      <select
        id={name}
        name={name}
        value={value || ''}
        className={styles.formInput}
        onChange={onChange}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);


// The main form component, now with SweetAlert2 integration
const BasicProfileForm = ({ profileData }) => {
  const [formData, setFormData] = useState(profileData || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleModalSave = (socials) => {
    setFormData(prevData => ({
        ...prevData,
        ...socials
    }));
    setIsModalOpen(false);
  };

  // --- UPDATED: Form submission handler with SweetAlert ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData || !profileData.id) {
      console.error("Profile data is missing or invalid. Cannot submit.");
      Swal.fire({
        title: 'Error!',
        text: 'User data is not loaded. Please refresh the page.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/profile/${profileData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }

      // Show success alert
      Swal.fire({
        title: 'Success!',
        text: 'Your profile has been updated successfully.',
        icon: 'success',
        timer: 2000, // Auto-close after 2 seconds
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg shadow-lg',
        }
      });

    } catch (error) {
      console.error('Submission Error:', error);
      // Show error alert
      Swal.fire({
        title: 'Update Failed',
        html: `
          <div class="text-center text-gray-600">
            <p>We couldn't save your changes.</p>
            <p class="mt-2 text-sm">Please check your connection and try again.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Okay',
        confirmButtonColor: '#ef4444', // Red color for confirm button
        customClass: {
          popup: 'rounded-lg shadow-lg',
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className={styles.contentHeader}>
          <h3>Basic Details</h3>
          <WrapButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </WrapButton>
        </div>

        {/* The old status message divs are no longer needed */}

        <div className={styles.formGrid}>
          {/* Form fields remain the same */}
          <FormInput label="Full Name" name="fullName" value={formData.fullName} icon={<FiEdit3 size={18} />} onChange={handleChange} />
          <FormInput label="Username" name="username" value={formData.username} icon={<FiEdit3 size={18} />} onChange={handleChange} />
          <FormInput label="Date of Birth" name="dob" icon={<FiEdit size={18} />} value={formData.dob ? new Date(formData.dob).toLocaleDateString('en-CA') : ''} type="date" onChange={handleChange} />
          <FormSelectGender
            label="Gender"
            name="gender"
            value={formData.gender}
            icon={<FiEdit3 size={18} />}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select gender' },
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <FormInput label="Mobile" name="mobile" value={formData.mobile} icon={<FiEdit3 size={18} />} placeholder="+91 XXXXX XXXXX" onChange={handleChange} />
          <FormInput label="Email" name="email" value={formData.email} icon={<FiLock size={18} />} disabled />

          <div className={styles.formSection}>
            <label htmlFor="summary" className="text-zinc-500 text-xl">Summary</label>
            <textarea
              id="summary"
              name="summary"
              className={styles.formTextarea}
              placeholder="Write a brief summary about yourself..."
              value={formData.summary || ''}
              onChange={handleChange}
            />
          </div>

          <div className="text-zinc-500 text-xl">
            <label>Social Media</label>
            <WrapButton type="button" className="-ml-50 mt-10" onClick={() => setIsModalOpen(true)}>Manage Social Links</WrapButton>
          </div>
        </div>
      </form>
      
      <SocialMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileData={{ linkedin: formData.linkedin, github: formData.github, website: formData.website }}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default BasicProfileForm;
