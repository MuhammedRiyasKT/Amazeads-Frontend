"use client";

import React, { useEffect, useState } from "react";
import { X, Hash, Calendar, Layers, FileDown, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { jsPDF } from "jspdf";
import {
  getOrderProjectsAssignments,
  updateProjectDepartmentAssignments,
  assignOrderNumber,
  getPMOrderById
} from "../services/managerOrder.service";

interface CreateOrderIdModalProps {
  isOpen: boolean;
  orderId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderIdModal({
  isOpen,
  orderId,
  onClose,
  onSuccess,
}: CreateOrderIdModalProps) {
  const [newOrderNumber, setNewOrderNumber] = useState("");
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [orderDates, setOrderDates] = useState<{ commit_date?: string; completion_date?: string }>({});
  const [rawOrderData, setRawOrderData] = useState<any>(null);
  const [rawAssignmentsData, setRawAssignmentsData] = useState<any[]>([]);

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      setNewOrderNumber("");
      setRawOrderData(null);
      setRawAssignmentsData([]);

      Promise.all([
        getOrderProjectsAssignments(orderId),
        getPMOrderById(orderId)
      ])
        .then(([assignmentsData, orderData]) => {
          console.log("PROJECTS_ASSIGNMENTS_DATA:", JSON.stringify(assignmentsData, null, 2));
          console.log("ORDER_DATA:", JSON.stringify(orderData, null, 2));

          setRawOrderData(orderData);
          setRawAssignmentsData(assignmentsData || []);

          setOrderDates({
            commit_date: orderData?.commit_date,
            completion_date: orderData?.completion_date,
          });

          const today = getTodayStr();
          const orderProjects = orderData?.projects || [];
          const projectDetailsMap = new Map<number, any>();
          orderProjects.forEach((p: any) => {
            projectDetailsMap.set(p.id, p);
          });

          console.log("ORDER_PROJECTS_IDS:", orderProjects.map((p: any) => p.id));
          console.log("ASSIGNMENT_PROJECT_IDS:", (assignmentsData || []).map((proj: any) => proj.project_id || proj.id));

          const formatted = (assignmentsData || []).map((proj: any) => {
            const projId = proj.project_id || proj.id;
            const details = projectDetailsMap.get(projId) || {};

            const designDateVal = details.design_date || proj.design_date;
            const printingDateVal = details.printing_date || proj.printing_date;
            const fallbackDate = orderData?.commit_date ? orderData.commit_date.substring(0, 10) : today;

            return {
              project_id: projId,
              product_name: proj.product_name || proj.project_name || details.project_name,
              quantity: proj.quantity || details.quantity,
              design_date: designDateVal && designDateVal !== "null" ? designDateVal.substring(0, 10) : fallbackDate,
              printing_date: printingDateVal && printingDateVal !== "null" ? printingDateVal.substring(0, 10) : fallbackDate,
              departments: (proj.departments || []).map((d: any) => ({
                department_id: d.id || d.department_id,
                name: d.name || d.department_name,
                is_assigned: Boolean(d.is_assigned),
              })),
            };
          });

          setProjectsList(formatted);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  const handleDepartmentToggle = (projectIdx: number, deptId: number) => {
    setProjectsList((prev) => {
      const updated = [...prev];
      const targetProj = { ...updated[projectIdx] };
      targetProj.departments = targetProj.departments.map((d: any) => {
        if (d.department_id === deptId) {
          return { ...d, is_assigned: !d.is_assigned };
        }
        return d;
      });
      updated[projectIdx] = targetProj;
      return updated;
    });
  };

  const handleDateChange = (projectIdx: number, field: "design_date" | "printing_date", val: string) => {
    if (orderDates.commit_date && orderDates.completion_date && val) {
      const selected = new Date(val);
      const commit = new Date(orderDates.commit_date.substring(0, 10));
      const completion = new Date(orderDates.completion_date.substring(0, 10));

      if (selected < commit || selected > completion) {
        alert(
          `${field === "design_date" ? "Design Date" : "Printing Date"} must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`
        );
      }
    }

    setProjectsList((prev) => {
      const updated = [...prev];
      updated[projectIdx] = { ...updated[projectIdx], [field]: val };
      return updated;
    });
  };

  const handleGeneratePdf = () => {
    const orderNumStr = newOrderNumber.trim();
    if (!orderNumStr) {
      alert("Please enter a Production Order Number first to generate the PDF!");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const primaryColor = "#1e1b4b"; // Dark Navy
      const accentColor = "#4338ca"; // Indigo
      const textColor = "#1e293b"; // Slate-800
      const lightGray = "#f8fafc";
      const borderGray = "#cbd5e1";

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 182mm

      const val = (v: any) =>
        v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null" ? String(v) : "-";

      const formatCurrency = (amt: any) => {
        if (amt === undefined || amt === null || amt === "" || isNaN(Number(amt))) return "-";
        return `Rs. ${Number(amt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const formatDate = (dateStr: any) => {
        if (!dateStr || dateStr === "null") return "-";
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return String(dateStr);
          return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        } catch {
          return String(dateStr);
        }
      };

      let currentY = 16;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > 275) {
          doc.addPage();
          currentY = 16;
          return true;
        }
        return false;
      };

      // ── Header Section ──────────────────────────────────────────────
      doc.setTextColor(primaryColor);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("AMAZE ADS", margin, currentY);

      // Title & Order Number Badge Box
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(125, currentY - 6, 71, 14, 2, 2, "FD");
      doc.setTextColor(accentColor);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("PRODUCTION ORDER", 160.5, currentY, { align: "center" });
      doc.setFontSize(9);
      doc.text(`ORDER #: ${orderNumStr}`, 160.5, currentY + 5, { align: "center" });

      currentY += 5;
      doc.setTextColor(textColor);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text("Professional Signage & Advertising ERP", margin, currentY);

      currentY += 4;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, margin, currentY);

      currentY += 5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, margin + contentWidth, currentY);

      currentY += 6;

      // ── Customer & Addresses Section ──────────────────────────────────
      const colWidth = (contentWidth - 6) / 2; // 88mm
      const leftX = margin;
      const rightX = margin + colWidth + 6;
      const boxStartY = currentY;

      const custName = val(rawOrderData?.customer_name);
      const custPhone = val(rawOrderData?.customer_mobile_number || rawOrderData?.mobile_number);
      const custWhatsapp = val(rawOrderData?.customer_whatsapp_number || rawOrderData?.whatsapp_number);

      const formatAddressLines = (addr: any) => {
        if (!addr) return ["-"];
        if (typeof addr === "string") return [addr];
        const l1 = val(addr.address_line_1);
        const l2 = val(addr.address_line_2);
        const dist = val(addr.district || addr.city);
        const state = val(addr.state);
        const pin = val(addr.pincode);
        const country = val(addr.country);

        const line1 = [l1, l2].filter((s) => s !== "-").join(", ");
        const line2 = [dist, state, pin !== "-" ? `Pincode: ${pin}` : "", country].filter((s) => s !== "-").join(", ");
        const res = [];
        if (line1) res.push(line1);
        if (line2) res.push(line2);
        return res.length > 0 ? res : ["-"];
      };

      const billLines = formatAddressLines(rawOrderData?.billing_address);
      const shipLines = formatAddressLines(rawOrderData?.shipping_address || rawOrderData?.delivery_address);

      // Left Column: Customer & Billing
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor);
      doc.text("CUSTOMER DETAILS", leftX, currentY);

      currentY += 4;
      doc.setFontSize(8.5);
      doc.setTextColor(textColor);

      doc.setFont("helvetica", "bold");
      doc.text("Name: ", leftX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(custName, leftX + 13, currentY);

      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Phone: ", leftX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(custPhone, leftX + 13, currentY);

      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.text("WhatsApp: ", leftX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(custWhatsapp, leftX + 18, currentY);

      currentY += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor);
      doc.text("BILLING ADDRESS", leftX, currentY);

      currentY += 4;
      doc.setFontSize(8);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      billLines.forEach((l) => {
        const wrapped = doc.splitTextToSize(l, colWidth - 2);
        doc.text(wrapped, leftX, currentY);
        currentY += wrapped.length * 3.5;
      });

      const leftBoxHeight = currentY - boxStartY;

      // Right Column: Order Meta & Shipping
      currentY = boxStartY;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor);
      doc.text("ORDER META & SHIPPING", rightX, currentY);

      currentY += 4;
      doc.setFontSize(8.5);
      doc.setTextColor(textColor);

      const renderMeta = (label: string, value: string, yPos: number) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}: `, rightX, yPos);
        doc.setFont("helvetica", "normal");
        const splitVal = doc.splitTextToSize(value, colWidth - 25);
        doc.text(splitVal, rightX + 25, yPos);
        return Math.max(3.8, splitVal.length * 3.5);
      };

      currentY += renderMeta("Created By", val(rawOrderData?.created_by_name || rawOrderData?.created_by), currentY);
      currentY += renderMeta("Category", val(rawOrderData?.category_name || rawOrderData?.category?.category_name), currentY);
      currentY += renderMeta("Price Cat.", val(rawOrderData?.price_category_name || rawOrderData?.product_price_category_name), currentY);
      currentY += renderMeta("Delivery Type", val(rawOrderData?.delivery_type_name || rawOrderData?.delivery_type?.name), currentY);

      currentY += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor);
      doc.text("SHIPPING ADDRESS", rightX, currentY);

      currentY += 4;
      doc.setFontSize(8);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      shipLines.forEach((l) => {
        const wrapped = doc.splitTextToSize(l, colWidth - 2);
        doc.text(wrapped, rightX, currentY);
        currentY += wrapped.length * 3.5;
      });

      const rightBoxHeight = currentY - boxStartY;
      currentY = boxStartY + Math.max(leftBoxHeight, rightBoxHeight) + 4;

      // ── Order Financials & Timelines Grid ─────────────────────────────
      checkPageBreak(28);

      doc.setFillColor(lightGray);
      doc.setDrawColor(borderGray);
      doc.roundedRect(margin, currentY, contentWidth, 22, 1.5, 1.5, "FD");

      const innerY = currentY + 4.5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);

      // Row 1
      doc.text("Commit Date:", margin + 4, innerY);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(rawOrderData?.commit_date), margin + 26, innerY);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Completion Date:", margin + 55, innerY);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(rawOrderData?.completion_date), margin + 82, innerY);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Order Status:", margin + 112, innerY);
      doc.setTextColor(accentColor);
      doc.setFont("helvetica", "bold");
      doc.text(val(rawOrderData?.order_status), margin + 133, innerY);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Total Units:", margin + 155, innerY);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(val(rawOrderData?.total_units ?? rawOrderData?.total_quantity), margin + 173, innerY);

      // Row 2
      const innerY2 = innerY + 5.5;
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Account Name:", margin + 4, innerY2);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(val(rawOrderData?.account_name || rawOrderData?.account?.account_name), margin + 26, innerY2);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Type:", margin + 55, innerY2);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(val(rawOrderData?.payment_type), margin + 78, innerY2);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Status:", margin + 112, innerY2);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "normal");
      doc.text(val(rawOrderData?.payment_status), margin + 137, innerY2);

      // Row 3
      const innerY3 = innerY2 + 5.5;
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Paid Amount:", margin + 4, innerY3);
      doc.setTextColor("#15803d");
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(rawOrderData?.paid_amount), margin + 26, innerY3);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Balance Amount:", margin + 55, innerY3);
      doc.setTextColor("#b91c1c");
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(rawOrderData?.balance_amount), margin + 82, innerY3);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Final Amount:", margin + 112, innerY3);
      doc.setTextColor(accentColor);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(rawOrderData?.final_amount || rawOrderData?.total_amount), margin + 133, innerY3);

      currentY += 26;

      // ── Projects Table Section ─────────────────────────────────────────
      checkPageBreak(25);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("ORDER PROJECTS & ITEMS", margin, currentY);

      currentY += 4;

      const drawTableHeader = () => {
        doc.setFillColor(30, 27, 75);
        doc.rect(margin, currentY, contentWidth, 7, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);

        doc.text("#", margin + 3, currentY + 4.8);
        doc.text("Project Name / Description", margin + 10, currentY + 4.8);
        doc.text("Project ID", margin + 82, currentY + 4.8);
        doc.text("Qty", margin + 106, currentY + 4.8, { align: "center" });
        doc.text("Unit Price", margin + 132, currentY + 4.8, { align: "right" });
        doc.text("Addl Amt", margin + 156, currentY + 4.8, { align: "right" });
        doc.text("Amount", margin + 179, currentY + 4.8, { align: "right" });
        currentY += 7;
      };

      drawTableHeader();

      const rawProjects = rawOrderData?.projects || projectsList || [];
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor);
      doc.setFontSize(8);

      rawProjects.forEach((proj: any, idx: number) => {
        const pName = val(proj.project_name || proj.product_name);
        const pId = val(proj.id || proj.project_id);
        const qty = val(proj.quantity);
        const unitPrice = formatCurrency(proj.unit_price);
        const addlAmt = formatCurrency(proj.additional_amount);
        const amt = formatCurrency(proj.amount);

        const wrappedName = doc.splitTextToSize(pName, 68);
        const rowHeight = Math.max(6, wrappedName.length * 4 + 2);

        if (checkPageBreak(rowHeight + 8)) {
          drawTableHeader();
        }

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, currentY, contentWidth, rowHeight, "F");
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

        doc.text(`${idx + 1}`, margin + 3, currentY + 4);
        doc.text(wrappedName, margin + 10, currentY + 4);
        doc.text(`#${pId}`, margin + 82, currentY + 4);
        doc.text(`${qty}`, margin + 106, currentY + 4, { align: "center" });
        doc.text(unitPrice, margin + 132, currentY + 4, { align: "right" });
        doc.text(addlAmt, margin + 156, currentY + 4, { align: "right" });
        doc.text(amt, margin + 179, currentY + 4, { align: "right" });

        currentY += rowHeight;
      });

      currentY += 6;

      // ── Departments Workflow Checklist Section ──────────────────────────
      checkPageBreak(25);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor);
      doc.text("PRODUCTION & WORKFLOW CHECKLIST", margin, currentY);

      currentY += 4;

      // Extract target design date & printing date from projectsList or rawOrderData
      const designProj = projectsList.find((p: any) => p.design_date && p.design_date !== "null" && String(p.design_date).trim() !== "");
      const designDateStr = designProj
        ? formatDate(designProj.design_date)
        : (rawOrderData?.design_date ? formatDate(rawOrderData.design_date) : null);

      const printProj = projectsList.find((p: any) => p.printing_date && p.printing_date !== "null" && String(p.printing_date).trim() !== "");
      const printDateStr = printProj
        ? formatDate(printProj.printing_date)
        : (rawOrderData?.print_date || rawOrderData?.printing_date ? formatDate(rawOrderData.print_date || rawOrderData.printing_date) : null);

      const assignedDeptSet = new Set<string>();
      projectsList.forEach((proj: any) => {
        (proj.departments || []).forEach((d: any) => {
          if (d.is_assigned && d.name) {
            const dName = d.name.trim();
            const capitalized = dName.charAt(0).toUpperCase() + dName.slice(1).toLowerCase();
            assignedDeptSet.add(capitalized);
          }
        });
      });

      if (assignedDeptSet.size === 0 && rawAssignmentsData) {
        (rawAssignmentsData || []).forEach((proj: any) => {
          (proj.departments || []).forEach((d: any) => {
            if (Boolean(d.is_assigned) && (d.name || d.department_name)) {
              const dName = (d.name || d.department_name).trim();
              const capitalized = dName.charAt(0).toUpperCase() + dName.slice(1).toLowerCase();
              assignedDeptSet.add(capitalized);
            }
          });
        });
      }

      interface ChecklistItem {
        label: string;
        subtext?: string;
      }

      const checklistItems: ChecklistItem[] = [];

      // 1. Department Items (with date subtexts if available)
      const deptNames = Array.from(assignedDeptSet);
      deptNames.forEach((name) => {
        let subtext: string | undefined = undefined;
        if (name.toLowerCase() === "designing" && designDateStr && designDateStr !== "-") {
          subtext = `Date: ${designDateStr}`;
        } else if (name.toLowerCase() === "printing" && printDateStr && printDateStr !== "-") {
          subtext = `Date: ${printDateStr}`;
        }
        checklistItems.push({ label: name, subtext });
      });

      // 2. Additional Checklist items requested 🌟
      checklistItems.push({ label: "Design Approval" });
      checklistItems.push({ label: "Payment" });
      checklistItems.push({ label: "Packed" });
      checklistItems.push({ label: "Delivered" });
      checklistItems.push({ label: "Closed" });

      const hasAnySubtext = checklistItems.some((item) => !!item.subtext);
      const rowStep = hasAnySubtext ? 11 : 7;
      const numRows = Math.ceil(checklistItems.length / 4);
      const checklistBoxHeight = numRows * rowStep + 6;

      doc.setFillColor(lightGray);
      doc.setDrawColor(borderGray);
      doc.roundedRect(margin, currentY, contentWidth, checklistBoxHeight, 1.5, 1.5, "FD");

      let checkY = currentY + 5.5;
      let checkCol = 0;
      const colWidthCheck = contentWidth / 4;

      checklistItems.forEach((item) => {
        const itemX = margin + 4 + checkCol * colWidthCheck;

        // Draw Checkbox Square
        doc.setDrawColor(100, 116, 139);
        doc.setFillColor(255, 255, 255);
        doc.rect(itemX, checkY - 3, 3.5, 3.5, "FD");

        // Draw Main Label
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textColor);
        doc.text(item.label, itemX + 5, checkY);

        // Draw Subtext (Date) if available
        if (item.subtext) {
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(item.subtext, itemX + 5, checkY + 3.8);
        }

        checkCol++;
        if (checkCol >= 4) {
          checkCol = 0;
          checkY += rowStep;
        }
      });

      currentY += checklistBoxHeight + 6;

      // ── Remarks Section ───────────────────────────────────────────────
      const remarksStr = val(rawOrderData?.remarks);
      if (remarksStr !== "-") {
        checkPageBreak(22);

        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text("ORDER REMARKS & NOTES", margin, currentY);

        currentY += 4;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);

        const wrappedRemarks = doc.splitTextToSize(remarksStr, contentWidth - 8);
        const remarksHeight = wrappedRemarks.length * 4 + 5;

        doc.setFillColor(lightGray);
        doc.setDrawColor(borderGray);
        doc.roundedRect(margin, currentY, contentWidth, remarksHeight, 1.5, 1.5, "FD");

        doc.text(wrappedRemarks, margin + 4, currentY + 4.5);
        currentY += remarksHeight + 6;
      }

      // ── Footer & Page Numbers ──────────────────────────────────────────
      const pageCount = (doc as any).getNumberOfPages ? (doc as any).getNumberOfPages() : 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 282, margin + contentWidth, 282);

        doc.text("Confidential - Production Order Document - Amaze ERP System", margin, 286);
        doc.text(`Page ${i} of ${pageCount}`, margin + contentWidth, 286, { align: "right" });
      }

      // Download PDF
      const fileName = `Production-Order-${orderNumStr}.pdf`;
      doc.save(fileName);

    } catch (err: any) {
      console.error("Error generating Production Order PDF:", err);
      alert(`Failed to generate PDF: ${err?.message || "Unknown error"}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderNumber.trim()) {
      alert("Please enter a Production Order Number!");
      return;
    }

    if (orderDates.commit_date && orderDates.completion_date) {
      const commit = new Date(orderDates.commit_date.substring(0, 10));
      const completion = new Date(orderDates.completion_date.substring(0, 10));

      for (let i = 0; i < projectsList.length; i++) {
        const proj = projectsList[i];
        const rowNum = i + 1;

        const isDesigningChecked = proj.departments.some(
          (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
        );
        const isPrintingChecked = proj.departments.some(
          (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
        );

        if (isDesigningChecked) {
          if (!proj.design_date) {
            alert(`Please select a Design Date for item #${rowNum} (${proj.product_name || "Project"})`);
            return;
          }
          const dDate = new Date(proj.design_date);
          if (dDate < commit || dDate > completion) {
            alert(`Design Date for item #${rowNum} (${proj.product_name || "Project"}) must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`);
            return;
          }
        }

        if (isPrintingChecked) {
          if (!proj.printing_date) {
            alert(`Please select a Printing Date for item #${rowNum} (${proj.product_name || "Project"})`);
            return;
          }
          const pDate = new Date(proj.printing_date);
          if (pDate < commit || pDate > completion) {
            alert(`Printing Date for item #${rowNum} (${proj.product_name || "Project"}) must be between Commit Date (${orderDates.commit_date.substring(0, 10)}) and Completion Date (${orderDates.completion_date.substring(0, 10)})!`);
            return;
          }
        }
      }
    }

    setIsSubmitting(true);
    const today = getTodayStr();

    try {
      // 1. ഓരോ പ്രൊജക്റ്റിന്റെയും ഡിപ്പാർട്ട്മെന്റ് ചെക്ക്ബോക്സുകളും തീയതികളും പാച്ച് ചെയ്യുന്നു
      for (const proj of projectsList) {

        // Designing (1), Printing (2) ചെക്ക്ബോക്സുകൾ ടിക്ക് ചെയ്തിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു 🌟
        const isDesigningChecked = proj.departments.some(
          (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
        );
        const isPrintingChecked = proj.departments.some(
          (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
        );

        // അടിസ്ഥാന പേലോഡ്
        const payload: any = {
          departments: proj.departments.map((d: any) => ({
            department_id: d.department_id,
            status: Boolean(d.is_assigned),
          })),
        };

        // 🌟 Designing ടിക്ക് ചെയ്തിട്ടുണ്ടെങ്കിൽ മാത്രം design_date അയക്കുന്നു
        if (isDesigningChecked) {
          payload.design_date = proj.design_date && proj.design_date.trim() !== "" ? proj.design_date : today;
        }

        // 🌟 Printing ടിക്ക് ചെയ്തിട്ടുണ്ടെങ്കിൽ മാത്രം printing_date അയക്കുന്നു
        if (isPrintingChecked) {
          payload.printing_date = proj.printing_date && proj.printing_date.trim() !== "" ? proj.printing_date : today;
        }

        await updateProjectDepartmentAssignments(proj.project_id, payload);
      }

      // 2. ഫൈനൽ പ്രൊഡക്ഷൻ ഓർഡർ നമ്പർ അസൈൻ ചെയ്യുന്നു
      await assignOrderNumber(orderId, newOrderNumber.trim());

      alert("Order ID and department routing generated successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error generating Order ID and routing:", err);
      const errMsg = err?.response?.data?.detail?.[0]?.msg || "Failed to confirm order ID and department routing.";
      alert(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[2500] p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Hash className="text-indigo-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm uppercase">Generate Order ID & Routing</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 overflow-y-auto text-xs font-semibold text-slate-600">

          {/* Order dates helper display */}
          {orderDates.commit_date && orderDates.completion_date && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-medium text-slate-500 justify-around">
              <div>
                Commit: <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md ml-1">{orderDates.commit_date.substring(0, 10)}</span>
              </div>
              <div className="w-px h-3 bg-slate-200" />
              <div>
                Completion: <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md ml-1">{orderDates.completion_date.substring(0, 10)}</span>
              </div>
            </div>
          )}

          {/* Order ID Input Field */}
          <div className="flex flex-col gap-1.5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <label className="text-[11px] font-bold text-indigo-900 uppercase flex items-center gap-1">
              <Hash size={13} className="text-indigo-600" />
              <span>Production Order Number / ID *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ABC123, SO-98419..."
              value={newOrderNumber}
              onChange={(e) => setNewOrderNumber(e.target.value)}
              className="h-10 border border-slate-300 rounded-lg px-3 bg-white text-xs font-extrabold focus:outline-none focus:border-indigo-500 shadow-2xs"
              required
            />
          </div>

          {/* Department Workflow Routing Checklist */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2.5 flex items-center gap-1">
              <Layers size={13} className="text-indigo-600" />
              <span>Confirm Department Workflow Routing per Product</span>
            </h4>

            {isLoading ? (
              <div className="p-6 text-center text-slate-500 italic">Loading product items & department checklists...</div>
            ) : projectsList.length === 0 ? (
              <div className="p-4 text-center text-slate-400 italic bg-slate-50 rounded-lg">No projects mapped under this order.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {projectsList.map((proj, pIdx) => {
                  const isDesigningSelected = proj.departments.some(
                    (d: any) => (d.department_id === 1 || d.name === "designing") && d.is_assigned
                  );
                  const isPrintingSelected = proj.departments.some(
                    (d: any) => (d.department_id === 2 || d.name === "printing") && d.is_assigned
                  );

                  return (
                    <div key={proj.project_id || pIdx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-3">
                      {/* Product Name & Qty */}
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-extrabold text-slate-800 text-xs">
                          {pIdx + 1}. {proj.product_name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border">
                          Qty: {proj.quantity}
                        </span>
                      </div>

                      {/* Department Checkboxes */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase w-full">Target Departments:</span>
                        {proj.departments
                          .map((dept: any) => {
                            return (
                              <label
                                key={dept.department_id}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${dept.is_assigned
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={dept.is_assigned}
                                  onChange={() => {
                                    handleDepartmentToggle(pIdx, dept.department_id);
                                  }}
                                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="capitalize">{dept.name}</span>
                              </label>
                            );
                          })}
                      </div>

                      {/* 🌟 ഡേറ്റുകൾ കാണിക്കുന്നത് അതാത് ചെക്ക്ബോക്സ് ടിക്ക് ചെയ്താൽ മാത്രം */}
                      {(isDesigningSelected || isPrintingSelected) && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {isDesigningSelected && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-0.5">
                                <Calendar size={10} /> Design Target Date
                              </span>
                              <input
                                type="date"
                                value={proj.design_date || getTodayStr()}
                                onChange={(e) => handleDateChange(pIdx, "design_date", e.target.value)}
                                min={orderDates.commit_date ? orderDates.commit_date.substring(0, 10) : undefined}
                                max={orderDates.completion_date ? orderDates.completion_date.substring(0, 10) : undefined}
                                className="h-8 border border-slate-200 bg-white rounded-lg px-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                              />
                            </div>
                          )}

                          {isPrintingSelected && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] uppercase text-slate-400 font-bold flex items-center gap-0.5">
                                <Calendar size={10} /> Print Target Date
                              </span>
                              <input
                                type="date"
                                value={proj.printing_date || getTodayStr()}
                                onChange={(e) => handleDateChange(pIdx, "printing_date", e.target.value)}
                                min={orderDates.commit_date ? orderDates.commit_date.substring(0, 10) : undefined}
                                max={orderDates.completion_date ? orderDates.completion_date.substring(0, 10) : undefined}
                                className="h-8 border border-slate-200 bg-white rounded-lg px-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                              />
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t mt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>Cancel</Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || isLoading || !newOrderNumber.trim()}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold flex items-center gap-1 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <FileDown size={13} /> Generate PDF
                </>
              )}
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || isLoading || !newOrderNumber.trim()}>
              {isSubmitting ? "Generating ID..." : "Confirm Routing & Generate ID"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}