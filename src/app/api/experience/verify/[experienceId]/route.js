'use client';
import React, { useState, useEffect } from 'react';
import styles from './GetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';

// The component now accepts both 'user' and 'experience' props
const GetVerifiedModal = ({ isOpen, onClose, user, experience }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill the email field with the user's verifier email when the modal opens
    useEffect(() => {
        if (user?.verifier_email) {
            setEmail(user.verifier_email);
        }
    }, [user]);

    // Don't render if the modal is not open or if data is missing
    if (!isOpen || !user || !experience) {
        return null;
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setError('');
        
        try {
            // The API call now sends dynamic data from the props
            const response = await fetch('/api/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verifierEmail: email,       // The email from the input field
                    employeeId: user.id,        // The main user's ID
                    experienceId: experience.id // The specific experience ID
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            Swal.fire('Success!', `Verification email for "${experience.role}" sent successfully to ${email}!`, 'success');
            handleClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setError('');
        setIsSending(false);
        onClose();
    };

    return (
        <div className={styles.modalOverlay} id="modal-backdrop" onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    {/* The title is now dynamic */}
                    <h2>Verify: {experience.role} at {experience.companyName}</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className={styles.formBody}>
                    <h3>Enter Verifier's Email ID</h3>
                    <form onSubmit={handleFormSubmit} className={styles.form}>
                        <input
                            type="email"
                            placeholder="Enter verifier's email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputField}
                            required
                            disabled={isSending}
                        />
                        <p className={styles.helperText}>
                            The verification email will be sent to this address.
                        </p>
                        {error && <p className={styles.errorText}>{error}</p>}
                        <div className={styles.primaryActions}>
                            <button type="submit" className={styles.primaryButton} disabled={isSending}>
                                <FiMail /> {isSending ? 'Sending...' : 'Send for Verification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GetVerifiedModal;
