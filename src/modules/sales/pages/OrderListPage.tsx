"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit2, CalendarRange, Clock, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";

export default function OrderListPage() {
  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrdersList(currentPage, 5);
      setOrders(data.items || []);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      Draft: "bg-amber-50 text-amber-700 border-amber-100",
      Completed: "bg-blue-50 text-blue-700 border-blue-100",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || "bg-slate-50"}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      Paid: "bg-emerald-50 text-emerald-700",
      Partial: "bg-blue-50 text-blue-700",
      Pending: "bg-rose-50 text-rose-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[status] || "bg-slate-50"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sales Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active orders, payment statuses and production workflow routes.</p>
        </div>
        <Link href="/sales/orders/create" passHref legacyBehavior>
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 cursor-pointer">
            <Plus size={16} /> New Sales Order
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><CalendarRange size={20} /></div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Total Orders</span>
            <strong className="text-xl font-bold text-slate-800">{totalCount}</strong>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Draft Orders</span>
            <strong className="text-xl font-bold text-slate-800">{orders.filter(o => o.order_status === "Draft").length}</strong>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={20} /></div>
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Confirmed Orders</span>
            <strong className="text-xl font-bold text-slate-800">{orders.filter(o => o.order_status === "Confirmed").length}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "90px" }}>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead style={{ width: "120px" }}>Order Date</TableHead>
                <TableHead style={{ width: "120px" }}>Total Amount</TableHead>
                <TableHead style={{ width: "120px" }}>Balance Due</TableHead>
                <TableHead style={{ width: "120px" }}>Order Status</TableHead>
                <TableHead style={{ width: "120px" }}>Payment</TableHead>
                <TableHead style={{ width: "120px", textAlign: "center" }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6 font-semibold">Loading active orders...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 font-semibold">No order records found.</TableCell></TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-700">Order #{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{order.customer_name}</span>
                        <span className="text-[10px] text-slate-400">{order.customer_mobile_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-600">{order.order_date}</TableCell>
                    <TableCell className="font-semibold text-slate-800">₹{order.final_amount}</TableCell>
                    <TableCell className="font-semibold text-rose-600">₹{order.balance_amount}</TableCell>
                    <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                    <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1.5 items-center">
                        <Link href={`/sales/orders/${order.id}`} passHref legacyBehavior>
                          <button className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="View Specifications">
                            <Eye size={13} />
                          </button>
                        </Link>
                        <Link href={`/sales/orders/edit/${order.id}`} passHref legacyBehavior>
                          <button className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit Order">
                            <Edit2 size={13} />
                          </button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border-t px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Showing page {currentPage} of {totalPages}</div>
            <Pagination total={totalCount} limit={5} activePage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}