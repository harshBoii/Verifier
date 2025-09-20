'use client';
import React, { useState, useEffect } from 'react';
import styles from './GetVerifiedModal.module.css';
import { FiX, FiMail } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { FaPaperPlane } from 'react-icons/fa';
const GetVerifiedModal = ({ isOpen, onClose, user, experience }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [mob,setMob] = useState('')

    // This effect runs when the modal opens or the selected experience changes.
    useEffect(() => {
        if (isOpen) {
            // Prioritize the email from the specific work experience.
            if (experience?.verifier_email) {
                setEmail(experience.verifier_email);
            } 
            // If that doesn't exist, fall back to the user's default verifier email.
            else if (user?.verifier_email) {
                setEmail(user.verifier_email);
            }
            // Otherwise, start with an empty field.
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
    }, [isOpen, user, experience]);

    // Don't render if the modal isn't open or if essential data is missing.
    if (!isOpen || !user || !experience) {
        return null;
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setError('');
        try {
            console.log(user)
            console.log(experience.id)
            const response = await fetch('/api/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verifierNumber:mob,
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

            Swal.fire('Success!', `Verification Request for "${experience.role}" sent successfully to ${email}! and ${mob}`, 'success');
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
                    <h2 className="text-xl font-bold">Verify: {experience.role}</h2>
                    <button onClick={handleClose} className={styles.closeButton}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className={styles.formBody}>
                    <h3>Enter Verifier's Detail</h3>
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

export default GetVerifiedModal;
