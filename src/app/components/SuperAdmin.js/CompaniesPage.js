'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CompaniesPage.module.css';
import { FiUsers, FiBriefcase } from 'react-icons/fi';

const StatCard = ({ icon, value, label }) => (
    <div className={styles.statCard}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statInfo}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
        </div>
    </div>
);

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/companies');
                if (!response.ok) throw new Error('Failed to fetch companies.');
                const data = await response.json();
                setCompanies(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.headerGrid}>
                <div className={styles.welcomeBanner}>
                    <h2>Welcome back, Super Admin!</h2>
                    <p>You can now turn your Verification Process Faster than a Cheetah.</p>
                </div>
                <div className={styles.statsContainer}>
                    <StatCard icon={<FiUsers />} value="2830" label="Total Company applied for Verification" />
                    <StatCard icon={<FiBriefcase />} value={companies.length} label="Total Companys" />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <h3>Newly Joined Company</h3>
                {loading ? (
                    <p>Loading companies...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Error: {error}</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Package</th>
                                <th>Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company.id}>
                                    <td>
                                        <div className={styles.cellWrapper}>
                                            <Image 
                                                src={`https://ui-avatars.com/api/?name=${company.adminName.replace(' ', '+')}&background=random`} 
                                                alt={company.adminName} 
                                                width={30} 
                                                height={30} 
                                                className={styles.avatar}
                                                unoptimized={true}
                                            />
                                            {company.companyName}
                                        </div>
                                    </td>
                                    <td>{company.adminEmail}</td>
                                    <td>Administrator</td>
                                    <td>{company.package}</td>
                                    <td className={company.remaining === '4 days' ? styles.remainingUrgent : ''}>
                                        {company.remaining}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
