'use client';
import React, { useState } from 'react';
import styles from './UserGetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';

const UserGetVerifiedModal = ({ isOpen, onClose, user }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');

    // When the modal opens, pre-fill the email state with the user's verifier email
    React.useEffect(() => {
        if (user?.verifier_email) {
            setEmail(user.verifier_email);
        }
    }, [user]);

    if (!isOpen || !user) {
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
                    verifierEmail: email, // Send the email from the input field
                    employeeId: user.id,
                    company: user.company?.name, // Safely access company name
                    name: user.fullName,
                    position: user.position
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            Swal.fire('Success!', `Verification email sent successfully to ${email}!`, 'success');
            handleClose();

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        // Don't clear the email state on close, just the error/sending state
        setError('');
        setIsSending(false);
        onClose();
    };

    return (
        <div className={styles.modalOverlay} id="modal-backdrop" onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Send Verification for {user.fullName}</h2>
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
