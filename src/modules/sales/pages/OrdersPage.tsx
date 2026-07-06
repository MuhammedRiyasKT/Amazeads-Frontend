"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import OrdersKPIGrid from "../components/OrdersKPIGrid";
import OrdersFilters from "../components/OrdersFilters";
import OrdersTable from "../components/OrdersTable";
import { Order } from "../types";
import styles from "../components/OrdersComponents.module.css";

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderId: "",
    date: "Oct 24, 2023",
    customerName: "Aman Rathore",
    items: [
      { productName: "Custom Packaging Kit x4", qty: 450, status: "ORDER" },
      { productName: "Canvas Print (A3)", qty: 2, status: "ORDER" }
    ],
    total: 147700,
    paymentStatus: "PAID",
    paidAmount: 147700,
    dueAmount: 0,
    isToday: true,
    isConverted: true
  },
  {
    id: "2",
    orderId: "",
    date: "Oct 24, 2023",
    customerName: "Sneha Varma",
    items: [
      { productName: "Luxe Brand Identity", qty: 1, status: "ORDER" }
    ],
    total: 85000,
    paymentStatus: "PAID",
    paidAmount: 85000,
    dueAmount: 0,
    isToday: true,
    isConverted: true
  },
  {
    id: "3",
    orderId: "#SO-98419",
    date: "Oct 23, 2023",
    customerName: "Rohan Parekh",
    items: [
      { productName: "Matte Finish Envelopes", qty: 1000, status: "PROJECT" },
      { productName: "Acrylic Frame (12x18)", qty: 1, status: "PROJECT" }
    ],
    total: 15000,
    paymentStatus: "PARTIAL",
    paidAmount: 5000,
    dueAmount: 10000,
    isToday: true,
    isPending: true
  },
  {
    id: "4",
    orderId: "#SO-98420",
    date: "Oct 22, 2023",
    customerName: "Arjun Nair",
    items: [
      { productName: "Premium Acrylic Keychain", qty: 50, status: "ORDER" }
    ],
    total: 7500,
    paymentStatus: "DUE",
    paidAmount: 0,
    dueAmount: 7500,
    isPending: true
  },
  {
    id: "5",
    orderId: "",
    date: "Oct 21, 2023",
    customerName: "Priya Sharma",
    items: [
      { productName: "Wooden Engraved Frame", qty: 5, status: "ORDER" }
    ],
    total: 9500,
    paymentStatus: "PAID",
    paidAmount: 9500,
    dueAmount: 0,
    isConverted: true
  },
  {
    id: "6",
    orderId: "#SO-98421",
    date: "Oct 20, 2023",
    customerName: "Meera Patel",
    items: [
      { productName: "Luxe Brand Packaging", qty: 200, status: "PROJECT" }
    ],
    total: 45000,
    paymentStatus: "DUE",
    paidAmount: 15000,
    dueAmount: 30000,
    isPending: true
  }
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Today's Orders");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 3;

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeTab === "Today's Orders" && !order.isToday) return false;
    if (activeTab === "Converted Orders" && !order.isConverted) return false;
    if (activeTab === "Pending Convertion" && !order.isPending) return false;

    if (paymentFilter !== "All") {
      if (paymentFilter === "PAID" && order.paymentStatus !== "PAID") return false;
      if (paymentFilter === "DUE" && order.paymentStatus === "PAID") return false; 
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesCustomer = order.customerName.toLowerCase().includes(query);
      const matchesOrderId = order.orderId?.toLowerCase().includes(query);
      const matchesProduct = order.items.some((i) => i.productName.toLowerCase().includes(query));
      return matchesCustomer || matchesOrderId || matchesProduct;
    }

    return true;
  });

  const totalCount = filteredOrders.length;
  const startIndex = (currentPage - 1) * limit;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Orders</h1>
          <p className={styles.subtitle}>Manage and track your global enterprise sales lifecycle.</p>
        </div>
        <Link href="/sales/create-order" passHref legacyBehavior>
          <Button variant="primary" className={styles.createBtn}>
            <Plus size={16} /> CREATE NEW ORDER
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <OrdersKPIGrid />

      {/* Filters Box & Tabs */}
      <OrdersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
      />

      {/* Orders Table */}
      <OrdersTable
        orders={paginatedOrders}
        totalCount={totalCount}
        currentPage={currentPage}
        limit={limit}
        onPageChange={setCurrentPage}
        activeTabTitle={activeTab}
      />
    </div>
  );
}