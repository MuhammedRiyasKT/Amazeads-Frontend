"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSalesStore } from "@/store/salesStore";
import CustomerScheduleForm from "../components/CustomerScheduleForm";
import ProductTable from "../components/ProductTable";
import BillingSummary from "../components/BillingSummary";
import { 
  searchCustomersByMobile, 
  getCustomerDetails, 
  getDeliveryTypes, 
  getSalesPriceCategories, 
  getOrderDepartments, 
  getProductPricesByCat,
  createSalesOrder 
} from "../services/order.service";
import { 
  Customer, 
  Address, 
  DeliveryType, 
  SalesPriceCategory, 
  ProjectDepartment, 
  SalesProductPrice, 
  OrderProjectPayload 
} from "../types";
import styles from "../components/CreateOrderComponents.module.css";

export default function CreateOrderPage() {
  const router = useRouter();
  const { selectedCategory } = useSalesStore();

  // API Lists
  const [customers, setCustomers] = useState<Array<{ id: number; mobile_number: string }>>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
  const [priceCategories, setPriceCategories] = useState<SalesPriceCategory[]>([]);
  const [departments, setDepartments] = useState<ProjectDepartment[]>([]);
  const [autocompleteProducts, setAutocompleteProducts] = useState<SalesProductPrice[]>([]);

  // Form states
  const [mobileSearch, setMobileSearch] = useState("");
  const [customerId, setCustomerId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState<number>(6);
  const [priceCategoryId, setPriceCategoryId] = useState<number>(4);

  // Address
  const [customerAddress, setCustomerAddress] = useState(""); // Billing Address Line 1
  const [deliveryAddress, setDeliveryAddress] = useState(""); // Delivery Address Line 1
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Kochi");
  const [state, setState] = useState("Kerala");

  // Dates
  const [commitDate, setCommitDate] = useState("2026-08-01");
  const [designDate, setDesignDate] = useState("2026-07-28");
  const [printDate, setPrintDate] = useState("2026-07-30");
  const [completionDate, setCompletionDate] = useState("2026-08-01");
  const [orderType, setOrderType] = useState("Normal");

  // Projects list table rows
  const [rows, setRows] = useState<OrderProjectPayload[]>([
    {
      quantity: 1,
      unit_price: 0,
      amount: 0,
      additional_amount: 0,
      project_name: "",
      description: "Custom specification",
      status: "Pending",
      design_date: "2026-07-28",
      printing_date: "2026-07-30",
      completed_date: "2026-08-01",
      department_ids: [],
    }
  ]);

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  // ബാക്കൻഡ് ഡാറ്റ ലോഡിങ്
  useEffect(() => {
    searchCustomersByMobile().then(setCustomers).catch(console.error);
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
    getOrderDepartments().then(setDepartments).catch(console.error);
  }, []);

  // പ്രൈസ് കാറ്റഗറി ലഭിച്ചാൽ പ്രൊഡക്ട് സഗ്ഗഷൻസ് ഫെച്ച് ചെയ്യുന്നു
  useEffect(() => {
    if (priceCategoryId && selectedCategory) {
      getProductPricesByCat(priceCategoryId, selectedCategory.id)
        .then((data) => setAutocompleteProducts(data.products || []))
        .catch(console.error);
    }
  }, [priceCategoryId, selectedCategory]);

  // കസ്റ്റമർ സെലക്ട് ഓട്ടോഫിൽ ലോജിക്
  const handleSelectCustomer = async (id: number) => {
    try {
      const data = await getCustomerDetails(id);
      setCustomerId(data.id);
      setCustomerName(data.customer_name);
      setMobileSearch(data.mobile_number);
      setWhatsappNumber(data.whatsapp_number);
      setRequirements(data.requirements || "");
      
      if (data.billing_address) {
        setCustomerAddress(data.billing_address.address_line_1 || "");
        setCity(data.billing_address.city || "Kochi");
        setState(data.billing_address.state || "Kerala");
        setPincode(data.billing_address.pincode || "");
      }
      if (data.shipping_address) {
        setDeliveryAddress(data.shipping_address.address_line_1 || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRowChange = (idx: number, field: string, value: any) => {
    setRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      const updated = { ...row, [field]: value };
      if (field === "quantity" || field === "unit_price") {
        updated.amount = updated.quantity * updated.unit_price;
      }
      return updated;
    }));
  };

  const handleAddRow = () => {
    setRows([...rows, {
      quantity: 1,
      unit_price: 0,
      amount: 0,
      additional_amount: 0,
      project_name: "",
      description: "Custom specification",
      status: "Pending",
      design_date: "2026-07-28",
      printing_date: "2026-07-30",
      completed_date: "2026-08-01",
      department_ids: []
    }]);
  };

  const handleDeleteRow = (idx: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== idx));
    }
  };

  const calculateDeliveryDays = () => {
    const start = new Date(commitDate);
    const end = new Date(completionDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 5;
  };

  const tableTotal = rows.reduce((acc, row) => acc + (row.quantity * row.unit_price + row.additional_amount), 0);
  const totalUnits = rows.reduce((acc, row) => acc + row.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!customerName || !mobileSearch) {
      alert("Please enter customer name and mobile number!");
      return;
    }

    const billing_address: Omit<Address, "id"> = {
      address_type: "Billing",
      address_line_1: customerAddress,
      address_line_2: "Billing Location",
      city,
      state,
      country: "India",
      pincode,
      is_default: true
    };

    const delivery_address_payload: Omit<Address, "id"> = {
      address_type: "Delivery",
      address_line_1: deliveryAddress || customerAddress,
      address_line_2: "Delivery Location",
      city,
      state,
      country: "India",
      pincode,
      is_default: true
    };

    const finalAmount = tableTotal - discount;
    const balanceAmount = finalAmount - paidAmount;

    const payload = {
      customer_id: customerId,
      customer: {
        customer_name: customerName,
        mobile_number: mobileSearch,
        whatsapp_number: whatsappNumber || mobileSearch,
        requirements,
        status: "Active"
      },
      billing_address_id: 0,
      billing_address,
      delivery_address_id: 0,
      delivery_address: delivery_address_payload,
      delivery_type_id: deliveryTypeId,
      expected_delivery_days: calculateDeliveryDays(),
      order_date: commitDate,
      commit_date: commitDate,
      design_date: designDate,
      print_date: printDate,
      completion_date: completionDate,
      total_orders: 1,
      discount_amount: discount,
      final_amount: finalAmount,
      paid_amount: paidAmount,
      balance_amount: balanceAmount,
      total_amount: tableTotal,
      total_units: totalUnits,
      payment_status: paymentStatus as any,
      is_quotation: false,
      order_status: "Confirmed" as any,
      remarks,
      product_price_category_id: priceCategoryId,
      projects: rows
    };

    try {
      await createSalesOrder(payload);
      alert("Order submitted successfully!");
      router.push("/sales/orders");
    } catch (err) {
      console.error(err);
      alert("Error submitting order request");
    }
  };

  return (
    <div className={styles.container}>
      <CustomerScheduleForm 
        mobileSearch={mobileSearch} setMobileSearch={setMobileSearch}
        customerName={customerName} setCustomerName={setCustomerName}
        whatsappNumber={whatsappNumber} setWhatsappNumber={setWhatsappNumber}
        customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
        deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress}
        pincode={pincode} setPincode={setPincode}
        deliveryTypeId={deliveryTypeId} setDeliveryTypeId={setDeliveryTypeId}
        priceCategoryId={priceCategoryId} setPriceCategoryId={setPriceCategoryId}
        commitDate={commitDate} setCommitDate={setCommitDate}
        designDate={designDate} setDesignDate={setDesignDate}
        printDate={printDate} setPrintDate={setPrintDate}
        completionDate={completionDate} setCompletionDate={setCompletionDate}
        orderType={orderType} setOrderType={setOrderType}
        customers={customers}
        deliveryTypes={deliveryTypes}
        priceCategories={priceCategories}
        onSelectCustomer={handleSelectCustomer}
      />
      
      <ProductTable
        rows={rows}
        onRowChange={handleRowChange}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        totalUnits={totalUnits}
        tableTotal={tableTotal}
        departments={departments}
        autocompleteProducts={autocompleteProducts}
      />

      <BillingSummary
        tableTotal={tableTotal}
        discount={discount}
        onDiscountChange={setDiscount}
        paidAmount={paidAmount}
        onPaidAmountChange={setPaidAmount}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        remarks={remarks}
        onRemarksChange={setRemarks}
      />

      <div className={styles.actionButtonsRow}>
        <button type="button" onClick={handleSubmitOrder} className={styles.submitBtn} style={{ cursor: "pointer" }}>
          <CheckSquare size={18} /> SUBMIT ORDER
        </button>
      </div>
    </div>
  );
}