'use client';
import React from 'react';
import styles from './GetHrEmailModal.module.css';
import { FiX, FiSend, FiCornerUpRight } from 'react-icons/fi';

const GetHrEmailModal = ({ isOpen, onClose, onRequestFromEmployee, onSendDirectly }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Get HR Email for Verification</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </div>
        <p className={styles.description}>
          Choose how you would like to proceed with the verification:
        </p>
        <div className={styles.optionsContainer}>
          <button className={styles.optionButton} onClick={onRequestFromEmployee}>
            <FiSend size={20} />
            <div>
              <strong>Request from Employee</strong>
              <span>Send an email asking the employee to provide their HR's email address.</span>
            </div>
          </button>
          <button className={styles.optionButton} onClick={onSendDirectly}>
            <FiCornerUpRight size={20} />
            <div>
              <strong>Send Mail Directly</strong>
              <span>If you already know the HR email, send the verification directly.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetHrEmailModal;