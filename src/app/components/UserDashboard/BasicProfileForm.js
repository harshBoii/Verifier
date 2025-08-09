'use client';
import React from 'react';
import styles from './UserProfile.module.css';
import { FiSave, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';
import WrapButton from '@/components/ui/wrap-button';

// Updated FormInput to accept and render an icon
const FormInput = ({ label, name, value, placeholder, type = 'text', disabled = false, icon }) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name}>{label}</label>
    <div className={icon ? styles.inputWithIcon : ''}>
      {icon}
      <input
        type={type}
        id={name}
        name={name}
        defaultValue={value || ''}
        placeholder={placeholder}
        className={styles.formInput}
        disabled={disabled}
      />
    </div>
  </div>
);

// The main form component, now with Summary and Social Media sections
const BasicProfileForm = ({ profileData }) => {

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted!');
  };

  return (
    <div>
      <div className={styles.contentHeader}>
        <h3>Basic Details</h3>
        <WrapButton onClick={handleFormSubmit}>
              Save Changes
        </WrapButton>
      </div>
      <form className={styles.formGrid}>
        {/* --- Basic Info --- */}
        <FormInput label="Full Name" name="fullName" value={profileData.fullName} />
        <FormInput label="Username" name="username" value={profileData.username} />
        <FormInput label="Date of Birth" name="dob" value={new Date(profileData.dob).toLocaleDateString('en-CA')} type="date" />
        <FormInput label="Gender" name="gender" value={profileData.gender} />
        <FormInput label="Mobile" name="mobile" value={profileData.mobile} placeholder="+91 XXXXX XXXXX" />
        <FormInput label="Email" name="email" value={profileData.email} disabled />

        {/* --- NEW: Summary Section --- */}
        <div className={styles.formSection}>
          <label htmlFor="summary" className={styles.inputGroup.label}>Summary</label>
          <textarea
            id="summary"
            name="summary"
            className={styles.formTextarea}
            placeholder="Write a brief summary about yourself..."
            defaultValue={profileData.summary || ''} // Assuming you add a 'summary' field to your data
          />
        </div>

        {/* --- NEW: Social Media Section --- */}
        <div className={styles.formSection}>
          <label className={styles.inputGroup.label}>Social Media Links</label>
          <div className={styles.socialsGrid}>
            <FormInput 
              name="linkedin" 
              value={profileData.linkedin || ''} 
              placeholder="LinkedIn Profile URL"
              icon={<FiLinkedin size={18} />}
            />
            <FormInput 
              name="github" 
              value={profileData.github || ''} 
              placeholder="GitHub Profile URL"
              icon={<FiGithub size={18} />}
            />
            <FormInput 
              name="website" 
              value={profileData.website || ''} 
              placeholder="Personal Website URL"
              icon={<FiGlobe size={18} />}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicProfileForm;