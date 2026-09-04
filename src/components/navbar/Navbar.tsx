"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useSalesStore } from "@/store/salesStore";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import NavbarUser from "./NavbarUser";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("sales");

  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile); // 🌟 Mobile toggle

  // Active Category State
  const salesCategory = useSalesStore((state) => state.selectedCategory);
  const salesCategoryHydrated = useSalesStore((state) => state._hasHydrated);

  const pmCategory = useProjectManagerStore((state) => state.selectedCategory);
  const pmCategoryHydrated = useProjectManagerStore((state) => state._hasHydrated);

  const activeCategory = salesCategory || pmCategory;
  const isCategoryHydrated = salesCategoryHydrated || pmCategoryHydrated;

  useEffect(() => {
    if (_hasHydrated && user) {
      setRole(user.role_name.toLowerCase());
    }
  }, [_hasHydrated, user]);

  const handleLogout = async () => {
    try {
      await logout();
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

  const isCategoryPage = (path: string) => {
    // 🌟 Hide Category Badge on Daily Tasks & Expenses pages
    if (
      path.includes("/daily-tasks") ||
      path.includes("/expenses")
    ) {
      return false;
    }

    if (path.startsWith("/project-manager")) return true;
    const targetPaths = [
      "/sales",
      "/sales/create-order",
      "/sales/orders",
      "/sales/payments",
      "/sales/projects",
      "/sales/projects-to-design",
      "/sales/projects-to-print",
      "/sales/create-quotation",
      "/sales/list-quotation",
      "/sales/order-dispatch",
      "/sales/closed-orders",
      "/sales/design-approval",
      "/sales/orders-to-close",
      "/sales/reports"
    ];
    return targetPaths.some(target => {
      if (target === "/sales") {
        return path === target;
      }
      return path === target || path.startsWith(target + "/");
    });
  };

  const navbarLeft = isCollapsed ? "64px" : "260px";

  return (
    <div className={styles.navbar} style={{ left: navbarLeft }}>
      
      {/* 🌟 Left Section: Mobile Menu Icon + Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-[320px]">
        {/* Mobile Hamburger Menu Button (Shows ONLY on Mobile Screens) */}
        <button
          onClick={toggleMobile}
          className={styles.mobileMenuBtn}
          aria-label="Open Mobile Menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={getSearchPlaceholder()}
          />
        </div>
      </div>

      {/* Action Buttons on Right */}
      <div className={styles.actions}>
        {/* 🏷️ Active Category Display (Only on specified Sales / Projects pages) */}
        {isCategoryPage(pathname) && isCategoryHydrated && activeCategory && (
          <div className={styles.categoryBadge}>
            <span className={styles.categoryValue}>
              {activeCategory.category_name}
            </span>
          </div>
        )}

        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.badge} />
        </button>

        <NavbarUser />

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