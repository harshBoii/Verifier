'use client';
import React, { useState, useEffect } from 'react';
import styles from './VerificationReviewPage.module.css';
import { FiCheckCircle, FiFacebook, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Image from 'next/image';

/**
 * A sub-component for displaying a single skill tag.
 */
const SkillTag = ({ children, highlighted }) => (
  <div className={`${styles.skillTag} ${highlighted ? styles.highlighted : ''}`}>
    {children}
  </div>
);

/**
 * The main component for the verification review page.
 */
const VerificationReviewPage = ({ id }) => {
  // State for the data fetched from the API
  const [reviewData, setReviewData] = useState(null);
  // State to handle loading UI
  const [loading, setLoading] = useState(true);
  // State to handle any errors during data fetching
  const [error, setError] = useState('');
  // State to toggle the visibility of the revision comment box
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  // State to store the text from the revision comment box
  const [revisionComment, setRevisionComment] = useState('');
  // State to handle the submission loading state (disables buttons)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs when the component mounts or when the `id` prop changes.
  useEffect(() => {
    if (!id) return; // Don't fetch if no ID is provided

    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/review/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const data = await response.json();
        setReviewData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [id]);

  // Toggles the revision mode on/off when the "Send for Revision" button is clicked.
  const handleRevisionClick = () => {
    setIsRevisionMode(!isRevisionMode);
  };

  // Handles the final verification submission.
  const handleVerifyNow = async () => {
    setIsSubmitting(true);
    try {
      // Calls the backend API to send the verification result emails
      const response = await fetch('/api/submit-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: reviewData.id,
          revisionComment: revisionComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification.');
      }

      // Shows a professional-looking success alert
      Swal.fire({
        title: 'Request Sent!',
        icon: 'success',
        html: `
          <div style="text-align: left; line-height: 1.6;">
            <p style="font-size: 1.1rem; color: #333;">
              The request to update the experience has been successfully sent to <strong>${reviewData.fullName}</strong>.
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <h4 style="font-weight: 600; color: #1a202c; margin-bottom: 10px;">What Happens Next?</h4>
            <ul style="list-style-position: inside; padding-left: 5px; color: #555;">
              <li style="margin-bottom: 8px;">You will receive another email for verifying the updated Demo CRMs.</li>
              <li>The employee will be notified of the submitted review.</li>
            </ul>
            <p style="margin-top: 25px; font-size: 0.9em; color: #777;">
              Thank you for your patience.
            </p>
          </div>
        `,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#2979FF',
      });
      // Resets the UI state after a successful submission
      setIsRevisionMode(false);
      setRevisionComment('');

    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // RENDER LOGIC
  // Handle loading state
  if (loading) {
    return <div className={styles.pageContainer}><p>Loading...</p></div>;
  }

  // Handle error state
  if (error) {
    return <div className={styles.pageContainer}><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }

  // If data is not yet available, render nothing
  if (!reviewData) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>{reviewData.fullName} is mentioned the following details,</h2>
      
      <div className={styles.infoFields}>
        <div className={styles.fieldGroup}>
          <label>Full Name</label>
          <div className={styles.inputDisplay}>
            <span>{reviewData.fullName}</span>
            <FiCheckCircle className={styles.checkIcon} />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label>Employee/Staff ID</label>
          <div className={styles.inputDisplay}>
            {/* Display the first work experience's employeeId as an example */}
            <span>{reviewData.workExperiences[0]?.employeeId || 'N/A'}</span>
          </div>
        </div>
      </div>

      {reviewData.workExperiences.map(experience => (
        <div key={experience.id} className={styles.experienceCard}>
          <div className={styles.cardHeader}>
            <FiFacebook size={28} className={styles.companyLogo} />
            <div>
              <h3 className={styles.jobTitle}>{experience.role}</h3>
              <p className={styles.companyInfo}>{experience.companyName} | {experience.location}</p>
              <p className={styles.durationInfo}>{new Date(experience.startDate).toLocaleDateString()} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}</p>
            </div>
          </div>
          <p className={styles.description}>{experience.description}</p>
          
          <div className={styles.skillsSection}>
              <div className={styles.skillsHeader}>
                  <h4>Skills Earned</h4>
                  <p>Select the Skills to Endorse</p>
              </div>
              <div className={styles.skillsList}>
                  {experience.skills.map(workSkill => (
                    <SkillTag key={workSkill.skill.id} highlighted={workSkill.verificationStatus === 'VERIFIED'}>
                      {workSkill.skill.name}
                    </SkillTag>
                  ))}
                  <button className={styles.addSkillButton}><FiPlus size={12}/> Add Skills</button>
              </div>
          </div>
          <div className={styles.cardActions}>
              <button
                className={`${styles.revisionButton} ${isRevisionMode ? styles.revisionActive : ''}`}
                onClick={handleRevisionClick}
                disabled={isSubmitting}
              >
                Send for Revision
              </button>
          </div>

          {isRevisionMode && (
            <textarea
              className={styles.revisionTextarea}
              placeholder="Enter your revision comments here..."
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              disabled={isSubmitting}
            />
          )}
        </div>
      ))}

      <div className={styles.footerActions}>
        <p>I find all the information true to my knowledge.</p>
        <button 
          className={styles.verifyButton} 
          onClick={handleVerifyNow}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Verify Now'}
        </button>
      </div>
    </div>
  );
};

export default VerificationReviewPage;
