'use client'
import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import CampaignsTable from './CampaignsTable';
import { FiUsers, FiUserCheck, FiX, FiClock } from 'react-icons/fi';
import DashboardCharts from './Chart';
import SubAlert from './SubAlert';

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
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    
    // State for filters, table data, and loading
    const [filters, setFilters] = useState({
        campaignId: '',
        role: '',
        name: '', // Added name to the filter state
    });
    const [tableData, setTableData] = useState([]);
    const [allCampaigns, setAllCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [loginTime, setLoginTime] = useState(null);


    // --- DATA FETCHING ---
    useEffect(() => {
        const initialFetch = async () => {
            try {
                setLoading(true);
                const [userRes, statsRes, campaignsRes] = await Promise.all([
                    fetch('/api/auth/me'),
                    fetch('/api/dashboard-stats'),
                    fetch('/api/campaigns')
                ]);

                if (!userRes.ok) throw new Error('Failed to fetch user data.');
                if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats.');
                if (!campaignsRes.ok) throw new Error('Failed to fetch campaign list.');

                const userData = await userRes.json();
                const statsData = await statsRes.json();
                const campaignsData = await campaignsRes.json();

                setUser(userData);
                setStats(statsData);
                setAllCampaigns(campaignsData);
                setTableData(campaignsData);
                // Set the login time from the API response
                if (userData.loginTime) {
                    setLoginTime(new Date(userData.loginTime));
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        initialFetch();
    }, []);

    // --- EFFECT TO HANDLE SEARCHING ---
    useEffect(() => {
        // Don't run the search on the initial page load
        if (loading) return;

        // Debounce: Wait 300ms after the user stops typing before making an API call
        const handler = setTimeout(() => {
            const searchCampaigns = async () => {
                const params = new URLSearchParams();
                if (filters.campaignId) params.append('campaignId', filters.campaignId);
                if (filters.role) params.append('role', filters.role);
                if (filters.name) params.append('name', filters.name);
                
                try {
                    const response = await fetch(`/api/campaigns/search?${params.toString()}`);
                    if (!response.ok) throw new Error('Search failed.');
                    const data = await response.json();
                    setTableData(data); // Update the table with filtered results
                } catch (err) {
                    setError(err.message);
                }
            };
            searchCampaigns();
        }, 300); // 300ms delay

        // Cleanup function: If the user types again, cancel the previous timeout
        return () => {
            clearTimeout(handler);
        };
    }, [filters, loading]); // This effect re-runs whenever the filters change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar className="w-20" />
            <main className={styles.mainContent}>
                <Header user={user} />
                <SubAlert/>
                <div className={styles.welcomeBanner}>
                    <div>
                        <h2>Welcome back, {user ? user.fullName : 'Admin'}!</h2>
                        <p>You can now turn your Verification Process Faster than a Cheetah.</p>

                    </div>
                </div>
                <div className={styles.statsGrid}>
                    {loading ? <p>Loading statistics...</p> : error ? <p style={{ color: 'red' }}>Error: {error}</p> : stats ? (
                        <>
                            <StatCard icon={<FiUsers />} value={stats.totalEmployees} label="Total Employees in Your Company" />
                            <StatCard icon={<FiUserCheck />} value={stats.verifiedEmployees} label="Verified Employees" />
                            <StatCard icon={<FiX />} value={stats.pendingEmployees} label="Pending Verification" />
                        </>
                    ) : null}
                    <div className={styles.loginTimeCard}>
                        <div className={styles.statIcon}><FiClock /></div>
                        <div className={styles.statInfo}>
                            <span className={styles.statValue}>
                                {loginTime ? loginTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                            </span>
                            <span className={styles.statLabel}>Logged In Time</span>
                        </div>
                    </div>
                </div>

                <DashboardCharts className="mb-5"/>

                {/* --- UPDATED SEARCH & FILTERS SECTION --- */}
                <div className={styles.searchSection}>
                    <h3 className='mt-10'>Search Campaign</h3>
                    <div className={styles.filters}>
                        <select name="campaignId" value={filters.campaignId} onChange={handleFilterChange} className={styles.filterInput}>
                            <option value="">All Campaigns</option>
                            {allCampaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                        </select>
                        <select name="role" value={filters.role} onChange={handleFilterChange} className={styles.filterInput}>
                            <option value="">All Roles</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {/* The "Level" select is replaced with this text input */}
                        <input
                            type="text"
                            name="name"
                            placeholder="Search by name..."
                            value={filters.name}
                            onChange={handleFilterChange}
                            className={styles.filterInput}
                        />
                    </div>
                     <div className={styles.dateFilters}>
                        <input type="text" placeholder="Select date" className={styles.filterInput} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'}/>
                        <span>to</span>
                        <input type="text" placeholder="Select date" className={styles.filterInput} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'}/>
                    </div>
                </div>
                
                {/* CampaignsTable now receives the dynamic and filtered tableData */}
            <CampaignsTable data={tableData} setData={setTableData} />
            </main>
        </div>
    );
};

export default Dashboard;
