import React from 'react';
import styles from './SettingsPage.module.css';
import { FiUser, FiFileText, FiMail, FiLogOut, FiX } from 'react-icons/fi';
import Link from 'next/link';

const SettingsPage = () => {
    return (
        <div className={styles.settingsContainer}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Settings</h2>
                <ul className={styles.navList}>
                    <Link href="/">
                    <li className={styles.navItem}>
                        <FiUser className={styles.navIcon} />
                        User profile
                    </li>
                    </Link>
                    <li className={styles.navItem}>
                        <FiFileText className={styles.navIcon} />
                        Templates
                    </li>
                    <li className={styles.navItem}>
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
            </main>
        </div>
    );
};

export default SettingsPage;