'use client';
import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { FiUser, FiFileText, FiMail, FiLogOut, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';

// A functional sub-component for the User Profile form
const UserProfileForm = () => {
    const [profile, setProfile] = useState({
        fullName: '',
        role: '',
        position: '',
        mobile: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/settings/profile');
                if (!response.ok) throw new Error('Could not load profile.');
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (!response.ok) throw new Error('Failed to save profile.');
            Swal.fire('Success!', 'Your profile has been updated.', 'success');
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) return <LoadingGlass/>;

    return (
        <>
            <div className={styles.header}>
                <h2>User profile</h2>
                <button className={styles.closeButton}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className={styles.formContainer}>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="fullName">Full Name</label>
                        <input type="text" id="fullName" value={profile.fullName || ''} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="role">Role</label>
                        <input type="text" id="role" value={profile.role || ''} disabled />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="position">Designation</label>
                        <input type="text" id="position" value={profile.position || ''} onChange={handleInputChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="department">Department</label>
                        <input type="text" id="department" placeholder="e.g., Engineering" />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="mobile">Mobile</label>
                        <input type="tel" id="mobile" value={profile.mobile || ''} onChange={handleInputChange} placeholder="+XX XXX XXX XXXX" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={profile.email || ''} disabled />
                    </div>
                </div>
                <button type="submit" className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </>
    );
};

// A functional sub-component for the SMTP settings form
const SmtpForm = () => {
    const [settings, setSettings] = useState({
        smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '', senderEmail: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/settings/smtp');
                if (!response.ok) throw new Error('Could not load SMTP settings.');
                const data = await response.json();
                setSettings(prev => ({
                    ...prev, ...data,
                    smtpPass: data.passwordIsSet ? '••••••••' : '',
                }));
            } catch (error) {
                Swal.fire('Loading Error!', error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handlePasswordFocus = () => {
        if (settings.smtpPass.includes('••••')) {
            setSettings(prev => ({ ...prev, smtpPass: '' }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings/smtp', {
                method: 'PUT', // Use PUT for updating
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            Swal.fire('Success!', 'Your company\'s SMTP settings have been saved.', 'success');
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (loading) return <LoadingGlass/>;

    return (
        <>
            <div className={styles.header}>
                <h2>SMTP Configuration</h2>
                <button className={styles.closeButton}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className={styles.formContainer}>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="smtpHost">SMTP Host</label>
                        <input type="text" id="smtpHost" value={settings.smtpHost} onChange={handleInputChange} placeholder="smtp.example.com" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="smtpPort">SMTP Port</label>
                        <input type="text" id="smtpPort" value={settings.smtpPort} onChange={handleInputChange} placeholder="587" />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="smtpUser">Username</label>
                        <input type="text" id="smtpUser" value={settings.smtpUser} onChange={handleInputChange} placeholder="your-email@example.com" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="smtpPass">Password</label>
                        <input type="password" id="smtpPass" value={settings.smtpPass} onFocus={handlePasswordFocus} onChange={handleInputChange} placeholder="Enter new password to update" />
                    </div>
                </div>
                <div className={styles.row}>
                     <div className={styles.inputGroup}>
                        <label htmlFor="senderEmail">Sender Email (From Address)</label>
                        <input type="email" id="senderEmail" value={settings.senderEmail} onChange={handleInputChange} placeholder="no-reply@example.com" />
                    </div>
                </div>
                <button type="submit" className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save SMTP Settings'}
                </button>
            </form>
        </>
    );
};


const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className={styles.settingsContainer}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Settings</h2>
                <ul className={styles.navList}>
                    <li className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>
                        <FiUser className={styles.navIcon} /> User profile
                    </li>
                    <li className={`${styles.navItem} ${activeTab === 'templates' ? styles.active : ''}`} onClick={() => setActiveTab('templates')}>
                        <FiFileText className={styles.navIcon} /> Templates
                    </li>
                    <li className={`${styles.navItem} ${activeTab === 'smtp' ? styles.active : ''}`} onClick={() => setActiveTab('smtp')}>
                        <FiMail className={styles.navIcon} /> SMTP
                    </li>
                    <li className={styles.navItem}>
                        <FiLogOut className={styles.navIcon} /> Logout
                    </li>
                </ul>
            </aside>
            <main className={styles.mainContent}>
                {activeTab === 'profile' && <UserProfileForm />}
                {activeTab === 'smtp' && <SmtpForm />}
                {activeTab === 'templates' && <div className={styles.header}><h2>Templates</h2><p>Template management form goes here...</p></div>}
            </main>
        </div>
    );
};

export default SettingsPage;
