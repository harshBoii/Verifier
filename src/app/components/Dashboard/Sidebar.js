'use client'; // Required for using hooks like usePathname
import React from 'react';
import styles from './Sidebar.module.css';

// 1. Import Link for navigation and usePathname for active state
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FiGrid, FiUploadCloud, FiCheckSquare, FiBarChart2, FiHelpCircle, FiSettings } from 'react-icons/fi';

// 2. Modify NavItem to handle links and dynamic active state
const NavItem = ({ icon, label, href }) => {
  // Get the current URL path (e.g., '/', '/verification', '/settings')
  const pathname = usePathname();
  // An item is active if its href matches the current path
  const active = href === pathname;

  // If an href is provided, wrap the item in a Next.js Link component
  if (href) {
    return (
      <Link href={href} className={`${styles.navItem} ${active ? styles.active : ''}`}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  // If no href, render a non-clickable div (e.g., for "Help")
  return (
    <div className={styles.navItem}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        Demo CRM
      </div>
      <nav className={styles.nav}>
        {/* 3. Use the corrected NavItem with href props for each link */}
        <NavItem icon={<FiGrid />} href="/admin" label="Dashboard" />
        <NavItem icon={<FiUploadCloud />} href="/import" label="Import Employee" />
        <NavItem icon={<FiCheckSquare />} href="/verification" label="Verification" />
        <NavItem icon={<FiBarChart2 />} href="/reports" label="Reports" />
      </nav>
      <div className={styles.footer}>
        <NavItem icon={<FiHelpCircle />} label="Help" /> {/* No href = not a link */}
        <NavItem icon={<FiSettings />} href='/settings' label="Settings" />
      </div>
       <div className={styles.copyright}>
            <p>Privacy Policy | Terms</p>
            <p>@ 2025 Demo CRM Innovation and Enterprises Pvt. Ltd.</p>
        </div>
    </aside>
  );
};

export default Sidebar;