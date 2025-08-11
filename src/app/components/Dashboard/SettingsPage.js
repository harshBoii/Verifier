'use client';
import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import { FiUser, FiFileText, FiMail, FiLogOut, FiX } from 'react-icons/fi';
import Link from 'next/link';

// A sub-component for the User Profile form
const UserProfileForm = () => (
    <>
        <div className={styles.header}>
            <h2>User profile</h2>
            <button className={styles.closeButton}>
                <FiX size={20} />
            </button>
        </div>
        <div className={styles.formContainer}>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" placeholder="" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="role">Role</label>
                    <input type="text" id="role" placeholder="Administrator" disabled />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="designation">Designation</label>
                    <input type="text" id="designation" placeholder="" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="department">Department</label>
                    <input type="text" id="department" placeholder="" />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="mobile">Mobile</label>
                    <input type="tel" id="mobile" placeholder="+XX XXX XXX XXXX" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="your.email@company.com" />
                </div>
            </div>
            <button className={styles.saveButton}>Save</button>
        </div>
    </>
);

// A new sub-component for the SMTP settings form
const SmtpForm = () => (
    <>
        <div className={styles.header}>
            <h2>SMTP Configuration</h2>
            <button className={styles.closeButton}>
                <FiX size={20} />
            </button>
        </div>
        <div className={styles.formContainer}>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="smtpHost">SMTP Host</label>
                    <input type="text" id="smtpHost" placeholder="smtp.example.com" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="smtpPort">SMTP Port</label>
                    <input type="text" id="smtpPort" placeholder="587" />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="smtpUser">Username</label>
                    <input type="text" id="smtpUser" placeholder="your-email@example.com" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="smtpPass">Password</label>
                    <input type="password" id="smtpPass" placeholder="••••••••" />
                </div>
            </div>
            <div className={styles.row}>
                 <div className={styles.inputGroup}>
                    <label htmlFor="senderEmail">Sender Email</label>
                    <input type="email" id="senderEmail" placeholder="no-reply@example.com" />
                </div>
            </div>
            <button className={styles.saveButton}>Save SMTP Settings</button>
        </div>
    </>
);


const SettingsPage = () => {
    // State to manage which form is currently active
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className={styles.settingsContainer}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Settings</h2>
                <ul className={styles.navList}>
                    {/* Use buttons to control the active tab state */}
                    <li className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`} onClick={() => setActiveTab('profile')}>
                        <FiUser className={styles.navIcon} />
                        User profile
                    </li>
                    <li className={`${styles.navItem} ${activeTab === 'templates' ? styles.active : ''}`} onClick={() => setActiveTab('templates')}>
                        <FiFileText className={styles.navIcon} />
                        Templates
                    </li>
                    <li className={`${styles.navItem} ${activeTab === 'smtp' ? styles.active : ''}`} onClick={() => setActiveTab('smtp')}>
                        <FiMail className={styles.navIcon} />
                        SMTP
                    </li>
                    <li className={styles.navItem}>
                        <FiLogOut className={styles.navIcon} />
                        Logout
                    </li>
                </ul>
            </aside>
            <main className={styles.mainContent}>
                {/* Conditionally render the form based on the active tab */}
                {activeTab === 'profile' && <UserProfileForm />}
                {activeTab === 'smtp' && <SmtpForm />}
                {/* You can add a component for the 'templates' tab here */}
                {activeTab === 'templates' && <div className={styles.header}><h2>Templates</h2><p>Template management form goes here...</p></div>}
            </main>
        </div>
    );
};

export default SettingsPage;
