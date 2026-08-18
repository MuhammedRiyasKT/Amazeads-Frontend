"use client";

import React, { useEffect, useState } from "react";
import { Eye, CheckCircle2, DollarSign, Calendar, X } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { getPMOrders } from "@/modules/project-manager/services/managerOrder.service";
import ViewOrderModal from "../components/ViewOrderModal";
import styles from "../components/OrderListComponents.module.css";

export default function ClosedOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Date Filter States
    const [commitToDate, setCommitToDate] = useState("");
    const [completionDate, setCompletionDate] = useState("");

    // Modal State
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const fetchClosedOrders = async () => {
        setIsLoading(true);
        try {
            // 🌟 Fetch Closed Orders using getPMOrders
            const data = await getPMOrders(currentPage, 5, "Closed", commitToDate, completionDate);
            setOrders(data.items || []);
            setTotalPages(data.pagination?.total_pages || 1);
            setTotalCount(data.pagination?.total_count || 0);
        } catch (err) {
            console.error("Error fetching closed orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClosedOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, commitToDate, completionDate]);

    const handleCommitToDate = (val: string) => {
        setCommitToDate(val);
        setCurrentPage(1);
    };

    const handleCompletionDate = (val: string) => {
        setCompletionDate(val);
        setCurrentPage(1);
    };

    const handleViewClick = (id: number) => {
        setSelectedOrderId(id);
        setIsViewOpen(true);
    };

    const formatDateStyle = (dateStr: string) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch (e) {
            return dateStr;
        }
    };

    const getPaymentBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
            case "partial":
                return "bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
            case "pending":
                return "bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
            default:
                return "bg-slate-50 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block";
        }
    };

    // KPI Revenue calculation
    const totalRevenue = orders.reduce((sum, o) => sum + (o.final_amount || 0), 0);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.title}>Closed Orders</h1>
                    <p className={styles.subtitle}>
                        Historical registry of all completed, delivered, and closed customer orders.
                    </p>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Closed Orders</span>
                        <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue (Current Page)</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{totalRevenue.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>

            {/* 🌟 Pill-style Date Filters Bar */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-3 px-4 py-2.5 w-fit mb-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">DATE FILTERS:</span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-slate-200" />

                {/* Commit Date */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                        Commit:
                    </span>
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            value={commitToDate}
                            onChange={(e) => handleCommitToDate(e.target.value)}
                            className="border-none outline-none text-xs text-slate-600 bg-transparent cursor-pointer"
                            style={{ paddingRight: commitToDate ? "18px" : "0" }}
                        />
                        {commitToDate && (
                            <button
                                type="button"
                                onClick={() => handleCommitToDate("")}
                                className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-slate-200" />

                {/* Completion Date */}
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                        Completed:
                    </span>
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            value={completionDate}
                            onChange={(e) => handleCompletionDate(e.target.value)}
                            className="border-none outline-none text-xs text-slate-600 bg-transparent cursor-pointer"
                            style={{ paddingRight: completionDate ? "18px" : "0" }}
                        />
                        {completionDate && (
                            <button
                                type="button"
                                onClick={() => handleCompletionDate("")}
                                className="absolute right-0 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "90px" }}>ORDER ID</th>
                                <th style={{ width: "135px" }}>CUSTOMER</th>
                                <th>PRODUCT</th>
                                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                                <th style={{ width: "95px" }}>ORDER DATE</th>
                                <th style={{ width: "95px" }}>COMMIT DATE</th>
                                <th style={{ width: "100px" }}>COMPLETED DATE</th>
                                <th style={{ width: "100px" }}>FINAL AMT</th>
                                <th style={{ width: "90px", textAlign: "center" }}>PAYMENT</th>
                                <th style={{ width: "90px", textAlign: "center" }}>STATUS</th>
                                <th style={{ width: "60px", textAlign: "center" }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading closed sales orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: "center", padding: "24px" }}>
                                        No closed orders found for selected date filters.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                                    const projectsCount = projectsList.length;

                                    return (
                                        <React.Fragment key={order.id}>
                                            {projectsList.map((proj: any, pIdx: number) => {
                                                const isFirstRow = pIdx === 0;

                                                return (
                                                    <tr key={`${order.id}-${proj?.id || pIdx}`} className="hover:bg-slate-50 transition-colors">
                                                        {isFirstRow && (
                                                            <>
                                                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap text-center text-slate-400">
                                                                    {order.order_number ? `#${order.order_number}` : `#${order.id}`}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle">
                                                                    <div className="font-bold text-slate-800">{order.customer_name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                                                </td>
                                                            </>
                                                        )}

                                                        <td className="font-bold text-[0.78rem] text-slate-700 align-middle">
                                                            {proj ? proj.project_name : "—"}
                                                        </td>

                                                        <td style={{ textAlign: "center", color: "#64748b" }} className="align-middle">
                                                            {proj ? proj.quantity : "—"}
                                                        </td>

                                                        {isFirstRow && (
                                                            <>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                                                    {formatDateStyle(order.order_date)}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                                                    {formatDateStyle(order.commit_date)}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                                                    {formatDateStyle(order.completion_date)}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                                                    ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                                                </td>
                                                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                                                    <span className={getPaymentBadgeClass(order.payment_status)}>
                                                                        {order.payment_status || "Pending"}
                                                                    </span>
                                                                </td>
                                                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                                                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide inline-flex items-center gap-1">
                                                                        <CheckCircle2 size={11} /> {order.order_status || "Closed"}
                                                                    </span>
                                                                </td>

                                                                {/* ACTION COLUMN */}
                                                                <td rowSpan={projectsCount} className="align-middle">
                                                                    <div className="flex items-center justify-center">
                                                                        <button
                                                                            onClick={() => handleViewClick(order.id)}
                                                                            className={styles.actionBtn}
                                                                            title="View Order Details"
                                                                        >
                                                                            <Eye size={13} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.paginationRow}>
                        <div className={styles.resultsText}>
                            Showing page <span className={styles.highlightText}>{currentPage}</span> of{" "}
                            <span className={styles.highlightText}>{totalPages}</span> ({totalCount} orders)
                        </div>
                        <Pagination
                            total={totalCount}
                            limit={5}
                            activePage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <ViewOrderModal
                isOpen={isViewOpen}
                orderId={selectedOrderId}
                onClose={() => {
                    setIsViewOpen(false);
                    setSelectedOrderId(null);
                }}
            />
        </div>
    );
}
