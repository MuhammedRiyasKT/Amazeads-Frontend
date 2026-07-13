"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import NavbarUser from "./NavbarUser"; // പുതിയ NavbarUser ഇമ്പോർട്ട് ചെയ്യുന്നു
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string>("sales");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) setRole(savedRole);
  }, []);

  const handleLogout = () => {
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const getSearchPlaceholder = () => {
    if (role === "admin") {
      return "Search across Command Center...";
    }
    return "Search orders, customers, projects...";
  };

  return (
    <div className={styles.navbar}>
      {/* Search Input Bar */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={16} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={getSearchPlaceholder()}
        />
      </div>

      {/* Action Buttons on Right */}
      <div className={styles.actions}>
        {/* Notification Bell */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.badge} />
        </button>

        {/* പുതിയ ഡൈനാമിക് യൂസർ ബട്ടൺ കമ്പോണന്റ് ഇവിടെ വിളിക്കുന്നു */}
        <NavbarUser />

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