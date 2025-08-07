'use client';
import React from 'react';
import styles from './UserSearchBar.module.css'; // Assuming you have a Header.module.css
import { FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import Image from 'next/image';

const UserSearchBar = ({ user }) => {
  // If the user data is still loading, you can render a placeholder or nothing
  if (!user) {
    return (
        <header className={styles.header}>
            {/* You can add a loading skeleton here if you like */}
        </header>
    );
  }

  // Dynamically generate the avatar URL from the user's name
  const avatarUrl = `https://ui-avatars.com/api/?name=${user.fullName.replace(' ', '+')}&background=random&color=fff`;
  // const avatarUrl = `https://placehold.co/40x40/7E57C2/FFFFFF?text=${user.fullName.charAt(0)}`;

  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        <FiSearch className={styles.searchIcon} />
        <input type="text" placeholder="Search" />
      </div>
      <div className={styles.userSection}>
        <button className={styles.addButton}><FiPlus /></button>
        <div className={styles.iconWrapper}>
            <FiBell />
        </div>
        {/* Wrapper for user avatar and name */}
        <div className={styles.userProfile}>
           <Image 
             src={avatarUrl} 
             alt={user.fullName} 
             width={30} 
             height={30} 
             className={styles.avatar} 
             unoptimized={true} // Good practice for placeholder services
           />
           {/* Display the user's name */}
        </div>
      </div>
    </header>
  );
};

export default UserSearchBar;
