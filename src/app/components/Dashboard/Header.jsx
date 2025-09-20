"use client";

import React, { useEffect, useState } from "react";
import styles from "./Header.module.css";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";
import AdminNotificationBell from "./AdminNotificationBell";

const Header = () => {
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch("/api/auth/company");
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setAuthData(data);
      } catch (err) {
        console.error("Failed to load company data:", err);
      }
    }
    fetchCompany();
  }, []);

  const avatarUrl = `https://placehold.co/40x40/7E57C2/FFFFFF?text=Adm`;

  return (
    <header className={styles.header}>
      <div className={styles.searchBar}>
        {/* <FiSearch className={styles.searchIcon} />
        <input type="text" placeholder="Search" /> */}
      </div>
      <div className={styles.userSection}>
        <div className={styles.iconWrapper}>
          {authData?.company?.id && (
            <AdminNotificationBell companyId={authData.company.id} />
          )}
        </div>
        <div className={styles.userProfile}>
          <Image
            src={avatarUrl}
            width={30}
            height={30}
            className={styles.avatar}
            unoptimized={true}
            alt="Admin Avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
