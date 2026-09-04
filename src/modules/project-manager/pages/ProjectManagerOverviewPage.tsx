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
  DashboardFilter,
  UserRole
} from "../services/managerOrder.service";
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
        fetchStaffKpi(uptoTodayFilters)
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
    { name: "Balance Pending", value: payStats?.balance_pending_orders ?? 0, color: "#3b82f6" },
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

      {/* ─── Workflow and Payments Row ─── */}
      <div className={styles.twoColGrid}>

        {/* Order Status Chart (Compact SVG Vertical Chart) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <TrendingUp size={14} className="text-blue-500" /> Order Status Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Workflow queue</span>
          </div>

          {orderStatus.loading ? (
            <div className="flex items-center justify-center h-[180px] w-full bg-slate-50 rounded-lg animate-pulse" />
          ) : orderStatus.error ? (
            <div className={styles.sectionErrorView}>
              <span className={styles.errorTitle}>Error</span>
              <span className={styles.errorSub}>{orderStatus.error}</span>
              <button className={styles.sectionRetryBtn} onClick={() => fetchOrderStatus(getUptoTodayFilters())}>Retry</button>
            </div>
          ) : orderChartData.filter(d => d.value > 0).length === 0 ? (
            <div className={styles.emptyStateContainer}>
              <span className={styles.emptyStateTitle}>No Orders Registered</span>
              <span className="text-[10px] text-slate-400">There are no orders tracked in this filtering slot.</span>
            </div>
          ) : (
            <div className={styles.chartContainer}>
              {/* Custom SVG Vertical Bar Chart for 9 Categories */}
              <svg viewBox="0 0 540 180" className="w-full h-full overflow-visible select-none">
                {/* Gridlines */}
                {[0, 0.5, 1].map((ratio) => {
                  const y = 145 - ratio * 120;
                  const maxVal = Math.max(...orderChartData.map(d => d.value), 0);
                  const gridVal = Math.round(ratio * maxVal);
                  return (
                    <g key={ratio} className="opacity-40">
                      <line x1="45" y1={y} x2="525" y2={y} stroke="#e2e8f0" strokeDasharray="3,3" />
                      <text x="35" y={y + 3} textAnchor="end" className="text-[8px] font-bold fill-slate-400">{gridVal}</text>
                    </g>
                  );
                })}

                {/* Draw Columns */}
                {orderChartData.map((item, index) => {
                  const maxVal = Math.max(...orderChartData.map(d => d.value), 0);
                  const x = 50 + index * 52;
                  const barHeight = maxVal > 0 ? (item.value / maxVal) * 120 : 0;
                  const y = 145 - barHeight;

                  return (
                    <g key={item.name} className="group">
                      <title>{`${item.name}: ${item.value} orders`}</title>
                      <rect
                        x={x + 10}
                        y={y}
                        width={28}
                        height={Math.max(barHeight, 1.5)}
                        fill={item.color}
                        rx="3"
                        className="transition-all duration-300 hover:opacity-80"
                      />
                      {item.value > 0 && (
                        <text x={x + 24} y={y - 4} textAnchor="middle" className="text-[8px] font-black fill-slate-700">{item.value}</text>
                      )}

                      {/* X label */}
                      <text x={x + 24} y="158" textAnchor="middle" className="text-[8px] font-bold fill-slate-500">{item.name}</text>
                    </g>
                  );
                })}
                <line x1="45" y1="145" x2="525" y2="145" stroke="#cbd5e1" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>

        {/* Payment Donut Widget */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <DollarSign size={14} className="text-green-500" /> Payments Status
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Cash ledger</span>
          </div>

          {paymentStatus.loading ? (
            <div className="flex items-center justify-center h-[180px] w-full bg-slate-50 rounded-lg animate-pulse" />
          ) : paymentStatus.error ? (
            <div className={styles.sectionErrorView}>
              <span className={styles.errorTitle}>Error</span>
              <span className={styles.errorSub}>{paymentStatus.error}</span>
              <button className={styles.sectionRetryBtn} onClick={() => fetchPaymentStatus(getUptoTodayFilters())}>Retry</button>
            </div>
          ) : totalPaymentsCount === 0 ? (
            <div className={styles.emptyStateContainer}>
              <span className={styles.emptyStateTitle}>No Payments Data</span>
              <span className="text-[10px] text-slate-400 font-medium">No order values processed.</span>
            </div>
          ) : (
            <div className={styles.donutLayout}>
              {/* Donut Chart chart */}
              <div className="flex items-center justify-center relative">
                <PieChart
                  data={paymentChartData}
                  centerValue={String(totalPaymentsCount)}
                  totalLabel="Total Orders"
                  size={120}
                  minHeight="min-h-[140px]"
                />
              </div>

              {/* Legend checklist */}
              <div className={styles.donutLegend}>
                {paymentChartData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <div className={styles.legendLabel}>
                      <span className={styles.legendDot} style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className={styles.legendVal}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Department grouped performance chart and Overall task summary row ─── */}
      <div className={styles.twoColGrid}>
        {/* Left: Department-Wise Tasks Performance */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <Briefcase size={14} className="text-indigo-500" /> Department-Wise Tasks Performance
            </h3>
          </div>

          {departmentKpi.loading ? (
            <div className="flex flex-col items-center justify-center h-[220px] w-full bg-slate-50 rounded-lg animate-pulse" />
          ) : departmentKpi.error ? (
            <div className={styles.sectionErrorView}>
              <span className={styles.errorTitle}>Error</span>
              <span className={styles.errorSub}>{departmentKpi.error}</span>
              <button className={styles.sectionRetryBtn} onClick={() => fetchDepartmentProgress(getUptoTodayFilters())}>Retry</button>
            </div>
          ) : (
            <>
              <div className={styles.groupedChartContainer}>
                <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible select-none">
                  {/* Horizontal gridlines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = 175 - ratio * 140;
                    const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress, d.completed]);
                    const maxLimit = Math.max(...allVals, 5);
                    const gridVal = Math.round(ratio * maxLimit);

                    return (
                      <g key={ratio} className="opacity-45">
                        <line x1="50" y1={y} x2="570" y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        <text x="40" y={y + 3.5} textAnchor="end" className="text-[8.5px] font-bold fill-slate-400">{gridVal}</text>
                      </g>
                    );
                  })}

                  {/* Draw Group bars */}
                  {departmentKpi.data.map((item, grpIdx) => {
                    const xStart = 78 + grpIdx * 126;

                    const allVals = departmentKpi.data.flatMap(d => [d.assigned, d.inProgress, d.completed]);
                    const maxLimit = Math.max(...allVals, 5);

                    const barDetails = [
                      { val: item.assigned, color: "#6366f1", label: "Assigned" },
                      { val: item.inProgress, color: "#f59e0b", label: "In Progress" },
                      { val: item.completed, color: "#10b981", label: "Completed" }
                    ];

                    return (
                      <g key={item.department}>
                        {/* Title of Department */}
                        <text
                          x={xStart + 50}
                          y="190"
                          textAnchor="middle"
                          className={`${styles.chartText} fill-slate-600 font-bold`}
                        >
                          {item.department}
                        </text>

                        {/* Three sub-bars inside group */}
                        {barDetails.map((bar, barIdx) => {
                          const barWidth = 20;
                          const bx = xStart + 16 + barIdx * 24;
                          const barHeight = maxLimit > 0 ? (bar.val / maxLimit) * 140 : 0;
                          const by = 175 - barHeight;

                          return (
                            <g key={bar.label}>
                              <title>{`${item.department} - ${bar.label}: ${bar.val} tasks`}</title>
                              <rect
                                x={bx}
                                y={by}
                                width={barWidth}
                                height={Math.max(barHeight, 1.5)}
                                fill={bar.color}
                                rx="2.5"
                                className="transition-all duration-300 hover:opacity-85"
                              />
                              {bar.val > 0 && (
                                <text x={bx + 9} y={by - 4} textAnchor="middle" className="text-[7.5px] font-black fill-slate-700">{bar.val}</text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

                  <line x1="50" y1="175" x2="570" y2="175" stroke="#cbd5e1" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Custom Legend */}
              <div className={styles.chartLegend}>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 block" /> Assigned
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 block" /> In Progress
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block" /> Completed
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Task Summary OR Attendance & Approvals */}
        <div className={styles.card} style={{ minHeight: "340px" }}>
          {role === "admin" || role === "manager" ? (
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className={styles.cardHeader} style={{ marginBottom: "0px" }}>
                  <h3 className={styles.cardTitle}>
                    <Users size={14} className="text-indigo-500" /> Attendance & Approvals
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Executive Check</span>
                </div>

                {/* Staff Attendance */}
                <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                  <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Attendance Summary</h4>
                  {attendanceStats.loading ? (
                    <div className="h-10 bg-slate-100 rounded animate-pulse" />
                  ) : attendanceStats.error ? (
                    <span className="text-xs text-rose-500">{attendanceStats.error}</span>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-emerald-50 border border-emerald-100/60 p-2 rounded-lg text-center">
                        <span className="text-sm font-extrabold text-emerald-800">{attendanceStats.data?.present ?? 0}</span>
                        <div className="text-[9px] font-bold text-emerald-600">Present</div>
                      </div>
                      <div className="bg-rose-50 border border-rose-100/60 p-2 rounded-lg text-center">
                        <span className="text-sm font-extrabold text-rose-800">{attendanceStats.data?.absent ?? 0}</span>
                        <div className="text-[9px] font-bold text-rose-600">Absent</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100/60 p-2 rounded-lg text-center">
                        <span className="text-sm font-extrabold text-amber-800">{attendanceStats.data?.leave ?? 0}</span>
                        <div className="text-[9px] font-bold text-amber-600">On Leave</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Leave Requests Approvals */}
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

              {/* View All Leaves link */}
              <div className="pt-2.5 border-t border-slate-100 flex justify-end">
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
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  <ClipboardList size={14} className="text-indigo-500" /> General Task Summary
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Daily volume</span>
              </div>

              {taskSummary.loading ? (
                <div className="flex flex-col gap-3.5 mt-2">
                  <div className="h-14 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="h-14 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                    ))}
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
                <div className={styles.taskSummaryGrid}>
                  <div className={`${styles.taskSumCard} ${styles.taskSumCardFull}`}>
                    <span className={styles.taskSumLabel}>Total Assigned</span>
                    <span className={styles.taskSumValue}>{taskSummary.data.total_assigned_tasks ?? 0}</span>
                  </div>

                  <div className={styles.taskSumCard}>
                    <span className={styles.taskSumLabel}>Completed</span>
                    <span className={styles.taskSumValue} style={{ color: "#10b981" }}>{taskSummary.data.completed_tasks ?? 0}</span>
                  </div>

                  <div className={styles.taskSumCard}>
                    <span className={styles.taskSumLabel}>In Progress</span>
                    <span className={styles.taskSumValue} style={{ color: "#f59e0b" }}>{taskSummary.data.in_progress_tasks ?? 0}</span>
                  </div>

                  <div className={styles.taskSumCard}>
                    <span className={styles.taskSumLabel}>Not Accepted</span>
                    <span className={styles.taskSumValue} style={{ color: "#8b5cf6" }}>{taskSummary.data.not_accepted_tasks ?? 0}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Staff Tasks Performance (Full Width) ─── */}
      <div className={styles.card} style={{ minHeight: "300px" }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Users size={14} className="text-blue-500" /> Staff Tasks Performance
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Staff audit</span>
        </div>

        {/* Filtering and search controls */}
        <div className={styles.staffControls}>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff Name..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <label className={styles.viewAllToggle}>
            <input
              type="checkbox"
              checked={viewAllStaff}
              onChange={(e) => setViewAllStaff(e.target.checked)}
              className={styles.viewAllCheckbox}
            />
            <span>Show All Staff (including zero counts)</span>
          </label>
        </div>

        {staffKpi.loading ? (
          <div className={styles.skeletonTable}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={styles.skeletonRow} />
            ))}
          </div>
        ) : staffKpi.error ? (
          <div className={styles.sectionErrorView}>
            <span className={styles.errorTitle}>Error</span>
            <span className={styles.errorSub}>{staffKpi.error}</span>
            <button className={styles.sectionRetryBtn} onClick={() => fetchStaffKpi(getUptoTodayFilters())}>Retry</button>
          </div>
        ) : getProcessedStaffList().length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <span className={styles.emptyStateTitle}>No staff members found</span>
            <span className="text-[10px] text-slate-400">Try changing query parameters or checking View All.</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("staff_name")}>Staff Name</th>
                  <th onClick={() => handleSort("role_name")}>Department</th>
                  <th onClick={() => handleSort("total_assigned_tasks")} style={{ textAlign: "center" }}>Assigned</th>
                  <th onClick={() => handleSort("in_progress_tasks")} style={{ textAlign: "center" }}>In Progress</th>
                  <th onClick={() => handleSort("completed_tasks")} style={{ textAlign: "center" }}>Completed</th>
                  <th onClick={() => handleSort("not_completed_tasks")} style={{ textAlign: "center" }}>Not Completed</th>
                  <th onClick={() => handleSort("not_accepted_tasks")} style={{ textAlign: "center" }}>Not Accepted</th>
                </tr>
              </thead>
              <tbody>
                {getProcessedStaffList().map((row) => (
                  <tr key={row.staff_id ?? row.staff_name}>
                    <td style={{ fontWeight: 700 }} className="text-slate-800">{row.staff_name}</td>
                    <td>
                      {row.role_name ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                          {row.role_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.countBadge} ${row.total_assigned_tasks > 0 ? styles.activeCount : styles.zeroCount}`}>
                        {row.total_assigned_tasks}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.countBadge} ${row.in_progress_tasks > 0 ? styles.activeCount : styles.zeroCount}`}>
                        {row.in_progress_tasks}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.countBadge} ${row.completed_tasks > 0 ? styles.activeCount : styles.zeroCount}`}>
                        {row.completed_tasks}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.countBadge} ${row.not_completed_tasks > 0 ? styles.activeCount : styles.zeroCount}`}>
                        {row.not_completed_tasks}
                      </span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span className={`${styles.countBadge} ${row.not_accepted_tasks > 0 ? styles.activeCount : styles.zeroCount}`}>
                        {row.not_accepted_tasks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}