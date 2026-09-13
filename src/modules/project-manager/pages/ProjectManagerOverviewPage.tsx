"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  RotateCw,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Briefcase,
  Users,
  Search,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  UserX,
  X,
  Layers,
  Sparkles
} from "lucide-react";
import PieChart from "@/components/charts/PieChart";
import { getAttendanceLog } from "@/modules/hr/services/attendance.service";
import {
  getAdminLeaves,
  getManagerLeaves,
  approveLeaveByAdmin,
  rejectLeaveByAdmin,
  approveLeaveByManager,
  rejectLeaveByManager
} from "@/modules/leave/services/leave.service";
import { LeaveRequest } from "@/modules/leave/types";
import {
  getProjectManagerSalesKpiCards,
  getProjectManagerOrderStatus,
  getProjectManagerPaymentStatus,
  getProjectManagerTasksKpiCards,
  getProjectManagerStaffWiseTasks,
  getProjectManagerDesignTasks,
  getProjectManagerPrintingTasks,
  getProjectManagerProductionTasks,
  getProjectManagerLogisticsTasks,
  getProjectManagerPrintingSubDepartmentTasks,
  getProjectManagerProductionSubDepartmentTasks,
  getEssentialKpiCards,
  DashboardFilter,
  UserRole
} from "../services/managerOrder.service";
import StaffTasksStackedChart from "../components/StaffTasksStackedChart";
import EssentialKpiVerticalChart, { EssentialKpiData } from "../components/EssentialKpiVerticalChart";
import { getRoles } from "@/modules/admin/services/staff.service";
import styles from "./ProjectManagerOverviewPage.module.css";


// Helper to format Indian Rupees
const formatRupees = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val);
};

// Safe API response extractor (works for both { success, data } and direct payloads)
const extractData = (res: any, fallback: any = null) => {
  if (!res) return fallback;
  if (res.success === false) return fallback;
  if (res.success === true && res.data !== undefined) return res.data;
  return res;
};

// Types
type FilterMode = "today" | "this_month" | "specific_date" | "custom_range" | "upto_today";

interface KpiData {
  orders: number;
  sales_amount: number;
  cash_collection: number;
  orders_pending: number;
}

interface OrderStatusData {
  quotations: number;
  new_orders: number;
  in_progress: number;
  packed: number;
  in_transit: number;
  delivered: number;
  orders_to_close?: number;
  order_to_close?: number;
  closed_orders?: number;
  closed?: number;
  cancelled_orders?: number;
  cancelled?: number;
}

interface PaymentStatusData {
  paid_orders: number;
  partial_orders: number;
  balance_pending_orders: number;
  not_paid_orders: number;
}

interface TaskKpiData {
  total_assigned_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  not_completed_tasks: number;
  not_accepted_tasks: number;
}

interface StaffWiseTaskItem {
  staff_id: number;
  staff_name: string;
  role_id: number;
  role_name?: string;
  total_assigned_tasks: number;
  not_accepted_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  not_completed_tasks: number;
}

interface DeptStats {
  department: string;
  assigned: number;
  inProgress: number;
  completed: number;
  notCompleted: number;
  apiName: string;
}

interface SubDeptStats {
  sub_department_name?: string;
  name?: string;
  total_assigned_tasks?: number;
  assigned?: number;
  in_progress_tasks?: number;
  in_progress?: number;
  completed_tasks?: number;
  completed?: number;
  not_completed_tasks?: number;
  not_completed?: number;
  not_accepted_tasks?: number;
  not_accepted?: number;
}

