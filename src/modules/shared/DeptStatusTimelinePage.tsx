"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Filter,
  RotateCcw,
  Calendar,
  Clock,
  X,
  Phone,
  MessageSquare,
  Package,
  Layers,
  User,
  Eye,
  ChevronRight,
  ImageIcon,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import styles from "@/modules/project-manager/components/PMOrderComponents.module.css";

// ================================
// Types & Config
// ================================
export type DeptTimelineDept = "designing" | "printing" | "production" | "logistics";

interface DeptStatusTimelinePageProps {
  department: DeptTimelineDept;
  title: string;
  subtitle: string;
  fetchFn: (filters: any) => Promise<any>;
  detailFetchFn?: (projectId: number) => Promise<any>;
}

const DEPT_CONFIG = [
  { id: 1, key: "designing", label: "DS", name: "Designing" },
  { id: 2, key: "printing", label: "PR", name: "Printing" },
  { id: 3, key: "production", label: "PD", name: "Production" },
  { id: 4, key: "logistics", label: "LG", name: "Logistics" },
];

const DEPT_ID_MAP: Record<DeptTimelineDept, number> = {
  designing: 1,
  printing: 2,
  production: 3,
  logistics: 4,
};

// ================================
// Helper Functions & Image Extractor
// ================================
function resolveImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath || typeof imagePath !== "string") return null;
  const cleanPath = imagePath.trim();
  if (!cleanPath) return null;

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  const baseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:8000";

  const formattedBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `${formattedBase}${formattedPath}`;
}

function extractProjectImage(data: any): string | null {
  if (!data) return null;

  if (Array.isArray(data.project_images) && data.project_images.length > 0) {
    for (const item of data.project_images) {
      const url = item?.img_url || item?.url || item?.file || item?.image;
      if (typeof url === "string" && url.trim().length > 0) {
        return resolveImageUrl(url);
      }
    }
  }

  const possibleProps = [
    data.image,
    data.image_url,
    data.project_image,
    data.design_file,
    data.file,
    data.file_url,
    data.attachment,
    data.sample_image,
  ];

  for (const prop of possibleProps) {
    if (typeof prop === "string" && prop.trim().length > 0) {
      return resolveImageUrl(prop);
    }
  }

  const possibleArrays = [data.images, data.files, data.attachments];
  for (const arr of possibleArrays) {
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      if (typeof first === "string") return resolveImageUrl(first);
      if (first && typeof first === "object") {
        const nested =
          first.img_url ||
          first.file ||
          first.file_url ||
          first.url ||
          first.image ||
          first.image_url;
        if (typeof nested === "string") return resolveImageUrl(nested);
      }
    }
  }

  return null;
}

function processDrawerData(rawResponse: any, targetProjectId: number | null) {
  if (!rawResponse) return null;

  let targetProj = rawResponse;
  let orderData = rawResponse;

  if (Array.isArray(rawResponse.projects) && rawResponse.projects.length > 0) {
    targetProj =
      rawResponse.projects.find((p: any) => p?.id === targetProjectId) ||
      rawResponse.projects[0];
    orderData = rawResponse;
  }

  return {
    ...targetProj,
    order_id: orderData.id || targetProj.order_id,
    order_number: orderData.order_number || targetProj.order_number,
    customer_name: orderData.customer_name || targetProj.customer_name,
    customer_mobile_number:
      orderData.customer_mobile_number || targetProj.customer_mobile_number,
    customer_whatsapp_number:
      orderData.customer_whatsapp_number || targetProj.customer_whatsapp_number,
    commit_date: orderData.commit_date || targetProj.commit_date,
    order_status: orderData.order_status || targetProj.order_status,
    remarks: targetProj.remarks || orderData.remarks,
    delivery_type_name: orderData.delivery_type_name,
    shipping_address: orderData.shipping_address,
    billing_address: orderData.billing_address,
    payment_status: orderData.payment_status,
    final_amount: orderData.final_amount,
    paid_amount: orderData.paid_amount,
    balance_amount: orderData.balance_amount,
    project_images: targetProj.project_images || orderData.project_images,
    departments: targetProj.departments || orderData.departments,
  };
}

