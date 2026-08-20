"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Edit2, Calendar, Clock } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";
import ViewOrderModal from "../components/ViewOrderModal";
import ProjectProgressTimelineDropdown from "../../project-manager/components/ProjectProgressTimelineDropdown";
import { useSalesStore } from "@/store/salesStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "../components/OrderListComponents.module.css";

export default function OrderDispatchPage() {
    const { selectedCategory } = useSalesStore();

    const [orders, setOrders] = useState<OrderItemResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Default date to today's local date
    const [completionDate, setCompletionDate] = useState<string>(
        new Date().toLocaleDateString("en-CA") // "YYYY-MM-DD" formatted using local timezone
    );
    const [mobileSearch, setMobileSearch] = useState("");

    // Modal states
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Timeline State
    const [activeTimelineProjectId, setActiveTimelineProjectId] = useState<number | null>(null);

    const toggleTimeline = (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        setActiveTimelineProjectId((prev) => (prev === projectId ? null : projectId));
    };

    const fetchOrders = async (pageToFetch = currentPage) => {
        setIsLoading(true);
        try {
            const activeFilters: any = {
                page: pageToFetch,
                page_size: 5,
                category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
                is_quotation: false
            };

            if (mobileSearch.trim()) activeFilters.mobile_number = mobileSearch.trim();
            if (completionDate) activeFilters.completion_date = completionDate;

            const data = await getOrdersList(activeFilters);
            setOrders(data.items || []);
            setTotalPages(data.pagination?.total_pages || 1);
            setTotalCount(data.pagination?.total_count || 0);
        } catch (err) {
            console.error("Error fetching orders for dispatch:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentPage,
        selectedCategory,
        completionDate,
        mobileSearch
    ]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMobileSearch(e.target.value);
        setCurrentPage(1);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompletionDate(e.target.value);
        setCurrentPage(1);
    };

    const handleViewClick = (id: number) => {
        setSelectedOrderId(id);
        setIsViewOpen(true);
    };

    const formatDateStyle = (dateStr?: string) => {
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

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div>
                    <h1 className={styles.title}>Orders To Dispatch</h1>
                    <p className={styles.subtitle}>
                        View and manage all active orders scheduled for dispatch today.
                    </p>
                </div>
            </div>

            {/* Filters Area */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm mb-6 mt-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Completion Date
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={completionDate}
                                onChange={handleDateChange}
                                className="w-full h-10 pl-3 pr-4 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-800"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Search Mobile
                        </label>
                        <input
                            type="text"
                            placeholder="Search by number..."
                            value={mobileSearch}
                            onChange={handleSearchChange}
                            className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="pl-2">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 block h-10 flex items-center">
                            Total {totalCount} matching orders
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className={styles.tableCard} style={{ overflow: "visible" }}>
                <div className={styles.tableContainer} style={{ overflow: "visible", maxHeight: "none" }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "90px" }}>ORDER ID</th>
                                <th style={{ width: "130px" }}>CUSTOMER</th>
                                <th>PRODUCT</th>
                                <th style={{ width: "45px", textAlign: "center" }}>QTY</th>
                                <th style={{ width: "95px" }}>COMMIT DATE</th>
                                <th style={{ width: "100px" }}>COMPLETION DATE</th>
                                <th style={{ width: "100px" }}>ACCOUNT</th>
                                <th style={{ width: "100px" }}>FINAL AMT</th>
                                <th style={{ width: "90px", textAlign: "center" }}>PAYMENT STATUS</th>
                                <th style={{ width: "90px", textAlign: "center" }}>ORDER STATUS</th>
                                <th style={{ width: "80px", textAlign: "center" }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading orders to dispatch...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: "center", padding: "24px" }}>
                                        No sales orders to dispatch for the selected date.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const projectsList = order.projects && order.projects.length > 0 ? order.projects : [null];
                                    const projectsCount = projectsList.length;

                                    return (
                                        <React.Fragment key={order.id}>
                                            {projectsList.map((proj, pIdx) => {
                                                const isFirstRow = pIdx === 0;

                                                return (
                                                    <tr key={`${order.id}-${proj?.id || pIdx}`}>
                                                        {isFirstRow && (
                                                            <>
                                                                <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                                                    {order.order_number ? `#${order.order_number}` : `#${order.id}`}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle">
                                                                    <div className="font-bold text-slate-800">{order.customer_name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-semibold">{order.customer_mobile_number}</div>
                                                                </td>
                                                            </>
                                                        )}

                                                        <td
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: "0.78rem",
                                                                position: "relative",
                                                                zIndex: activeTimelineProjectId === proj.id ? 50 : undefined
                                                            }}
                                                            className="align-middle"
                                                        >
                                                            {proj ? (
                                                                <>
                                                                    <span
                                                                        className="cursor-pointer hover:text-indigo-600 transition-colors text-indigo-950 font-bold underline-offset-2 hover:underline block"
                                                                        onClick={(e) => toggleTimeline(e, proj.id)}
                                                                        title="Click to view department progress timeline"
                                                                    >
                                                                        {proj.project_name}
                                                                    </span>
                                                                    {activeTimelineProjectId === proj.id && (
                                                                        <ProjectProgressTimelineDropdown
                                                                            projectId={proj.id}
                                                                            onClose={() => setActiveTimelineProjectId(null)}
                                                                            position="bottom"
                                                                        />
                                                                    )}
                                                                </>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>

                                                        <td style={{ textAlign: "center", color: "#64748b" }}>
                                                            {proj ? proj.quantity : "—"}
                                                        </td>

                                                        {isFirstRow && (
                                                            <>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                                                    {formatDateStyle(order.commit_date || "")}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs font-bold text-indigo-700">
                                                                    {formatDateStyle(order.completion_date || "")}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle font-bold text-slate-600">
                                                                    {order.account_name || "—"}
                                                                </td>
                                                                <td rowSpan={projectsCount} className="align-middle whitespace-nowrap font-bold text-slate-800">
                                                                    ₹{(order.final_amount || 0).toLocaleString("en-IN")}
                                                                </td>
                                                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                                                    <span className={getPaymentBadgeClass(order.payment_status)}>
                                                                        {order.payment_status || "Pending"}
                                                                    </span>
                                                                </td>
                                                                <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle font-bold text-slate-700">
                                                                    <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                        {order.order_status || "Confirmed"}
                                                                    </span>
                                                                </td>

                                                                {/* ACTION COLUMN */}
                                                                <td rowSpan={projectsCount} className="align-middle">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        

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
