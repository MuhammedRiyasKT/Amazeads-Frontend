"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { SIDEBAR_MENU_BY_ROLE, SIDEBAR_FOOTER_ITEMS } from "@/constants/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggle = useSidebarStore((state) => state.toggle);

  // ─── Only one group open at a time ──────────────────────────────────────
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleGroupToggle = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  // ─── Determine role from pathname (existing logic preserved exactly) ─────
  const getRole = (): string => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/sales")) return "sales";
    if (pathname.startsWith("/project-manager")) return "project manager";
    if (pathname.startsWith("/printing")) return "printing";
    if (pathname.startsWith("/designing")) return "designing";
    if (pathname.startsWith("/production")) return "production";
    if (pathname.startsWith("/logistics")) return "logistics";
    if (pathname.startsWith("/hr")) return "hr";
    if (pathname.startsWith("/accounts")) return "accounts";
    if (pathname.startsWith("/marketing")) return "marketing";
    if (pathname.startsWith("/manager")) return "manager";
    if (_hasHydrated && user) return user.role_name.toLowerCase();
    return "sales";
  };

  const role = getRole();
  const baseMenuItems = SIDEBAR_MENU_BY_ROLE[role] || SIDEBAR_MENU_BY_ROLE["sales"];
  const menuItems = [...baseMenuItems];

  const roleRoutes: Record<string, string> = {
    admin: "/admin",
    sales: "/sales",
    "project manager": "/project-manager",
    manager: "/manager",
    designing: "/designing/tasks",
    designer: "/designing/tasks",
    printing: "/printing",
    production: "/production/laser-cutting",
    logistics: "/logistics",
    hr: "/hr",
    accounts: "/accounts",
    marketing: "/marketing",
  };

  if (role === "profile" && _hasHydrated && user) {
    const userRole = user.role_name.toLowerCase();
    const exitPath = roleRoutes[userRole] || "/dashboard";
    menuItems.push({
      name: "Exit Profile",
      path: exitPath,
      iconName: "ArrowLeft"
    });
  }

  // Auto-open the group whose child matches current pathname; close others
  useEffect(() => {
    const activeGroup = menuItems.find(
      (item) =>
        item.subItems &&
        item.subItems.some((sub) => pathname.startsWith(sub.path))
    );
    setOpenGroup(activeGroup ? activeGroup.name : null);
  }, [pathname]);

  // ─── Brand header labels (existing logic preserved exactly) ─────────────
  const getBrandHeader = (): { title: string; sub: string } => {
    switch (role) {
      case "admin":           return { title: "Admin", sub: "Management Edition" };
      case "profile":         return { title: "Profile", sub: "Management Edition" };
      case "manager":         return { title: "Manager", sub: "Operations Edition" };
      case "project manager": return { title: "Proj. Manager", sub: "Enterprise Edition" };
      case "printing":        return { title: "Printing", sub: "Enterprise Edition" };
      case "designing":       return { title: "Design", sub: "Enterprise Edition" };
      case "production":      return { title: "Production", sub: "Enterprise Edition" };
      case "logistics":       return { title: "Logistics", sub: "Enterprise Edition" };
      case "hr":              return { title: "HR", sub: "Enterprise Edition" };
      case "accounts":        return { title: "Accounts", sub: "Enterprise Edition" };
      case "marketing":       return { title: "Marketing", sub: "Enterprise Edition" };
      default:                return { title: "Sales", sub: "Enterprise Edition" };
    }
  };

  const brand = getBrandHeader();

  // ─── Active link detection (existing logic preserved exactly) ───────────
  const isActive = (itemPath: string): boolean => {
    if (!itemPath) return false;

    if (itemPath === "/printing" || itemPath === "/printing/tasks") {
      return (
        pathname.startsWith("/printing") &&
        !pathname.startsWith("/printing/daily-tasks") &&
        !pathname.startsWith("/printing/timeline")
      );
    }

    if (itemPath === "/designing" || itemPath === "/designing/tasks") {
      return (
        pathname.startsWith("/designing") &&
        !pathname.startsWith("/designing/daily-tasks") &&
        !pathname.startsWith("/designing/timeline")
      );
    }

    const exactMatchPaths = [
      "/sales", "/admin", "/project-manager", "/projects",
      "/profile", "/manager", "/dashboard", "/logistics",
      "/production", "/hr", "/accounts", "/marketing",
    ];

    if (exactMatchPaths.includes(itemPath)) {
      return pathname === itemPath;
    }

    return pathname.startsWith(itemPath);
  };

  // Toggle button uses position:fixed so overflow:hidden on sidebar doesn't clip it.
  // It sits exactly on the sidebar's right border edge.
  const toggleLeft = isCollapsed ? "52px" : "248px";

  return (
    <div 
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
      style={role === "profile" ? { background: "linear-gradient(to bottom, #1e1b4b, #0f0b21)" } : undefined}
    >

      {/* ── Toggle button — fixed on the right border edge of the sidebar ── */}
      <button
        type="button"
        onClick={toggle}
        className={styles.toggleBtn}
        style={{ left: toggleLeft }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── Brand Header ───────────────────────────────────────────────── */}
      <div className={`${styles.brand} ${isCollapsed ? styles.brandCollapsed : ""}`}>
        <div className={styles.brandLogo}>
          {role === "profile" ? <User size={18} /> : "A"}
        </div>
        <div className={`${styles.brandText} ${isCollapsed ? styles.brandTextHidden : ""}`}>
          <h1 className={styles.brandTitle}>{brand.title}</h1>
          <p className={styles.brandSubtitle}>{brand.sub}</p>
        </div>
      </div>

      {/* ── Main Nav Items ──────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;

          if (hasSubItems) {
            return (
              <SidebarGroup
                key={item.name}
                name={item.name}
                iconName={item.iconName}
                subItems={item.subItems!}
                isCollapsed={isCollapsed}
                isOpen={openGroup === item.name}
                onToggle={() => handleGroupToggle(item.name)}
              />
            );
          }

          return (
            <SidebarItem
              key={item.name}
              name={item.name}
              path={item.path}
              iconName={item.iconName}
              isActive={isActive(item.path)}
              isCollapsed={isCollapsed}
              isDanger={item.name === "Exit Profile"}
            />
          );
        })}
      </nav>

      {/* ── Footer Nav Items ────────────────────────────────────────────── */}
      <div className={styles.footer}>
        {SIDEBAR_FOOTER_ITEMS.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            path={item.path}
            iconName={item.iconName}
            isActive={isActive(item.path)}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
}