function getDepartmentStatusInfo(d: any) {
  if (!d || d.is_assigned === false) {
    return {
      code: "unassigned",
      label: "Not Started",
      icon: "—",
      colorClass: "text-slate-400 bg-slate-50 border-slate-200",
      iconColor: "text-slate-300",
      tooltip: "Not Started — This project is not assigned to this department yet.",
    };
  }

  if (d.final_status === true) {
    return {
      code: "completed",
      label: "Completed",
      icon: "✓",
      colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600 font-extrabold",
      tooltip: "Completed — This department has completed its work.",
    };
  }

  const raw = (d.status || d.department_status || "Created").toString().toLowerCase();

  if (raw === "in progress" || raw === "in_progress") {
    return {
      code: "in_progress",
      label: "In Progress",
      icon: "◉",
      colorClass: "text-blue-700 bg-blue-50 border-blue-200",
      iconColor: "text-blue-600 font-extrabold",
      tooltip: "In Progress — This department is currently working on this project.",
    };
  }

  if (raw === "pending") {
    return {
      code: "pending",
      label: "Pending",
      icon: "◷",
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
      iconColor: "text-amber-600 font-bold",
      tooltip: "Pending — Waiting to start work.",
    };
  }

  return {
    code: "planned",
    label: "Planned",
    icon: "●",
    colorClass: "text-indigo-700 bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-600 font-bold",
    tooltip: "Planned — This project is assigned to this department and is upcoming.",
  };
}

