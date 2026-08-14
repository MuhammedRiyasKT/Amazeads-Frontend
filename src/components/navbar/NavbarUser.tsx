"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import styles from "./Navbar.module.css";

export default function NavbarUser() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Zustand auth values
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const logout = useAuthStore((state) => state.logout);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    // authStore.logout() ഉള്ളിൽ backend call, state clear, /login redirect
    // എല്ലാം handle ചെയ്യുന്നു — ഇവിടെ separate redirect ആവശ്യമില്ല
    await logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!_hasHydrated || !user) {
    return (
      <button className={styles.iconBtn} aria-label="User Account">
        <UserIcon size={18} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className={styles.iconBtn} 
        onClick={toggleDropdown}
        aria-label="User Account"
      >
        <UserIcon size={18} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User Details Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200/80">
              <UserIcon size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <strong className="text-slate-800 font-bold text-xs leading-snug truncate">
                {user.staff_name}
              </strong>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                EMP-10{user.id}
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                {user.role_name}
              </span>
            </div>
          </div>

          <div className="my-2.5 border-t border-slate-100" />

          {/* Menu Options */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold w-full text-left transition-colors cursor-pointer"
            >
              <UserIcon size={14} className="text-slate-400" />
              <span>My Profile</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/settings");
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold w-full text-left transition-colors cursor-pointer"
            >
              <Settings size={14} className="text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 rounded-lg text-xs font-bold w-full text-left transition-colors cursor-pointer mt-1"
            >
              <LogOut size={14} className="text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}