export default function ProjectManagerOverviewPage({ role = "project-manager" }: { role?: UserRole }) {
  const todayStr = new Date().toISOString().split("T")[0];

  // ─── Global Filter States (Locked) ──────────────────────────────────────────

  // ─── Refresh State ────────────────────────────────────────────────────────
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ─── Widgets States ───────────────────────────────────────────────────────
  const [salesKpi, setSalesKpi] = useState<{ loading: boolean; error: string | null; data: KpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [orderStatus, setOrderStatus] = useState<{ loading: boolean; error: string | null; data: OrderStatusData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [paymentStatus, setPaymentStatus] = useState<{ loading: boolean; error: string | null; data: PaymentStatusData | null }>({
    loading: true,
    error: null,
    data: null
  });

  const [taskSummary, setTaskSummary] = useState<{ loading: boolean; error: string | null; data: TaskKpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  // ─── Admin/Manager Specific States ──────────────────────────────────────────
  const [attendanceStats, setAttendanceStats] = useState<{ loading: boolean; error: string | null; data: { present: number; absent: number; leave: number; halfDay: number } | null }>({
    loading: false,
    error: null,
    data: null
  });

  const [leaveRequests, setLeaveRequests] = useState<{ loading: boolean; error: string | null; data: LeaveRequest[]; pendingCount: number; approvedTodayCount: number }>({
    loading: false,
    error: null,
    data: [],
    pendingCount: 0,
    approvedTodayCount: 0
  });

  const [departmentKpi, setDepartmentKpi] = useState<{ loading: boolean; error: string | null; data: DeptStats[] }>({
    loading: true,
    error: null,
    data: []
  });

  const [staffKpi, setStaffKpi] = useState<{ loading: boolean; error: string | null; data: StaffWiseTaskItem[] }>({
    loading: true,
    error: null,
    data: []
  });

  const [essentialKpi, setEssentialKpi] = useState<{ loading: boolean; error: string | null; data: EssentialKpiData | null }>({
    loading: true,
    error: null,
    data: null
  });

  // role_id -> role_name lookup (built once from /admin/roles)
  const [roleMap, setRoleMap] = useState<Record<number, string>>({});

  // ─── Drill-down Drawer State ──────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerDept, setDrawerDept] = useState<"Printing" | "Production" | null>(null);
  const [drawerData, setDrawerData] = useState<{ loading: boolean; error: string | null; subDepts: SubDeptStats[] }>({
    loading: false,
    error: null,
    subDepts: []
  });

  // Staff Table Sorting / Filtering
  const [mounted, setMounted] = useState<boolean>(false);
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [staffSortCol, setStaffSortCol] = useState<string>("total_assigned_tasks");
  const [staffSortAsc, setStaffSortAsc] = useState<boolean>(false);
  const [viewAllStaff, setViewAllStaff] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Date Filters ──────────────────────────────────────────────────────────
  const getThisMonthFilters = useCallback((): DashboardFilter => {
    const now = new Date();
    return {
      month: String(now.getMonth() + 1).padStart(2, "0"),
      year: now.getFullYear()
    };
  }, []);

  const getUptoTodayFilters = useCallback((): DashboardFilter => {
    return {
      upto_today: true
    };
  }, []);

  // ─── Date Label ────────────────────────────────────────────────────────────
  const getActiveFilterLabel = () => {
    return "Sales: This Month | Tasks: Till Today";
  };

  // ─── Fetching Logic for Section APIs ──────────────────────────────────────

  const fetchSalesKpi = async (filters: DashboardFilter) => {
    setSalesKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerSalesKpiCards(filters, role);
      setSalesKpi({ loading: false, error: null, data: extractData(res) });
    } catch {
      setSalesKpi({ loading: false, error: "Failed to load sales indicators", data: null });
    }
  };

  const fetchOrderStatus = async (filters: DashboardFilter) => {
    setOrderStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerOrderStatus(filters, role);
      setOrderStatus({ loading: false, error: null, data: extractData(res) });
    } catch {
      setOrderStatus({ loading: false, error: "Failed to load order workflow", data: null });
    }
  };

  const fetchPaymentStatus = async (filters: DashboardFilter) => {
    setPaymentStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerPaymentStatus(filters, role);
      setPaymentStatus({ loading: false, error: null, data: extractData(res) });
    } catch {
      setPaymentStatus({ loading: false, error: "Failed to load payments summary", data: null });
    }
  };

  const fetchTaskSummary = async (filters: DashboardFilter) => {
    setTaskSummary((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getProjectManagerTasksKpiCards(filters, role);
      setTaskSummary({ loading: false, error: null, data: extractData(res) });
    } catch {
      setTaskSummary({ loading: false, error: "Failed to load task counters", data: null });
    }
  };

  const fetchDepartmentProgress = async (filters: DashboardFilter) => {
    setDepartmentKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [designRes, printingRes, productionRes, logisticsRes] = await Promise.all([
        getProjectManagerDesignTasks(filters, role).catch(() => null),
        getProjectManagerPrintingTasks(filters, role).catch(() => null),
        getProjectManagerProductionTasks(filters, role).catch(() => null),
        getProjectManagerLogisticsTasks(filters, role).catch(() => null)
      ]);

      const design = extractData(designRes);
      const printing = extractData(printingRes);
      const production = extractData(productionRes);
      const logistics = extractData(logisticsRes);

      const formatted: DeptStats[] = [
        {
          department: "Design",
          assigned: design?.total_assigned_tasks ?? 0,
          inProgress: design?.in_progress_tasks ?? 0,
          completed: design?.completed_tasks ?? 0,
          notCompleted: design?.not_completed_tasks ?? 0,
          apiName: "design"
        },
        {
          department: "Printing",
          assigned: printing?.total_assigned_tasks ?? 0,
          inProgress: printing?.in_progress_tasks ?? 0,
          completed: printing?.completed_tasks ?? 0,
          notCompleted: printing?.not_completed_tasks ?? 0,
          apiName: "printing"
        },
        {
          department: "Production",
          assigned: production?.total_assigned_tasks ?? 0,
          inProgress: production?.in_progress_tasks ?? 0,
          completed: production?.completed_tasks ?? 0,
          notCompleted: production?.not_completed_tasks ?? 0,
          apiName: "production"
        },
        {
          department: "Logistics",
          assigned: logistics?.total_assigned_tasks ?? 0,
          inProgress: logistics?.in_progress_tasks ?? 0,
          completed: logistics?.completed_tasks ?? 0,
          notCompleted: logistics?.not_completed_tasks ?? 0,
          apiName: "logistics"
        }
      ];

      setDepartmentKpi({ loading: false, error: null, data: formatted });
    } catch {
      setDepartmentKpi({ loading: false, error: "Failed to load department task progress", data: [] });
    }
  };

  const fetchStaffKpi = async (filters: DashboardFilter) => {
    setStaffKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Fetch staff-wise tasks AND roles in parallel
      const [res, rolesRes] = await Promise.all([
        getProjectManagerStaffWiseTasks(filters, role),
        getRoles().catch(() => [])
      ]);

      // Build role_id -> role_name map
      const map: Record<number, string> = {};
      if (Array.isArray(rolesRes)) {
        rolesRes.forEach((r: { id: number; role_name: string }) => {
          map[r.id] = r.role_name;
        });
      }
      setRoleMap(map);

      let items: StaffWiseTaskItem[] = [];
      if (res) {
        if (res.success && res.data) {
          items = Array.isArray(res.data.items) ? res.data.items : [];
        } else if (Array.isArray(res.items)) {
          items = res.items;
        } else if (res.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res)) {
          items = res;
        }
      }

      // Attach role_name from the map so filters can use it
      items = items.map((item) => ({
        ...item,
        role_name: map[item.role_id] ?? item.role_name ?? ""
      }));

      setStaffKpi({ loading: false, error: null, data: items });
    } catch {
      setStaffKpi({ loading: false, error: "Failed to load staff stats", data: [] });
    }
  };

  const fetchEssentialKpi = async (filters: DashboardFilter) => {
    setEssentialKpi((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await getEssentialKpiCards(filters, role);
      setEssentialKpi({ loading: false, error: null, data: extractData(res) });
    } catch {
      setEssentialKpi({ loading: false, error: "Failed to load essential KPI metrics", data: null });
    }
  };


  const fetchAttendance = async (filters: DashboardFilter) => {
    setAttendanceStats((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const targetDate = filters.date || todayStr;
      const res = await getAttendanceLog({
        page: 1,
        page_size: 1,
        date: targetDate
      });
      setAttendanceStats({
        loading: false,
        error: null,
        data: {
          present: res.total_present ?? 0,
          absent: res.total_absent ?? 0,
          leave: res.total_leave ?? 0,
          halfDay: res.total_half_day ?? 0
        }
      });
    } catch {
      setAttendanceStats({
        loading: false,
        error: "Failed to load attendance",
        data: null
      });
    }
  };

  const fetchLeaves = async () => {
    setLeaveRequests((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const typeFilters = { page: 1, page_size: 10 };
      const res = await (role === "admin" ? getAdminLeaves(typeFilters) : getManagerLeaves(typeFilters));
      const items = res?.items || [];
      const pendingItems = items.filter((l: any) => l.status === "HR Approved");
      const todayDateStr = new Date().toDateString();
      const approvedToday = items.filter((l: any) => {
        if (l.status !== "Approved") return false;
        const approvedAt = l.admin_approved_at || l.manager_approved_at;
        return approvedAt && new Date(approvedAt).toDateString() === todayDateStr;
      }).length;

      setLeaveRequests({
        loading: false,
        error: null,
        data: items,
        pendingCount: pendingItems.length,
        approvedTodayCount: approvedToday
      });
    } catch {
      setLeaveRequests({
        loading: false,
        error: "Failed to load leave requests",
        data: [],
        pendingCount: 0,
        approvedTodayCount: 0
      });
    }
  };

  const handleLeaveDecision = async (leaveId: number, approve: boolean) => {
    const adminStaffId = 2; // Default system operator ID
    try {
      if (approve) {
        await (role === "admin" ? approveLeaveByAdmin(leaveId, adminStaffId) : approveLeaveByManager(leaveId, adminStaffId));
      } else {
        await (role === "admin" ? rejectLeaveByAdmin(leaveId, adminStaffId) : rejectLeaveByManager(leaveId, adminStaffId));
      }
      fetchLeaves();
    } catch (err: any) {
      console.error("Failed to approve/reject leave", err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || "An error occurred";
      alert(errMsg);
    }
  };

  // Central refresh driver
  const loadDashboard = useCallback(
    async (isManual: boolean = false) => {
      if (isManual) setIsRefreshing(true);
      const thisMonthFilters = getThisMonthFilters();
      const uptoTodayFilters = getUptoTodayFilters();

      const promises: Promise<any>[] = [
        fetchSalesKpi(thisMonthFilters),
        fetchOrderStatus(uptoTodayFilters),
        fetchPaymentStatus(uptoTodayFilters),
        fetchTaskSummary(uptoTodayFilters),
        fetchDepartmentProgress(uptoTodayFilters),
        fetchStaffKpi(uptoTodayFilters),
        fetchEssentialKpi(uptoTodayFilters)
      ];

      if (role === "admin" || role === "manager") {
        promises.push(fetchAttendance(uptoTodayFilters));
        promises.push(fetchLeaves());
      }

      await Promise.all(promises);

      if (isManual) setIsRefreshing(false);
    },
    [getThisMonthFilters, getUptoTodayFilters, role]
  );

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Drawer Fetching
  const fetchSubDepartmentKpis = async (deptName: "Printing" | "Production") => {
    setDrawerData({ loading: true, error: null, subDepts: [] });
    const filters = getUptoTodayFilters();
    try {
      let data = null;
      if (deptName === "Printing") {
        data = await getProjectManagerPrintingSubDepartmentTasks(filters, role);
      } else {
        data = await getProjectManagerProductionSubDepartmentTasks(filters, role);
      }
      const raw = extractData(data, []);
      // extractData returns null when { success: true, data: null } — guard always to array
      const subDepts: SubDeptStats[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
      setDrawerData({ loading: false, error: null, subDepts });
    } catch {
      setDrawerData({ loading: false, error: `Failed to load sub-departments for ${deptName}`, subDepts: [] });
    }
  };

  const handleDepartmentClick = (dept: string) => {
    if (dept === "Printing" || dept === "Production") {
      setDrawerDept(dept);
      setDrawerOpen(true);
      fetchSubDepartmentKpis(dept);
    }
  };

  // Staff Table Sorting / Searching
  const handleSort = (col: string) => {
    if (staffSortCol === col) {
      setStaffSortAsc(!staffSortAsc);
    } else {
      setStaffSortCol(col);
      setStaffSortAsc(false);
    }
  };

  // Filter staff rows — hide zero-activity staff by default; search + sort still apply
  const getProcessedStaffList = (rawList: StaffWiseTaskItem[] = staffKpi.data || []): StaffWiseTaskItem[] => {
    const listToProcess = Array.isArray(rawList) ? rawList : [];
    let list = listToProcess.filter((item) => {
      // Default: hide staff with zero activity
      if (!viewAllStaff) {
        const total =
          (item.total_assigned_tasks ?? 0) +
          (item.in_progress_tasks ?? 0) +
          (item.completed_tasks ?? 0) +
          (item.not_completed_tasks ?? 0) +
          (item.not_accepted_tasks ?? 0);
        if (total === 0) return false;
      }
      // Search filter
      if (staffSearch.trim() !== "") {
        return item.staff_name.toLowerCase().includes(staffSearch.toLowerCase());
      }
      return true;
    });


    // Sort
    list.sort((a: any, b: any) => {
      let valA = a[staffSortCol] ?? 0;
      let valB = b[staffSortCol] ?? 0;
      if (typeof valA === "string") {
        return staffSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return staffSortAsc ? valA - valB : valB - valA;
    });

    return list;
  };

  // KPI calculations helper
  const ordersVal = salesKpi.data?.orders ?? 0;
  const salesVal = salesKpi.data?.sales_amount ?? 0;
  const collectionVal = salesKpi.data?.cash_collection ?? 0;
  const pendingVal = salesKpi.data?.orders_pending ?? 0;

  // Order status list mapping
  const orderStats = orderStatus.data;
  const orderChartData = [
    { name: "Quotations", value: orderStats?.quotations ?? 0, color: "#6366f1" },
    { name: "New Orders", value: orderStats?.new_orders ?? 0, color: "#3b82f6" },
    { name: "In Progress", value: orderStats?.in_progress ?? 0, color: "#f59e0b" },
    { name: "Packed", value: orderStats?.packed ?? 0, color: "#10b981" },
    { name: "In Transit", value: orderStats?.in_transit ?? 0, color: "#14b8a6" },
    { name: "Delivered", value: orderStats?.delivered ?? 0, color: "#22c55e" },
    { name: "To Close", value: orderStats?.orders_to_close ?? orderStats?.order_to_close ?? 0, color: "#ec4899" },
    { name: "Closed", value: orderStats?.closed_orders ?? orderStats?.closed ?? 0, color: "#64748b" },
    { name: "Cancelled", value: orderStats?.cancelled_orders ?? orderStats?.cancelled ?? 0, color: "#ef4444" }
  ];

  // Payment donut status
  const payStats = paymentStatus.data;
  const paymentChartData = [
    { name: "Paid", value: payStats?.paid_orders ?? 0, color: "#10b981" },
    { name: "Partial", value: payStats?.partial_orders ?? 0, color: "#f59e0b" },
    { name: "Not Paid", value: payStats?.not_paid_orders ?? 0, color: "#ef4444" }
  ];

  const totalPaymentsCount = paymentChartData.reduce((acc, c) => acc + c.value, 0);

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className="flex items-center gap-1.5">
              <Layers className="text-indigo-600" size={20} />
              <h1 className={styles.title}>Project Manager Overview</h1>
            </div>
          </div>
        </div>
        <div className={styles.skeletonKpiGrid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonKpiCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ─── Header ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className="flex items-center gap-1.5">
            <Layers className="text-indigo-600" size={20} />
            <h1 className={styles.title}>
              {role === "admin" ? "Admin Overview" : role === "manager" ? "Manager Overview" : "Project Manager Overview"}
            </h1>
          </div>
          <span className={styles.activeRangeLabel}>
            {getActiveFilterLabel()}
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.filterControls}>
            {/* Refresh Button */}
            <button
              onClick={() => loadDashboard(true)}
              disabled={isRefreshing}
              className={styles.refreshBtn}
              title="Refresh Dashboard Statitics"
            >
              <RotateCw size={14} className={isRefreshing ? styles.spinning : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 Top KPI Cards ─── */}
      {salesKpi.loading ? (
        <div className={styles.skeletonKpiGrid}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={styles.skeletonKpiCard} />
          ))}
        </div>
      ) : salesKpi.error ? (
        <div className={styles.errorState}>
          <AlertCircle size={16} className={styles.errorIcon} />
          <span className={styles.errorMsg}>{salesKpi.error}</span>
          <button className={styles.retryBtn} onClick={() => fetchSalesKpi(getThisMonthFilters())}>Retry</button>
        </div>
      ) : (
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Orders</span>
              <div className={styles.kpiIconWrapper}><ShoppingBag size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{ordersVal}</strong>
            <span className={styles.subtitle}>Registered orders</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Sales</span>
              <div className={styles.kpiIconWrapper}><DollarSign size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(salesVal)}</strong>
            <span className={styles.subtitle}>Gross Sales amount</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiAmber}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Collection</span>
              <div className={styles.kpiIconWrapper}><CheckCircle2 size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(collectionVal)}</strong>
            <span className={styles.subtitle}>Collected cash amount</span>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiRose}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Pending Amount</span>
              <div className={styles.kpiIconWrapper}><Clock size={15} /></div>
            </div>
            <strong className={styles.kpiValue}>{formatRupees(pendingVal)}</strong>
            <span className={styles.subtitle}>Total outstanding balance</span>
          </div>
        </div>
      )}

      {/* ─── ROW 1: 3 Section Cards ─── */}
      <div className={styles.threeColGrid}>
        {/* 1. Order status distribution */}
