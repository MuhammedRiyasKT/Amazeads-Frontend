// src/modules/products/components/DeliveryTypeListTab.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Truck,
  RotateCw,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Store,
  MapPin,
  Mail,
  Wrench,
  Navigation,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DeliveryType } from "../types/deliveryType";
import {
  getDeliveryTypes,
  updateDeliveryType,
  deleteDeliveryType,
} from "../services/deliveryType.service";
import DeliveryTypeDialog from "./DeliveryTypeDialog";

export default function DeliveryTypeListTab() {
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeliveryType | null>(null);

  // Fetch Delivery Types
  const fetchTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDeliveryTypes();
      setDeliveryTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load delivery types:", err);
      setDeliveryTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // Status Toggle
  const handleToggleStatus = async (item: DeliveryType) => {
    const updatedStatus = !item.status;
    // Optimistic update
    setDeliveryTypes((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, status: updatedStatus } : t))
    );

    try {
      await updateDeliveryType(item.id, {
        name: item.name,
        status: updatedStatus,
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      // Revert on error
      fetchTypes();
    }
  };

  // Delete
  const handleDelete = async (item: DeliveryType) => {
    if (confirm(`Are you sure you want to delete delivery type "${item.name}"?`)) {
      try {
        await deleteDeliveryType(item.id);
        setDeliveryTypes((prev) => prev.filter((t) => t.id !== item.id));
      } catch (err) {
        console.error("Failed to delete delivery type:", err);
        alert("Failed to delete delivery type. It may be linked to existing orders.");
      }
    }
  };

  // Filter & Search
  const filteredTypes = useMemo(() => {
    return deliveryTypes.filter((item) => {
      // Search by name
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (!item.name?.toLowerCase().includes(query)) return false;
      }

      // Filter by status
      if (statusFilter === "active" && !item.status) return false;
      if (statusFilter === "inactive" && item.status) return false;

      return true;
    });
  }, [deliveryTypes, searchQuery, statusFilter]);

  // Pagination calculation
  const totalCount = filteredTypes.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTypes = filteredTypes.slice(startIndex, startIndex + pageSize);

  // Statistics
  const activeCount = deliveryTypes.filter((t) => t.status).length;
  const inactiveCount = deliveryTypes.filter((t) => !t.status).length;

  // Icon helper based on method name
  const getMethodIcon = (name: string) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("pickup")) return <Store size={15} className="text-indigo-600" />;
    if (lower.includes("install")) return <Wrench size={15} className="text-amber-600" />;
    if (lower.includes("post")) return <Mail size={15} className="text-blue-600" />;
    if (lower.includes("ksrtc") || lower.includes("bus")) return <Navigation size={15} className="text-emerald-600" />;
    if (lower.includes("dtdc") || lower.includes("courier")) return <Truck size={15} className="text-purple-600" />;
    return <Truck size={15} className="text-slate-600" />;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Delivery Type Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure order fulfillment, courier channels, and pickup options.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTypes}
            disabled={isLoading}
            className="flex items-center gap-1.5 cursor-pointer text-slate-700 bg-white hover:bg-slate-50 border-slate-200 shadow-2xs font-bold"
            title="Refresh list"
          >
            <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer font-bold w-fit"
          >
            <Plus size={16} /> Add Delivery Type
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Methods */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Total Methods
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {deliveryTypes.length}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <PackageCheck size={20} />
          </div>
        </div>

        {/* Active Methods */}
        <div className="bg-white border border-emerald-200/70 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">
              Active Methods
            </span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {activeCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Inactive Methods */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Inactive Methods
            </span>
            <div className="text-2xl font-black text-slate-700 mt-1">
              {inactiveCount}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search delivery method..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 border border-slate-200 rounded-lg pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-indigo-600"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-10 border border-slate-200 rounded-lg px-3 bg-white text-xs font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "90px" }}>ID</TableHead>
                <TableHead>DELIVERY METHOD</TableHead>
                <TableHead style={{ width: "160px" }}>CREATED DATE</TableHead>
                <TableHead style={{ width: "130px", textAlign: "center" }}>STATUS</TableHead>
                <TableHead style={{ width: "120px", textAlign: "center" }}>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Loading delivery types...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <Truck size={24} />
                      </div>
                      <span className="text-sm font-extrabold text-slate-700">
                        No delivery types found
                      </span>
                      <span className="text-xs text-slate-400">
                        {searchQuery
                          ? "Try a different search query"
                          : "Create your first delivery method to get started"}
                      </span>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(null);
                            setIsDialogOpen(true);
                          }}
                          className="mt-2 text-xs font-bold cursor-pointer"
                        >
                          <Plus size={14} /> Add Delivery Type
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTypes.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="font-extrabold text-slate-500 text-xs">
                      #{item.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {getMethodIcon(item.name)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm capitalize">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Fulfillment Method
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-slate-600">
                      {item.created_on ? item.created_on.substring(0, 10) : "N/A"}
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      <span
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:opacity-85 transition-all shadow-3xs ${
                          item.status
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {item.status ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>

                    <TableCell style={{ textAlign: "center" }}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDialogOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Delivery Type"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Delivery Type"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Row */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-100 bg-white">
            <div className="text-xs font-semibold text-slate-500">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} methods
            </div>
            <Pagination
              total={totalCount}
              limit={pageSize}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <DeliveryTypeDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={fetchTypes}
        item={selectedItem}
      />
    </div>
  );
}
