"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckSquare, ArrowLeft, Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { CATEGORY_IDS } from "@/constants/categories";
import { useSalesStore } from "@/store/salesStore";
import CustomerScheduleForm from "../components/CustomerScheduleForm";
import { uploadToCloudinary } from "../services/cloudinary.service";
import {
  searchCustomersByMobile,
  getCustomerDetails,
  getDeliveryTypes,
  getSalesPriceCategories,
  getProductPricesByCat,
  createSalesQuotation,
  updateSalesQuotation,
  getOrderById,
} from "../services/order.service";
import { Address, CreateOrderPayload } from "../types";
import styles from "../components/CreateOrderComponents.module.css";

function CreateQuotationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationIdParam = searchParams.get("quotation_id"); // 🌟 Mode: Edit Quotation (`quotation_id`)
  const isEditMode = Boolean(quotationIdParam);

  const { selectedCategory } = useSalesStore();

  // API Lists
  const [customers, setCustomers] = useState<Array<{ id: number; mobile_number: string }>>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<any[]>([]);
  const [priceCategories, setPriceCategories] = useState<any[]>([]);
  const [autocompleteProducts, setAutocompleteProducts] = useState<any[]>([]);

  // Form states
  const [mobileSearch, setMobileSearch] = useState("");
  const [customerId, setCustomerId] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [deliveryTypeId, setDeliveryTypeId] = useState<number>(0);
  const [priceCategoryId, setPriceCategoryId] = useState<number>(4);

  // Address
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPincode, setBillingPincode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Dates (Only Commit Date kept for Quotation)
  const [commitDate, setCommitDate] = useState("");
  const [orderType, setOrderType] = useState("Online");

  // Products
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
      project_images: [],
      is_locked: false,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [remarks, setRemarks] = useState("");

  // UI state
  const [searchRowIdx, setSearchRowIdx] = useState<number | null>(null);
  const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
  const [uploadingRows, setUploadingRows] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<HTMLTableCellElement>(null);

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

    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setSearchRowIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🌟 Edit Quotation Mode: Prefill quotation data if `quotation_id` param exists
  useEffect(() => {
    if (quotationIdParam) {
      const qId = parseInt(quotationIdParam);
      if (qId) {
        getOrderById(qId)
          .then((quote) => {
            if (!quote) return;
            setCustomerId(quote.customer_id || 0);
            setCustomerName(quote.customer_name || "");
            setMobileSearch(quote.customer_mobile_number || "");
            setWhatsappNumber(quote.customer_whatsapp_number || quote.customer_mobile_number || "");

            if (quote.billing_address) {
              setBillingAddress(quote.billing_address.address_line_1 || "");
              setBillingCity(quote.billing_address.city || "Kochi");
              setBillingState(quote.billing_address.state || "Kerala");
              setBillingPincode(quote.billing_address.pincode || "");
              setBillingCountry(quote.billing_address.country || "India");
            }

            if (quote.shipping_address) {
              setDeliveryAddress(quote.shipping_address.address_line_1 || "");
              setDeliveryCity(quote.shipping_address.city || "Kochi");
              setDeliveryState(quote.shipping_address.state || "Kerala");
              setDeliveryPincode(quote.shipping_address.pincode || "");
              setDeliveryCountry(quote.shipping_address.country || "India");
            }

            if (quote.delivery_type_id) setDeliveryTypeId(quote.delivery_type_id);
            if (quote.product_price_category_id) setPriceCategoryId(quote.product_price_category_id);
            if (quote.commit_date) setCommitDate(quote.commit_date);
            if (quote.remarks) setRemarks(quote.remarks);

            const discountVal = Number(quote.discount_amount) > 0
              ? Number(quote.discount_amount)
              : Math.max(0, Number(quote.total_amount || 0) - Number(quote.final_amount || 0));
            setDiscount(discountVal);

            if (quote.projects && quote.projects.length > 0) {
              setProjects(
                quote.projects.map((p: any) => ({
                  id: p.id,
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
  }, [quotationIdParam]);

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

  // Sync Same as Billing Address
  useEffect(() => {
    if (sameAsBilling) {
      setDeliveryAddress(billingAddress);
      setDeliveryCity(billingCity);
      setDeliveryState(billingState);
      setDeliveryPincode(billingPincode);
      setDeliveryCountry(billingCountry);
    }
  }, [sameAsBilling, billingAddress, billingCity, billingState, billingPincode, billingCountry]);

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
        setBillingAddress(data.billing_address.address_line_1 || "");
        setBillingCity(data.billing_address.city || "Kochi");
        setBillingState(data.billing_address.state || "Kerala");
        setBillingPincode(data.billing_address.pincode || "");
        setBillingCountry(data.billing_address.country || "India");
      }
      if (data.shipping_address) {
        setDeliveryAddress(data.shipping_address.address_line_1 || "");
        setDeliveryCity(data.shipping_address.city || "Kochi");
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
          updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unit_price) || 0);
        }
        return updated;
      })
    );
  };

  const handleSelectProduct = (idx: number, prod: any) => {
    handleUpdateProjectField(idx, "project_name", prod.product_name);
    handleUpdateProjectField(idx, "unit_price", prod.selling_price);
    handleUpdateProjectField(idx, "product_id", prod.id || prod.product_id || 1);
    handleUpdateProjectField(idx, "is_locked", true);
    setSearchRowIdx(null);
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
        project_images: [],
        is_locked: false,
      },
    ]);
  };

  const handleRemoveProjectRow = (idx: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== idx));
    }
  };

  const handleImageUploadTrigger = (idx: number) => {
    setActiveUploadIdx(idx);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && activeUploadIdx !== null) {
      const selectedFiles = Array.from(e.target.files);
      const idx = activeUploadIdx;

      setUploadingRows((prev) => ({ ...prev, [idx]: true }));

      try {
        const project_images = await Promise.all(
          selectedFiles.map(async (file) => {
            const cloudinary = await uploadToCloudinary(file);
            return {
              img_url: cloudinary.secure_url,
              platform_name: "Cloudinary",
              status: true,
            };
          })
        );
        handleUpdateProjectField(idx, "project_images", project_images);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        alert("Image upload failed.");
      } finally {
        setUploadingRows((prev) => ({ ...prev, [idx]: false }));
        setActiveUploadIdx(null);
      }
    }
  };

  const totalAmount = projects.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.unit_price) + (Number(p.additional_amount) || 0),
    0
  );
  const finalAmount = Math.max(0, totalAmount - discount);
  const totalUnits = projects.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const handleValidateForm = (): boolean => {
    if (!customerName.trim()) { alert("Please enter Customer Name!"); return false; }
    if (!mobileSearch.trim()) { alert("Please enter Mobile Number!"); return false; }
    if (!billingAddress.trim()) { alert("Please enter Billing Address!"); return false; }
    if (!deliveryAddress.trim()) { alert("Please enter Shipping Address!"); return false; }
    if (!commitDate) { alert("Please select a Quotation Date / Commit Date!"); return false; }
    if (!priceCategoryId) { alert("Please select a Customer Category!"); return false; }
    if (!deliveryTypeId) { alert("Please select a Delivery Type!"); return false; }
    if (projects.length === 0) { alert("Please add at least one product!"); return false; }

    for (let i = 0; i < projects.length; i++) {
      const proj = projects[i];
      const rowNum = i + 1;
      if (!proj.project_name.trim()) { alert(`Please enter/select a Product Name in Row #${rowNum}!`); return false; }
      if (proj.quantity <= 0) { alert(`Quantity must be 1 or more in Row #${rowNum}!`); return false; }
      if (proj.unit_price < 0) { alert(`Selling Price cannot be negative in Row #${rowNum}!`); return false; }
    }

    if (discount < 0) { alert("Discount cannot be negative!"); return false; }

    return true;
  };

  const handleSubmitQuotation = async () => {
    if (!handleValidateForm()) return;

    const billing_address: Omit<Address, "id"> = {
      address_type: "Billing",
      address_line_1: billingAddress,
      address_line_2: billingAddress,
      city: billingCity,
      state: billingState,
      country: billingCountry,
      pincode: billingPincode,
      is_default: true,
    };

    const delivery_address_payload: Omit<Address, "id"> = {
      address_type: "Delivery",
      address_line_1: deliveryAddress,
      address_line_2: deliveryAddress,
      city: deliveryCity,
      state: deliveryState,
      country: deliveryCountry,
      pincode: deliveryPincode,
      is_default: true,
    };

    const projects_payload = projects.map(({ is_locked, ...rest }) => ({
      ...rest,
      status: "Created" as const,
      quantity: Number(rest.quantity) || 1,
      unit_price: Number(rest.unit_price) || 0,
      amount: Number(rest.quantity) * Number(rest.unit_price) + Number(rest.additional_amount || 0),
      design_date: rest.design_date || null,
      printing_date: rest.printing_date || null,
      completed_date: null,
    }));

    // 🌟 QUOTATION PAYLOAD
    const payload: CreateOrderPayload = {
      customer_id: customerId,
      ...(customerId === 0 && {
        customer: {
          customer_name: customerName,
          mobile_number: mobileSearch,
          whatsapp_number: whatsappNumber || mobileSearch,
          requirements,
          status: "Active",
        },
      }),
      billing_address_id: 0,
      billing_address,
      delivery_address_id: 0,
      delivery_address: delivery_address_payload,
      delivery_type_id: deliveryTypeId,
      expected_delivery_days: null,
      order_date: commitDate,
      commit_date: commitDate,
      design_date: null,
      print_date: null,
      completion_date: null, // 🌟 NULL for Quotation
      total_orders: 0,
      discount_amount: Number(discount) || 0,
      final_amount: finalAmount,
      paid_amount: 0,
      balance_amount: finalAmount,
      total_amount: totalAmount,
      total_units: totalUnits,
      payment_status: "Pending",
      is_quotation: true, // 🌟 ALWAYS TRUE FOR QUOTATIONS
      order_status: "Draft", // 🌟 ALWAYS DRAFT FOR QUOTATIONS
      remarks: remarks.trim() || "",
      order_type: orderType,
      product_price_category_id: priceCategoryId,
      account_id: 1,
      payment_type: "Cash",
      projects: projects_payload,
      category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
    };

    try {
      if (isEditMode && quotationIdParam) {
        // 🌟 FLOW 4: Edit Quotation (PUT /sales/quotations/{quotation_id})
        await updateSalesQuotation(parseInt(quotationIdParam), payload);
        alert(`Quotation #${quotationIdParam} updated successfully!`);
      } else {
        // 🌟 FLOW 3: Create Quotation (POST /sales/quotations/)
        await createSalesQuotation(payload);
        alert("Quotation created successfully!");
      }
      router.push("/sales/list-quotation");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Error submitting quotation request");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className="flex items-center gap-3">
          <Link href="/sales/list-quotation" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className={styles.title}>{isEditMode ? "Edit Price Quotation" : "Create New Quotation"}</h1>
            {/* <p className={styles.subtitle}>Draft and refine price quotation requests for client deals.</p> */}
          </div>
        </div>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFilesChange}
        className="hidden"
        accept="image/*"
      />

      <CustomerScheduleForm
        mobileSearch={mobileSearch} setMobileSearch={setMobileSearch}
        customerName={customerName} setCustomerName={setCustomerName}
        whatsappNumber={whatsappNumber} setWhatsappNumber={setWhatsappNumber}
        sameAsMobile={sameAsMobile} setSameAsMobile={setSameAsMobile}

        billingAddress={billingAddress} setBillingAddress={setBillingAddress}
        billingCity={billingCity} setBillingCity={setBillingCity}
        billingState={billingState} setBillingState={setBillingState}
        billingPincode={billingPincode} setBillingPincode={setBillingPincode}
        billingCountry={billingCountry} setBillingCountry={setBillingCountry}

        deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress}
        deliveryCity={deliveryCity} setDeliveryCity={setDeliveryCity}
        deliveryState={deliveryState} setDeliveryState={setDeliveryState}
        deliveryPincode={deliveryPincode} setDeliveryPincode={setDeliveryPincode}
        deliveryCountry={deliveryCountry} setDeliveryCountry={setDeliveryCountry}

        sameAsBilling={sameAsBilling} setSameAsBilling={setSameAsBilling}

        deliveryTypeId={deliveryTypeId} setDeliveryTypeId={setDeliveryTypeId}
        priceCategoryId={priceCategoryId} setPriceCategoryId={setPriceCategoryId}
        commitDate={commitDate} setCommitDate={setCommitDate}
        hideCompletionDate={true}
        orderType={orderType} setOrderType={setOrderType}
        customers={customers}
        deliveryTypes={deliveryTypes}
        priceCategories={priceCategories}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Product Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>#</th>
              <th>PRODUCT</th>
              <th style={{ width: "100px", textAlign: "center" }}>IMAGE</th>
              <th style={{ width: "90px", textAlign: "center" }}>QTY</th>
              <th style={{ width: "140px" }}>UNIT PRICE</th>
              <th style={{ width: "140px" }}>ADDL AMT</th>
              <th style={{ width: "150px", textAlign: "right" }}>AMOUNT</th>
              <th style={{ width: "50px" }}></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((row, index) => {
              const rowImages = row.project_images || [];
              const previewUrl = rowImages.length > 0 ? rowImages[0].img_url : null;
              const isUploading = !!uploadingRows[index];
              const isLocked = !!row.is_locked;

              return (
                <tr key={index}>
                  <td>{index + 1}</td>

                  {/* Autocomplete Input */}
                  <td className={styles.relativeCell} ref={searchRowIdx === index ? autocompleteRef : undefined}>
                    <div className="relative flex items-center w-full">
                      <input
                        type="text"
                        placeholder="Search product..."
                        className={`${styles.tableInput} ${
                          isLocked ? "bg-slate-50 text-slate-400 font-bold border-slate-200/80" : ""
                        }`}
                        value={row.project_name}
                        disabled={isLocked}
                        onChange={(e) => {
                          handleUpdateProjectField(index, "project_name", e.target.value);
                          setSearchRowIdx(index);
                        }}
                        onFocus={() => setSearchRowIdx(index)}
                      />
                      {isLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateProjectField(index, "project_name", "");
                            handleUpdateProjectField(index, "unit_price", 0);
                            handleUpdateProjectField(index, "is_locked", false);
                          }}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Unlock product and unit price"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    {searchRowIdx === index && row.project_name && !isLocked && (
                      <div className="absolute top-11 left-2 bg-white border border-slate-200 rounded-lg shadow-xl z-[150] max-h-48 overflow-y-auto p-1.5 flex flex-col gap-0.5 w-[calc(100%-16px)] min-w-[250px]">
                        {autocompleteProducts
                          .filter((p) => p.product_name.toLowerCase().includes(row.project_name.toLowerCase()))
                          .map((prod, pIdx) => (
                            <div
                              key={pIdx}
                              className="px-3 py-2 text-xs hover:bg-slate-50 rounded-md cursor-pointer font-bold text-slate-700 flex justify-between"
                              onClick={() => handleSelectProduct(index, prod)}
                            >
                              <span>{prod.product_name}</span>
                              <span className="text-indigo-600 font-bold">₹{prod.selling_price}</span>
                            </div>
                          ))}
                        <div
                          className="px-3 py-1.5 text-[10px] text-slate-400 border-t mt-1 text-right cursor-pointer"
                          onClick={() => setSearchRowIdx(null)}
                        >
                          Close suggestions
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Image Column */}
                  <td className="text-center">
                    <div className="flex items-center justify-center">
                      <div
                        onClick={() => handleImageUploadTrigger(index)}
                        className={styles.imagePreview}
                        style={{ cursor: "pointer" }}
                      >
                        {isUploading ? (
                          <span className="text-[10px] font-bold text-slate-400">...</span>
                        ) : previewUrl ? (
                          <img src={previewUrl} className={styles.previewImg} alt="Preview" />
                        ) : (
                          <ImageIcon size={14} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Quantity */}
                  <td>
                    <input
                      type="number"
                      className={styles.tableInputCenter}
                      value={row.quantity || ""}
                      min="1"
                      onChange={(e) => handleUpdateProjectField(index, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </td>

                  {/* Price Input - Locked when autofilled */}
                  <td>
                    <div className={`${styles.priceCell} ${isLocked ? "bg-slate-50 border-slate-200/80" : ""}`}>
                      <span className="text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        className={`${styles.tableInputNoBorder} ${isLocked ? "text-slate-400 font-bold" : ""}`}
                        value={row.unit_price}
                        disabled={isLocked}
                        min="0"
                        onChange={(e) => handleUpdateProjectField(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </td>

                  {/* Additional Amount */}
                  <td>
                    <div className={styles.priceCell}>
                      <span>₹</span>
                      <input
                        type="number"
                        className={styles.tableInputNoBorder}
                        value={row.additional_amount || ""}
                        min="0"
                        onChange={(e) =>
                          handleUpdateProjectField(index, "additional_amount", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </td>

                  {/* Amount Column */}
                  <td className={styles.amountText}>
                    ₹{(row.quantity * row.unit_price + (row.additional_amount || 0)).toLocaleString("en-IN")}.00
                  </td>

                  {/* Delete Button */}
                  <td>
                    <button
                      type="button"
                      onClick={() => handleRemoveProjectRow(index)}
                      className={styles.deleteBtn}
                      disabled={projects.length <= 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Actions */}
        <div className={styles.tableFooter}>
          <button type="button" onClick={handleAddProjectRow} className={styles.addBtn}>
            <Plus size={14} /> Add Product
          </button>
          <div className={styles.tableSummary}>
            <span>
              Total Qty: <strong>{totalUnits}</strong>
            </span>
            <span>
              Sub Total: <strong>₹{totalAmount.toLocaleString("en-IN")}.00</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      <div className={styles.bottomGrid}>
        <div className={styles.notesCard}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Remarks / Notes</div>
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
            <strong className="text-indigo-600 text-lg">₹{finalAmount.toLocaleString("en-IN")}.00</strong>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className={styles.stickyBar}>
        <Button type="button" onClick={handleSubmitQuotation} className={styles.submitBtn}>
          <CheckSquare size={16} /> {isEditMode ? "UPDATE QUOTATION" : "SUBMIT QUOTATION"}
        </Button>
      </div>
    </div>
  );
}

export default function CreateQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-semibold">Loading Quotation Form...</div>}>
      <CreateQuotationContent />
    </Suspense>
  );
}