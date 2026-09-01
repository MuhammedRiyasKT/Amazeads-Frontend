"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { CATEGORY_IDS } from "@/constants/categories";
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
  createSalesOrder,
  updateSalesOrder,
  updateSalesQuotation,
  getSalesAccounts,
  getOrderById,
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

function CreateOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");       // Mode 1: Edit Normal Order 🌟
  const quotationIdParam = searchParams.get("quotation_id"); // Mode 2: Convert Quotation 🌟

  const isEditMode = Boolean(orderIdParam);
  const isConversionMode = Boolean(quotationIdParam && !isEditMode);

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
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  // Delivery Address State
  const [deliveryAddressId, setDeliveryAddressId] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Dates
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [commitDate, setCommitDate] = useState(getTodayString());
  const [completionDate, setCompletionDate] = useState("");
  const [orderType, setOrderType] = useState("Online");

  // Projects List
  const [projects, setProjects] = useState<any[]>([
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

  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Not Paid");
  const [paymentType, setPaymentType] = useState("");

  // Backend Data Initialization
  useEffect(() => {
    searchCustomersByMobile().then(setCustomers).catch(console.error);
    getDeliveryTypes()
      .then((types) => {
        setDeliveryTypes(types || []);
        if (types && types.length > 0) {
          setDeliveryTypeId(types[0].id);
        }
      })
      .catch(console.error);

    getSalesPriceCategories().then(setPriceCategories).catch(console.error);
    getOrderDepartments().then(setDepartments).catch(console.error);
    getSalesAccounts()
      .then((accs) => {
        setAccounts(accs || []);
        if (accs && accs.length > 0) {
          setAccountId(accs[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // 🌟 Prefill Effect: Supports Edit Mode (`order_id`) and Conversion Mode (`quotation_id`)
  useEffect(() => {
    const targetId = orderIdParam || quotationIdParam;
    if (targetId) {
      const parsedId = parseInt(targetId);
      if (parsedId) {
        getOrderById(parsedId)
          .then((data) => {
            if (!data) return;
            setCustomerId(data.customer_id || 0);
            setCustomerName(data.customer_name || "");
            setMobileSearch(data.customer_mobile_number || "");
            setWhatsappNumber(data.customer_whatsapp_number || data.customer_mobile_number || "");

            if (data.billing_address) {
              setBillingAddressId((isEditMode || isConversionMode) ? data.billing_address.id || 0 : 0);
              setBillingAddress(data.billing_address.address_line_1 || "");
              setBillingDistrict(data.billing_address.district || "Kochi");
              setBillingState(data.billing_address.state || "Kerala");
              setBillingPincode(data.billing_address.pincode || "");
              setBillingCountry(data.billing_address.country || "India");
            }

            if (data.shipping_address) {
              setDeliveryAddressId((isEditMode || isConversionMode) ? data.shipping_address.id || 0 : 0);
              setDeliveryAddress(data.shipping_address.address_line_1 || "");
              setDeliveryDistrict(data.shipping_address.district || "Kochi");
              setDeliveryState(data.shipping_address.state || "Kerala");
              setDeliveryPincode(data.shipping_address.pincode || "");
              setDeliveryCountry(data.shipping_address.country || "India");
            }

            if (data.delivery_type_id) setDeliveryTypeId(data.delivery_type_id);
            if (data.product_price_category_id) setPriceCategoryId(data.product_price_category_id);
            if (data.account_id) setAccountId(data.account_id);
            if (data.order_type) setOrderType(data.order_type);
            if (data.commit_date) setCommitDate(data.commit_date);
            if (data.completion_date) setCompletionDate(data.completion_date);
            if (data.remarks) setRemarks(data.remarks);
            if (isEditMode && data.paid_amount) setPaidAmount(data.paid_amount);

            const discountVal = Number(data.discount_amount) > 0
              ? Number(data.discount_amount)
              : Math.max(0, Number(data.total_amount || 0) - Number(data.final_amount || 0));
            setDiscount(discountVal);

            if (data.projects && data.projects.length > 0) {
              setProjects(
                data.projects.map((p: any) => ({
                  ...((isEditMode || isConversionMode) && { id: p.id }), // Only keep project ID when editing existing normal order or converting quotation
                  product_id: p.product_id || 1,
                  quantity: p.quantity || 1,
                  unit_price: p.unit_price || 0,
                  amount: p.amount || 0,
                  additional_amount: p.additional_amount || 0,
                  project_name: p.project_name || "",
                  description: p.description || "Standard Specification",
                  status: "Created",
                  design_date: p.design_date || null,
                  printing_date: p.printing_date || null,
                  completed_date: null,
                  department_ids: p.departments?.map((d: any) => d.department_id) || [],
                  project_images: p.project_images?.map((img: any) => ({
                    img_url: img.img_url,
                    platform_name: img.platform_name || "Cloudinary",
                    status: true,
                  })) || [],
                  is_locked: true,
                }))
              );
            }
          })
          .catch(console.error);
      }
    }
  }, [orderIdParam, quotationIdParam, isEditMode, isConversionMode]);

  // Fetch product suggestions when price category changes
  useEffect(() => {
    if (priceCategoryId && selectedCategory) {
      getProductPricesByCat(priceCategoryId, selectedCategory.id)
        .then((data) => setAutocompleteProducts(data.products || []))
        .catch(console.error);
    }
  }, [priceCategoryId, selectedCategory]);

  // Sync "Same as Mobile"
  useEffect(() => {
    if (sameAsMobile) {
      setWhatsappNumber(mobileSearch);
    }
  }, [sameAsMobile, mobileSearch]);

  // Sync "Same as Billing Address"
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

  // Calculations
  const totalAmount = projects.reduce(
    (sum, p) => sum + p.quantity * p.unit_price + (p.additional_amount || 0),
    0
  );
  const finalAmount = Math.max(0, totalAmount - discount);
  const balanceAmount = Math.max(0, finalAmount - paidAmount);
  const totalUnits = projects.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  // Validation Logic
  const handleValidateForm = (): boolean => {
    if (!customerName.trim()) { alert("Please enter Customer Name!"); return false; }
    if (!mobileSearch.trim()) { alert("Please enter Mobile Number!"); return false; }
    if (!whatsappNumber.trim()) { alert("Please enter WhatsApp Number!"); return false; }
    if (!billingAddress.trim()) { alert("Please enter Billing Address!"); return false; }
    if (!deliveryAddress.trim()) { alert("Please enter Delivery Address!"); return false; }
    const todayStr = getTodayString();
    if (!commitDate) { alert("Please select a Commit Date (Order Date)!"); return false; }
    if (commitDate !== todayStr) { alert(`Commit Date must be today (${todayStr})!`); return false; }
    if (!completionDate) { alert("Please select a Completion Date!"); return false; }
    if (!orderType) { alert("Please select an Order Type!"); return false; }
    if (!priceCategoryId) { alert("Please select a Customer Category!"); return false; }
    if (!deliveryTypeId) { alert("Please select a Delivery Type!"); return false; }
    if (!paymentType) { alert("Please select a Payment Type!"); return false; }
    if (!accountId || accountId === 0) { alert("Please select an Account!"); return false; }

    if (projects.length === 0) { alert("Please add at least one product row!"); return false; }

    const designDept = departments.find((d) => d.department_name.toLowerCase() === "designing");
    const printDept = departments.find((d) => d.department_name.toLowerCase() === "printing");
    const designDeptId = designDept?.id || 1;
    const printDeptId = printDept?.id || 2;

    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      const rowNum = i + 1;

      if (!proj.project_name.trim()) { alert(`Please select/enter Product Name in Row #${rowNum}!`); return false; }
      if (proj.quantity <= 0) { alert(`Quantity must be 1 or more in Row #${rowNum}!`); return false; }
      if (proj.unit_price <= 0) { alert(`Selling Price must be greater than ₹0 in Row #${rowNum}!`); return false; }

      // Validate Designing Date
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

      // Validate Printing Date
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

    if (paidAmount > finalAmount) {
      alert(`Paid Amount (₹${paidAmount}) cannot be greater than Final Amount (₹${finalAmount})`);
      return false;
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
        status: "Created" as const, // 🌟 MUST BE "Created"
        quantity: Number(rest.quantity) || 1,
        unit_price: Number(rest.unit_price) || 0,
        amount: Number(rest.quantity) * Number(rest.unit_price) + Number(rest.additional_amount || 0),
        design_date: designSelected && rest.design_date ? rest.design_date : null,
        printing_date: printSelected && rest.printing_date ? rest.printing_date : null,
        completed_date: null, // 🌟 ALWAYS null
      };
    });

    const computedPaymentStatus =
      paidAmount === 0 ? "Not Paid" : paidAmount >= finalAmount ? "Paid" : "Partial";

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
      completion_date: completionDate,

      total_orders: 0,

      discount_amount: Number(discount) || 0,
      final_amount: finalAmount,
      paid_amount: Number(paidAmount) || 0,
      balance_amount: balanceAmount,
      total_amount: totalAmount,
      total_units: totalUnits,

      payment_status: computedPaymentStatus as any,
      is_quotation: false, // 🌟 ALWAYS FALSE FOR NORMAL ORDERS
      order_status: "Confirmed", // 🌟 ALWAYS CONFIRMED FOR NORMAL ORDERS

      remarks: remarks.trim() || "",
      order_type: orderType,
      product_price_category_id: priceCategoryId,
      account_id: accountId,
      payment_type: paymentType,
      category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
      projects: projects_payload,
    };

    try {
      if (isEditMode && orderIdParam) {
        // 🌟 FLOW 2: Edit Normal Sales Order (PUT /sales/orders/{order_id})
        await updateSalesOrder(parseInt(orderIdParam), payload);
        alert(`Sales Order #${orderIdParam} updated successfully!`);
      } else if (isConversionMode && quotationIdParam) {
        // 🌟 FLOW 5: Convert Quotation (PUT /sales/quotations/{quotation_id} with is_quotation: false)
        await updateSalesQuotation(parseInt(quotationIdParam), payload);
        alert("Quotation converted to Sales Order successfully!");
      } else {
        // 🌟 FLOW 1: Create New Normal Sales Order (POST /sales/orders/)
        await createSalesOrder(payload);
        alert("Sales Order created successfully!");
      }
      if (isConversionMode) {
        router.push("/sales/list-quotation");
      } else {
        router.push("/sales/orders");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Error submitting order request");
    }
  };

  return (
    <div className={styles.container}>
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

      {/* Sticky bottom action bar */}
      <div className={styles.stickyBar}>
        <Button type="button" onClick={handleSubmitOrder} className={styles.submitBtn} style={{ cursor: "pointer" }}>
          <CheckSquare size={16} /> {isEditMode ? "UPDATE ORDER" : "SUBMIT ORDER"}
        </Button>
      </div>
    </div>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading Order Form...</div>}>
      <CreateOrderContent />
    </Suspense>
  );
}