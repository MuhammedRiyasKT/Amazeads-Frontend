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
  searchCustomersByMobile,
  getSalesAccounts
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
  const [accounts, setAccounts] = useState<any[]>([]);

  // Form states
  const [mobileSearch, setMobileSearch] = useState("");
  const [customerId, setCustomerId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState<number>(6);
  const [priceCategoryId, setPriceCategoryId] = useState<number>(4);
  const [accountId, setAccountId] = useState<number>(0);

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
  const [paymentType, setPaymentType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // ബാക്കൻഡ് ഡാറ്റ ലോഡിങ്
  useEffect(() => {
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
    getOrderDepartments().then(setDepartments).catch(console.error);
    searchCustomersByMobile().then(setCustomers).catch(console.error);
    getSalesAccounts().then(setAccounts).catch(console.error);
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
          setAccountId(data.account_id || 0);
          setCommitDate(data.commit_date);
          setCompletionDate(data.completion_date);
          setOrderType(data.order_type || "Online");
          setDiscount(data.discount_amount || 0);
          setPaidAmount(data.paid_amount || 0);
          setRemarks(data.remarks || "");
          setPaymentStatus(data.payment_status || "Pending");
          setPaymentType(data.payment_type || "");

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
            product_id: proj.product_id || 1,
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
      product_id: 1,
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

  const handleValidateForm = (): boolean => {
    if (!customerName.trim()) { alert("Please enter Customer Name!"); return false; }
    if (!mobileSearch.trim()) { alert("Please enter Mobile Number!"); return false; }
    if (!whatsappNumber.trim()) { alert("Please enter WhatsApp Number!"); return false; }
    if (!customerAddress.trim()) { alert("Please enter Customer Address!"); return false; }
    if (!deliveryAddress.trim()) { alert("Please enter Delivery Address!"); return false; }
    if (!pincode.trim()) { alert("Please enter Pincode!"); return false; }
    if (!city.trim()) { alert("Please enter City!"); return false; }
    if (!state.trim()) { alert("Please enter State!"); return false; }
    if (!country.trim()) { alert("Please enter Country!"); return false; }
    if (!commitDate) { alert("Please select a Commit Date!"); return false; }
    if (!completionDate) { alert("Please select a Completion Date!"); return false; }
    if (!orderType) { alert("Please select an Order Type!"); return false; }
    if (!priceCategoryId) { alert("Please select a Customer Category!"); return false; }
    if (!deliveryTypeId) { alert("Please select a Delivery Type!"); return false; }
    if (!paymentType) { alert("Please select a Payment Type!"); return false; }
    if (!accountId || accountId === 0) { alert("Please select an Account!"); return false; }

    if (projects.length === 0) { alert("Please add at least one product to the list!"); return false; }

    const designDept = departments.find(d => d.department_name.toLowerCase() === "designing");
    const printDept = departments.find(d => d.department_name.toLowerCase() === "printing");
    const designDeptId = designDept?.id || 1;
    const printDeptId = printDept?.id || 2;
    
    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      const rowNum = i + 1;
      
      if (!proj.project_name.trim()) { alert(`Please enter/select a Product Name in Row #${rowNum}!`); return false; }
      if (proj.quantity <= 0) { alert(`Quantity must be 1 or more in Row #${rowNum}!`); return false; }
      if (proj.unit_price <= 0) { alert(`Selling Price must be greater than ₹0 in Row #${rowNum}!`); return false; }

      // Check if Designing selected
      if (proj.department_ids && proj.department_ids.includes(designDeptId)) {
        if (!proj.design_date) {
          alert(`Please select a Design Date in Row #${rowNum}!`);
          return false;
        }
        const dDate = new Date(proj.design_date);
        const start = new Date(commitDate);
        const end = new Date(completionDate);
        if (dDate < start || dDate > end) {
          alert(`Design Date in Row #${rowNum} must be between Commit Date (${commitDate}) and Completion Date (${completionDate})!`);
          return false;
        }
      }

      // Check if Printing selected
      if (proj.department_ids && proj.department_ids.includes(printDeptId)) {
        if (!proj.printing_date) {
          alert(`Please select a Printing Date in Row #${rowNum}!`);
          return false;
        }
        const pDate = new Date(proj.printing_date);
        const start = new Date(commitDate);
        const end = new Date(completionDate);
        if (pDate < start || pDate > end) {
          alert(`Printing Date in Row #${rowNum} must be between Commit Date (${commitDate}) and Completion Date (${completionDate})!`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!handleValidateForm()) return;

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

    const designDept = departments.find(d => d.department_name.toLowerCase() === "designing");
    const printDept = departments.find(d => d.department_name.toLowerCase() === "printing");
    const designDeptId = designDept?.id || 1;
    const printDeptId = printDept?.id || 2;

    const projects_payload = projects.map(({ is_locked, ...rest }) => {
      const designSelected = rest.department_ids.includes(designDeptId);
      const printSelected = rest.department_ids.includes(printDeptId);
      return {
        ...rest,
        design_date: designSelected ? rest.design_date : null,
        printing_date: printSelected ? rest.printing_date : null,
        completed_date: rest.completed_date || completionDate
      };
    });

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
      discount_amount: discount || 0,
      final_amount: finalAmount,
      paid_amount: paidAmount || 0,
      balance_amount: balanceAmount,
      total_amount: totalAmount,
      total_units: totalUnits,
      payment_status: (balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending") as any,
      is_quotation: false,
      order_status: "Confirmed" as any,
      remarks,
      order_type: orderType,
      product_price_category_id: priceCategoryId,
      account_id: accountId,
      payment_type: paymentType,
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
        accountId={accountId} setAccountId={setAccountId}
        commitDate={commitDate} setCommitDate={setCommitDate}
        completionDate={completionDate} setCompletionDate={setCompletionDate}
        orderType={orderType} setOrderType={setOrderType}
        customers={customers}
        deliveryTypes={deliveryTypes}
        priceCategories={priceCategories}
        accounts={accounts}
        onSelectCustomer={() => Promise.resolve()} 
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
        commitDate={commitDate}
        completionDate={completionDate}
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
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
        accountId={accountId}
        onAccountIdChange={setAccountId}
        accounts={accounts}
      />

      <div className={styles.actionButtonsRow}>
        <button type="button" onClick={handleSubmitOrder} className={styles.submitBtn} style={{ cursor: "pointer" }}>
          <CheckSquare size={18} /> UPDATE ORDER
        </button>
      </div>
    </div>
  );
}