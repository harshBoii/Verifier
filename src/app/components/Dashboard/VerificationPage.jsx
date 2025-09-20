'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import styles from './VerificationPage.module.css';
import Sidebar from './Sidebar';
import Header from './Header';
import GetVerifiedModal from './GetVerifiedModal';
import GetHrEmailModal from '../GetHrEmailModal';
import { FiCheck, FiCheckCircle, FiXCircle, FiMoreVertical, FiX , FiClock} from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';
import { Search,Loader2 } from 'lucide-react';
import Link from 'next/link';

// --- Helper Components (No Changes Needed) ---
const renderStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="relative group inline-flex items-center cursor-pointer">
            <FiCheckCircle className={styles.statusVerified} />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">Verified</div>
          </span>
        );
      case "rejected":
        return (
          <span className="relative group inline-flex items-center cursor-pointer">
            <FiXCircle className={styles.statusRejected} />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">Rejected</div>
          </span>
        );
      case "pending":
        return (
          <span className="relative group inline-flex items-center cursor-pointer">
            <FiClock className={styles.statusPending} />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">Pending</div>
          </span>
        );
      default: return null;
    }
};

const ActionMenu = ({ onEditClick, onVerifyClick, onGetHrEmail, onDeleteClick }) => (
    <div className={styles.actionMenu}>
        <button onClick={onEditClick}>Edit Details</button>
        <button onClick={onVerifyClick}>Send Verification</button>
        <button onClick={()=>GoVerify(user.id)}>View Exp</button> 
        <button onClick={onGetHrEmail}>Get HR Email</button>
        <button onClick={onDeleteClick} className={styles.delete}>Delete User</button>
    </div>
);

const GoVerify=(id)=>{
    window.location.href=`/admin/verify-experience/${id}`
}

