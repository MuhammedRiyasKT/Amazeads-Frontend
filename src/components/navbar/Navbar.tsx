"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // Zustand സ്റ്റോർ ഇമ്പോർട്ട് ചെയ്യുന്നു
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

  const handleLogout = () => {
    logout(); // സ്റ്റോറിലെ ലോഗൗട്ട് വഴി കുക്കികളും ലോക്കൽസ്റ്റോറേജും പൂർണ്ണമായി ക്ലിയർ ചെയ്യുന്നു (പ്രധാന മാറ്റം)
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