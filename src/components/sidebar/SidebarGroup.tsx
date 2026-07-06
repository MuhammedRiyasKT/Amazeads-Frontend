"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { ChevronRight } from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarGroupProps {
  name: string;
  iconName: string;
  subItems: { name: string; path: string }[];
}

export default function SidebarGroup({ name, iconName, subItems }: SidebarGroupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = (LucideIcons as any)[iconName];

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Checks whether any of its contained subitems are currently active.
  const isChildActive = subItems.some((sub) => pathname === sub.path);

  return (
    <div className={styles.dropdownGroup}>
      {/* Main button (Eg: Sale) */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`${styles.navItem} ${isOpen || isChildActive ? styles.activeParent : ""}`}
      >
        {IconComponent && <IconComponent size={18} />}
        <span>{name}</span>
        <ChevronRight
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          size={14}
        />
      </button>

      {/* Sub-menus when the dropdown expands */}
      {isOpen && (
        <div className={styles.subItemsList}>
          {subItems.map((sub) => {
            const isActive = pathname === sub.path;
            return (
              <Link
                key={sub.name}
                href={sub.path}
                className={`${styles.subNavItem} ${isActive ? styles.subActive : ""}`}
              >
                <div className={styles.subDot} />
                <span>{sub.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}