<div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
      Order status distribution
    </h3>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
      Workflow queue
    </span>
  </div>

  {orderStatus.loading ? (
    <div className="flex-1 w-full bg-slate-50 rounded-lg animate-pulse" />
  ) : orderStatus.error ? (
    <div className={styles.sectionErrorView}>
      <span className={styles.errorTitle}>Error</span>
      <span className={styles.errorSub}>{orderStatus.error}</span>
      <button className={styles.sectionRetryBtn} onClick={() => fetchOrderStatus(getUptoTodayFilters())}>Retry</button>
    </div>
  ) : orderChartData.filter(d => d.value > 0).length === 0 ? (
    <div className={styles.emptyStateContainer}>
      <span className={styles.emptyStateTitle}>No Orders Registered</span>
      <span className="text-xs text-slate-400">There are no orders tracked in this filtering slot.</span>
    </div>
  ) : (
    <div className="w-full flex-1 relative">
      <svg viewBox="0 0 560 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
          const maxVal = Math.max(...orderChartData.map(d => d.value), 12);
          const y = 195 - ratio * 170;
          const gridVal = Math.round(ratio * maxVal);
          return (
            <g key={ratio} className="opacity-40">
              <line x1="34" y1={y} x2="545" y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
              <text x="26" y={y + 4} textAnchor="end" className="text-[12px] font-extrabold fill-slate-500">{gridVal}</text>
            </g>
          );
        })}

        {orderChartData.map((item, index) => {
          const maxVal = Math.max(...orderChartData.map(d => d.value), 12);
          const x = 40 + index * 58;
          const barHeight = maxVal > 0 ? (item.value / maxVal) * 170 : 0;
          const y = 195 - barHeight;

          return (
            <g key={item.name} className="group cursor-pointer">
              <title>{`${item.name}: ${item.value} orders`}</title>
              <rect
                x={x + 3}
                y={y}
                width={36}
                height={Math.max(barHeight, 2)}
                fill={item.color}
                rx="5"
                className="transition-all duration-300 hover:opacity-85"
              />
              {item.value > 0 && (
                <text x={x + 21} y={y - 7} textAnchor="middle" className="text-[15px] font-black fill-slate-900">{item.value}</text>
              )}

              <text
                x={x + 20}
                y="212"
                transform={`rotate(-28, ${x + 20}, 212)`}
                textAnchor="end"
                className="text-[11.5px] font-extrabold fill-slate-700"
              >
                {item.name}
              </text>
            </g>
          );
        })}
        <line x1="34" y1="195" x2="545" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
    </div>
  )}
