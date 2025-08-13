'use client';
import React, { useState, useEffect } from 'react';
import styles from './RolesPermissionsPage.module.css';
import { FiCheck, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';
import LoadingGlass from '../LoadingGlass';

// This object now maps all database fields to user-friendly table headers.
// This is the new single source of truth for your table columns.
const permissionsMap = {
    accessCompanies: 'Access Companies',
    packages: 'Packages',
    supportTeam: 'Support Team',
    searchLogin: 'Search Login',
    manageSystemSettings: 'Manage System',
    manageAgentStaff: 'Manage Agents',
    assignManageCompanyStaff: 'Manage Company Staff',
    initiateVerifications: 'Initiate Verifications',
    viewVerificationResults: 'View Results',
    viewReportsStatistics: 'View Reports',
};

// We get the keys from the map to ensure the order is correct and dynamic.
const permissionKeys = Object.keys(permissionsMap);

const RolesPermissionsPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/roles');
                if (!response.ok) throw new Error('Failed to fetch roles.');
                const data = await response.json();
                setRoles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
    }, []);

    const handlePermissionChange = (roleIndex, permissionKey) => {
        const updatedRoles = [...roles];
        updatedRoles[roleIndex].permissions[permissionKey] = !updatedRoles[roleIndex].permissions[permissionKey];
        setRoles(updatedRoles);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roles),
            });
            if (!response.ok) throw new Error('Failed to save changes.');
            Swal.fire({
                title: 'Success!',
                text: 'Permissions have been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#242565',
            });
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingGlass/>;
    if (error) return <div className={styles.container}><p style={{ color: 'red' }}>Error: {error}</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Roles and Permissions</h1>
                <button 
                    className={styles.createButton} 
                    onClick={handleSaveChanges} 
                    disabled={isSaving}
                >
                    <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Role name</th>
                            {/* Dynamically create headers from our map */}
                            {permissionKeys.map(key => (
                                <th key={key}>{permissionsMap[key]}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role, roleIndex) => (
                            <tr key={role.name}>
                                <td>{role.name}</td>
                                {permissionKeys.map(key => (
                                    <td key={key}>
                                        <label className={styles.checkboxContainer}>
                                            <input 
                                                type="checkbox" 
                                                checked={role.permissions[key] || false} 
                                                onChange={() => handlePermissionChange(roleIndex, key)}
                                            />
                                            <span className={styles.checkmark}>
                                                {role.permissions[key] && <FiCheck color="white" />}
                                            </span>
                                        </label>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RolesPermissionsPage;
