'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from  './Verification.module.css' ;
import { FiCheckCircle, FiFacebook, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import Image from 'next/image';
import LoadingGlass from '@/app/components/LoadingGlass';

const SkillTag = ({ children, highlighted }) => (
  <div className={`${styles.skillTag} ${highlighted ? styles.highlighted : ''}`}>
    {children}
  </div>
);

const SingleExperienceReviewPage = () => {
  const [experienceData, setExperienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const { experienceId } = params;

  useEffect(() => {
    if (!experienceId) return;

    const fetchExperienceData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/experience/${experienceId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch experience data.');
        }
        const data = await response.json();
        setExperienceData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExperienceData();
  }, [experienceId]);

  const handleRevisionClick = () => setIsRevisionMode(!isRevisionMode);

  const handleVerifyNow = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: experienceData.userId,
          revisionComment: revisionComment,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit verification.');
      
      Swal.fire({
        title: 'Request Sent!',
        icon: 'success',
        html: `The request to update the experience has been successfully sent to <strong>${experienceData.user.fullName}</strong>.`,
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#2979FF',
      });
      setIsRevisionMode(false);
      setRevisionComment('');
    } catch (err) {
      Swal.fire('Error!', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingGlass className='mt-250'/>;
  if (error) return <div className={styles.pageContainer}><p style={{ color: 'red' }}>Error: {error}</p></div>;
  if (!experienceData) return null;

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>{experienceData.user.fullName} is mentioned the following details,</h2>
      
      <div className={styles.infoFields}>
        <div className={styles.fieldGroup}>
          <label>Full Name</label>
          <div className={styles.inputDisplay}>
            <span>{experienceData.user.fullName}</span>
            <FiCheckCircle className={styles.checkIcon} />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label>Employee/Staff ID</label>
          <div className={styles.inputDisplay}>
            <span>{experienceData.employeeId || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className={styles.experienceCard}>
        <div className={styles.cardHeader}>
          <FiFacebook size={28} className={styles.companyLogo} />
          <div>
            <h3 className={styles.jobTitle}>{experienceData.role}</h3>
            <p className={styles.companyInfo}>{experienceData.companyName} | {experienceData.location}</p>
            <p className={styles.durationInfo}>{new Date(experienceData.startDate).toLocaleDateString()} - {experienceData.endDate ? new Date(experienceData.endDate).toLocaleDateString() : 'Present'}</p>
          </div>
        </div>
        <p className={styles.description}>{experienceData.description}</p>
        
        <div className={styles.skillsSection}>
            <div className={styles.skillsHeader}>
                <h4>Skills Earned</h4>
                <p>Select the Skills to Endorse</p>
            </div>
            <div className={styles.skillsList}>
                {experienceData.skills.map(workSkill => (
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

export default SingleExperienceReviewPage;
