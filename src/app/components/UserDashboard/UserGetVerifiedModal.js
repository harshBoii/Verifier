'use client';
import React, { useState, useEffect } from 'react';
import styles from './UserGetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { FaPaperPlane } from 'react-icons/fa';

const UserGetVerifiedModal = ({ isOpen, onClose, user, experience }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [mob,setMob] = useState('')

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
            if (experience?.verifier_number){
                setMob(experience.verifier_number)
            }
            else if (! experience?.verifier_number){
                setMob('')
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
                    verifierNumber:mob,
                    verifierEmail: email,
                    employeeId: user.id,
                    company:experience.companyName,
                    name:user.fullName,
                    position:experience.role,
                    exp_id: experience.id 
                }),
            });
// verifierEmail, employeeId, company, name, position, exp_id
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            Swal.fire('Success!', `Verification request for "${experience.role}" sent successfully to ${email}! and ${mob}`, 'success');
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
                    <h3>Enter Verifier's Detail</h3>
                    <form onSubmit={handleFormSubmit} className={styles.form}>
                        <input
                            type="email"
                            placeholder="Enter Verifier's email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputField}
                            required
                            disabled={isSending}
                        />
                        <input
                            type="tel"
                            placeholder="Enter verifier's Number"
                            value={mob}
                            onChange={(e) => setMob(e.target.value)}
                            className={styles.inputField}
                            required
                            disabled={isSending}
                        />

                        <p className={styles.helperText}>
                            The verification Request will be sent to these credentials.
                        </p>
                        {error && <p className={styles.errorText}>{error}</p>}
                        <div className={styles.primaryActions}>
                            <button type="submit" className={styles.primaryButton} disabled={isSending}>
                                <FaPaperPlane /> {isSending ? 'Sending...' : 'Send for Verification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserGetVerifiedModal;
