// src/modules/sales/pages/CustomersPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye, Users, Smartphone, Info, Loader2 } from "lucide-react";
import styles from "../components/OrderListComponents.module.css";
import { searchCustomersByMobile } from "../services/order.service";
import CustomerDetailsDrawer from "../components/CustomerDetailsDrawer";

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [customers, setCustomers] = useState<Array<{ id: number; mobile_number: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Detail Drawer States
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Debounced search logic with request cancellation handling
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (trimmed.length < 3) {
            setCustomers([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        let isCurrent = true;

        const delayDebounceFn = setTimeout(() => {
            searchCustomersByMobile(trimmed)
                .then((data) => {
                    if (isCurrent) {
                        setCustomers(data || []);
                    }
                })
                .catch((err) => {
                    if (isCurrent) {
                        console.error("Error searching customers:", err);
                        setError("Failed to load customer results. Please check connection.");
                    }
                })
                .finally(() => {
                    if (isCurrent) {
                        setIsLoading(false);
                    }
                });
        }, 450); // 450ms debounce

        return () => {
            isCurrent = false;
            clearTimeout(delayDebounceFn);
        };
    }, [searchQuery]);

    const handleRetry = () => {
        const trimmed = searchQuery.trim();
        if (trimmed.length >= 3) {
            setIsLoading(true);
            setError(null);
            searchCustomersByMobile(trimmed)
                .then((data) => {
                    setCustomers(data || []);
                })
                .catch((err) => {
                    console.error("Retry error:", err);
                    setError("Failed to load customer results. Please check connection.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleViewDetails = (id: number) => {
        setSelectedCustomerId(id);
        setIsDrawerOpen(true);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div className="space-y-1">
                    <h1 className={styles.title}>Customers</h1>
                    <p className={styles.subtitle}>Customer directory & contact management</p>
                </div>
            </div>

            {/* Directory Section */}
            <div className="space-y-4">
                {/* Search Searchbar */}
                <div className="max-w-md bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5 select-none">
                        Find Customer
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by mobile number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full border border-slate-200 rounded-lg pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-650 bg-white placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* State/List Display Area */}
                <div className="space-y-4">
                    {searchQuery.trim().length < 3 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div className="space-y-1 max-w-sm">
                                <h3 className="text-xs font-bold text-slate-700">Search-First Directory</h3>
                                <p className="text-[11px] font-semibold text-slate-450 leading-relaxed">
                                    Type at least 3 digits of a mobile number to search.
                                </p>
                            </div>
                        </div>
                    )}

                    {searchQuery.trim().length >= 3 && isLoading && (
                        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                            <Loader2 className="h-7 w-7 text-indigo-600 animate-spin" />
                            <p className="text-xs font-bold text-slate-500">Searching customer directory...</p>
                        </div>
                    )}

                    {searchQuery.trim().length >= 3 && error && !isLoading && (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700">{error}</p>
                                <button
                                    onClick={handleRetry}
                                    className="mt-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-100"
                                >
                                    Retry Search
                                </button>
                            </div>
                        </div>
                    )}

                    {searchQuery.trim().length >= 3 && !isLoading && !error && customers.length === 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-700">No customers found</p>
                                <p className="text-[11px] font-semibold text-slate-450">
                                    Try searching with another mobile number.
                                </p>
                            </div>
                        </div>
                    )}

                    {searchQuery.trim().length >= 3 && !isLoading && !error && customers.length > 0 && (
                        <div className={styles.tableCard}>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className="w-24 text-center">Customer ID</th>
                                            <th>Mobile Number</th>
                                            <th className="w-28 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((cust) => (
                                            <tr key={cust.id} className="hover:bg-slate-50/50">
                                                <td className="text-center font-extrabold text-slate-400">
                                                    #{cust.id}
                                                </td>
                                                <td className="font-bold text-slate-700">
                                                    <span className="flex items-center gap-2">
                                                        <Smartphone size={13} className="text-slate-400" />
                                                        {cust.mobile_number || "—"}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => handleViewDetails(cust.id)}
                                                            className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[11px] font-bold transition-all hover:bg-indigo-150 inline-flex items-center gap-1.5 cursor-pointer"
                                                            title="View Customer Profile"
                                                        >
                                                            <Eye size={12} />
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Details Drawer */}
            <CustomerDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                customerId={selectedCustomerId}
            />
        </div>
    );
}
