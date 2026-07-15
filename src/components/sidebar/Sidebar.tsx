"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SIDEBAR_MENU_BY_ROLE, SIDEBAR_FOOTER_ITEMS } from "@/constants/sidebar";
import { useAuthStore } from "@/store/authStore"; // Zustand സ്റ്റോർ ഇമ്പോർട്ട് ചെയ്യുന്നു
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("sales");

  // Zustand സ്റ്റോറിൽ നിന്നും ഡാറ്റയും ഹൈഡ്രേഷൻ സ്റ്റാറ്റസും എടുക്കുന്നു
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

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
    } else if (pathname.startsWith("/production")) {
      setRole("production");
    } else if (pathname.startsWith("/logistics")) {
      setRole("logistics");
    } else if (pathname.startsWith("/hr")) {
      setRole("hr");
    } else if (pathname.startsWith("/accounts")) {
      setRole("accounts");
    } else if (pathname.startsWith("/marketing")) {
      setRole("marketing");
    } else if (pathname.startsWith("/manager")) {
      setRole("manager");
    } else if (_hasHydrated && user) {
      // പഴയ മാനുവൽ ലോക്കൽസ്റ്റോറേജിന് പകരം സ്റ്റോറിൽ നിന്നും റോൾ ഓട്ടോമാറ്റിക് ആയി എടുക്കുന്നു (പ്രധാന മാറ്റം)
      setRole(user.role_name.toLowerCase());
    }
  }, [pathname, _hasHydrated, user]);

  const menuItems = SIDEBAR_MENU_BY_ROLE[role] || SIDEBAR_MENU_BY_ROLE["sales"];

  const getBrandHeader = () => {
    switch (role) {
      case "admin": return { title: "Admin Portal", sub: "Management Edition" };
      case "profile": return { title: "PROFILE", sub: "Management Edition" };
      case "manager": return { title: "Manager Dashboard", sub: "Operations Edition" };
      case "project manager": return { title: "Project Manager", sub: "Enterprise Edition" };
      case "printing": return { title: "Printing Dashboard", sub: "Enterprise Edition" }; 
      case "designer": return { title: "Design Dashboard", sub: "Enterprise Edition" };
      case "production": return { title: "Production Dashboard", sub: "Enterprise Edition" };
      case "logistics": return { title: "Logistics Dashboard", sub: "Enterprise Edition" };
      case "hr": return { title: "HR Dashboard", sub: "Enterprise Edition" };
      case "accounts": return { title: "Accounts Dashboard", sub: "Enterprise Edition" };
      case "marketing": return { title: "Marketing Dashboard", sub: "Enterprise Edition" };
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