</div>

       {/* 2. Payments status */}
<div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
      Payments status
    </h3>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
      Cash ledger
    </span>
  </div>

  {paymentStatus.loading ? (
    <div className="flex-1 w-full bg-slate-50 rounded-lg animate-pulse" />
  ) : paymentStatus.error ? (
    <div className={styles.sectionErrorView}>
      <span className={styles.errorTitle}>Error</span>
      <span className={styles.errorSub}>{paymentStatus.error}</span>
      <button className={styles.sectionRetryBtn} onClick={() => fetchPaymentStatus(getUptoTodayFilters())}>Retry</button>
    </div>
  ) : totalPaymentsCount === 0 ? (
    <div className={styles.emptyStateContainer}>
      <span className={styles.emptyStateTitle}>No Payments Data</span>
      <span className="text-xs text-slate-400 font-medium">No order values processed.</span>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
  <div className="flex items-center justify-center relative">
    <PieChart
      data={paymentChartData}
      centerValue={String(totalPaymentsCount)}
      totalLabel="TOTAL ORDERS"
      size={170}
      minHeight="min-h-[180px]"
    />
  </div>

  <div className="space-y-4 font-semibold text-sm">
    {paymentChartData.map((item) => (
      <div key={item.name} className="flex items-center justify-between text-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          <span className="font-extrabold text-slate-800 text-sm">{item.name}</span>
        </div>
        <span className="font-black text-slate-900 text-lg">{item.value}</span>
      </div>
    ))}
  </div>
</div>
  )}
