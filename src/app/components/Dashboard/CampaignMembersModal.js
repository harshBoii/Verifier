'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CampaignMembersModal.module.css';
import { FiX } from 'react-icons/fi';

const CampaignMembersModal = ({ isOpen, onClose, campaign }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && campaign) {
      const fetchMembers = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/campaigns/${campaign.id}/members`);
          if (!response.ok) throw new Error('Failed to fetch members.');
          const data = await response.json();
          setMembers(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, campaign]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Members of "{campaign.name}"</h2>
          <button onClick={onClose} className={styles.closeButton}><FiX /></button>
        </div>
        <div className={styles.modalBody}>
          {loading ? (
            <p>Loading members...</p>
          ) : error ? (
            <p className={styles.errorText}>Error: {error}</p>
          ) : (
            <ul className={styles.memberList}>
              {members.map(member => (
                <li key={member.id} className={styles.memberItem}>
                  <Image 
                    src={`https://ui-avatars.com/api/?name=${member.fullName.replace(' ', '+')}&background=random`} 
                    alt={member.fullName} 
                    width={40} 
                    height={40} 
                    className={styles.avatar}
                    unoptimized={true}
                  />
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.fullName}</span>
                    <span className={styles.memberEmail}>{member.email}</span>
                  </div>
                  <span className={styles.memberRole}>{member.position}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignMembersModal;
