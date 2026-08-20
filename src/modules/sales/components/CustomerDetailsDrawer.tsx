// src/modules/sales/components/CustomerDetailsDrawer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, User, Smartphone, MessageSquare, Home, MapPin, Loader2, Info } from "lucide-react";
import { getCustomerDetails } from "../services/order.service";

interface CustomerDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: number | null;
}

export default function CustomerDetailsDrawer({
    isOpen,
    onClose,
    customerId,
}: CustomerDetailsDrawerProps) {
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && customerId) {
            setIsLoading(true);
            setError(null);
            setCustomer(null);
            getCustomerDetails(customerId)
                .then((data) => {
                    setCustomer(data);
                })
                .catch((err) => {
                    console.error("Error fetching customer details:", err);
                    setError("Failed to load customer profile details.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, customerId]);

    if (!isOpen) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const renderAddress = (address: any) => {
        if (!address || (!address.address_line_1 && !address.district)) {
            return <p className="text-slate-400 italic text-xs font-semibold">Not provided</p>;
        }
        return (
            <div className="space-y-0.5 text-slate-700 text-xs font-bold font-sans">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && address.address_line_2 !== address.address_line_1 && (
                    <p>{address.address_line_2}</p>
                )}
                <p>
                    {[address.district, address.state, address.pincode].filter(Boolean).join(", ")}
                </p>
                {address.country && <p className="text-slate-400 text-[10px] uppercase">{address.country}</p>}
            </div>
        );
    };

    const billingAddr = customer?.billing_address;
    const shippingAddr = customer?.shipping_address || customer?.delivery_address;

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-[2000] flex justify-end">
            {/* Backdrop click close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Drawer Panel */}
            <div className="relative bg-white w-full max-w-lg h-full border-l shadow-2xl flex flex-col z-10 animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="space-y-0.5">
                        <h3 className="font-extrabold text-slate-900 text-sm uppercase">Customer Profile</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Details View
                        </span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500 font-semibold">
                            <Loader2 size={32} className="animate-spin text-indigo-600" />
                            <span className="text-xs">Fetching customer info...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
                            <Info size={32} className="text-rose-500" />
                            <p className="text-xs font-bold text-slate-700">{error}</p>
                            <button
                                onClick={() => customerId && getCustomerDetails(customerId).then(setCustomer).catch(() => { })}
                                className="mt-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && customer && (
                        <div className="space-y-6">
                            {/* Profile Card Header */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center rounded-full shrink-0 uppercase">
                                    {(customer.customer_name || "C").charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                                        {customer.customer_name || "Unnamed Customer"}
                                    </h4>
                                    <span
                                        className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${customer.status === "Active"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-slate-50 text-slate-500 border-slate-100"
                                            }`}
                                    >
                                        {customer.status || "Active"}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                                    <Smartphone size={12} /> Contact Info
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
                                        <Smartphone size={16} className="text-indigo-600 shrink-0" />
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Mobile Phone</span>
                                            <strong className="text-slate-800 text-xs font-bold block">{customer.mobile_number || "—"}</strong>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
                                        <MessageSquare size={16} className="text-emerald-600 shrink-0" />
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">WhatsApp</span>
                                            <strong className="text-slate-800 text-xs font-bold block">{customer.whatsapp_number || "—"}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-3">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                                    <Info size={12} /> Requirements
                                </h5>
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5">
                                    <p className="text-slate-700 text-xs font-semibold whitespace-pre-wrap leading-relaxed">
                                        {customer.requirements?.trim() || "No specific customer requirements recorded."}
                                    </p>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                                    <Home size={12} /> Addresses
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Billing */}
                                    <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/20">
                                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                                            Billing Address
                                        </span>
                                        {renderAddress(billingAddr)}
                                    </div>

                                    {/* Shipping */}
                                    <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/20">
                                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                                            Delivery Address
                                        </span>
                                        {renderAddress(shippingAddr)}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="space-y-3 pt-2">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                                    <Calendar size={12} /> System History
                                </h5>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-slate-600">
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Customer ID</span>
                                        <span className="font-bold text-slate-800 block">#{customer.id}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Created Date</span>
                                        <span className="font-bold text-slate-850 block">{formatDate(customer.created_on)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 flex items-center justify-end bg-slate-50 select-none">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
