"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENU_BY_ROLE, SIDEBAR_FOOTER_ITEMS } from "@/constants/sidebar";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("sales");

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setRole("admin");
    } else if (pathname.startsWith("/profile")) {
      setRole("profile");
    } else if (pathname.startsWith("/sales")) {
      setRole("sales");
    } else if (pathname.startsWith("/project-manager")) {
      setRole("project manager");
    } else if (pathname.startsWith("/printing")) {
      setRole("printing");
    } else if (pathname.startsWith("/designing")) {
      setRole("designer");
    } else if (pathname.startsWith("/manager")) {
      setRole("manager");
    } else {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole) setRole(savedRole);
    }
  }, [pathname]);

  const menuItems = SIDEBAR_MENU_BY_ROLE[role] || SIDEBAR_MENU_BY_ROLE["sales"];

  const getBrandHeader = () => {
    switch (role) {
      case "admin": return { title: "Admin Portal", sub: "Management Edition" };
      case "profile": return { title: "PROFILE", sub: "Enterprise Edition" };
      case "manager": return { title: "Manager Desk", sub: "Operations Edition" };
      case "project manager": return {title: "Project Manager", sub: "Enterprise Edition"};
      case "printing": return { title: "Printing Dashboard", sub: "Enterprise Edition" }; 
      case "designer": return { title: "Design Dashboard", sub: "Enterprise Edition" };
      default: return { title: "Sales Dashboard", sub: "Enterprise Edition" };
    }
  };

  const brand = getBrandHeader();

  const isActive = (itemPath: string) => {
    const exactMatchPaths = [
      "/sales",
      "/admin",
      "/project-manager",
      "/printing",
      "/projects",
      "/profile",
      "/manager",
      "/dashboard"
    ];

    // ലിങ്കുകൾ മുകളിൽ പറഞ്ഞവയിൽ ഏതെങ്കിലും ഒന്നാണെങ്കിൽ കൃത്യമായി ഒത്തുനോക്കുന്നു (Exact Match)
    if (exactMatchPaths.includes(itemPath)) {
      return pathname === itemPath;
    }

    return pathname.startsWith(itemPath);
  };

  return (
    <div className={styles.sidebar}>
      {/* Brand Header */}
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>{brand.title}</h1>
        <p className={styles.brandSubtitle}>{brand.sub}</p>
      </div>

      {/* Main Nav Items */}
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
            />
          );
        })}
      </nav>

      {/* Footer Nav Items */}
      <div className={styles.footer}>
        {SIDEBAR_FOOTER_ITEMS.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            path={item.path}
            iconName={item.iconName}
            isActive={isActive(item.path)}
          />
        ))}
      </div>
    </div>
  );
}