</div>

    
{/* 3. Department-wise tasks */}
<div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[350px] sm:min-h-[370px] flex flex-col">
  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
      Department-wise tasks
    </h3>
  </div>

  {departmentKpi.loading ? (
    <div className="flex-1 w-full bg-slate-50 rounded-lg animate-pulse" />
  ) : departmentKpi.error ? (
    <div className={styles.sectionErrorView}>
      <span className={styles.errorTitle}>Error</span>
      <span className={styles.errorSub}>{departmentKpi.error}</span>
      <button className={styles.sectionRetryBtn} onClick={() => fetchDepartmentProgress(getUptoTodayFilters())}>Retry</button>
    </div>
  ) : (
    <>
      <div className="w-full flex-1 relative">
        <svg viewBox="0 0 520 260" preserveAspectRatio="none" className="w-full h-full overflow-visible select-none">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = 195 - ratio * 170;
            const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress]);
            const maxLimit = Math.max(...allVals, 14);
            const gridVal = Math.round(ratio * maxLimit);

            return (
              <g key={ratio} className="opacity-40">
                <line x1="38" y1={y} x2="500" y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                <text x="28" y={y + 4} textAnchor="end" className="text-[12px] font-extrabold fill-slate-500">{gridVal}</text>
              </g>
            );
          })}

          {departmentKpi.data.map((item, grpIdx) => {
            const xStart = 60 + grpIdx * 120;
            const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress]);
            const maxLimit = Math.max(...allVals, 14);

            const assignedHeight = maxLimit > 0 ? (item.assigned / maxLimit) * 170 : 0;
            const assignedY = 195 - assignedHeight;

            const inProgressHeight = maxLimit > 0 ? (item.inProgress / maxLimit) * 170 : 0;
            const inProgressY = 195 - inProgressHeight;

            return (
              <g key={item.department} className="group cursor-pointer">
                <title>{`${item.department}: ${item.assigned} assigned, ${item.inProgress} in progress`}</title>

                {/* Assigned bar */}
                <rect
                  x={xStart}
                  y={assignedY}
                  width={34}
                  height={Math.max(assignedHeight, 2)}
                  fill="#6366f1"
                  rx="5"
                  className="transition-all duration-300 group-hover:opacity-85"
                />
                {item.assigned > 0 && (
                  <text x={xStart + 17} y={assignedY - 7} textAnchor="middle" className="text-[14px] font-black fill-slate-900">{item.assigned}</text>
                )}

                {/* In progress bar */}
                <rect
                  x={xStart + 40}
                  y={inProgressY}
                  width={34}
                  height={Math.max(inProgressHeight, 2)}
                  fill="#f59e0b"
                  rx="5"
                  className="transition-all duration-300 group-hover:opacity-85"
                />
                {item.inProgress > 0 && (
                  <text x={xStart + 57} y={inProgressY - 7} textAnchor="middle" className="text-[14px] font-black fill-slate-900">{item.inProgress}</text>
                )}

                <text
                  x={xStart + 37}
                  y="212"
                  textAnchor="middle"
                  className="text-[13.5px] font-extrabold fill-slate-700"
                >
                  {item.department}
                </text>
              </g>
            );
          })}

          <line x1="38" y1="195" x2="500" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-sm font-black text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 block" /> Assigned
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block" /> In progress
        </div>
      </div>
    </>
  )}
