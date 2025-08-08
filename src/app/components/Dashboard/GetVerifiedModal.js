'use client';
import React, { useState } from 'react';
import styles from './GetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';

const GetVerifiedModal = ({ isOpen, onClose,user }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // Don't render the component if it's not open
    if (!isOpen) {
        return null;
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setError('');
        try {
            // STEP 1: Send the user's data to our backend API route
            const response = await fetch('/api/send-verification', {
                
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verifierEmail: user.hrEmail,
                    employeeId: user.id,
                    company:user.companyName,
                    name:user.name,
                    position:user.position
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            // STEP 2: Handle the successful response from the server
            Swal.fire(`Verification email sent successfully to ${user.hrEmail}!`);
            handleClose(); // Close the modal

        } catch (err) {
            // STEP 3: Handle any errors that occur
            console.error(err);
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError('');
        setIsSending(false);
        onClose();
    };

    // This allows closing the modal by clicking on the backdrop
    const handleBackdropClick = (e) => {
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} id="modal-backdrop" onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Get Verified</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className={styles.formBody}>
                    <h3>Enter your Verifier Email ID</h3>
                    <form onSubmit={handleFormSubmit} className={styles.form}>
                        <input
                            type="email"
                            placeholder={user.hrEmail}
                            value={user.hrEmail}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputField}
                            required
                            disabled={isSending}
                        />
                        <p className={styles.helperText}>
                            The Verifier's Email ID should be valid & It can be your HR, or any management person
                        </p>
                        <div className={styles.primaryActions}>
                            <button type="submit" className={styles.primaryButton}>
                                <FiMail /> Send for Verification
                            </button>
                            <button type="button" className={styles.primaryButton}>
                                <FiMail /> Sign in with Passport
                            </button>
                        </div>
                        <button type="button" className={styles.secondaryButton}>
                            Look for Another person email in company
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GetVerifiedModal;