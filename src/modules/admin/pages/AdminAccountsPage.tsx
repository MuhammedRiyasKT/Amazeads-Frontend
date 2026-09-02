// src/modules/admin/pages/AdminAccountsPage.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Landmark,
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";
import { AdminAccount } from "../types/adminAccount.types";
import { getAdminAccounts, deleteAdminAccount } from "../services/adminAccount.service";
import AdminAccountModal from "../components/AdminAccountModal";
import DeleteAccountDialog from "../components/DeleteAccountDialog";

const formatDateReadable = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AdminAccount | null>(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AdminAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Auto-dismiss toast helper
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load Accounts list
  const fetchAccounts = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);
      const data = await getAdminAccounts();
      setAccounts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch admin accounts:", err);
      setErrorMsg(
        err?.response?.data?.message || "Unable to load company accounts. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase().trim();
    return accounts.filter((acc) => acc.account_name.toLowerCase().includes(q));
  }, [accounts, searchQuery]);

  // KPI Counters
  const activeCount = useMemo(
    () => accounts.filter((acc) => acc.status === true).length,
    [accounts]
  );
  const inactiveCount = useMemo(
    () => accounts.filter((acc) => acc.status === false).length,
    [accounts]
  );

  // Handlers
  const handleOpenAddModal = () => {
    setSelectedAccountForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (acc: AdminAccount) => {
    setSelectedAccountForEdit(acc);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (acc: AdminAccount) => {
    setAccountToDelete(acc);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminAccount(accountToDelete.id);
      setToastMsg(`Account "${accountToDelete.account_name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
      fetchAccounts();
    } catch (err: any) {
      console.error("Delete account error:", err);
      setDeleteError(
        err?.response?.data?.message || "Failed to delete account. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSuccess = (message: string) => {
    setToastMsg(message);
    fetchAccounts();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xl border border-emerald-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-6 h-6 text-indigo-600" />
              <span>Accounts</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold rounded-full">
              Management
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            Manage company accounts and their active status
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAccounts(true)}
            disabled={isLoading || isRefreshing}
            className="h-10 px-3.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
            title="Refresh Accounts"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Accounts</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">{accounts.length}</div>
          <div className="text-[10px] text-slate-400 font-medium">Configured accounts</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">{activeCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Available for transactions</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inactive</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-600">{inactiveCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">Disabled / Suspended</div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account name..."
            className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          Showing <span className="font-bold text-slate-800">{filteredAccounts.length}</span> of{" "}
          <span className="font-bold text-slate-800">{accounts.length}</span> accounts
        </div>
      </div>

      {/* 4. Table / Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-3 animate-pulse">
          <div className="h-6 w-1/4 bg-slate-100 rounded-md" />
          <div className="space-y-2 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-lg" />
            ))}
          </div>
        </div>
      ) : errorMsg ? (
        /* Error State */
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800">{errorMsg}</h3>
            <p className="text-xs text-slate-500 font-medium">
              An error occurred while loading accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchAccounts()}
            className="px-4.5 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredAccounts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="h-12 w-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery ? "No accounts match your search" : "No accounts found"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {searchQuery
                ? `No company account found matching "${searchQuery}". Try clearing your search.`
                : "Get started by creating your first company account."}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 h-9 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={handleOpenAddModal}
              className="px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Add Account</span>
            </button>
          )}
        </div>
      ) : (
        /* Responsive Table & Cards */
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 border-r border-slate-100">Account Name</th>
                    <th className="py-3 px-4 border-r border-slate-100">Status</th>
                    <th className="py-3 px-4 border-r border-slate-100">Created Date</th>
                    <th className="py-3 px-4 border-r border-slate-100">Last Updated</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredAccounts.map((acc) => (
                    <tr
                      key={acc.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Account Name */}
                      <td className="py-3.5 px-4 border-r border-slate-100 font-bold text-slate-900 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span>{acc.account_name}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 border-r border-slate-100">
                        {acc.status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 border-r border-slate-100 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{formatDateReadable(acc.created_on)}</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 border-r border-slate-100 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span>{formatDateReadable(acc.updated_on)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(acc)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                            title="Edit Account"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteDialog(acc)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                            title="Delete Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards List View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-base block">
                      {acc.account_name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      ID: #{acc.id}
                    </span>
                  </div>

                  {acc.status ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">
                      Created On
                    </span>
                    <span className="font-semibold text-slate-700 block mt-0.5">
                      {formatDateReadable(acc.created_on)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[10px] uppercase">
                      Last Updated
                    </span>
                    <span className="font-semibold text-slate-700 block mt-0.5">
                      {formatDateReadable(acc.updated_on)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(acc)}
                    className="px-3 h-8 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteDialog(acc)}
                    className="px-3 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AdminAccountModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedAccountForEdit(null);
        }}
        onSuccess={handleModalSuccess}
        account={selectedAccountForEdit}
        existingAccounts={accounts}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        accountName={accountToDelete?.account_name || ""}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
