"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";
import OrderKPIs from "../components/OrderKPIs";
import OrderFilters from "../components/OrderFilters";
import OrderTable from "../components/OrderTable";
import ViewOrderModal from "../components/ViewOrderModal";
import { useSalesStore } from "@/store/salesStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "../components/OrderListComponents.module.css";

export default function OrderListPage() {
  const { selectedCategory } = useSalesStore();

  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Live Auto-Apply Filter States 🌟
  const [mobileSearch, setMobileSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState("");
  const [priceCategoryId, setPriceCategoryId] = useState("");

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // ഫിൽട്ടറുകൾ സഹിതം തത്സമയം ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു 🌟
  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = { 
        page: pageToFetch, 
        page_size: 5,
        category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART 
      };

      if (mobileSearch.trim()) activeFilters.mobile_number = mobileSearch.trim();
      if (orderStatus) activeFilters.order_status = orderStatus;
      if (paymentStatus) activeFilters.payment_status = paymentStatus;
      if (fromDate) activeFilters.from_date = fromDate;
      if (toDate) activeFilters.to_date = toDate;
      if (deliveryTypeId) activeFilters.delivery_type_id = parseInt(deliveryTypeId);
      if (priceCategoryId) activeFilters.product_price_category_id = parseInt(priceCategoryId);

      const data = await getOrdersList(activeFilters);
      setOrders(data.items || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching orders list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Live Auto-Apply: ഏതൊരു ഫിൽട്ടറോ പേജോ കാറ്റഗറിയോ മാറുമ്പോൾ തനിയെ അപ്ലൈ ആകും!
  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage, 
    selectedCategory, 
    mobileSearch, 
    orderStatus, 
    paymentStatus, 
    fromDate, 
    toDate, 
    deliveryTypeId, 
    priceCategoryId
  ]);

  // ഫിൽട്ടർ റീസെറ്റ് ആക്ഷൻ
  const handleClearFilters = () => {
    setMobileSearch("");
    setOrderStatus("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    setDeliveryTypeId("");
    setPriceCategoryId("");
    setCurrentPage(1);
  };

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  const draftCount = orders.filter((o) => o.order_status === "Draft").length;
  const confirmedCount = orders.filter((o) => o.order_status === "Confirmed").length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Sales Orders</h1>
          <p className={styles.subtitle}>
            Manage active orders, payment statuses and production workflow routes.
          </p>
        </div>
        <Link href="/sales/orders/create" passHref legacyBehavior>
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 cursor-pointer font-bold">
            <Plus size={16} /> New Sales Order
          </Button>
        </Link>
      </div>

      {/* KPI കമ്പോണന്റ് */}
      <OrderKPIs 
        totalCount={totalCount} 
        draftCount={draftCount} 
        confirmedCount={confirmedCount} 
      />

      {/* 🌟 തത്സമയം അപ്ലൈ ആകുന്ന ഫിൽട്ടർ കമ്പോണന്റ് (Apply Filters ബട്ടൺ ഇല്ലാതെ) */}
      <OrderFilters
        mobileSearch={mobileSearch}
        setMobileSearch={setMobileSearch}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
      />

      {/* ടേബിൾ കമ്പോണന്റ് */}
      <OrderTable 
        orders={orders} 
        isLoading={isLoading} 
        onViewClick={handleViewClick}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
      />

      {/* ഡീറ്റെയിൽസ് മോഡൽ */}
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