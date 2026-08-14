"use client";

import React from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarItemProps {
  name: string;
  path: string;
  iconName: string;
  isActive: boolean;
  isCollapsed?: boolean;
  isDanger?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function SidebarItem({
  name,
  path,
  iconName,
  isActive,
  isCollapsed = false,
  isDanger = false,
  onClick,
}: SidebarItemProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[iconName];

  return (
    <Link
      href={path}
      onClick={onClick}
      className={`${styles.navItem} ${isActive ? styles.active : ""} ${
        isDanger ? "!text-rose-500 hover:!text-rose-400 hover:!bg-rose-500/10" : ""
      }`}
      title={isCollapsed ? name : undefined}
    >
      {IconComponent && (
        <IconComponent 
          size={18} 
          className={isDanger ? "!text-rose-500" : undefined}
        />
      )}
      <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ""}`}>
        {name}
      </span>
    </Link>
  );
}