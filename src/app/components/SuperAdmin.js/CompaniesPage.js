'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CompaniesPage.module.css';
import { FiUsers, FiBriefcase, FiPlus, FiSearch } from 'react-icons/fi';
import SuperAdminCharts from './SuperChart';
import AddCompanyModal from './AddCompanyModal';
import CompanyEmployeesModal from './CompanyEmployeesModal';

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
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingCompany, setViewingCompany] = useState(null);

    const fetchCompanies = async (name = '') => {
        try {
            setLoading(true);
            const response = await fetch(`/api/companies/search?name=${name}`);
            if (!response.ok) throw new Error('Failed to fetch companies.');
            const data = await response.json();
            setCompanies(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch for all companies
    useEffect(() => {
        fetchCompanies();
    }, []);

    // Debounced search effect
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchCompanies(searchTerm);
        }, 500); // Wait 500ms after user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    return (
        <>
            <div className={styles.container}>
                <div className={styles.headerGrid}>
                    <div className={styles.welcomeBanner}>
                        <h2>Welcome back, Super Admin!</h2>
                        <p>You can now turn your Verification Process Faster than a Cheetah.</p>
                    </div>
                    <div className={styles.statsContainer}>
                        <StatCard icon={<FiUsers />} value="2830" label="Total Company applied for Verification" />
                        <StatCard icon={<FiBriefcase />} value={companies.length} label="Total Companies" />
                    </div>
                </div>

                <div className="my-8">
                    <SuperAdminCharts />
                </div>

                <div className={styles.tableWrapper}>
                    <div className={styles.tableHeader}>
                        <h3>Newly Joined Company</h3>
                        {/* --- UPDATED SEARCH AND ADD BUTTONS --- */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by company name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                />
                            </div>
                            <button 
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <FiPlus /> Add Company
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center p-8">Loading companies...</p>
                    ) : error ? (
                        <p className="text-center p-8 text-red-500">Error: {error}</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Company Name</th>
                                    <th>Admin Email</th>
                                    <th>Admin Role</th>
                                    <th>Package</th>
                                    <th>Remaining</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map(company => (
                                    <tr key={company.id} onClick={() => setViewingCompany(company)} className="cursor-pointer hover:bg-gray-50">
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
            
            {/* Modals */}
            <AddCompanyModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => fetchCompanies()}
            />
            <CompanyEmployeesModal
                isOpen={!!viewingCompany}
                onClose={() => setViewingCompany(null)}
                company={viewingCompany}
                onSuccess={() => fetchCompanies()}

            />
        </>
    );
};

export default CompaniesPage;
