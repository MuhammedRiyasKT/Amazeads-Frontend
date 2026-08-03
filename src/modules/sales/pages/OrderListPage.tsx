"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList } from "../services/order.service";
import OrderKPIs from "../components/OrderKPIs";
import OrderFilters from "../components/OrderFilters"; // ഫിൽട്ടർ കമ്പോണന്റ് ഇമ്പോർട്ട് ചെയ്തു 🌟
import OrderTable from "../components/OrderTable";
import ViewOrderModal from "../components/ViewOrderModal";
import styles from "../components/OrderListComponents.module.css";

export default function OrderListPage() {
  const [orders, setOrders] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ഫിൽട്ടർ സ്റ്റേറ്റുകൾ 🌟
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

  // ഫിൽട്ടറുകൾ സഹിതം ഓർഡറുകൾ ഫെച്ച് ചെയ്യുന്നു 🌟
  const fetchOrders = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = { page: pageToFetch, page_size: 5 };
      if (mobileSearch) activeFilters.mobile_number = mobileSearch;
      if (orderStatus) activeFilters.order_status = orderStatus;
      if (paymentStatus) activeFilters.payment_status = paymentStatus;
      if (fromDate) activeFilters.from_date = fromDate;
      if (toDate) activeFilters.to_date = toDate;
      if (deliveryTypeId) activeFilters.delivery_type_id = parseInt(deliveryTypeId);
      if (priceCategoryId) activeFilters.product_price_category_id = parseInt(priceCategoryId);

      const data = await getOrdersList(activeFilters);
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

  // ഫിൽട്ടർ അപ്ലൈ ആക്ഷൻ
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };

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
    
    // ഫ്രഷ് ലിസ്റ്റ് ഉടൻ ഫെച്ച് ചെയ്യുന്നു
    setIsLoading(true);
    getOrdersList({ page: 1, page_size: 5 })
      .then((data) => {
        setOrders(data.items || []);
        setTotalPages(data.pagination.total_pages);
        setTotalCount(data.pagination.total_count);
      })
      .finally(() => setIsLoading(false));
  };

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  // കൗണ്ടുകൾ
  const draftCount = orders.filter(o => o.order_status === "Draft").length;
  const confirmedCount = orders.filter(o => o.order_status === "Confirmed").length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Sales Orders</h1>
          <p className={styles.subtitle}>Manage active orders, payment statuses and production workflow routes.</p>
        </div>
        <Link href="/sales/orders/create" passHref legacyBehavior>
          <Button variant="primary" size="sm" className="flex items-center gap-1.5 cursor-pointer">
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

      {/* ഫിൽട്ടർ കമ്പോണന്റ് ഇമ്പോർട്ട് ചെയ്തു റെൻഡർ ചെയ്യുന്നു 🌟 */}
      <OrderFilters
        mobileSearch={mobileSearch} setMobileSearch={setMobileSearch}
        orderStatus={orderStatus} setOrderStatus={setOrderStatus}
        paymentStatus={paymentStatus} setPaymentStatus={setPaymentStatus}
        fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate}
        deliveryTypeId={deliveryTypeId} setDeliveryTypeId={setDeliveryTypeId}
        priceCategoryId={priceCategoryId} setPriceCategoryId={setPriceCategoryId}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
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