// src/modules/profile/components/AdminProfileView.tsx

import React, { useState } from "react";
import Link from "next/link";
import {
    Users,
    ShieldCheck,
    Landmark,
    CalendarCheck,
    ShoppingBag,
    Settings,
    ArrowRight,
    LogOut,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    Key,
    Lock,
} from "lucide-react";
import { User, useAuthStore } from "@/store/authStore";

interface AdminProfileViewProps {
    user: User;
}

export default function AdminProfileView({ user }: AdminProfileViewProps) {
    const { logout } = useAuthStore();
    const [imgError, setImgError] = useState(false);
    const [isLoggingOutState, setIsLoggingOutState] = useState(false);

    // Helper to format date into "25 June 2026"
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Not available";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const day = d.getDate();
            const month = d.toLocaleDateString("en-US", { month: "long" });
            const year = d.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    };

    // Helper for avatar initials
    const getInitials = (name?: string) => {
        if (!name) return "AD";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogoutClick = async () => {
        setIsLoggingOutState(true);
        try {
            await logout();
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setIsLoggingOutState(false);
        }
    };

    const QUICK_ACCESS_CARDS = [
        {
            title: "Staff Management",
            desc: "Manage staff members and roles",
            path: "/admin/hr/staff",
            icon: Users,
            color: "bg-blue-50 text-blue-600 border-blue-100",
        },
        {
            title: "Compliances",
            desc: "Manage company compliance activities",
            path: "/admin/compliances",
            icon: ShieldCheck,
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        },
        {
            title: "Accounts",
            desc: "View and manage account activities",
            path: "/admin/accounts",
            icon: Landmark,
            color: "bg-cyan-50 text-cyan-600 border-cyan-100",
        },
        {
            title: "HR Management",
            desc: "Access HR operations and leave requests",
            path: "/admin/hr/staff",
            icon: CalendarCheck,
            color: "bg-indigo-50 text-indigo-700 border-indigo-100",
        },
        {
            title: "Sales & Orders",
            desc: "View sales, quotations, and ongoing orders",
            path: "/admin/orders",
            icon: ShoppingBag,
            color: "bg-amber-50 text-amber-600 border-amber-100",
        },
        {
            title: "Settings",
            desc: "Manage account and system settings",
            path: "/settings",
            icon: Settings,
            color: "bg-slate-100 text-slate-600 border-slate-205",
        },
    ];

    return (
        <div className="flex flex-col gap-6 w-full p-4 md:p-6">

            {/* Page Title & Subtitle */}
            <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                    Manage your personal information and account settings
                </p>
            </div>

            {/* 1. PROFILE HEADER CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row items-center gap-6 w-full">
                {user.image_url && !imgError ? (
                    <img
                        src={user.image_url}
                        alt={user.staff_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-3xs"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-3xs">
                        {getInitials(user.staff_name)}
                    </div>
                )}

                <div className="flex-grow text-center sm:text-left space-y-1.5">
                    <h2 className="text-lg font-black text-slate-900">{user.staff_name}</h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs font-bold text-slate-500">
                        <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {user.role_name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Mail size={13} className="text-slate-400" />
                            {user.email}
                        </span>
                    </div>

                    <div className="pt-1 text-left flex justify-center sm:justify-start">
                        {user.account_status !== undefined ? (
                            user.account_status ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full block animate-pulse" />
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full block" />
                                    Inactive
                                </span>
                            )
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-black text-slate-500 bg-slate-50 border border-slate-205 rounded-full">
                                Not Available
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. PERSONAL & ACCOUNT INFORMATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                {/* Personal Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-650" />
                        <h3 className="font-extrabold text-slate-800 text-xs uppercase leading-tight tracking-wider">
                            Personal Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Full Name</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal">{user.staff_name}</strong>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Email Address</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal break-all">{user.email}</strong>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Address</span>
                            <strong className="text-slate-800 block text-xs font-semibold leading-relaxed whitespace-pre-line">
                                {user.address || "Not specified"}
                            </strong>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Role</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal">{user.role_name}</strong>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Joined Date</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal">{formatDate(user.created_on)}</strong>
                        </div>
                    </div>
                </div>

                {/* Account Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Landmark size={16} className="text-indigo-650" />
                        <h3 className="font-extrabold text-slate-800 text-xs uppercase leading-tight tracking-wider">
                            Account Details
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">User ID</span>
                            <strong className="text-indigo-700 block text-xs font-extrabold leading-normal">#{user.id}</strong>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Account Status</span>
                            <div>
                                {user.account_status !== undefined ? (
                                    user.account_status ? (
                                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-250">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-250">
                                            Inactive
                                        </span>
                                    )
                                ) : (
                                    <span className="text-slate-400 italic">Not available</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">System Role</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal">{user.role_name}</strong>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Created On</span>
                            <strong className="text-slate-800 block text-xs font-bold leading-normal">{formatDate(user.created_on)}</strong>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3. ADMIN QUICK ACCESS */}
            {/* <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Settings size={16} className="text-indigo-650" />
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase leading-tight tracking-wider">
                        Admin Quick Access
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {QUICK_ACCESS_CARDS.map((card) => (
                        <Link
                            key={card.path}
                            href={card.path}
                            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between transition-all hover:-translate-y-0.5 shadow-3xs group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg border ${card.color}`}>
                                    <card.icon size={18} />
                                </div>
                                <div className="text-left">
                                    <strong className="font-extrabold text-xs text-slate-800 block group-hover:text-indigo-600 transition-colors">
                                        {card.title}
                                    </strong>
                                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                                        {card.desc}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-350 group-hover:text-indigo-600 transition-colors shrink-0 ml-2" />
                        </Link>
                    ))}
                </div>
            </div> */}

            {/* 4. SECURITY & LOGOUT SECTION */}
            <div className="bg-white border border-slate-202 rounded-2xl p-5 shadow-2xs flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Lock size={16} className="text-indigo-650" />
                    <h3 className="font-extrabold text-slate-800 text-xs uppercase leading-tight tracking-wider">
                        Security & Session
                    </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-200/60">
                    <div className="text-left">
                        <strong className="text-xs font-extrabold text-slate-800 block">Password</strong>
                        <span className="text-[10.5px] text-slate-450 font-bold block mt-0.5">
                            Keep your account secure
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Change Password - disabled, "Coming soon" */}
                        <div className="relative group">
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 border border-slate-200 bg-white text-slate-350 rounded-lg text-xs font-bold cursor-not-allowed shadow-3xs flex items-center gap-1.5"
                            >
                                <Key size={14} />
                                Change Password
                            </button>
                            <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                Coming soon
                            </span>
                        </div>

                        {/* Logout button */}
                        <button
                            type="button"
                            onClick={handleLogoutClick}
                            disabled={isLoggingOutState}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <LogOut size={14} />
                            {isLoggingOutState ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
