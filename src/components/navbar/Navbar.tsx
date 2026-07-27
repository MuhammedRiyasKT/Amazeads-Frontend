"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // Zustand സ്റ്റോർ
import NavbarUser from "./NavbarUser";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<string>("sales");

  // Zustand സ്റ്റോർ വാല്യൂസ്
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout); // ലോഗൗട്ട് ആക്ഷൻ

  useEffect(() => {
    if (_hasHydrated && user) {
      setRole(user.role_name.toLowerCase());
    }
  }, [_hasHydrated, user]);

  // ലോഗൗട്ട് അസിൻക്രണസ് ആക്കി മാറ്റി (പ്രധാന മാറ്റം! 🌟)
   const handleLogout = async () => {
    try {
      await logout(); // സെർവർ ലോഗൗട്ടും ബ്രൗസർ സ്റ്റോറേജ് ക്ലിയറൻസും നടത്തുന്നു
      
      // router.push-ന് പകരം വിൻഡോ റീലോഡ് ഉപയോഗിച്ച് റീഡയറക്ട് ചെയ്യുന്നു (പ്രധാന മാറ്റം! 🌟)
      window.location.href = "/login"; 
    } catch (err) {
      console.error("Logout action failed:", err);
    }
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

        {/* പുതിയ ഡൈനാമിക് യൂസർ ബട്ടൺ കമ്പോണന്റ് */}
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