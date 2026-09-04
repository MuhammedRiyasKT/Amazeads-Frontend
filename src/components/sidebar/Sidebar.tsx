
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { SIDEBAR_MENU_BY_ROLE, SIDEBAR_FOOTER_ITEMS } from "@/constants/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { usePrintingStore } from "@/store/printingStore";
import { useProductionStore } from "@/store/productionStore";
import { useSalesStore } from "@/store/salesStore";
import { useProjectManagerStore } from "@/store/projectManagerStore";
import { CATEGORY_IDS } from "@/constants/categories";
import { getSalesOrderStatusKpi } from "@/modules/sales/services/salesKpi.service";
import { getPendingDesignApprovalsCount } from "@/modules/sales/services/designApproval.service";
import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen); // 🌟 Mobile state
  const closeMobile = useSidebarStore((state) => state.closeMobile);   // 🌟 Close action
  const selectedSubDept = usePrintingStore((state) => state.selectedSubDept);
  const selectedProductionSubDept = useProductionStore((state) => state.selectedSubDept);

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [salesBadges, setSalesBadges] = useState<{ delivered?: number; orders_to_close?: number; design_approval?: number }>({});
  const { selectedCategory } = useSalesStore();

  const handleGroupToggle = (groupName: string) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

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

  useEffect(() => {
    if (role === "sales") {
      const fetchSalesBadges = async () => {
        try {
          const activeCategoryId = selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART;
          const [kpiResponse, countResponse] = await Promise.all([
            getSalesOrderStatusKpi({ upto_today: true }),
            getPendingDesignApprovalsCount(activeCategoryId)
          ]);

          let ordersToClose = 0;
          if (kpiResponse && kpiResponse.success && kpiResponse.data) {
            ordersToClose = kpiResponse.data.orders_to_close || kpiResponse.data.order_to_close || 0;
          }

          let designApprovalCount = 0;
          if (countResponse && countResponse.count !== undefined) {
            designApprovalCount = countResponse.count;
          }

          setSalesBadges({
            orders_to_close: ordersToClose,
            design_approval: designApprovalCount,
          });
        } catch (error) {
          console.error("Failed to fetch sidebar badges", error);
        }
      };

      fetchSalesBadges();
      const interval = setInterval(fetchSalesBadges, 120000);
      return () => clearInterval(interval);
    }
  }, [role, selectedCategory]);

  const baseMenuItems = SIDEBAR_MENU_BY_ROLE[role] || SIDEBAR_MENU_BY_ROLE["sales"];
  let menuItems = baseMenuItems.map((item) => {
    if (role === "printing" && item.name === "Task") {
      const subDeptName = selectedSubDept?.sub_department_name;
      let dynamicPath = "/printing";
      if (subDeptName) {
        const lowerName = subDeptName.toLowerCase();
        if (lowerName.includes("uv")) dynamicPath = "/printing/uvprint";
        else if (lowerName.includes("photo")) dynamicPath = "/printing/photo-print";
        else if (lowerName.includes("laser")) dynamicPath = "/printing/laser-print";
        else dynamicPath = "/printing/tasks";
      }
      return { ...item, path: dynamicPath };
    }
    if (role === "production" && item.name === "Task") {
      const subDeptName = selectedProductionSubDept?.sub_department_name;
      let dynamicPath = "/production";
      if (subDeptName) {
        const lowerName = subDeptName.toLowerCase();
        if (lowerName.includes("laser")) dynamicPath = "/production/laser-cutting";
        else if (lowerName.includes("frame") || lowerName.includes("photo")) dynamicPath = "/production/photo-frame";
        else dynamicPath = "/production/tasks";
      }
      return { ...item, path: dynamicPath };
    }
    return item;
  });

  if (role === "sales") {
    menuItems = menuItems.map((item) => {
      if (item.name === "Activities" && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map((sub) => {
            if (sub.name === "Design Approval" && salesBadges.design_approval !== undefined) {
              return { ...sub, badge: salesBadges.design_approval };
            }
            if (sub.name === "Orders To Close" && salesBadges.orders_to_close !== undefined) {
              return { ...sub, badge: salesBadges.orders_to_close };
            }
            return sub;
          }),
        };
      }
      return item;
    });
  }

  // For Admin users on the /profile section, hide staff-only sidebar items
  if (role === "profile" && _hasHydrated && user?.role_name?.toLowerCase() === "admin") {
    const ADMIN_HIDDEN_PROFILE_ITEMS = ["Attendance", "Daily Task Report", "Leave Requests"];
    menuItems = menuItems.filter((item) => !ADMIN_HIDDEN_PROFILE_ITEMS.includes(item.name));
  }


  const roleRoutes: Record<string, string> = {
    admin: "/admin",
    sales: "/sales",
    "project manager": "/project-manager",
    manager: "/manager",
    designing: "/designing/tasks",
    printing: "/printing",
    production: "/production",
    logistics: "/logistics",
    hr: "/hr",
    accounts: "/accounts",
    marketing: "/marketing",
  };

  if (role === "profile" && _hasHydrated && user) {
    const userRole = user.role_name.toLowerCase();
    console.log(userRole, " this is user role")
    const exitPath = roleRoutes[userRole] || "/dashboard";
    menuItems.push({
      name: "Exit Profile",
      path: exitPath,
      iconName: "ArrowLeft"
    });
  }

  // 🌟 റൂട്ട് മാറുമ്പോൾ അല്ലെങ്കിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ മൊബൈൽ സൈഡ്ബാർ തനിയെ ക്ലോസ് ആകും
  useEffect(() => {
    closeMobile();
    const activeGroup = menuItems.find(
      (item) =>
        item.subItems &&
        item.subItems.some((sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"))
    );
    setOpenGroup(activeGroup ? activeGroup.name : null);
  }, [pathname]);

  const getBrandHeader = (): { title: string; sub: string } => {
    switch (role) {
      case "admin": return { title: "Admin", sub: "Management Edition" };
      case "profile": return { title: "Profile", sub: "Management Edition" };
      case "manager": return { title: "Manager", sub: "Operations Edition" };
      case "project manager": return { title: "Proj. Manager", sub: "Enterprise Edition" };
      case "printing": return { title: "Printing", sub: "Enterprise Edition" };
      case "designing": return { title: "Design", sub: "Enterprise Edition" };
      case "production": return { title: "Production", sub: "Enterprise Edition" };
      case "logistics": return { title: "Logistics", sub: "Enterprise Edition" };
      case "hr": return { title: "HR", sub: "Enterprise Edition" };
      case "accounts": return { title: "Accounts", sub: "Enterprise Edition" };
      case "marketing": return { title: "Marketing", sub: "Enterprise Edition" };
      default: return { title: "Sales", sub: "Enterprise Edition" };
    }
  };

  const brand = getBrandHeader();

  const isActive = (itemPath: string): boolean => {
    if (!itemPath) return false;

    if (itemPath.startsWith("/printing")) {
      if (itemPath === "/printing/overview") {
        return pathname === "/printing/overview" || pathname.startsWith("/printing/categories");
      }
      if (itemPath === "/printing/daily-tasks" || itemPath === "/printing/timeline") {
        return pathname.startsWith(itemPath);
      }
      return (
        pathname.startsWith("/printing") &&
        !pathname.startsWith("/printing/overview") &&
        !pathname.startsWith("/printing/categories") &&
        !pathname.startsWith("/printing/daily-tasks") &&
        !pathname.startsWith("/printing/timeline")
      );
    }

    if (itemPath.startsWith("/designing")) {
      // Exact-match routes
      if (itemPath === "/designing") {
        return pathname === "/designing";
      }
      // Daily tasks / timeline — prefix match
      if (itemPath === "/designing/daily-tasks" || itemPath === "/designing/timeline") {
        return pathname.startsWith(itemPath);
      }
      // All other sub-routes (e.g. /designing/tasks) — prefix match
      return pathname.startsWith(itemPath);
    }

    if (itemPath.startsWith("/production")) {
      if (itemPath === "/production/overview") {
        return pathname === "/production/overview";
      }
      if (itemPath === "/production/daily-tasks" || itemPath === "/production/timeline") {
        return pathname.startsWith(itemPath);
      }
      return (
        pathname.startsWith("/production") &&
        !pathname.startsWith("/production/overview") &&
        !pathname.startsWith("/production/daily-tasks") &&
        !pathname.startsWith("/production/timeline")
      );
    }

    if (itemPath.startsWith("/logistics")) {
      if (itemPath === "/logistics") {
        return pathname === "/logistics";
      }
      if (
        itemPath === "/logistics/tasks" ||
        itemPath === "/logistics/packed-orders" ||
        itemPath === "/logistics/daily-tasks" ||
        itemPath === "/logistics/timeline"
      ) {
        return pathname.startsWith(itemPath);
      }
      return (
        pathname.startsWith("/logistics") &&
        pathname !== "/logistics" &&
        !pathname.startsWith("/logistics/tasks") &&
        !pathname.startsWith("/logistics/packed-orders") &&
        !pathname.startsWith("/logistics/daily-tasks") &&
        !pathname.startsWith("/logistics/timeline")
      );
    }

    const exactMatchPaths = [
      "/sales", "/admin", "/project-manager", "/projects",
      "/profile", "/manager", "/dashboard", "/logistics",
      "/hr", "/accounts", "/marketing",
    ];

    if (exactMatchPaths.includes(itemPath)) {
      return pathname === itemPath;
    }

    return pathname.startsWith(itemPath);
  };

  const toggleLeft = isCollapsed ? "52px" : "248px";

  return (
    <>
      {/* 🌟 Mobile Dark Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={closeMobile}
        />
      )}

      {/* 🌟 Sidebar Container */}
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isMobileOpen ? styles.sidebarMobileOpen : ""}`}
        style={role === "profile" ? { background: "linear-gradient(to bottom, #1e1b4b, #0f0b21)" } : undefined}
      >

        {/* Toggle button */}
        <button
          type="button"
          onClick={toggle}
          className={styles.toggleBtn}
          style={{ left: toggleLeft }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand Header */}
        <div className={`${styles.brand} ${isCollapsed ? styles.brandCollapsed : ""}`}>
          <div className={styles.brandLogo}>
            {role === "profile" ? <User size={18} /> : "A"}
          </div>
          <div className={`${styles.brandText} ${isCollapsed ? styles.brandTextHidden : ""}`}>
            <h1 className={styles.brandTitle}>{brand.title}</h1>
            <p className={styles.brandSubtitle}>{brand.sub}</p>
          </div>
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
                  isCollapsed={isCollapsed}
                  isOpen={openGroup === item.name}
                  onToggle={() => handleGroupToggle(item.name)}
                  onSubItemClick={(subName) => {
                    // 🌟 Sales - Create Order/Quotation subItem click ചെയ്യുമ്പോൾ sidebar auto-collapse ആകും
                    if (role === "sales" && (subName === "Create Order" || subName === "Create Quotation")) {
                      setCollapsed(true);
                    }
                  }}
                />
              );
            }

            return (
              <SidebarItem
                key={item.name}
                name={item.name}
                path={item.path}
                iconName={item.iconName}
                isActive={item.name === "Back To Category" ? false : isActive(item.path)}
                isCollapsed={isCollapsed}
                isDanger={item.name === "Exit Profile" || item.name === "Back To Category"}
                onClick={() => {
                  if (item.name === "Back To Category") {
                    useSalesStore.getState().clearCategory();
                    useProjectManagerStore.getState().clearCategory();
                  }
                  // 🌟 Sales - Create Order/Quotation click ചെയ്യുമ്പോൾ sidebar auto-collapse ആകും
                  if (role === "sales" && (item.name === "Create Order" || item.name === "Create Quotation")) {
                    setCollapsed(true);
                  }
                }}
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
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
    </>
  );
}