</div>

        {/* 4. General task summary / Attendance & approvals */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-2 min-h-[310px] sm:min-h-[330px] flex flex-col justify-between">
          {role === "admin" || role === "manager" ? (
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Attendance & approvals
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Executive check</span>
                </div>

                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Attendance Summary</h4>
                  {attendanceStats.loading ? (
                    <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  ) : attendanceStats.error ? (
                    <span className="text-xs text-rose-500">{attendanceStats.error}</span>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 border border-emerald-100/60 p-2.5 rounded-lg text-center">
                        <span className="text-base font-extrabold text-emerald-800">{attendanceStats.data?.present ?? 0}</span>
                        <div className="text-[9.5px] font-bold text-emerald-600">Present</div>
                      </div>
                      <div className="bg-rose-50 border border-rose-100/60 p-2.5 rounded-lg text-center">
                        <span className="text-base font-extrabold text-rose-800">{attendanceStats.data?.absent ?? 0}</span>
                        <div className="text-[9.5px] font-bold text-rose-600">Absent</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100/60 p-2.5 rounded-lg text-center">
                        <span className="text-base font-extrabold text-amber-800">{attendanceStats.data?.leave ?? 0}</span>
                        <div className="text-[9.5px] font-bold text-amber-600">On Leave</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Pending Leaves ({leaveRequests.pendingCount})</h4>
                    {leaveRequests.approvedTodayCount > 0 && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {leaveRequests.approvedTodayCount} Approved Today
                      </span>
                    )}
                  </div>

                  {leaveRequests.loading ? (
                    <div className="animate-pulse flex flex-col gap-2 mt-2">
                      <div className="h-10 bg-slate-100 rounded" />
                      <div className="h-10 bg-slate-100 rounded" />
                    </div>
                  ) : leaveRequests.error ? (
                    <span className="text-xs text-rose-500">{leaveRequests.error}</span>
                  ) : leaveRequests.data.filter(l => l.status === "HR Approved").length === 0 ? (
                    <div className={styles.emptyStateContainer} style={{ minHeight: "80px", padding: "10px" }}>
                      <span className={styles.emptyStateTitle}>All processed</span>
                      <span className="text-[9px] text-slate-400">All leave requests have been cleared.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2 max-h-[140px] overflow-y-auto pr-1">
                      {leaveRequests.data
                        .filter(l => l.status === "HR Approved")
                        .slice(0, 2)
                        .map((leave) => (
                          <div key={leave.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs gap-2">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              <span className="font-bold text-slate-700 truncate">{leave.staff_name}</span>
                              <span className="text-[9px] text-slate-400 truncate">
                                {leave.leave_type} • {new Date(leave.from_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleLeaveDecision(leave.id, true)}
                                className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                title="Approve Leave"
                              >
                                <CheckCircle2 size={13} />
                              </button>
                              <button
                                onClick={() => handleLeaveDecision(leave.id, false)}
                                className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                                title="Reject Leave"
                              >
                                <XCircle size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <a
                  href={role === "admin" ? "/admin/hr/leave" : "/manager/hr/leave"}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  Manage All Leaves <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  General task summary
                </h3>
              </div>

              {taskSummary.loading ? (
                <div className="flex flex-col gap-3.5 mt-2">
                  <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                    <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                    <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              ) : taskSummary.error ? (
                <div className={styles.sectionErrorView}>
                  <span className={styles.errorTitle}>Error</span>
                  <span className={styles.errorSub}>{taskSummary.error}</span>
                  <button className={styles.sectionRetryBtn} onClick={() => fetchTaskSummary(getUptoTodayFilters())}>Retry</button>
                </div>
              ) : !taskSummary.data ? (
                <div className={styles.emptyStateContainer}>
                  <span className={styles.emptyStateTitle}>No Task Data available</span>
                </div>
              ) : (
                <div className="space-y-4 my-auto">
                  {/* Top Block: TOTAL ASSIGNED */}
                  <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 text-center space-y-1">
                    <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest block">
                      TOTAL ASSIGNED
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tight block">
                      {taskSummary.data.total_assigned_tasks ?? 45}
                    </span>
                  </div>

                  {/* Bottom 3 Cards Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* COMPLETED */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        COMPLETED
                      </span>
                      <span className="text-2xl font-black text-emerald-600 block">
                        {taskSummary.data.completed_tasks ?? 0}
                      </span>
                    </div>

                    {/* IN PROGRESS */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        IN PROGRESS
                      </span>
                      <span className="text-2xl font-black text-amber-600 block">
                        {taskSummary.data.in_progress_tasks ?? 0}
                      </span>
                    </div>

                    {/* NOT ACCEPTED */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        NOT ACCEPTED
                      </span>
                      <span className="text-2xl font-black text-indigo-600 block">
                        {taskSummary.data.not_accepted_tasks ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 5. Essential KPI metrics */}
        <EssentialKpiVerticalChart
          data={essentialKpi.data}
          isLoading={essentialKpi.loading}
          isError={Boolean(essentialKpi.error)}
          errorMsg={essentialKpi.error || ""}
          onRetry={() => fetchEssentialKpi(getUptoTodayFilters())}
        />

        {/* 6. Tasks by staff */}
        <StaffTasksStackedChart
          data={staffKpi.data}
          isLoading={staffKpi.loading}
        />
      </div>
    </div>
  );
}