function formatDateStyle(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function mapBackendStatus(statusStr: string) {
  if (!statusStr) return { label: "Planned", variant: "planned" };
  const lower = statusStr.toLowerCase();
  if (lower === "created") return { label: "Planned", variant: "planned" };
  if (lower === "pending") return { label: "Pending", variant: "pending" };
  if (lower === "in progress" || lower === "in_progress")
    return { label: "In Progress", variant: "progress" };
  if (lower === "completed" || lower === "delivered")
    return { label: "Completed", variant: "completed" };
  return { label: statusStr, variant: "default" };
}

// Workflow Cell Component
function WorkflowCell({
  departments,
  currentDeptId,
}: {
  departments: any[];
  currentDeptId: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 py-1 min-w-[210px]">
      {DEPT_CONFIG.map(({ id, label, name }) => {
        const d = (departments || []).find(
          (x: any) => x.department_id === id || x.id === id
        );
        const statusInfo = getDepartmentStatusInfo(d);
        const isCurrent = id === currentDeptId;

        return (
          <div
            key={id}
            title={`${name}: ${statusInfo.tooltip}`}
            className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded border transition-colors ${
              isCurrent ? "ring-1 ring-indigo-400 font-bold" : ""
            } ${statusInfo.colorClass}`}
          >
            <span className={`text-[11px] leading-none ${statusInfo.iconColor}`}>
              {statusInfo.icon}
            </span>
            <div className="flex items-center gap-1 truncate leading-tight">
              <span className="font-extrabold text-[10px] uppercase tracking-tight text-slate-800">
                {label}:
              </span>
              <span className="text-[10px] font-semibold truncate">
                {statusInfo.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const mapped = mapBackendStatus(status);
  
  const colorMap: Record<string, string> = {
    planned: "bg-slate-100 text-slate-700 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    progress: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    default: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border whitespace-nowrap inline-block ${
        colorMap[mapped.variant] || colorMap.default
      }`}
    >
      {mapped.label}
    </span>
  );
}

// ================================
// Main Component
// ================================
export default function DeptStatusTimelinePage({
  department,
  title,
  subtitle,
  fetchFn,
  detailFetchFn,
}: DeptStatusTimelinePageProps) {
  const currentDeptId = DEPT_ID_MAP[department];

  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Date Filters
  const [designDate, setDesignDate] = useState("");
  const [printingDate, setPrintingDate] = useState("");
  const [commitDate, setCommitDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");

  const hasFilters = !!(designDate || printingDate || commitDate || completedDate);

  // Project Details Drawer State
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [drawerRawData, setDrawerRawData] = useState<any | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fetch Data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const filters: any = { page: currentPage, page_size: 10 };
      if (designDate) filters.design_date = designDate;
      if (printingDate) filters.printing_date = printingDate;
      if (commitDate) filters.commit_date = commitDate;
      if (completedDate) filters.completed_date = completedDate;

      const data = await fetchFn(filters);
      const items = data.items || data.results || [];
      setOrders(items);
      setTotalPages(data.pagination?.total_pages || data.total_pages || 1);
      setTotalCount(data.pagination?.total_count || data.count || items.length);
    } catch (err) {
      console.error(`[${department}] Status Timeline fetch error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, designDate, printingDate, commitDate, completedDate]);

  const handleClearFilters = () => {
    setDesignDate("");
    setPrintingDate("");
    setCommitDate("");
    setCompletedDate("");
    setCurrentPage(1);
  };

  // Open Drawer
  const handleOpenDrawer = async (projectId: number) => {
    if (!projectId) return;
    setSelectedProjectId(projectId);
    setDrawerRawData(null);
    setImgError(false);
    setIsDrawerLoading(true);

    try {
      if (detailFetchFn) {
        const details = await detailFetchFn(projectId);
        setDrawerRawData(details?.data || details);
      } else {
        let foundProj: any = null;
        for (const o of orders) {
          const match = (o.projects || []).find((p: any) => p?.id === projectId);
          if (match) {
            foundProj = { ...match, order_number: o.order_number, customer_name: o.customer_name };
            break;
          }
        }
        setDrawerRawData(foundProj);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Process Drawer Object
  const drawerData = useMemo(() => {
    return processDrawerData(drawerRawData, selectedProjectId);
  }, [drawerRawData, selectedProjectId]);

  // Extract Image URL
  const projectImageUrl = useMemo(() => {
    return extractProjectImage(drawerData);
  }, [drawerData]);

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200"
        >
          <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Fully Responsive Date Filters Bar */}
      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-2xs mb-3 space-y-2.5 sm:space-y-0">
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between gap-2 sm:hidden pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[11px]">
            <Filter size={14} className="text-indigo-600" /> Date Filters
          </div>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Inputs Layout: 2-Column Grid on Mobile, Flex Row on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600">
          <div className="hidden sm:flex items-center gap-1 font-bold text-slate-700 uppercase text-[10px] mr-1">
            <Filter size={14} className="text-indigo-600" /> Date Filters:
          </div>

          {/* Design Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 sm:py-0 sm:h-9 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold shrink-0">
              Design:
            </span>
            <input
              type="date"
              value={designDate}
              onChange={(e) => {
                setDesignDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
            />
          </div>

          {/* Printing Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 sm:py-0 sm:h-9 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold shrink-0">
              Printing:
            </span>
            <input
              type="date"
              value={printingDate}
              onChange={(e) => {
                setPrintingDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
            />
          </div>

          {/* Commit Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 sm:py-0 sm:h-9 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold shrink-0">
              Commit:
            </span>
            <input
              type="date"
              value={commitDate}
              onChange={(e) => {
                setCommitDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
            />
          </div>

          {/* Completed Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 sm:py-0 sm:h-9 w-full sm:w-auto">
            <span className="text-[9px] sm:text-[10px] uppercase text-slate-400 font-bold shrink-0">
              Completed:
            </span>
            <input
              type="date"
              value={completedDate}
              onChange={(e) => {
                setCompletedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
            />
          </div>

          {/* Reset button for Desktop */}
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="hidden sm:flex items-center gap-1 px-3 h-9 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200 sm:ml-auto"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200 mb-3">
        <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
          Workflow Legend:
        </span>
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="text-emerald-600 font-black">✓</span> Completed
          </span>
          <span className="flex items-center gap-1 text-indigo-700 font-bold">
            <span className="text-indigo-600 font-black">●</span> Planned
          </span>
          <span className="flex items-center gap-1 text-blue-700 font-bold">
            <span className="text-blue-600 font-black">◉</span> In Progress
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            <span className="text-amber-600 font-black">◷</span> Pending
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className={styles.tableCard}>
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "95px" }}>ORDER</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th>PRODUCT / PROJECT</th>
                <th style={{ width: "55px", textAlign: "center" }}>QTY</th>
                <th style={{ width: "110px" }}>DESIGN DATE</th>
                <th style={{ width: "110px" }}>COMMIT DATE</th>
                <th style={{ width: "85px", textAlign: "center" }}>DAYS LEFT</th>
                <th style={{ width: "220px" }}>DEPARTMENT WORKFLOW</th>
                <th style={{ width: "90px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "60px", textAlign: "center" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                    Loading timeline...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                    No projects found for the selected date filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const projectsList =
                    order.projects && order.projects.length > 0 ? order.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={order.order_id || order.id}>
                      {projectsList.map((proj: any, pIdx: number) => {
                        const isFirstRow = pIdx === 0;
                        const projId = proj?.id;

                        return (
                          <tr
                            key={`${order.order_id}-${projId || pIdx}`}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                            onClick={() => projId && handleOpenDrawer(projId)}
                          >
                            {/* ORDER ID */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle font-bold text-slate-800 text-xs whitespace-nowrap"
                              >
                                #{order.order_number || order.order_id}
                              </td>
                            )}

                            {/* CUSTOMER */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle font-semibold text-slate-700 text-xs"
                              >
                                {order.customer_name || "—"}
                              </td>
                            )}

                            {/* PRODUCT / PROJECT */}
                            <td className="align-middle">
                              <div className="font-bold text-slate-900 text-xs">
                                {proj ? proj.project_name : "—"}
                              </div>
                              {proj?.remarks && (
                                <div className="text-[10px] text-slate-400 truncate max-w-xs">
                                  {proj.remarks}
                                </div>
                              )}
                            </td>

                            {/* QTY */}
                            <td className="text-center align-middle font-black text-indigo-700 text-xs">
                              {proj ? proj.quantity : "—"}
                            </td>

                            {/* DESIGN DATE */}
                            <td className="align-middle text-xs font-medium text-slate-600 whitespace-nowrap">
                              {proj ? formatDateStyle(proj.design_date) : "—"}
                            </td>

                            {/* COMMIT DATE */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle text-xs font-medium text-slate-600 whitespace-nowrap"
                              >
                                {formatDateStyle(order.commit_date)}
                              </td>
                            )}

                            {/* DAYS LEFT */}
                            {isFirstRow && (
                              <td
                                rowSpan={projectsCount}
                                className="align-middle text-center"
                              >
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded ${
                                    order.days_left_to_complete < 0
                                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {order.days_left_to_complete !== undefined &&
                                  order.days_left_to_complete !== null
                                    ? `${order.days_left_to_complete}d`
                                    : "—"}
                                </span>
                              </td>
                            )}

                            {/* WORKFLOW CELL */}
                            <td className="align-middle">
                              {proj ? (
                                <WorkflowCell
                                  departments={proj.departments || []}
                                  currentDeptId={currentDeptId}
                                />
                              ) : (
                                <span className="text-slate-400 text-[10px]">—</span>
                              )}
                            </td>

                            {/* STATUS */}
                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle text-center">
                                <StatusBadge status={order.order_status || "Created"} />
                              </td>
                            )}

                            {/* ACTION BUTTON */}
                            <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => projId && handleOpenDrawer(projId)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
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

        {/* MOBILE CARD VIEW */}
        <div className="block md:hidden p-3 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Loading timeline...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No projects found for the selected date filters.
            </div>
          ) : (
            orders.map((order) => {
              const projectsList =
                order.projects && order.projects.length > 0 ? order.projects : [null];

              return projectsList.map((proj: any, pIdx: number) => {
                const projId = proj?.id;
                return (
                  <div
                    key={`mob-${order.order_id}-${projId || pIdx}`}
                    onClick={() => projId && handleOpenDrawer(projId)}
                    className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5 active:bg-slate-50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-800">
                        #{order.order_number || order.order_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded ${
                            order.days_left_to_complete < 0
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.days_left_to_complete !== undefined
                            ? `${order.days_left_to_complete}d left`
                            : "—"}
                        </span>
                        <StatusBadge status={order.order_status || "Created"} />
                      </div>
                    </div>

                    {/* Product & Customer */}
                    <div>
                      <div className="font-black text-slate-900 text-sm">
                        {proj ? proj.project_name : "Unnamed Product"}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {order.customer_name || "Unknown Customer"}
                      </div>
                    </div>

                    {/* Qty & Dates */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg text-[11px]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Quantity
                        </span>
                        <span className="font-black text-indigo-700">
                          {proj?.quantity || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Design
                        </span>
                        <span className="font-semibold text-slate-700">
                          {proj ? formatDateStyle(proj.design_date) : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Commit
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatDateStyle(order.commit_date)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Workflow List */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                        Department Workflow
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {DEPT_CONFIG.map(({ id, name }) => {
                          const d = (proj?.departments || []).find(
                            (x: any) => x.department_id === id || x.id === id
                          );
                          const statusInfo = getDepartmentStatusInfo(d);
                          return (
                            <div
                              key={id}
                              title={statusInfo.tooltip}
                              className={`flex items-center justify-between px-2 py-1 rounded border text-[10px] ${statusInfo.colorClass}`}
                            >
                              <span className="font-bold text-slate-800">{name}</span>
                              <span className="flex items-center gap-1 font-extrabold">
                                <span>{statusInfo.icon}</span>
                                <span>{statusInfo.label}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (projId) handleOpenDrawer(projId);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Details <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              });
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              {totalCount} total orders)
            </div>
            <Pagination
              total={totalCount}
              limit={10}
              activePage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* PROJECT DETAILS DRAWER */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="text-indigo-600" size={18} />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {drawerData?.project_name || drawerData?.name || "Project Details"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Order #{drawerData?.order_number || drawerData?.order_id || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {isDrawerLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading project details...
                </div>
              ) : drawerData ? (
                <>
                  {/* Product Overview Card */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                          Product Specifications
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {drawerData.project_name || drawerData.name || "—"}
                        </h4>
                      </div>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-md border border-indigo-200">
                        Qty: {drawerData.quantity || drawerData.qty || "—"}
                      </span>
                    </div>

                    {drawerData.description && (
                      <p className="text-xs font-medium text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        {drawerData.description}
                      </p>
                    )}

                    {drawerData.remarks && (
                      <div className="text-xs text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                        <span className="font-bold">Remarks:</span> {drawerData.remarks}
                      </div>
                    )}

                    {/* Image Preview */}
                    {projectImageUrl && !imgError ? (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 max-h-56 flex items-center justify-center p-1">
                        <img
                          src={projectImageUrl}
                          alt="Project Preview"
                          onError={() => setImgError(true)}
                          className="object-contain max-h-52 w-full rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg text-slate-400 text-xs">
                        <ImageIcon size={16} />
                        <span>
                          {imgError
                            ? "Image path found, but could not load file from Cloudinary/server."
                            : "No project preview image attached."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-600" /> Schedule Deadlines
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Design Scheduled
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatDateStyle(drawerData.design_date)}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Printing Target
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatDateStyle(drawerData.printing_date)}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Commit Date
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatDateStyle(drawerData.commit_date)}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Completion Date
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatDateStyle(drawerData.completed_date || drawerData.completion_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-indigo-600" /> Customer Information
                    </h4>

                    <div className="text-xs space-y-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {drawerData.customer_name || "—"}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        {drawerData.customer_mobile_number && (
                          <a
                            href={`tel:${drawerData.customer_mobile_number}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium"
                          >
                            <Phone size={12} /> {drawerData.customer_mobile_number}
                          </a>
                        )}

                        {drawerData.customer_whatsapp_number && (
                          <a
                            href={`https://wa.me/${drawerData.customer_whatsapp_number.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                          >
                            <MessageSquare size={11} /> WhatsApp ({drawerData.customer_whatsapp_number})
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Shipping Info */}
                  {(drawerData.shipping_address || drawerData.delivery_type_name) && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck size={14} className="text-indigo-600" /> Delivery Information
                      </h4>

                      <div className="text-xs space-y-1.5">
                        {drawerData.delivery_type_name && (
                          <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50/60 px-2 py-1 rounded border border-indigo-100">
                            <span>Method:</span> {drawerData.delivery_type_name}
                          </div>
                        )}

                        {drawerData.shipping_address && (
                          <div className="flex items-start gap-1.5 text-slate-600 pt-1">
                            <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-medium">
                                {drawerData.shipping_address.address_line_1},{" "}
                                {drawerData.shipping_address.address_line_2}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {drawerData.shipping_address.city},{" "}
                                {drawerData.shipping_address.state} -{" "}
                                {drawerData.shipping_address.pincode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Billing & Payment Info */}
                  {drawerData.payment_status && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CreditCard size={14} className="text-indigo-600" /> Payment Summary
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {drawerData.payment_status}
                        </span>
                      </h4>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-lg">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                          <span className="font-bold text-slate-800">₹{drawerData.final_amount || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Paid</span>
                          <span className="font-bold text-emerald-700">₹{drawerData.paid_amount || 0}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Balance</span>
                          <span className="font-bold text-rose-600">₹{drawerData.balance_amount || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Department Workflow Breakdown */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-600" /> Department Workflow Breakdown
                    </h4>

                    <div className="space-y-1.5">
                      {DEPT_CONFIG.map(({ id, label, name }) => {
                        const deptInfo = (drawerData.departments || []).find(
                          (d: any) => d.department_id === id || d.id === id
                        );
                        const statusInfo = getDepartmentStatusInfo(deptInfo);

                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center">
                                {label}
                              </span>
                              <span className="font-semibold text-slate-800">{name}</span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${statusInfo.colorClass}`}
                            >
                              <span>{statusInfo.icon}</span>
                              <span>{statusInfo.label}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No details found for this project.
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}