'use client'
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import CampaignsTable from './CampaignsTable';
import { FiUsers, FiUserCheck, FiUserX, FiClock } from 'react-icons/fi';

const StatCard = ({ icon, value, label }) => (
    <div className={styles.statCard}>
        <div className={styles.statIcon}>
            {icon}
        </div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    </div>
);

const Dashboard = () => {
    // 1. ADD STATE FOR USER, STATS, LOADING, AND ERRORS
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. FETCH DATA WHEN THE COMPONENT LOADS
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch both user data and stats concurrently for speed
                const [userResponse, statsResponse] = await Promise.all([
                    fetch('/api/auth/me'), // An API to get the current user
                    fetch('/api/dashboard-stats') // The API for company stats
                ]);

                if (!userResponse.ok) throw new Error('Failed to fetch user data. Please log in again.');
                if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats.');

                const userData = await userResponse.json();
                const statsData = await statsResponse.json();

                setUser(userData);
                setStats(statsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty array ensures this runs only once on mount

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                {/* The Header now receives the dynamic user data */}
                <Header user={user} />

                {/* Welcome Banner now uses the dynamic user name */}
                <div className={styles.welcomeBanner}>
                    <div>
                        <h2>Welcome back, {user ? user.fullName : 'Admin'}!</h2>
                        <p>You can now turn your Verification Process Faster than a Cheetah.</p>
                        <button className={styles.exploreButton}>Explore Now &rarr;</button>
                    </div>
                </div>

                {/* Logged In Time & Stats */}
                <div className={styles.statsGrid}>
                    {/* 3. DISPLAY FETCHED DATA OR LOADING/ERROR STATES */}
                    {loading ? (
                        <p>Loading statistics...</p>
                    ) : error ? (
                        <p style={{ color: 'red' }}>Error: {error}</p>
                    ) : stats ? (
                        <>
                            <StatCard icon={<FiUsers />} value={stats.totalEmployees} label="Total Employees in Your Company" />
                            <StatCard icon={<FiUserCheck />} value={stats.verifiedEmployees} label="Verified Employees" />
                            <StatCard icon={<FiUserX />} value={stats.pendingEmployees} label="Pending Verification" />
                        </>
                    ) : null}
                    <div className={styles.loginTimeCard}>
                         <div className={styles.statIcon}><FiClock /></div>
                         <div className={styles.statInfo}>
                            <span className={styles.statValue}>09:00 am</span>
                            <span className={styles.statLabel}>Logged In Time</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className={styles.searchSection}>
                    <h3>Search Campaign</h3>
                    <div className={styles.filters}>
                        <select className={styles.filterInput}><option>Select Campaign</option></select>
                        <select className={styles.filterInput}><option>Role</option></select>
                        <select className={styles.filterInput}><option>Level</option></select>
                    </div>
                     <div className={styles.dateFilters}>
                        <input type="text" placeholder="Select date" className={styles.filterInput} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'}/>
                        <span>to</span>
                        <input type="text" placeholder="Select date" className={styles.filterInput} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'}/>
                    </div>
                </div>
                
                {/* Campaigns List */}
                <CampaignsTable />

            </main>
        </div>
    );
};

export default Dashboard;