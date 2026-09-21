"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useSalesStore } from "@/store/salesStore";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import logoImg from "@/assets/images/logo.png";
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

  const isCategoryPage = (path: string) => {
    // 🌟 Hide Category Badge on common pages (Daily Tasks, HR, Products, Accounts, etc.)
    if (
      path.includes("/daily-tasks") ||
      path.includes("/expenses") ||
      path.includes("/attendance") ||
      path.includes("/compliances") ||
      path.includes("/products") ||
      path.includes("/accounts") ||
      path.includes("/customers") ||
      path.includes("/reports") ||
      path.includes("/hr")
    ) {
      return false;
    }

    const categoryPaths = [
      // Admin Category Pages
      "/admin",
      "/admin/new-orders",
      "/admin/orders",
      "/admin/order-dispatch",
      "/admin/closed",
      "/admin/cancel",
      "/admin/payments",
      "/admin/projects",
      "/admin/productfor-design",
      "/admin/productfor-print",
      "/admin/productfor-production",
      "/admin/productfor-logistics",
      "/admin/tasks",

      // Manager Category Pages
      "/manager",
      "/manager/new-orders",
      "/manager/orders",
      "/manager/order-dispatch",
      "/manager/closed",
      "/manager/cancel",
      "/manager/payments",
      "/manager/projects",
      "/manager/productfor-design",
      "/manager/productfor-print",
      "/manager/productfor-production",
      "/manager/productfor-logistics",
      "/manager/tasks",

      // Project Manager Category Pages
      "/project-manager",
      "/project-manager/new-orders",
      "/project-manager/orders",
      "/project-manager/order-dispatch",
      "/project-manager/closed",
      "/project-manager/cancel",
      "/project-manager/projects",
      "/project-manager/productfor-design",
      "/project-manager/productfor-print",
      "/project-manager/productfor-production",
      "/project-manager/productfor-logistics",
      "/project-manager/tasks",
      "/project-manager/packed-orders",
      "/project-manager/in-transist",
      "/project-manager/delivered",

      // Sales Category Pages
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
      "/sales/orders-to-close"
    ];

    return categoryPaths.some((target) => {
      if (
        target === "/admin" ||
        target === "/manager" ||
        target === "/project-manager" ||
        target === "/sales"
      ) {
        return path === target;
      }
      return path === target || path.startsWith(target + "/");
    });
  };

  const navbarLeft = isCollapsed ? "64px" : "260px";

  return (
    <div className={styles.navbar} style={{ left: navbarLeft }}>
      
      {/* 🌟 Left Section: Mobile Menu Icon + Brand Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button (Shows ONLY on Mobile Screens) */}
        <button
          onClick={toggleMobile}
          className={styles.mobileMenuBtn}
          aria-label="Open Mobile Menu"
        >
          <Menu size={20} />
        </button>

        {/* Brand Logo */}
        <div className="flex items-center py-1">
          <Image
            src={logoImg}
            alt="Amaze Ads Logo"
            height={40}
            className="h-9 md:h-10 w-auto max-w-[180px] md:max-w-[220px] object-contain"
            priority
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