export default function VerificationPage() {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDirectSendModalOpen, setIsDirectSendModalOpen] = useState(false);
    const [isHrChoiceModalOpen, setIsHrChoiceModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    // --- NEW STATE FOR SEARCH ---
    const [searchQuery, setSearchQuery] = useState('');

    // --- INLINE EDITING & SUBMITTING STATE ---
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/company-employees');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch employees.');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // --- NEW: FILTERED DATA LOGIC ---
    // useMemo ensures this expensive filtering operation only runs when users or the query change.
    // const filteredUsers = useMemo(() => {
    //     if (!searchQuery) {
    //         return users; // If search is empty, return all users
    //     }
    //     return users.filter(user =>
    //         user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    //     );
    // }, [users, searchQuery]);

    

    const filteredUsers = useMemo(() => {
    return users.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      !statusFilter || user.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [users, searchQuery, statusFilter]);


    // -----------------------------------------

    // --- EVENT HANDLERS (All existing handlers are preserved) ---
    const toggleMenu = (index) => setActiveMenu(activeMenu === index ? null : index);

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setEditFormData({ name: user.name, email: user.email, role: user.role });
        setActiveMenu(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async (userId) => {
        setIsSubmitting(userId);
        try {
            const response = await fetch(`/api/profile/${userId}`, { // Assuming this is the correct update endpoint
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });
            if (!response.ok) throw new Error('Failed to save changes.');
            setUsers(prevUsers => prevUsers.map(user =>
                user.id === userId ? { ...user, ...editFormData } : user
            ));
            handleCancelEdit();
            Swal.fire('Saved!', 'User details updated.', 'success');
        } catch (err) {
            Swal.fire('Error!', err.message, 'error');
        } finally {
            setIsSubmitting(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        setActiveMenu(null);
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6e7881',
            confirmButtonText: 'Yes, delete user!'
        });
        if (result.isConfirmed) {
            setIsSubmitting(userId);
            try {
                const response = await fetch(`/api/profile/${userId}`, { // Assuming this is the correct delete endpoint
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete user.');
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
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
            const response = await fetch('/api/request-hr-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser.id }),
            });
            if (!response.ok) throw new Error('Failed to send request.');
            Swal.fire('Sent!', `An email has been sent to ${selectedUser.name} asking for their HR's email.`, 'success');
        } catch (error) {
            Swal.fire('Error!', error.message, 'error');
        }
        setSelectedUser(null);
    };

    const handleSendDirectly = () => {
        setIsHrChoiceModalOpen(false);
        setIsDirectSendModalOpen(true);
    };
    
    // This now opens the direct send modal
    const handleVerifyClick = (user) => {
        setSelectedUser(user);
        setIsDirectSendModalOpen(true);
        setActiveMenu(null);
    };

    return (
        <>
            <div className={styles.pageContainer}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <Header user={{ name: 'Admin' }} />
                    {/* --- UPDATED TITLE BAR WITH SEARCH --- */}
                    <div className={styles.titleBar}>
                        <div className="flex-grow">
                            <h2>Let's Verify ! </h2>
                            <p className="text-sm text-gray-500">Manage and verify your company's employees.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative border-1 border-blue-300 rounded-2xl ">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-7 w-55 sm:text-sm"
                                />
                            </div>
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border-blue-300 border-1 rounded-2xl shadow-sm h-7 w-35 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <button className={styles.bulkVerifyButton}>Bulk Verify</button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        {loading ? <LoadingGlass className='-mt-20'/> : 
                         error ? <p className="text-center text-red-500 p-8">{error}</p> : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* --- RENDER THE FILTERED LIST --- */}
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, index) => (

                                            <tr key={user.id} className="hover:bg-blue-100 pointer-events-auto  ">

                                                <td>
                                                    <div className={styles.userCell} onClick={() => window.location.href=`/admin/verify-experience/${user.id}`}>
                                                    <Image
                                                    src={
                                                        user.profilePicture
                                                        ? user.profilePicture
                                                        : `https://ui-avatars.com/api/?name=${
                                                            encodeURIComponent(
                                                                (editingId === user.id ? editFormData.name : user.name) || "User"
                                                            )
                                                            }&background=random`
                                                    }
                                                    alt={user.name || "User"}
                                                    width={30}
                                                    height={30}
                                                    className={styles.avatar}
                                                    unoptimized
                                                    />

                                                        {editingId === user.id ? <input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={styles.editInput} /> : user.name}
                                                    </div>
                                                </td>
                                                <td>{editingId === user.id ? <input type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} className={styles.editInput} /> : user.email}</td>
                                                <td>{editingId === user.id ? <input type="text" name="role" value={editFormData.role} onChange={handleEditFormChange} className={styles.editInput} /> : user.role}</td>
                                                <td><div className={styles.statusCell}>{renderStatusIcon(user.status)}</div></td>
                                                <td className={styles.actionCell}>
                                                    {isSubmitting === user.id ? (
                                                        <Loader2 className="animate-spin h-5 w-5 text-gray-500 mx-auto" />
                                                    ) : editingId === user.id ? (
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button onClick={() => handleSaveEdit(user.id)} className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors" aria-label="Save changes"><FiCheck size={16} /></button>
                                                            <button onClick={handleCancelEdit} className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" aria-label="Cancel editing"><FiX size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative flex justify-center">
                                                            <button onClick={() => toggleMenu(index)} className={styles.moreButton}><FiMoreVertical /></button>
                                                            {activeMenu === index && 
                                                                <ActionMenu 
                                                                    onEditClick={() => handleEditClick(user)}
                                                                    onVerifyClick={() => handleVerifyClick(user)}
                                                                    onGetHrEmail={() => handleGetHrEmailClick(user)}
                                                                    onDeleteClick={() => handleDeleteUser(user.id)}
                                                                />}
                                                        </div>
                                                    )}
                                                </td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-gray-500">
                                                No users found {searchQuery && `for "${searchQuery}"`}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals (No Changes Needed) */}
            <GetHrEmailModal isOpen={isHrChoiceModalOpen} onClose={() => setIsHrChoiceModalOpen(false)} onRequestFromEmployee={handleRequestFromEmployee} onSendDirectly={handleSendDirectly} />
            <GetVerifiedModal isOpen={isDirectSendModalOpen} onClose={() => { setIsDirectSendModalOpen(false); setSelectedUser(null); }} user={selectedUser} />
        </>
    );
};
