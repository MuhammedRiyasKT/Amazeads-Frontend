"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { CATEGORY_IDS } from "@/constants/categories";
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
  updateSalesQuotation,
  searchCustomersByMobile,
  getSalesAccounts,
  getCustomerDetails,
} from "../services/order.service";
import {
  Address,
  DeliveryType,
  SalesPriceCategory,
  ProjectDepartment,
  SalesProductPrice,
  CreateOrderPayload,
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
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState<number>(0);
  const [priceCategoryId, setPriceCategoryId] = useState<number>(4);
  const [accountId, setAccountId] = useState<number>(0);

  // Billing Address State
  const [billingAddressId, setBillingAddressId] = useState(0);
  const [billingAddress, setBillingAddress] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("Kochi");
  const [billingState, setBillingState] = useState("Kerala");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCountry, setBillingCountry] = useState("India");

  // Delivery Address State
  const [deliveryAddressId, setDeliveryAddressId] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDistrict, setDeliveryDistrict] = useState("Kochi");
  const [deliveryState, setDeliveryState] = useState("Kerala");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("India");

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Dates
  const [commitDate, setCommitDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [orderType, setOrderType] = useState("Online");

  // Projects list
  const [projects, setProjects] = useState<any[]>([]);

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Not Paid");
  const [paymentType, setPaymentType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isQuotation, setIsQuotation] = useState(false);

  // Initial API Data
  useEffect(() => {
    getDeliveryTypes().then(setDeliveryTypes).catch(console.error);
    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
    getOrderDepartments().then(setDepartments).catch(console.error);
    searchCustomersByMobile().then(setCustomers).catch(console.error);
    getSalesAccounts().then(setAccounts).catch(console.error);
  }, []);

  // Fetch Existing Order Data
  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      getOrderById(orderId)
        .then((data) => {
          if (!data) return;
          setCustomerId(data.customer_id || 0);
          setCustomerName(data.customer_name || "");
          setMobileSearch(data.customer_mobile_number || "");
          setWhatsappNumber(data.customer_whatsapp_number || data.customer_mobile_number || "");
          setRequirements(data.remarks || "");
          setDeliveryTypeId(data.delivery_type_id || 1);
          setPriceCategoryId(data.product_price_category_id || 4);
          setAccountId(data.account_id || 0);
          setCommitDate(data.commit_date || data.order_date || "");
          setCompletionDate(data.completion_date || "");
          setOrderType(data.order_type || "Online");

          const discountVal = Number(data.discount_amount) > 0
            ? Number(data.discount_amount)
            : Math.max(0, Number(data.total_amount || 0) - Number(data.final_amount || 0));
          setDiscount(discountVal);

          setPaidAmount(data.paid_amount || 0);
          setRemarks(data.remarks || "");
          setPaymentStatus(data.payment_status || "Not Paid");
          setPaymentType(data.payment_type || "");
          setIsQuotation(data.is_quotation || false);

          if (data.billing_address) {
            setBillingAddressId(data.billing_address.id || 0);
            setBillingAddress(data.billing_address.address_line_1 || "");
            setBillingDistrict(data.billing_address.district || "Kochi");
            setBillingState(data.billing_address.state || "Kerala");
            setBillingPincode(data.billing_address.pincode || "");
            setBillingCountry(data.billing_address.country || "India");
          }

          if (data.shipping_address) {
            setDeliveryAddressId(data.shipping_address.id || 0);
            setDeliveryAddress(data.shipping_address.address_line_1 || "");
            setDeliveryDistrict(data.shipping_address.district || "Kochi");
            setDeliveryState(data.shipping_address.state || "Kerala");
            setDeliveryPincode(data.shipping_address.pincode || "");
            setDeliveryCountry(data.shipping_address.country || "India");
          }

          const mappedProjects = (data.projects || []).map((proj: any) => ({
            id: proj.id,
            product_id: proj.product_id || 1,
            quantity: proj.quantity || 1,
            unit_price: proj.unit_price || 0,
            amount: proj.amount || 0,
            additional_amount: proj.additional_amount || 0,
            project_name: proj.project_name || "",
            description: proj.description || "Standard Specification",
            status: proj.status || "Created",
            design_date: proj.design_date || null,
            printing_date: proj.printing_date || null,
            completed_date: null,
            department_ids: proj.departments ? proj.departments.map((d: any) => d.department_id) : [],
            project_images: proj.project_images || [],
            is_locked: true,
          }));
          setProjects(mappedProjects);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [orderId]);

  useEffect(() => {
    if (priceCategoryId && selectedCategory) {
      getProductPricesByCat(priceCategoryId, selectedCategory.id)
        .then((data) => setAutocompleteProducts(data.products || []))
        .catch(console.error);
    }
  }, [priceCategoryId, selectedCategory]);

  // Sync Same as Mobile
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileSearch);
    }
  }, [sameAsMobile, mobileSearch]);

  // Sync Same as Billing
  useEffect(() => {
    if (sameAsBilling) {
      setDeliveryAddress(billingAddress);
      setDeliveryDistrict(billingDistrict);
      setDeliveryState(billingState);
      setDeliveryPincode(billingPincode);
      setDeliveryCountry(billingCountry);
    }
  }, [
    sameAsBilling,
    billingAddress,
    billingDistrict,
    billingState,
    billingPincode,
    billingCountry,
  ]);

  const handleSelectCustomer = async (id: number) => {
    try {
      const data = await getCustomerDetails(id);
      setCustomerId(data.id);
      setCustomerName(data.customer_name);
      setMobileSearch(data.mobile_number);
      if (sameAsMobile) {
        setWhatsappNumber(data.mobile_number);
      } else {
        setWhatsappNumber(data.whatsapp_number || data.mobile_number);
      }
      setRequirements(data.requirements || "");

      if (data.billing_address) {
        setBillingAddressId(data.billing_address.id || 0);
        setBillingAddress(data.billing_address.address_line_1 || "");
        setBillingDistrict(data.billing_address.district || "Kochi");
        setBillingState(data.billing_address.state || "Kerala");
        setBillingPincode(data.billing_address.pincode || "");
        setBillingCountry(data.billing_address.country || "India");
      }

      if (data.shipping_address) {
        setDeliveryAddressId(data.shipping_address.id || 0);
        setDeliveryAddress(data.shipping_address.address_line_1 || "");
        setDeliveryDistrict(data.shipping_address.district || "Kochi");
        setDeliveryState(data.shipping_address.state || "Kerala");
        setDeliveryPincode(data.shipping_address.pincode || "");
        setDeliveryCountry(data.shipping_address.country || "India");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProjectField = (idx: number, field: string, value: any) => {
    setProjects((prev) =>
      prev.map((proj, i) => {
        if (i !== idx) return proj;
        const updated = { ...proj, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          const q = Number(updated.quantity) || 0;
          const p = Number(updated.unit_price) || 0;
          updated.amount = q * p;
        }
        return updated;
      })
    );
  };

  const handleAddProjectRow = () => {
    setProjects([
      ...projects,
      {
        product_id: 1,
        quantity: 1,
        unit_price: 0,
        amount: 0,
        additional_amount: 0,
        project_name: "",
        description: "Standard Specification",
        status: "Created",
        design_date: null,
        printing_date: null,
        completed_date: null,
        department_ids: [],
        is_locked: false,
      },
    ]);
  };

  const handleRemoveProjectRow = (idx: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== idx));
    }
  };

  const totalAmount = projects.reduce(
    (sum, p) => sum + p.quantity * p.unit_price + (p.additional_amount || 0),
    0
  );
  const finalAmount = Math.max(0, totalAmount - discount);
  const balanceAmount = Math.max(0, finalAmount - paidAmount);
  const totalUnits = projects.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const handleValidateForm = (): boolean => {
    if (!customerName.trim()) { alert("Please enter Customer Name!"); return false; }
    if (!mobileSearch.trim()) { alert("Please enter Mobile Number!"); return false; }
    if (!whatsappNumber.trim()) { alert("Please enter WhatsApp Number!"); return false; }
    if (!billingAddress.trim()) { alert("Please enter Billing Address!"); return false; }
    if (!deliveryAddress.trim()) { alert("Please enter Delivery Address!"); return false; }
    const getTodayString = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const todayStr = getTodayString();
    if (!commitDate) { alert("Please select a Commit Date!"); return false; }
    if (commitDate !== todayStr) { alert(`Commit Date must be today (${todayStr})!`); return false; }
    if (!isQuotation && !completionDate) { alert("Please select a Completion Date!"); return false; }
    if (!orderType) { alert("Please select an Order Type!"); return false; }
    if (!priceCategoryId) { alert("Please select a Customer Category!"); return false; }
    if (!deliveryTypeId) { alert("Please select a Delivery Type!"); return false; }
    if (!isQuotation && !paymentType) { alert("Please select a Payment Type!"); return false; }
    if (!isQuotation && (!accountId || accountId === 0)) { alert("Please select an Account!"); return false; }

    if (projects.length === 0) { alert("Please add at least one product to the list!"); return false; }

    const designDept = departments.find((d) => d.department_name.toLowerCase() === "designing");
    const printDept = departments.find((d) => d.department_name.toLowerCase() === "printing");
    const designDeptId = designDept?.id || 1;
    const printDeptId = printDept?.id || 2;

    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      const rowNum = i + 1;

      if (!proj.project_name.trim()) { alert(`Please enter/select a Product Name in Row #${rowNum}!`); return false; }
      if (proj.quantity <= 0) { alert(`Quantity must be 1 or more in Row #${rowNum}!`); return false; }
      if (proj.unit_price <= 0) { alert(`Selling Price must be greater than ₹0 in Row #${rowNum}!`); return false; }

      if (proj.department_ids && proj.department_ids.includes(designDeptId)) {
        if (!proj.design_date) {
          alert(`Please select a Design Date in Row #${rowNum}!`);
          return false;
        }
      }

      if (proj.department_ids && proj.department_ids.includes(printDeptId)) {
        if (!proj.printing_date) {
          alert(`Please select a Printing Date in Row #${rowNum}!`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!handleValidateForm()) return;

    const designDept = departments.find((d) => d.department_name.toLowerCase() === "designing");
    const printDept = departments.find((d) => d.department_name.toLowerCase() === "printing");
    const designDeptId = designDept?.id || 1;
    const printDeptId = printDept?.id || 2;

    const projects_payload = projects.map(({ is_locked, ...rest }) => {
      const designSelected = rest.department_ids.includes(designDeptId);
      const printSelected = rest.department_ids.includes(printDeptId);
      return {
        ...rest,
        status: rest.status || "Created",
        quantity: Number(rest.quantity) || 1,
        unit_price: Number(rest.unit_price) || 0,
        amount: Number(rest.quantity) * Number(rest.unit_price) + Number(rest.additional_amount || 0),
        design_date: designSelected && rest.design_date ? rest.design_date : null,
        printing_date: printSelected && rest.printing_date ? rest.printing_date : null,
        completed_date: null,
      };
    });

    const computedPaymentStatus = isQuotation
      ? "Not Paid"
      : paidAmount === 0
        ? "Not Paid"
        : paidAmount >= finalAmount
          ? "Paid"
          : "Partial";

    const payload: CreateOrderPayload = {
      customer_id: customerId,
      ...(customerId === 0 && {
        customer: {
          customer_name: customerName,
          mobile_number: mobileSearch,
          whatsapp_number: whatsappNumber,
          requirements: requirements || "",
          status: "Active",
        },
      }),

      billing_address_id: billingAddressId,
      ...(billingAddressId === 0 && {
        billing_address: {
          address_type: "Billing",
          address_line_1: billingAddress,
          address_line_2: billingAddress,
          district: billingDistrict,
          state: billingState,
          country: billingCountry,
          pincode: billingPincode,
          is_default: true,
        },
      }),

      delivery_address_id: deliveryAddressId,
      ...(deliveryAddressId === 0 && {
        delivery_address: {
          address_type: "Delivery",
          address_line_1: deliveryAddress,
          address_line_2: deliveryAddress,
          district: deliveryDistrict,
          state: deliveryState,
          country: deliveryCountry,
          pincode: deliveryPincode,
          is_default: true,
        },
      }),

      delivery_type_id: deliveryTypeId,
      expected_delivery_days: null,

      order_date: commitDate,
      commit_date: commitDate,

      design_date: null,
      print_date: null,
      completion_date: isQuotation ? null : completionDate,

      total_orders: 0,

      discount_amount: Number(discount) || 0,
      final_amount: finalAmount,
      paid_amount: isQuotation ? 0 : Number(paidAmount) || 0,
      balance_amount: isQuotation ? finalAmount : balanceAmount,
      total_amount: totalAmount,
      total_units: totalUnits,

      payment_status: computedPaymentStatus as any,
      is_quotation: isQuotation,
      order_status: isQuotation ? "Draft" : "Confirmed",

      remarks: remarks.trim() || "",
      order_type: orderType,
      product_price_category_id: priceCategoryId,
      account_id: isQuotation ? 1 : accountId,
      payment_type: isQuotation ? "Cash" : paymentType,
      category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
      projects: projects_payload,
    };

    try {
      if (isQuotation) {
        // 🌟 Edit Quotation (PUT /sales/quotations/{id})
        await updateSalesQuotation(orderId, payload);
        alert("Quotation updated successfully!");
        router.push("/sales/list-quotation");
      } else {
        // 🌟 Edit Normal Order (PUT /sales/orders/{id})
        await updateSalesOrder(orderId, payload);
        alert("Order updated successfully!");
        router.push("/sales/orders");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Error updating specifications");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold">
        Loading existing specifications...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className="flex items-center gap-3">
          <Link
            href={isQuotation ? "/sales/list-quotation" : "/sales/orders"}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className={styles.title}>
              {isQuotation ? "Edit Price Quotation" : "Edit Sales Order"}
            </h1>
            <p className={styles.subtitle}>
              {isQuotation
                ? "Update price quotation specs and client terms."
                : "Update active order specifications and production routes."}
            </p>
          </div>
        </div>
      </div>

      <CustomerScheduleForm
        mobileSearch={mobileSearch} setMobileSearch={setMobileSearch}
        customerName={customerName} setCustomerName={setCustomerName}
        whatsappNumber={whatsappNumber} setWhatsappNumber={setWhatsappNumber}
        sameAsMobile={sameAsMobile} setSameAsMobile={setSameAsMobile}

        billingAddress={billingAddress} setBillingAddress={setBillingAddress}
        billingDistrict={billingDistrict} setBillingDistrict={setBillingDistrict}
        billingState={billingState} setBillingState={setBillingState}
        billingPincode={billingPincode} setBillingPincode={setBillingPincode}
        billingCountry={billingCountry} setBillingCountry={setBillingCountry}

        deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress}
        deliveryDistrict={deliveryDistrict} setDeliveryDistrict={setDeliveryDistrict}
        deliveryState={deliveryState} setDeliveryState={setDeliveryState}
        deliveryPincode={deliveryPincode} setDeliveryPincode={setDeliveryPincode}
        deliveryCountry={deliveryCountry} setDeliveryCountry={setDeliveryCountry}

        sameAsBilling={sameAsBilling} setSameAsBilling={setSameAsBilling}

        deliveryTypeId={deliveryTypeId} setDeliveryTypeId={setDeliveryTypeId}
        priceCategoryId={priceCategoryId} setPriceCategoryId={setPriceCategoryId}
        commitDate={commitDate} setCommitDate={setCommitDate}
        completionDate={completionDate} setCompletionDate={setCompletionDate}
        hideCompletionDate={isQuotation}
        orderType={orderType} setOrderType={setOrderType}
        customers={customers}
        deliveryTypes={deliveryTypes}
        priceCategories={priceCategories}
        onSelectCustomer={handleSelectCustomer}
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

      {isQuotation ? (
        <div className={styles.bottomGrid}>
          <div className={styles.notesCard}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Remarks / Notes
            </div>
            <textarea
              placeholder="Special terms, validity notes or customer instructions..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={styles.textarea}
              rows={5}
            />
          </div>

          <div className={styles.billingCard}>
            <div className={styles.billRow}>
              <span>Sub Total</span>
              <strong>₹{totalAmount.toLocaleString("en-IN")}.00</strong>
            </div>
            <div className={styles.billRow}>
              <span>Discount (₹)</span>
              <input
                type="number"
                className={styles.billInput}
                value={discount || ""}
                min="0"
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className={`${styles.billRow} ${styles.borderTop}`}>
              <span>Final Amount</span>
              <strong className="text-indigo-600 text-lg">
                ₹{finalAmount.toLocaleString("en-IN")}.00
              </strong>
            </div>
          </div>
        </div>
      ) : (
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
      )}

      <div className={styles.stickyBar}>
        <Button
          type="button"
          onClick={handleSubmitOrder}
          className={styles.submitBtn}
          style={{ cursor: "pointer" }}
        >
          <CheckSquare size={16} /> {isQuotation ? "UPDATE QUOTATION" : "UPDATE ORDER"}
        </Button>
      </div>
    </div>
  );
}