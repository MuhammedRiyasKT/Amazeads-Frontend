"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit2, ArrowRightLeft, FileDown, FileText, Loader2, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { OrderItemResponse } from "../types";
import { getOrdersList, getOrderById } from "../services/order.service";
import ViewOrderModal from "../components/ViewOrderModal";
import { useSalesStore } from "@/store/salesStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { CATEGORY_IDS } from "@/constants/categories";
import styles from "../components/OrderListComponents.module.css";
import { jsPDF } from "jspdf";

export default function QuotationListPage() {
  const router = useRouter();
  const { selectedCategory } = useSalesStore();

  const [quotations, setQuotations] = useState<OrderItemResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Search / Filters
  const [mobileSearch, setMobileSearch] = useState("");

  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // PDF Generation State
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);

  const fetchQuotations = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const activeFilters: any = {
        page: pageToFetch,
        page_size: 5,
        category_id: selectedCategory?.id || CATEGORY_IDS.CRYSTAL_WALL_ART,
        is_quotation: true, // Only fetch quotations 🌟
        order_status: "Draft", // 🌟 Only fetch active draft (unconverted) quotations
      };

      if (mobileSearch.trim()) activeFilters.mobile_number = mobileSearch.trim();

      const data = await getOrdersList(activeFilters);
      // Fallback frontend filter to guarantee converted quotations are excluded
      const activeQuotes = (data.items || []).filter(
        (quote: any) => (quote.order_status || "").toLowerCase() === "draft"
      );
      setQuotations(activeQuotes);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalCount(data.pagination?.total_count || 0);
    } catch (err) {
      console.error("Error fetching quotations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, mobileSearch]);

  const handleViewClick = (id: number) => {
    setSelectedOrderId(id);
    setIsViewOpen(true);
  };

  // 🌟 Flow 5: Convert Quotation to Order -> Navigates to `/sales/create-order?quotation_id={id}`
  const handleConvertToOrder = (quoteId: number) => {
    const confirmConvert = window.confirm(
      `Convert Quotation #${quoteId} to an active Sales Order?\n\nThis will prefill the Create Order form with customer and product specs from this quote.`
    );
    if (!confirmConvert) return;

    router.push(`/sales/create-order?quotation_id=${quoteId}`);
  };

  const formatDateStyle = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    const val = Number(amount) || 0;
    return `Rs. ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // 🌟 Client-Side PDF Generation & Direct Browser Download (Read-Only)
  const handleGeneratePdf = async (quotationId: number) => {
    setGeneratingPdfId(quotationId);
    try {
      // 1. Fetch complete quotation details from backend
      const fullQuotation = await getOrderById(quotationId);
      if (!fullQuotation) throw new Error("Quotation details could not be loaded");

      // 2. Initialize jsPDF Document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Styling Constants
      const primaryColor = "#0047ab";
      const textColor = "#1e293b";

      // Header Branding
      doc.setTextColor(primaryColor);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("AMAZE ADS", 14, 20);

      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Professional Advertising & Signage ERP", 14, 25);
      doc.text("Email: info@amazeads.in | Web: www.amazeads.in", 14, 30);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 34, 196, 34);

      // Title & Quote Number
      doc.setTextColor(primaryColor);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("PRICE QUOTATION", 14, 43);

      doc.setTextColor(textColor);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const quoteNum = fullQuotation.order_number
        ? `#${fullQuotation.order_number}`
        : `Quote #${fullQuotation.id}`;
      doc.text(`Quotation No: ${quoteNum}`, 130, 43);
      doc.text(
        `Date: ${formatDateStyle(fullQuotation.commit_date || fullQuotation.order_date || new Date().toISOString())}`,
        130,
        48
      );

      // Customer Details Section
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Prepared For:", 14, 57);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Customer: ${fullQuotation.customer_name || "—"}`, 14, 62);
      doc.text(`Mobile: ${fullQuotation.customer_mobile_number || "—"}`, 14, 67);
      if (fullQuotation.customer_whatsapp_number) {
        doc.text(`WhatsApp: ${fullQuotation.customer_whatsapp_number}`, 14, 72);
      }

      // Addresses Section
      let addressY = 80;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);

      // Billing Address
      doc.text("Billing Address:", 14, addressY);
      doc.setFont("helvetica", "normal");
      const billing = fullQuotation.billing_address || {};
      const splitBilling = doc.splitTextToSize(billing.address_line_1 || "—", 85);
      doc.text(splitBilling, 14, addressY + 5);
      const billingCityY = addressY + 5 + (splitBilling.length * 4.5);
      doc.text(
        `${billing.district || "—"}, ${billing.state || "—"} - ${billing.pincode || "—"}`,
        14,
        billingCityY
      );

      // Shipping Address
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Address:", 110, addressY);
      doc.setFont("helvetica", "normal");
      const delivery = fullQuotation.shipping_address || {};
      const splitDelivery = doc.splitTextToSize(delivery.address_line_1 || "—", 85);
      doc.text(splitDelivery, 110, addressY + 5);
      const deliveryCityY = addressY + 5 + (splitDelivery.length * 4.5);
      doc.text(
        `${delivery.district || "—"}, ${delivery.state || "—"} - ${delivery.pincode || "—"}`,
        110,
        deliveryCityY
      );

      // Product Table Header
      let currentY = 105;
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 8, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, currentY, 182, 8, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("#", 17, currentY + 5.5);
      doc.text("Product Description", 26, currentY + 5.5);
      doc.text("Qty", 110, currentY + 5.5);
      doc.text("Unit Price", 130, currentY + 5.5);
      doc.text("Addl Amt", 155, currentY + 5.5);
      doc.text("Amount", 178, currentY + 5.5);

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor);
      const projectsList = fullQuotation.projects || [];

      projectsList.forEach((proj: any, idx: number) => {
        currentY += 8;
        doc.setDrawColor(226, 232, 240);
        doc.line(14, currentY, 196, currentY);

        const qty = Number(proj.quantity) || 1;
        const unitPrice = Number(proj.unit_price) || 0;
        const addlAmt = Number(proj.additional_amount) || 0;
        const rowAmount = (qty * unitPrice) + addlAmt;

        doc.text(`${idx + 1}`, 17, currentY + 5.5);
        doc.text(`${proj.project_name || "—"}`, 26, currentY + 5.5);
        doc.text(`${qty}`, 110, currentY + 5.5);
        doc.text(formatCurrency(unitPrice), 130, currentY + 5.5);
        doc.text(formatCurrency(addlAmt), 155, currentY + 5.5);
        doc.text(formatCurrency(rowAmount), 178, currentY + 5.5);
      });

      // Bottom Totals Summary (NO PAYMENT DETAILS INCLUDED 🌟)
      currentY += 14;
      doc.setDrawColor(226, 232, 240);
      doc.line(130, currentY, 196, currentY);

      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Sub Total:", 130, currentY);
      doc.text(formatCurrency(fullQuotation.total_amount), 170, currentY);

      currentY += 6;
      doc.text("Discount:", 130, currentY);
      const discountVal = Number(fullQuotation.discount_amount) > 0
        ? Number(fullQuotation.discount_amount)
        : Math.max(
          0,
          Number(fullQuotation.total_amount || 0) -
          Number(fullQuotation.final_amount || 0)
        );
      doc.text(`- ${formatCurrency(discountVal)}`, 170, currentY);

      currentY += 8;
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text("Final Quotation Amount:", 130, currentY);
      doc.text(formatCurrency(fullQuotation.final_amount), 170, currentY);

      // Remarks / Terms
      if (fullQuotation.remarks && fullQuotation.remarks.trim()) {
        currentY += 16;
        doc.setTextColor(textColor);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Special Remarks / Terms:", 14, currentY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        const cleanRemarks = fullQuotation.remarks.replace(/\[PDF_URL\]:\s*https?:\/\/[^\s]+/gi, "").trim();
        doc.text(cleanRemarks || "Standard quotation terms apply.", 14, currentY + 5, { maxWidth: 170 });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Thank you for your business! This is a system-generated quotation document.", 14, 280);

      // 3. Trigger Browser Safe Download
      const fileName = `Quotation-${fullQuotation.order_number || fullQuotation.id}.pdf`;
      const pdfBlob = doc.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

    } catch (err: any) {
      console.error("Error generating quotation PDF:", err);
      alert("Error generating quotation PDF: " + (err?.message || "Please try again."));
    } finally {
      setGeneratingPdfId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quotation Register</h1>
          <p className={styles.subtitle}>
            Manage drafted price quotes, create PDF documents, and view specifications.
          </p>
        </div>
        <Link href="/sales/create-quotation" passHref legacyBehavior>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer font-bold"
            onClick={() => useSidebarStore.getState().setCollapsed(true)}
          >
            <Plus size={16} /> Create Price Quotation
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search Mobile No..."
            value={mobileSearch}
            onChange={(e) => {
              setCurrentPage(1);
              setMobileSearch(e.target.value);
            }}
            className="h-10 w-full border border-slate-200 rounded-lg px-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Quotation Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "90px" }}>QUOTE ID</th>
                <th style={{ width: "90px" }}>COMMIT DATE</th>
                <th style={{ width: "130px" }}>CUSTOMER</th>
                <th style={{ width: "110px" }}>MOBILE</th>
                <th style={{ width: "100px", textAlign: "right" }}>SUB TOTAL</th>
                <th style={{ width: "90px", textAlign: "right" }}>DISCOUNT</th>
                <th style={{ width: "100px", textAlign: "right" }}>FINAL AMT</th>
                <th style={{ width: "100px", textAlign: "center" }}>STATUS</th>
                <th style={{ width: "140px", textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                    Loading quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                    No quotation records found.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => {
                  const isGeneratingThis = generatingPdfId === quote.id;
                  const isDraft = (quote.order_status || "").toLowerCase() === "draft";

                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-all duration-150">
                      <td style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                        {quote.order_number ? `#${quote.order_number}` : `Quote #${quote.id}`}
                      </td>
                      <td className="align-middle whitespace-nowrap text-xs text-slate-600">
                        {formatDateStyle(quote.commit_date || quote.order_date)}
                      </td>
                      <td style={{ fontWeight: 700 }} className="align-middle">
                        {quote.customer_name}
                      </td>
                      <td className="align-middle text-xs text-slate-600">
                        {quote.customer_mobile_number || "—"}
                      </td>
                      <td style={{ fontWeight: 700, textAlign: "right" }} className="align-middle">
                        ₹{(quote.total_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "right", color: "#ef4444" }} className="align-middle">
                        - ₹{(Number(quote.discount_amount) > 0
                          ? Number(quote.discount_amount)
                          : Math.max(
                            0,
                            Number(quote.total_amount || 0) -
                            Number(quote.final_amount || 0)
                          )
                        ).toLocaleString("en-IN")}
                      </td>
                      <td style={{ fontWeight: 700, textAlign: "right" }} className="align-middle">
                        ₹{(quote.final_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={{ textAlign: "center" }} className="align-middle">
                        {isDraft ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Active Quote
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Converted
                          </span>
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Specs Button */}
                          <button
                            onClick={() => handleViewClick(quote.id)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
                            title="View Specifications"
                          >
                            <Eye size={13} />
                          </button>

                          {/* 🌟 Flow 4: Edit Quotation Button (`/sales/create-quotation?quotation_id={id}`) */}
                          {isDraft && (
                            <Link href={`/sales/create-quotation?quotation_id=${quote.id}`} passHref legacyBehavior>
                              <button
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
                                title="Edit Quotation"
                              >
                                <Edit2 size={13} />
                              </button>
                            </Link>
                          )}

                          {/* 🌟 Flow 5: Convert Quotation to Order Button */}
                          {isDraft && (
                            <button
                              onClick={() => handleConvertToOrder(quote.id)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-lg cursor-pointer transition-colors"
                              title="Convert to Sales Order"
                            >
                              <ArrowRightLeft size={13} />
                            </button>
                          )}

                          {/* Direct PDF Generation & Browser Download Button */}
                          <button
                            onClick={() => handleGeneratePdf(quote.id)}
                            disabled={isGeneratingThis}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                            title="Generate & Download Quotation PDF"
                          >
                            {isGeneratingThis ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-amber-600" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <FileDown size={13} />
                                <span>Generate PDF</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.paginationRow}>
            <div className={styles.resultsText}>
              Showing page <span className={styles.highlightText}>{currentPage}</span> of{" "}
              <span className={styles.highlightText}>{totalPages}</span> ({totalCount} quotations)
            </div>
            <Pagination
              total={totalCount}
              limit={5}
              activePage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Details Specifications Modal */}
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