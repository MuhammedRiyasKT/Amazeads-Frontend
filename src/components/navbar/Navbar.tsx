"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User, LogOut } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Perform standard logout cleaning if any later
    router.push("/login");
  };

  return (
    <div className={styles.navbar}>
      {/* Search Input Bar */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={16} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search orders, customers, projects..."
        />
      </div>

      {/* Action Buttons on Right */}
      <div className={styles.actions}>
        {/* Notification Bell */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.badge} />
        </button>

        {/* User Account Button */}
        <button className={styles.iconBtn} aria-label="User Account">
          <User size={18} />
        </button>

        {/* Logout Button */}
        <button
          className={styles.iconBtn}
          onClick={handleLogout}
          aria-label="Log Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}