'use client';
import React, { useState, useEffect } from 'react';
import styles from './UserGetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';

const UserGetVerifiedModal = ({ isOpen, onClose, user, experience }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // --- THIS IS THE UPDATED LOGIC ---
    // This effect now correctly prioritizes the experience-specific verifier email.
    useEffect(() => {
        if (isOpen) {
            // If the specific experience has a verifier email, use it.
            if (experience?.verifier_email) {
                setEmail(experience.verifier_email);
            } 
            // Otherwise, fall back to the user's default verifier email.
            else if (user?.verifier_email) {
                setEmail(user.verifier_email);
            }
            // If neither exists, start with an empty field.
            else {
                setEmail('');
            }
        }
    }, [isOpen, user, experience]); // Re-run when the modal opens or data changes

    if (!isOpen || !user || !experience) {
        return null;
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setError('');
        try {
            const response = await fetch('/api/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verifierEmail: email, // Use the email from the component's state
                    employeeId: user.id,
                    company:experience.companyName,
                    name:user.fullName,
                    position:experience.role,
                    exp_id: experience.id // Send the specific experience ID
                }),
            });
// verifierEmail, employeeId, company, name, position, exp_id
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
                    <h2>Send Verification for: {experience.role}</h2>
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

export default UserGetVerifiedModal;
