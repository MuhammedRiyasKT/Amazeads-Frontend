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
import { generateQuotationPdf } from "@/lib/pdfHelper";

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

  const getProductName = (quote: OrderItemResponse) => {
    if (quote.projects && quote.projects.length > 0) {
      const names = quote.projects
        .map((p: any) => p.project_name || p.product_name || p.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    return (quote as any).product_name || "—";
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

      const quoteNum = fullQuotation.order_number
        ? `#${fullQuotation.order_number}`
        : `Quote #${fullQuotation.id}`;

      const discountVal =
        Number(fullQuotation.discount_amount) > 0
          ? Number(fullQuotation.discount_amount)
          : Math.max(
              0,
              Number(fullQuotation.total_amount || 0) -
                Number(fullQuotation.final_amount || 0)
            );

      await generateQuotationPdf({
        quotationNumber: quoteNum,
        quotationDate:
          fullQuotation.commit_date ||
          fullQuotation.order_date ||
          new Date().toISOString(),
        customerName: fullQuotation.customer_name || "—",
        customerMobile: fullQuotation.customer_mobile_number || "—",
        customerWhatsapp: fullQuotation.customer_whatsapp_number || undefined,
        billingAddress: fullQuotation.billing_address,
        shippingAddress:
          fullQuotation.shipping_address || fullQuotation.delivery_address,
        deliveryType:
          fullQuotation.delivery_type_name || fullQuotation.delivery_type?.name,
        priceCategoryName:
          fullQuotation.price_category_name ||
          fullQuotation.product_price_category_name,
        items: (fullQuotation.projects || []).map((proj: any) => ({
          productName: proj.project_name || proj.product_name || "—",
          quantity: Number(proj.quantity) || 1,
          unitPrice: Number(proj.unit_price) || 0,
          additionalAmount: Number(proj.additional_amount) || 0,
          amount:
            Number(proj.amount) ||
            (Number(proj.quantity) || 1) * (Number(proj.unit_price) || 0) +
              (Number(proj.additional_amount) || 0),
          imageCode: proj.image_code_details?.image_code || proj.image_code,
          imageName: proj.image_code_details?.image_name || proj.image_name,
          imageCategory:
            proj.image_code_details?.category_name || proj.image_category_name,
          imageUrl:
            proj.image_code_details?.image_url ||
            proj.project_images?.[0]?.img_url,
          image_code_details: proj.image_code_details,
          project_images: proj.project_images,
        })),
        subTotal: Number(fullQuotation.total_amount) || 0,
        discount: discountVal,
        finalAmount: Number(fullQuotation.final_amount) || 0,
        remarks: fullQuotation.remarks,
        fileName: `Quotation-${fullQuotation.order_number || fullQuotation.id}.pdf`,
      });
    } catch (err: any) {
      console.error("Error generating quotation PDF:", err);
      alert(
        "Error generating quotation PDF: " +
          (err?.message || "Please try again.")
      );
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
                <th style={{ minWidth: "160px" }}>PRODUCT NAME</th>
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
                  const projectsList = quote.projects && quote.projects.length > 0 ? quote.projects : [null];
                  const projectsCount = projectsList.length;

                  return (
                    <React.Fragment key={quote.id}>
                      {projectsList.map((proj, pIdx) => {
                        const isFirstRow = pIdx === 0;

                        return (
                          <tr key={`${quote.id}-${proj?.id || pIdx}`} className="hover:bg-slate-50/80 transition-all duration-150">
                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle whitespace-nowrap">
                                {quote.order_number ? `#${quote.order_number}` : `Quote #${quote.id}`}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle whitespace-nowrap text-xs text-slate-600">
                                {formatDateStyle(quote.commit_date || quote.order_date)}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700 }} className="align-middle">
                                <div>{quote.customer_name}</div>
                                {quote.customer_mobile_number && (
                                  <div className="text-[10px] text-slate-500 font-normal">{quote.customer_mobile_number}</div>
                                )}
                              </td>
                            )}

                            <td className="align-middle font-bold text-xs text-slate-800">
                              {proj ? proj.project_name || proj.product_name || "—" : "—"}
                            </td>

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700, textAlign: "right" }} className="align-middle">
                                ₹{(quote.total_amount || 0).toLocaleString("en-IN")}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ textAlign: "right", color: "#ef4444" }} className="align-middle">
                                - ₹{(Number(quote.discount_amount) > 0
                                  ? Number(quote.discount_amount)
                                  : Math.max(
                                    0,
                                    Number(quote.total_amount || 0) -
                                    Number(quote.final_amount || 0)
                                  )
                                ).toLocaleString("en-IN")}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ fontWeight: 700, textAlign: "right" }} className="align-middle">
                                ₹{(quote.final_amount || 0).toLocaleString("en-IN")}
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} style={{ textAlign: "center" }} className="align-middle">
                                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {quote.order_status || "Draft"}
                                </span>
                              </td>
                            )}

                            {isFirstRow && (
                              <td rowSpan={projectsCount} className="align-middle">
                                <div className="flex items-center justify-center gap-1.5">
                                  {/* View Specs Button */}
                                  <button
                                    onClick={() => handleViewClick(quote.id)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
                                    title="View Specifications"
                                  >
                                    <Eye size={13} />
                                  </button>

                                  {/* Edit Quotation Button */}
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

                                  {/* Convert Quotation to Order Button */}
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
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
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