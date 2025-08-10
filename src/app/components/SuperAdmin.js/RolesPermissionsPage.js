'use client';
import React, { useState, useEffect } from 'react';
import styles from './RolesPermissionsPage.module.css';
import { FiCheck } from 'react-icons/fi';

const permissionKeys = ['accessCompanies', 'packages', 'supportTeam', 'searchLogin'];

const RolesPermissionsPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
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
        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roles),
            });
            if (!response.ok) throw new Error('Failed to save changes.');
            alert('Permissions saved successfully!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) return <div className={styles.container}><p>Loading roles...</p></div>;
    if (error) return <div className={styles.container}><p style={{ color: 'red' }}>Error: {error}</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Roles and Permissions</h1>
                <button className={styles.createButton} onClick={handleSaveChanges}>Save Changes</button>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Role name</th>
                            <th>Access Companies</th>
                            <th>Packages</th>
                            <th>Support Team</th>
                            <th>Search Login</th>
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
                                                checked={role.permissions[key]} 
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
