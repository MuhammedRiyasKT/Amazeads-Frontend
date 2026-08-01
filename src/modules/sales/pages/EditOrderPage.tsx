"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSalesStore } from "@/store/salesStore";
import CustomerScheduleForm from "../components/CustomerScheduleForm";
import ProductTable from "../components/ProductTable";
import BillingSummary from "../components/BillingSummary";
import { 
  getOrderById, 
  getDeliveryTypes, 
  getSalesPriceCategories, 
  getOrderDepartments, 
  getProductPricesByCat,
  updateSalesOrder,
  searchCustomersByMobile
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

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
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
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Kochi");
  const [state, setState] = useState("Kerala");
  const [country, setCountry] = useState("India");

  // Dates
  const [commitDate, setCommitDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [orderType, setOrderType] = useState("Online");

  // Projects list table rows
  const [projects, setProjects] = useState<any[]>([]);

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [isLoading, setIsLoading] = useState(true);

  // ബാക്കൻഡ് ഡാറ്റ ലോഡിങ്
  useEffect(() => {
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
    getOrderDepartments().then(setDepartments).catch(console.error);
    searchCustomersByMobile().then(setCustomers).catch(console.error);
  }, []);

  // എക്സിസ്റ്റിങ് ഓർഡർ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      getOrderById(orderId)
        .then((data) => {
          setCustomerId(data.customer_id);
          setCustomerName(data.customer_name);
          setMobileSearch(data.customer_mobile_number);
          setWhatsappNumber(data.customer_whatsapp_number || data.customer_mobile_number);
          setRequirements(data.remarks || "");
          setDeliveryTypeId(data.delivery_type_id || 6);
          setPriceCategoryId(data.product_price_category_id || 4);
          setCommitDate(data.commit_date);
          setCompletionDate(data.completion_date);
          setOrderType(data.order_type || "Online");
          setDiscount(data.discount_amount || 0);
          setPaidAmount(data.paid_amount || 0);
          setRemarks(data.remarks || "");
          setPaymentStatus(data.payment_status || "Pending");

          if (data.billing_address) {
            setCustomerAddress(data.billing_address.address_line_1 || "");
            setCity(data.billing_address.city || "Kochi");
            setState(data.billing_address.state || "Kerala");
            setPincode(data.billing_address.pincode || "");
            setCountry(data.billing_address.country || "India");
          }

          if (data.shipping_address) {
            setDeliveryAddress(data.shipping_address.address_line_1 || "");
          }

          // എക്സിസ്റ്റിങ് പ്രൊഡക്റ്റുകൾ എല്ലാം ഓട്ടോമാറ്റിക് ആയി ലോക്ക് ചെയ്യുന്നു (is_locked: true)
          const mappedProjects = (data.projects || []).map((proj: any) => ({
            id: proj.id,
            quantity: proj.quantity,
            unit_price: proj.unit_price,
            amount: proj.amount,
            additional_amount: proj.additional_amount,
            project_name: proj.project_name,
            description: proj.description || "",
            status: proj.status || "Pending",
            design_date: proj.design_date || "",
            printing_date: proj.printing_date || "",
            completed_date: proj.completed_date,
            department_ids: proj.departments ? proj.departments.map((d: any) => d.department_id) : [],
            project_images: proj.project_images || [],
            is_locked: true
          }));
          setProjects(mappedProjects);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  // പ്രൈസ് കാറ്റഗറി ലഭിച്ചാൽ പ്രൊഡക്ട് സഗ്ഗഷൻസ് ഫെച്ച് ചെയ്യുന്നു
  useEffect(() => {
    if (priceCategoryId && selectedCategory) {
      getProductPricesByCat(priceCategoryId, selectedCategory.id)
        .then((data) => setAutocompleteProducts(data.products || []))
        .catch(console.error);
    }
  }, [priceCategoryId, selectedCategory]);

  const handleUpdateProjectField = (idx: number, field: string, value: any) => {
    setProjects(prev => prev.map((proj, i) => {
      if (i !== idx) return proj;
      const updated = { ...proj, [field]: value };
      if (field === "quantity" || field === "unit_price") {
        updated.amount = updated.quantity * updated.unit_price;
      }
      return updated;
    }));
  };

  const handleAddProjectRow = () => {
    setProjects([...projects, {
      quantity: 1,
      unit_price: 0,
      amount: 0,
      additional_amount: 0,
      project_name: "",
      description: "Custom specification",
      status: "Pending",
      design_date: "",
      printing_date: "",
      completed_date: completionDate,
      department_ids: [1, 2, 3, 4], // ഡിഫോൾട്ട് ആക്റ്റീവ് റോകൾ
      is_locked: false 
    }]);
  };

  const handleRemoveProjectRow = (idx: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== idx));
    }
  };

  const calculateDeliveryDays = () => {
    if (!commitDate || !completionDate) return 5;
    const start = new Date(commitDate);
    const end = new Date(completionDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 5;
  };

  const totalAmount = projects.reduce((sum, p) => sum + p.amount + p.additional_amount, 0);
  const finalAmount = totalAmount - discount;
  const balanceAmount = finalAmount - paidAmount;
  const totalUnits = projects.reduce((sum, p) => sum + p.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!customerName || !mobileSearch) {
      alert("Please enter customer name and mobile number!");
      return;
    }

    const billing_address: Omit<Address, "id"> = {
      address_type: "Billing",
      address_line_1: customerAddress,
      address_line_2: customerAddress, 
      city,
      state,
      country,
      pincode,
      is_default: true
    };

    const delivery_address_payload: Omit<Address, "id"> = {
      address_type: "Delivery",
      address_line_1: deliveryAddress || customerAddress,
      address_line_2: deliveryAddress || customerAddress, 
      city,
      state,
      country,
      pincode,
      is_default: true
    };

    const projects_payload = projects.map(({ is_locked, ...rest }) => rest);

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
      design_date: null as any, 
      print_date: null as any,
      completion_date: completionDate,
      total_orders: 1,
      discount_amount: discount,
      final_amount: finalAmount,
      paid_amount: paidAmount,
      balance_amount: balanceAmount,
      total_amount: totalAmount,
      total_units: totalUnits,
      payment_status: (balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending") as any,
      is_quotation: false,
      order_status: "Confirmed" as any,
      remarks,
      order_type: orderType,
      product_price_category_id: priceCategoryId,
      projects: projects_payload
    };

    try {
      await updateSalesOrder(orderId, payload);
      alert("Order updated successfully!");
      router.push("/sales/orders");
    } catch (err) {
      console.error(err);
      alert("Error updating order request");
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Loading existing order specifications...</div>;
  }

  return (
    <div className={styles.container}>
      <CustomerScheduleForm 
        mobileSearch={mobileSearch} setMobileSearch={setMobileSearch}
        customerName={customerName} setCustomerName={setCustomerName}
        whatsappNumber={whatsappNumber} setWhatsappNumber={setWhatsappNumber}
        customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
        deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress}
        pincode={pincode} setPincode={setPincode}
        city={city} setCity={setCity}
        state={state} setState={setState}
        country={country} setCountry={setCountry}
        deliveryTypeId={deliveryTypeId} setDeliveryTypeId={setDeliveryTypeId}
        priceCategoryId={priceCategoryId} setPriceCategoryId={setPriceCategoryId}
        commitDate={commitDate} setCommitDate={setCommitDate}
        completionDate={completionDate} setCompletionDate={setCompletionDate}
        orderType={orderType} setOrderType={setOrderType}
        customers={customers}
        deliveryTypes={deliveryTypes}
        priceCategories={priceCategories}
        onSelectCustomer={() => Promise.resolve()} 
        // ഡിസൈൻ ഡേറ്റ്, പ്രിന്റ് ഡേറ്റ് ഇമ്പോർട്ടുകൾ ഒഴിവാക്കി എറർ പരിഹരിച്ചു 🌟
      />
      
      <ProductTable
        rows={projects}
        onRowChange={handleUpdateProjectField}
        onAddRow={handleAddProjectRow}
        onDeleteRow={handleRemoveProjectRow}
        totalUnits={totalUnits}
        tableTotal={totalAmount}
        departments={departments}
        autocompleteProducts={autocompleteProducts}
      />

      <BillingSummary
        tableTotal={totalAmount}
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
          <CheckSquare size={18} /> UPDATE ORDER
        </button>
      </div>
    </div>
  );
}