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
}

export default function SidebarItem({ name, path, iconName, isActive }: SidebarItemProps) {
  const IconComponent = (LucideIcons as any)[iconName];

  return (
    <Link
      href={path}
      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
    >
      {IconComponent && <IconComponent size={18} />}
      <span>{name}</span>
    </Link>
  );
}