"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckSquare, RotateCcw, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { CATEGORY_IDS } from "@/constants/categories";
import { useSalesStore } from "@/store/salesStore";
import CustomerScheduleForm, { formatE164 } from "../components/CustomerScheduleForm";
import OrderPreviewModal from "../components/OrderPreviewModal";
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
  getOrderPaymentDetails,
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

const normalizePaymentType = (type?: string | null): string => {
  if (!type) return "";
  const t = type.trim();
  const lower = t.toLowerCase();
  if (lower === "cash") return "Cash";
  if (lower === "upi") return "UPI";
  if (lower === "card" || lower === "credit/debit card" || lower === "credit card" || lower === "debit card") return "Credit/Debit Card";
  if (lower === "bank transfer" || lower === "transfer" || lower === "bank") return "Bank Transfer";
  if (lower === "cheque" || lower === "check") return "Cheque";
  return t;
};

function CreateOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");       // Mode 1: Edit Normal Order 🌟
  const quotationIdParam = searchParams.get("quotation_id"); // Mode 2: Convert Quotation 🌟

  const isEditMode = Boolean(orderIdParam);
  const isConversionMode = Boolean(quotationIdParam && !isEditMode);

  const { selectedCategory } = useSalesStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [loadedCustomerMobile, setLoadedCustomerMobile] = useState("");
  const [loadedCustomerName, setLoadedCustomerName] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
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
  const [billingCountry, setBillingCountry] = useState("India");

  // Delivery Address State
  const [deliveryAddressId, setDeliveryAddressId] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("India");

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Dates
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const getMinCommitDateString = () => {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysPrior = dayOfWeek === 1 ? 2 : 1;
    d.setDate(d.getDate() - daysPrior);
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
      department_ids: [4],
      is_locked: false,
      image_code: "",
      image_code_id: 0,
      image_code_status: false,
      image_name: "",
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
    getOrderDepartments()
      .then((deptList) => {
        setDepartments(deptList || []);
        const logisticsDept = (deptList || []).find(
          (d) => d.department_name.toLowerCase() === "logistics" || d.id === 4
        );
        const logisticsId = logisticsDept?.id || 4;
        setProjects((prev) =>
          prev.map((p) => {
            const currentDepts = p.department_ids || [];
            if (!currentDepts.includes(logisticsId)) {
              return { ...p, department_ids: [...currentDepts, logisticsId] };
            }
            return p;
          })
        );
      })
      .catch(console.error);
    getSalesAccounts()
      .then((accs) => {
        setAccounts(accs || []);
      })
      .catch(console.error);
  }, [orderIdParam, quotationIdParam]);

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
            if (data.order_number) setOrderNumber(data.order_number);
            setCustomerName(data.customer_name || "");
            setLoadedCustomerName(data.customer_name || "");
            setMobileSearch(data.customer_mobile_number || "");
            setLoadedCustomerMobile(data.customer_mobile_number || "");
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
            const loadedPriceCatId = data.product_price_category_id || data.price_category_id || data.price_category?.id;
            if (loadedPriceCatId) setPriceCategoryId(Number(loadedPriceCatId));
            if (isEditMode && data.account_id) setAccountId(data.account_id);
            if (data.order_type) setOrderType(data.order_type);
            if (data.order_date || data.commit_date) setCommitDate(data.order_date || data.commit_date);
            if (data.completion_date) setCompletionDate(data.completion_date);
            if (data.remarks) setRemarks(data.remarks);
            if (isEditMode && data.paid_amount !== undefined) setPaidAmount(Number(data.paid_amount) || 0);
            if (data.payment_status) setPaymentStatus(data.payment_status);

            if (isEditMode) {
              const initialPaymentType = normalizePaymentType(data.payment_type);
              if (initialPaymentType) {
                setPaymentType(initialPaymentType);
              } else {
                getOrderPaymentDetails(parsedId)
                  .then((payData) => {
                    const fetchedType = normalizePaymentType(payData?.payment_type);
                    if (fetchedType) {
                      setPaymentType(fetchedType);
                    } else {
                      const fallback = data.account_name?.toLowerCase().includes("cash") ? "Cash" : "UPI";
                      setPaymentType(fallback);
                    }
                  })
                  .catch(() => {
                    const fallback = data.account_name?.toLowerCase().includes("cash") ? "Cash" : "UPI";
                    setPaymentType(fallback);
                  });
              }
            }

            const discountVal = Number(data.discount_amount) > 0
              ? Number(data.discount_amount)
              : Math.max(0, Number(data.total_amount || 0) - Number(data.final_amount || 0));
            setDiscount(discountVal);

            if (data.projects && data.projects.length > 0) {
              setProjects(
                data.projects.map((p: any) => {
                  const rawDepts = p.departments?.map((d: any) => d.department_id || d.id) || [];
                  const withLogistics = rawDepts.includes(4) ? rawDepts : [...rawDepts, 4];
                  return {
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
                    department_ids: withLogistics,
                    project_images: p.project_images?.map((img: any) => ({
                      img_url: img.img_url,
                      platform_name: img.platform_name || "Cloudinary",
                      status: true,
                    })) || [],
                    image_code_id: p.image_code_id || 0,
                    image_code_status: p.image_code_status || Boolean(p.image_code_id && p.image_code_id > 0),
                    image_code: p.image_code || "",
                    image_name: p.image_name || "",
                    is_locked: true,
                  };
                })
              );
            }
          })
          .catch(console.error);
      }
    }
  }, [orderIdParam, quotationIdParam, isEditMode, isConversionMode]);

  // Fallback paymentType once accounts load if still empty in edit mode
  useEffect(() => {
    if (isEditMode && accounts.length > 0 && accountId && !paymentType) {
      const acc = accounts.find((a) => a.id === accountId);
      const isCash = (acc?.account_name || "").toLowerCase().includes("cash");
      setPaymentType(isCash ? "Cash" : "UPI");
    }
  }, [isEditMode, accounts, accountId, paymentType]);

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

  // Clear Form Handler
  const handleClearForm = (showNotice = true) => {
    setCustomerId(0);
    setLoadedCustomerMobile("");
    setLoadedCustomerName("");
    setMobileSearch("");
    setCustomerName("");
    setWhatsappNumber("");
    setSameAsMobile(false);
    setRequirements("");

    setBillingAddressId(0);
    setBillingAddress("");
    setBillingDistrict("");
    setBillingState("");
    setBillingPincode("");
    setBillingCountry("India");

    setDeliveryAddressId(0);
    setDeliveryAddress("");
    setDeliveryDistrict("");
    setDeliveryState("");
    setDeliveryPincode("");
    setDeliveryCountry("India");
    setSameAsBilling(false);

    setCommitDate(getTodayString());
    setCompletionDate("");
    setOrderType("Online");

    setDiscount(0);
    setPaidAmount(0);
    setRemarks("");
    setPaymentStatus("Not Paid");
    setPaymentType("");
    setAccountId(0);

    const logisticsDept = departments.find(
      (d) => d.department_name.toLowerCase() === "logistics" || d.id === 4
    );
    const defaultDepts = logisticsDept ? [logisticsDept.id] : [4];

    setProjects([
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
        department_ids: defaultDepts,
        is_locked: false,
      },
    ]);

    try {
      localStorage.removeItem("AMAZEDS_CREATE_ORDER_DRAFT");
    } catch (e) {
      console.error("Error clearing draft:", e);
    }

    if (showNotice) {
      alert("Order form has been cleared.");
    }
  };

  // Restore Draft from LocalStorage on mount (when not in edit mode)
  useEffect(() => {
    if (isEditMode || isConversionMode) return;
    try {
      const saved = localStorage.getItem("AMAZEDS_CREATE_ORDER_DRAFT");
      if (saved) {
        const data = JSON.parse(saved);
        if (data) {
          if (data.customerId) setCustomerId(data.customerId);
          if (data.mobileSearch) setMobileSearch(data.mobileSearch);
          if (data.customerName) setCustomerName(data.customerName);
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (data.sameAsMobile !== undefined) setSameAsMobile(data.sameAsMobile);
          if (data.requirements) setRequirements(data.requirements);

          if (data.billingAddressId !== undefined) setBillingAddressId(data.billingAddressId);
          if (data.billingAddress) setBillingAddress(data.billingAddress);
          if (data.billingDistrict) setBillingDistrict(data.billingDistrict);
          if (data.billingState) setBillingState(data.billingState);
          if (data.billingPincode) setBillingPincode(data.billingPincode);
          if (data.billingCountry) setBillingCountry(data.billingCountry);

          if (data.deliveryAddressId !== undefined) setDeliveryAddressId(data.deliveryAddressId);
          if (data.deliveryAddress) setDeliveryAddress(data.deliveryAddress);
          if (data.deliveryDistrict) setDeliveryDistrict(data.deliveryDistrict);
          if (data.deliveryState) setDeliveryState(data.deliveryState);
          if (data.deliveryPincode) setDeliveryPincode(data.deliveryPincode);
          if (data.deliveryCountry) setDeliveryCountry(data.deliveryCountry);
          if (data.sameAsBilling !== undefined) setSameAsBilling(data.sameAsBilling);

          if (data.deliveryTypeId) setDeliveryTypeId(data.deliveryTypeId);
          if (data.priceCategoryId) setPriceCategoryId(data.priceCategoryId);
          if (data.accountId) setAccountId(data.accountId);

          if (data.commitDate) setCommitDate(data.commitDate);
          if (data.completionDate) setCompletionDate(data.completionDate);
          if (data.orderType) setOrderType(data.orderType);

          if (Array.isArray(data.projects) && data.projects.length > 0) {
            setProjects(
              data.projects.map((p: any) => {
                const currentDepts = p.department_ids || [];
                return {
                  ...p,
                  department_ids: currentDepts.includes(4) ? currentDepts : [...currentDepts, 4],
                };
              })
            );
          }
          if (data.discount !== undefined) setDiscount(data.discount);
          if (data.paidAmount !== undefined) setPaidAmount(data.paidAmount);
          if (data.remarks) setRemarks(data.remarks);
          if (data.paymentStatus) setPaymentStatus(data.paymentStatus);
          if (data.paymentType) setPaymentType(data.paymentType);
        }
      }
    } catch (e) {
      console.error("Error restoring order draft:", e);
    }
  }, [isEditMode, isConversionMode]);

  // Auto-save draft to LocalStorage when user types/changes form data
  useEffect(() => {
    if (isEditMode || isConversionMode) return;
    const draftData = {
      customerId,
      mobileSearch,
      customerName,
      whatsappNumber,
      sameAsMobile,
      requirements,
      billingAddressId,
      billingAddress,
      billingDistrict,
      billingState,
      billingPincode,
      billingCountry,
      deliveryAddressId,
      deliveryAddress,
      deliveryDistrict,
      deliveryState,
      deliveryPincode,
      deliveryCountry,
      sameAsBilling,
      deliveryTypeId,
      priceCategoryId,
      accountId,
      commitDate,
      completionDate,
      orderType,
      projects,
      discount,
      paidAmount,
      remarks,
      paymentStatus,
      paymentType,
    };

    const timer = setTimeout(() => {
      try {
        localStorage.setItem("AMAZEDS_CREATE_ORDER_DRAFT", JSON.stringify(draftData));
      } catch (e) {
        console.error("Failed to save order draft:", e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    isEditMode,
    isConversionMode,
    customerId,
    mobileSearch,
    customerName,
    whatsappNumber,
    sameAsMobile,
    requirements,
    billingAddressId,
    billingAddress,
    billingDistrict,
    billingState,
    billingPincode,
    billingCountry,
    deliveryAddressId,
    deliveryAddress,
    deliveryDistrict,
    deliveryState,
    deliveryPincode,
    deliveryCountry,
    sameAsBilling,
    deliveryTypeId,
    priceCategoryId,
    accountId,
    commitDate,
    completionDate,
    orderType,
    projects,
    discount,
    paidAmount,
    remarks,
    paymentStatus,
    paymentType,
  ]);

  const handleSelectCustomer = async (id: number) => {
    try {
      const data = await getCustomerDetails(id);
      setCustomerId(data.id);
      setCustomerName(data.customer_name);
      setLoadedCustomerName(data.customer_name);
      const formattedMobile = formatE164(data.mobile_number);
      setMobileSearch(formattedMobile);
      setLoadedCustomerMobile(formattedMobile);

      if (sameAsMobile) {
        setWhatsappNumber(formattedMobile);
      } else {
        setWhatsappNumber(data.whatsapp_number || formattedMobile);
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

  // Safely handle mobile input changes: automatically unlinks DB customer if staff edits phone number
  const handleMobileChange = (val: string) => {
    setMobileSearch(val);
    if (customerId > 0) {
      const cleanNew = (val || "").replace(/\D/g, "");
      const cleanOld = (loadedCustomerMobile || "").replace(/\D/g, "");
      if (cleanNew !== cleanOld) {
        setCustomerId(0);
        setBillingAddressId(0);
        setDeliveryAddressId(0);
        setLoadedCustomerMobile("");
        setLoadedCustomerName("");
      }
    }
  };

  // Safely handle customer name changes: unlinks DB customer if staff changes name
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (
      customerId > 0 &&
      loadedCustomerName &&
      val.trim().toLowerCase() !== loadedCustomerName.trim().toLowerCase()
    ) {
      setCustomerId(0);
      setBillingAddressId(0);
      setDeliveryAddressId(0);
      setLoadedCustomerMobile("");
      setLoadedCustomerName("");
    }
  };

  // Explicit unlink customer action
  const handleUnlinkCustomer = () => {
    setCustomerId(0);
    setBillingAddressId(0);
    setDeliveryAddressId(0);
    setLoadedCustomerMobile("");
    setLoadedCustomerName("");
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
    const logisticsDept = departments.find(
      (d) => d.department_name.toLowerCase() === "logistics" || d.id === 4
    );
    const defaultDepts = logisticsDept ? [logisticsDept.id] : [4];

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
        department_ids: defaultDepts,
        is_locked: false,
        image_code: "",
        image_code_id: 0,
        image_code_status: false,
        image_name: "",
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
    if (!commitDate) { alert("Please select a Commit Date (Order Date)!"); return false; }
    const todayStr = getTodayString();
    if (!isEditMode) {
      const minDateStr = getMinCommitDateString();
      const isMonday = new Date().getDay() === 1;
      if (commitDate < minDateStr || commitDate > todayStr) {
        if (isMonday) {
          alert(`On Mondays, Commit Date can only be between ${minDateStr} (2 days prior) and today (${todayStr})!`);
        } else {
          alert(`Commit Date can only be between ${minDateStr} (yesterday) and today (${todayStr})!`);
        }
        return false;
      }
    }
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

  const handleInitiateSubmit = () => {
    if (isSubmitting) return;
    if (!handleValidateForm()) return;
    setShowPreviewModal(true);
  };

  const handleFinalSubmitOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
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
        image_code_status: Boolean(rest.image_code_id && rest.image_code_id > 0),
        image_code_id: Number(rest.image_code_id) || 0,
      };
    });

    const computedPaymentStatus =
      paidAmount === 0 ? "Not Paid" : paidAmount >= finalAmount ? "Paid" : "Partial";

    const payload: CreateOrderPayload = {
      ...(orderNumber ? { order_number: orderNumber } : {}),
      customer_id: customerId,
      customer: {
        customer_name: customerName.trim(),
        mobile_number: mobileSearch.trim(),
        whatsapp_number: whatsappNumber.trim() || mobileSearch.trim(),
        requirements: requirements || "",
        status: "Active",
      },

      billing_address_id: billingAddressId,
      billing_address: {
        address_type: "Billing",
        address_line_1: billingAddress.trim() || "Address Line 1",
        address_line_2: billingAddress.trim() || "Address Line 2",
        district: billingDistrict.trim() || "Kochi",
        city: billingDistrict.trim() || "Kochi",
        state: billingState.trim() || "Kerala",
        country: billingCountry.trim() || "India",
        pincode: billingPincode.trim() || "682001",
        is_default: true,
      },

      delivery_address_id: deliveryAddressId,
      delivery_address: {
        address_type: "Delivery",
        address_line_1: deliveryAddress.trim() || "Address Line 1",
        address_line_2: deliveryAddress.trim() || "Address Line 2",
        district: deliveryDistrict.trim() || "Kochi",
        city: deliveryDistrict.trim() || "Kochi",
        state: deliveryState.trim() || "Kerala",
        country: deliveryCountry.trim() || "India",
        pincode: deliveryPincode.trim() || "682001",
        is_default: true,
      },

      delivery_type_id: deliveryTypeId,
      expected_delivery_days: 0,

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
      try {
        localStorage.removeItem("AMAZEDS_CREATE_ORDER_DRAFT");
      } catch (e) {}

      setShowPreviewModal(false);

      if (isConversionMode) {
        router.push("/sales/list-quotation");
      } else {
        router.push("/sales/orders");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Error submitting order request");
      setIsSubmitting(false);
    }
  };

    return (
      <div className={styles.container}>
        <CustomerScheduleForm
          mobileSearch={mobileSearch} setMobileSearch={handleMobileChange}
          customerName={customerName} setCustomerName={handleCustomerNameChange}
          customerId={customerId}
          onUnlinkCustomer={handleUnlinkCustomer}
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
          disablePriceCategory={isEditMode}
          commitDate={commitDate} setCommitDate={setCommitDate}
          disableCommitDate={isEditMode}
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
          readOnly={isEditMode}
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
          disableAccount={isEditMode}
          readOnly={isEditMode}
        />

        {/* Sticky bottom action bar */}
        <div className={styles.stickyBar}>
          <div className="flex w-full gap-3 justify-end items-center">
            {!isEditMode && (
              <button
                type="button"
                onClick={() => handleClearForm(true)}
                disabled={isSubmitting}
                className="flex items-center justify-center font-bold px-4 py-[9px] gap-1.5 rounded-lg cursor-pointer transition-colors bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 disabled:opacity-50 disabled:pointer-events-none"
                title="Clear all form fields"
              >
                <RotateCcw size={15} />
                <span>CLEAR FORM</span>
              </button>
            )}

            <Button
              type="button"
              onClick={handleInitiateSubmit}
              disabled={isSubmitting}
              className={styles.submitBtn}
              style={{ cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEditMode ? "UPDATING ORDER..." : "SUBMITTING ORDER..."}</span>
                </>
              ) : (
                <>
                  <CheckSquare size={16} />
                  <span>{isEditMode ? "REVIEW & UPDATE ORDER" : "REVIEW & SUBMIT ORDER"}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Order Preview & Confirmation Modal */}
        <OrderPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleFinalSubmitOrder}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          customerId={customerId}
          customerName={customerName}
          mobileSearch={mobileSearch}
          whatsappNumber={whatsappNumber}
          billingAddress={billingAddress}
          billingDistrict={billingDistrict}
          billingState={billingState}
          billingPincode={billingPincode}
          deliveryAddress={deliveryAddress}
          deliveryDistrict={deliveryDistrict}
          deliveryState={deliveryState}
          deliveryPincode={deliveryPincode}
          sameAsBilling={sameAsBilling}
          commitDate={commitDate}
          completionDate={completionDate}
          deliveryTypeName={deliveryTypes.find((d) => d.id === deliveryTypeId)?.name || "Standard Delivery"}
          orderType={orderType}
          projects={projects}
          departments={departments}
          totalAmount={totalAmount}
          discount={discount}
          finalAmount={finalAmount}
          paidAmount={paidAmount}
          paymentType={paymentType}
          accountName={accounts.find((a) => a.id === accountId)?.account_name || "Not Selected"}
          remarks={remarks}
        />
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