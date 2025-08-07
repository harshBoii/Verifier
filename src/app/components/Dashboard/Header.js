import React from 'react';
import styles from './Header.module.css';
import { FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import Image from 'next/image';

const Header = ({ user }) => {

  const avatarUrl = `https://placehold.co/40x40/7E57C2/FFFFFF?text=Adm`;

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
        <div className={styles.userProfile}>
           <Image src={avatarUrl} width={30} height={30} className={styles.avatar} unoptimized={true} />
        </div>
      </div>
    </header>
  );
};

export default Header;