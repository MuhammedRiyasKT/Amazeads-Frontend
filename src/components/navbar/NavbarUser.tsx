"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import styles from "./Navbar.module.css"; // ഒരേ ഫോൾഡറിലെ സി.എസ്.എസ് ഇമ്പോർട്ട് ചെയ്യുന്നു

export default function NavbarUser() {
  const router = useRouter();

  const handleProfileClick = () => {
    // പ്രൊഫൈൽ പേജിലേക്ക് റീഡയറക്ട് ചെയ്യുന്നു
    router.push("/profile");
  };

  return (
    <button 
      className={styles.iconBtn} 
      onClick={handleProfileClick}
      aria-label="User Account"
    >
      <User size={18} />
    </button>
  );
}