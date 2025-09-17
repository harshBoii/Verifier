'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMoreVertical, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';
import GetVerifiedModal from './GetVerifiedModal';
import GetHrEmailModal from '../GetHrEmailModal';
import styles from './VerificationPage.module.css';

// --- STATUS ICONS ---
const renderStatusIcon = (verified) => {
  if (verified === true) {
    return (
      <span className="relative group inline-flex items-center cursor-pointer">
        <FiCheckCircle className={styles.statusVerified} />
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">Verified</div>
      </span>
    );
  }
  return (
    <span className="relative group inline-flex items-center cursor-pointer">
      <FiClock className={styles.statusPending} />
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">Unverified</div>
    </span>
  );
};

// --- ACTION MENU ---
const ActionMenu = ({ onVerifyClick, onGetHrEmail, onDeleteClick }) => (
  <div className={styles.actionMenu}>
    <button onClick={onVerifyClick}>Send Verification</button>
    <button onClick={onGetHrEmail}>Get HR Email</button>
    <button onClick={onDeleteClick} className={styles.delete}>Delete User</button>
  </div>
);

export default function UnverifiedEmployeesPage() {
  // --- STATE ---
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isDirectSendModalOpen, setIsDirectSendModalOpen] = useState(false);
  const [isHrChoiceModalOpen, setIsHrChoiceModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(null);

  // --- FETCH COMPANIES INITIALLY ---
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/companies');
        if (!res.ok) throw new Error('Failed to fetch companies');
        const data = await res.json();
        setCompanies(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // --- FETCH USERS OF A COMPANY ---
  const fetchUnverifiedEmployees = async (companyId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${companyId}/employees/unverified`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      setUsers(data.data || []);
      setSelectedCompany(companyId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER USERS ---
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // --- FILTER COMPANIES ---
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companies;
    return companies.filter((c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  // --- EVENT HANDLERS ---
  const toggleMenu = (index) => setActiveMenu(activeMenu === index ? null : index);

  const handleDeleteUser = async (userId) => {
    setActiveMenu(null);
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Yes, delete user!'
    });
    if (result.isConfirmed) {
      setIsSubmitting(userId);
      try {
        const res = await fetch(`/api/profile/${userId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user.');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        Swal.fire('Deleted!', 'The user has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error!', err.message, 'error');
      } finally {
        setIsSubmitting(null);
      }
    }
  };

  const handleGetHrEmailClick = (user) => {
    setSelectedUser(user);
    setIsHrChoiceModalOpen(true);
    setActiveMenu(null);
  };

  const handleRequestFromEmployee = async () => {
    if (!selectedUser) return;
    setIsHrChoiceModalOpen(false);
    try {
      const res = await fetch('/api/request-hr-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      if (!res.ok) throw new Error('Failed to send request.');
      Swal.fire('Sent!', `Request sent to ${selectedUser.fullName}`, 'success');
    } catch (err) {
      Swal.fire('Error!', err.message, 'error');
    }
    setSelectedUser(null);
  };

  const handleSendDirectly = () => {
    setIsHrChoiceModalOpen(false);
    setIsDirectSendModalOpen(true);
  };

  const handleVerifyClick = (user) => {
    setSelectedUser(user);
    setIsDirectSendModalOpen(true);
    setActiveMenu(null);
  };

  // --- RENDER ---
  return (
    <>
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* If no company selected → show companies */}
          {!selectedCompany ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Select a Company</h2>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full sm:w-1/3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              {loading ? (
                <LoadingGlass />
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : filteredCompanies.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCompanies.map((c) => (
                    <li
                      key={c.id}
                      className="p-6 bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg hover:border-blue-400 transition cursor-pointer"
                      onClick={() => fetchUnverifiedEmployees(c.id)}
                    >
                      <h3 className="font-semibold text-lg text-blue-700">{c.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Type: {c.type || 'N/A'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No companies found.</p>
              )}
            </div>
          ) : (
            <>
              {/* Back Button */}
              <div className="flex items-center space-x-2 p-4">
                <button
                  onClick={() => {
                    setSelectedCompany(null);
                    setUsers([]);
                  }}
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" /> Back to Companies
                </button>
              </div>

              {/* Title bar */}
              <div className={styles.titleBar}>
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-blue-600">Unverified Employees</h2>
                  <p className="text-sm text-gray-500">
                    Showing employees of {companies.find((c) => c.id === selectedCompany)?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-8 w-60 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className={styles.tableContainer}>
                {loading ? (
                  <LoadingGlass className="-mt-20" />
                ) : error ? (
                  <p className="text-center text-red-500 p-8">{error}</p>
                ) : (
                  <table className={`${styles.table} bg-white shadow-md rounded-lg`}>
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="text-blue-700">Name</th>
                        <th className="text-blue-700">Email</th>
                        <th className="text-blue-700">Status</th>
                        <th className="text-blue-700 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id} className="hover:bg-blue-50 transition">
                            <td>
                              <div className={styles.userCell}>
                                <Image
                                  src={`https://ui-avatars.com/api/?name=${user.fullName?.replace(' ', '+') || 'User'}&background=random`}
                                  alt={user.fullName}
                                  width={30}
                                  height={30}
                                  className={styles.avatar}
                                  unoptimized
                                />
                                <Link
                                  href={`/superadmin/verify-exp/${user.id}`}
                                  className="ml-2 text-blue-600 hover:underline"
                                >
                                  {user.fullName || user.username}
                                </Link>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <div className={styles.statusCell}>{renderStatusIcon(user.is_verified)}</div>
                            </td>
                            <td className={styles.actionCell}>
                              {isSubmitting === user.id ? (
                                <Loader2 className="animate-spin h-5 w-5 text-gray-500 mx-auto" />
                              ) : (
                                <div className="relative flex justify-center">
                                  <button onClick={() => toggleMenu(index)} className={styles.moreButton}>
                                    <FiMoreVertical />
                                  </button>
                                  {activeMenu === index && (
                                    <ActionMenu
                                      onVerifyClick={() => handleVerifyClick(user)}
                                      onGetHrEmail={() => handleGetHrEmailClick(user)}
                                      onDeleteClick={() => handleDeleteUser(user.id)}
                                    />
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-10 text-gray-500">
                            No unverified employees found {searchQuery && `for "${searchQuery}"`}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <GetHrEmailModal
        isOpen={isHrChoiceModalOpen}
        onClose={() => setIsHrChoiceModalOpen(false)}
        onRequestFromEmployee={handleRequestFromEmployee}
        onSendDirectly={handleSendDirectly}
      />
      <GetVerifiedModal
        isOpen={isDirectSendModalOpen}
        onClose={() => {
          setIsDirectSendModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </>
  );
}
