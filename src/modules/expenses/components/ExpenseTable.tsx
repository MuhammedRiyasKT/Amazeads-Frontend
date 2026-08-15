// src/modules/expenses/components/ExpenseTable.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { MoreVertical, Paperclip, Eye, Edit3, Trash2, FileText } from "lucide-react";
import { Expense } from "../types";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onViewDetails: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onPreviewAttachment: (url: string) => void;
}

export default function ExpenseTable({
  expenses,
  isLoading,
  onViewDetails,
  onEditExpense,
  onDeleteExpense,
  onPreviewAttachment,
}: ExpenseTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close actions menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Paid") {
      return (
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block">
          Paid
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-visible shadow-2xs w-full relative">
      <div className="overflow-x-auto w-full rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead style={{ width: "110px" }}>Date</TableHead>
              <TableHead style={{ width: "150px" }}>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead style={{ width: "120px" }}>Account</TableHead>
              <TableHead style={{ width: "120px" }}>Payment</TableHead>
              <TableHead style={{ width: "120px", textAlign: "right" }}>Amount</TableHead>
              <TableHead style={{ width: "100px", textAlign: "center" }}>Status</TableHead>
              <TableHead style={{ width: "120px" }}>Added By</TableHead>
              <TableHead style={{ width: "70px", textAlign: "center" }}>Attachment</TableHead>
              <TableHead style={{ width: "60px", textAlign: "center" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`} className="animate-pulse">
                  <TableCell><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-24" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-full" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>
                  <TableCell align="right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></TableCell>
                  <TableCell align="center"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>
                  <TableCell align="center"><div className="h-5 bg-slate-100 rounded-full w-5 mx-auto" /></TableCell>
                  <TableCell align="center"><div className="h-4 bg-slate-100 rounded w-4 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">💸</span>
                    <strong className="text-slate-800 text-sm">No expenses found</strong>
                    <span className="text-xs">Try changing your filters or add a new expense.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => {
                const isMenuOpen = activeMenuId === expense.id;
                
                return (
                  <TableRow key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Date */}
                    <TableCell className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                      {formatDate(expense.expense_date)}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-xs font-bold text-slate-800">
                      {expense.category_name}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={expense.description}>
                      {expense.description || "—"}
                    </TableCell>

                    {/* Account */}
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {expense.account_name}
                    </TableCell>

                    {/* Payment Type */}
                    <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                      {expense.payment_type || "—"}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-xs font-extrabold text-slate-800 text-right whitespace-nowrap">
                      ₹{(expense.amount || 0).toLocaleString("en-IN")}.00
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center" className="whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </TableCell>

                    {/* Added By */}
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {expense.created_by_name || "—"}
                    </TableCell>

                    {/* Attachment */}
                    <TableCell align="center">
                      {expense.attachment_url ? (
                        <button
                          onClick={() => onPreviewAttachment(expense.attachment_url!)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                          title="View Receipt"
                        >
                          {expense.attachment_url.toLowerCase().endsWith(".pdf") ? (
                            <FileText size={14} />
                          ) : (
                            <Paperclip size={14} />
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs font-medium">—</span>
                      )}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell align="center" className="relative overflow-visible">
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : expense.id);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {isMenuOpen && (
                          <div
                            ref={menuRef}
                            className="absolute right-2.5 top-9 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-left"
                            style={{ position: "absolute" }}
                          >
                            {/* View Details */}
                            <button
                              onClick={() => {
                                onViewDetails(expense);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                            >
                              <Eye size={13} className="text-slate-400" /> View Details
                            </button>

                            {/* Edit Expense */}
                            <button
                              onClick={() => {
                                onEditExpense(expense);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors cursor-pointer"
                            >
                              <Edit3 size={13} className="text-slate-400" /> Edit Expense
                            </button>

                            {/* Delete Expense */}
                            <button
                              onClick={() => {
                                onDeleteExpense(expense);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer border-t"
                            >
                              <Trash2 size={13} className="text-rose-400" /> Delete Expense
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
