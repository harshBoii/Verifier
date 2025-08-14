'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiUsers, FiBriefcase, FiPlus, FiSearch } from 'react-icons/fi';
import SuperAdminCharts from './SuperChart';
import AddCompanyModal from './AddCompanyModal';
import CompanyEmployeesModal from './CompanyEmployeesModal';

const StatCard = ({ icon, value, label }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div>
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            <span className="block text-sm text-gray-500">{label}</span>
        </div>
    </div>
);

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [stats, setStats] = useState({ totalCompanies: 0, totalEmployees: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingCompany, setViewingCompany] = useState(null);

    const fetchCompanies = async (name = '') => {
        try {
            // No need to set loading here as the main fetch handles it
            const response = await fetch(`/api/companies/search?name=${name}`);
            if (!response.ok) throw new Error('Failed to fetch companies.');
            const data = await response.json();
            setCompanies(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Initial fetch for stats and all companies
    useEffect(() => {
        const initialFetch = async () => {
             try {
                setLoading(true);
                const [statsRes, companiesRes] = await Promise.all([
                    fetch('/api/superadmin/stats'),
                    fetch('/api/companies/search')
                ]);

                if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats.');
                if (!companiesRes.ok) throw new Error('Failed to fetch company list.');

                const statsData = await statsRes.json();
                const companiesData = await companiesRes.json();

                setStats(statsData);
                setCompanies(companiesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        initialFetch();
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
            <div className="p-6 font-sans">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl">
                        <h2 className="text-3xl font-bold">Welcome back, Super Admin!</h2>
                        <p className="mt-2 opacity-90">You can now turn your Verification Process Faster than a Cheetah.</p>
                    </div>
                    <div className="flex flex-col gap-4 justify-center">
                        <StatCard icon={<FiUsers size={20} />} value={stats.totalEmployees} label="Total Employees Verified" />
                        <StatCard icon={<FiBriefcase size={20} />} value={stats.totalCompanies} label="Total Companies" />
                    </div>
                </div>

                <div className="my-8">
                    <SuperAdminCharts />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Newly Joined Company</h3>
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

                    <div className="overflow-x-auto">
                        {loading ? (
                            <p className="text-center p-8">Loading companies...</p>
                        ) : error ? (
                            <p className="text-center p-8 text-red-500">Error: {error}</p>
                        ) : (
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Company Name</th>
                                        <th scope="col" className="px-6 py-3">Admin Email</th>
                                        <th scope="col" className="px-6 py-3">Package</th>
                                        <th scope="col" className="px-6 py-3">Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map(company => (
                                        <tr key={company.id} onClick={() => setViewingCompany(company)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-3">
                                                <Image 
                                                    src={`https://ui-avatars.com/api/?name=${company.adminName.replace(' ', '+')}&background=random`} 
                                                    alt={company.adminName} 
                                                    width={32} 
                                                    height={32} 
                                                    className="rounded-full"
                                                    unoptimized={true}
                                                />
                                                {company.companyName}
                                            </th>
                                            <td className="px-6 py-4">{company.adminEmail}</td>
                                            <td className="px-6 py-4">{company.package}</td>
                                            <td className={`px-6 py-4 ${company.remaining.includes('Expired') || company.remaining.includes('4 days') ? 'text-red-500 font-semibold' : ''}`}>
                                                {company.remaining}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            
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
