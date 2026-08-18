"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { ChevronRight } from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarGroupProps {
  name: string;
  iconName: string;
  subItems: { name: string; path: string }[];
  isCollapsed?: boolean;
  // Controlled open state — managed by parent Sidebar so only one opens at a time
  isOpen: boolean;
  onToggle: () => void;
  onSubItemClick?: (subName: string) => void; // 🌟 SubItem click callback
}

export default function SidebarGroup({
  name,
  iconName,
  subItems,
  isCollapsed = false,
  isOpen,
  onToggle,
  onSubItemClick,
}: SidebarGroupProps) {
  const pathname = usePathname();
  const IconComponent = (LucideIcons as unknown as Record<string, React.ElementType>)[iconName];

  const isChildActive = subItems.some((sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"));

  // Flyout state for collapsed mode
  const [flyoutTop, setFlyoutTop] = useState<number | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpandedClick = () => {
    if (!isCollapsed) onToggle();
  };

  // ── Flyout handlers (collapsed mode only) ──────────────────────────────
  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const scheduledHide = () => {
    hideTimer.current = setTimeout(() => setFlyoutTop(null), 120);
  };

  const handleBtnMouseEnter = () => {
    if (!isCollapsed) return;
    clearHideTimer();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setFlyoutTop(rect.top);
    }
  };

  const handleBtnMouseLeave = () => {
    if (!isCollapsed) return;
    scheduledHide();
  };

  const handleFlyoutMouseEnter = () => clearHideTimer();
  const handleFlyoutMouseLeave = () => scheduledHide();
  const closeFlyout = () => setFlyoutTop(null);

  return (
    <div className={styles.dropdownGroup}>
      {/* Group header button */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleExpandedClick}
        onMouseEnter={handleBtnMouseEnter}
        onMouseLeave={handleBtnMouseLeave}
        className={`${styles.navItem} ${isOpen || isChildActive ? styles.activeParent : ""}`}
        title={isCollapsed ? name : undefined}
      >
        {IconComponent && <IconComponent size={18} />}
        <span className={`${styles.navLabel} ${isCollapsed ? styles.navLabelHidden : ""}`}>
          {name}
        </span>
        <ChevronRight
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""} ${isCollapsed ? styles.chevronHidden : ""}`}
          size={14}
        />
      </button>

      {/* Expanded mode: inline sub-menu */}
      {!isCollapsed && isOpen && (
        <div className={styles.subItemsList}>
          {subItems.map((sub) => {
            const isActive = pathname === sub.path || pathname.startsWith(sub.path + "/");
            return (
              <Link
                key={sub.name}
                href={sub.path}
                onClick={() => onSubItemClick?.(sub.name)}
                className={`${styles.subNavItem} ${isActive ? styles.subActive : ""}`}
              >
                <div className={styles.subDot} />
                <span>{sub.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Collapsed mode: flyout panel */}
      {isCollapsed && flyoutTop !== null && (
        <div
          ref={flyoutRef}
          className={styles.flyoutMenu}
          style={{ top: flyoutTop }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          <div className={styles.flyoutTitle}>{name}</div>
          {subItems.map((sub) => {
            const isActive = pathname === sub.path || pathname.startsWith(sub.path + "/");
            return (
              <Link
                key={sub.name}
                href={sub.path}
                onClick={() => { closeFlyout(); onSubItemClick?.(sub.name); }}
                className={`${styles.flyoutItem} ${isActive ? styles.flyoutItemActive : ""}`}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}