import { jsPDF } from "jspdf";
import { loadBase64Image, extractProjectImageMeta } from "@/lib/pdfHelper";
import {
  getOrderProjectsAssignments,
  getPMOrderById,
  UserRole,
} from "../services/managerOrder.service";

export interface ProductionOrderPdfDataOptions {
  orderNumber: string;
  rawOrderData: any;
  projectsList: any[];
  rawAssignmentsData?: any[];
}

/**
 * Core PDF generation engine for Production Orders.
 * Renders identical styling, artwork specs, thumbnails, financial breakdowns, and workflow checklists.
 */
export async function generateProductionOrderPdfFromData({
  orderNumber,
  rawOrderData,
  projectsList,
  rawAssignmentsData,
}: ProductionOrderPdfDataOptions): Promise<void> {
  const orderNumStr = orderNumber.trim() || "DRAFT";

  const rawProjects =
    rawOrderData?.projects && rawOrderData.projects.length > 0
      ? rawOrderData.projects
      : projectsList || [];

  // Preload images into base64 thumbnails in parallel
  const enrichedProjects = await Promise.all(
    rawProjects.map(async (proj: any) => {
      const meta = extractProjectImageMeta(proj);
      let base64: string | null = null;
      if (meta.imageUrl) {
        base64 = await loadBase64Image(meta.imageUrl);
      }
      return {
        ...proj,
        _meta: {
          ...meta,
          base64,
        },
      };
    })
  );

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
    v !== undefined && v !== null && String(v).trim() !== "" && String(v) !== "null"
      ? String(v)
      : "-";

  const formatCurrency = (amt: any) => {
    if (amt === undefined || amt === null || amt === "" || isNaN(Number(amt))) return "-";
    return `Rs. ${Number(amt).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    margin,
    currentY
  );

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
    const line2 = [dist, state, pin !== "-" ? `Pincode: ${pin}` : "", country]
      .filter((s) => s !== "-")
      .join(", ");
    const res = [];
    if (line1) res.push(line1);
    if (line2) res.push(line2);
    return res.length > 0 ? res : ["-"];
  };

  const billLines = formatAddressLines(rawOrderData?.billing_address);
  const shipLines = formatAddressLines(
    rawOrderData?.shipping_address || rawOrderData?.delivery_address
  );

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

  currentY += renderMeta(
    "Created By",
    val(rawOrderData?.created_by_name || rawOrderData?.created_by),
    currentY
  );
  currentY += renderMeta(
    "Category",
    val(rawOrderData?.category_name || rawOrderData?.category?.category_name),
    currentY
  );
  currentY += renderMeta(
    "Price Cat.",
    val(rawOrderData?.price_category_name || rawOrderData?.product_price_category_name),
    currentY
  );
  currentY += renderMeta(
    "Delivery Type",
    val(rawOrderData?.delivery_type_name || rawOrderData?.delivery_type?.name),
    currentY
  );

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
  doc.text(
    val(rawOrderData?.total_units ?? rawOrderData?.total_quantity),
    margin + 173,
    innerY
  );

  // Row 2
  const innerY2 = innerY + 5.5;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("Account Name:", margin + 4, innerY2);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");
  doc.text(
    val(rawOrderData?.account_name || rawOrderData?.account?.account_name),
    margin + 26,
    innerY2
  );

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
  doc.text(
    formatCurrency(rawOrderData?.final_amount || rawOrderData?.total_amount),
    margin + 133,
    innerY3
  );

  currentY += 26;

  // ── Projects Table Section ─────────────────────────────────────────
  checkPageBreak(30);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor);
  doc.text("ORDER PROJECTS & ARTWORK SPECIFICATIONS", margin, currentY);

  currentY += 4;

  const drawTableHeader = () => {
    doc.setFillColor(30, 27, 75);
    doc.rect(margin, currentY, contentWidth, 7.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    doc.text("#", margin + 3.5, currentY + 5, { align: "center" });
    doc.text("Artwork & Project Specifications", margin + 10, currentY + 5);
    doc.text("Project ID", margin + 102, currentY + 5, { align: "center" });
    doc.text("Qty", margin + 120, currentY + 5, { align: "center" });
    doc.text("Unit Price", margin + 143, currentY + 5, { align: "right" });
    doc.text("Addl Amt", margin + 162, currentY + 5, { align: "right" });
    doc.text("Amount", margin + 180, currentY + 5, { align: "right" });
    currentY += 7.5;
  };

  drawTableHeader();

  enrichedProjects.forEach((proj: any, idx: number) => {
    const pName = val(proj.project_name || proj.product_name);
    const pId = val(proj.id || proj.project_id);
    const qty = val(proj.quantity);
    const unitPrice = formatCurrency(proj.unit_price);
    const addlAmt = formatCurrency(proj.additional_amount);
    const amt = formatCurrency(proj.amount);
    const meta = proj._meta || extractProjectImageMeta(proj);

    const hasImage = Boolean(meta.base64);
    const thumbSize = 13; // 13mm x 13mm
    const thumbX = margin + 9;
    const textStartX = hasImage ? thumbX + thumbSize + 3 : margin + 9;
    const textAvailableWidth = hasImage ? 64 : 80;

    const wrappedName = doc.splitTextToSize(pName, textAvailableWidth);

    // Lines count to calculate exact row height
    let detailLines = wrappedName.length;
    if (meta.code || meta.category) detailLines += 1;
    if (meta.name) detailLines += 1;

    const textBlockHeight = detailLines * 3.8 + 4;
    const rowHeight = Math.max(hasImage ? thumbSize + 5 : 9, textBlockHeight);

    if (checkPageBreak(rowHeight + 6)) {
      drawTableHeader();
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

    const midY = currentY + rowHeight / 2 + 1.2;

    // Number
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);
    doc.text(`${idx + 1}`, margin + 3.5, midY, { align: "center" });

    // Image Thumbnail
    if (hasImage && meta.base64) {
      const thumbY = currentY + (rowHeight - thumbSize) / 2;
      try {
        doc.addImage(meta.base64, "JPEG", thumbX, thumbY, thumbSize, thumbSize);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(thumbX, thumbY, thumbSize, thumbSize, 1, 1, "S");
      } catch (e) {
        console.warn("PDF image add failed:", e);
      }
    }

    // Details Text
    let lineY = currentY + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textColor);
    doc.text(wrappedName, textStartX, lineY);
    lineY += wrappedName.length * 3.8;

    // Code & Category Badge Line
    if (meta.code || meta.category) {
      doc.setFontSize(7.5);
      if (meta.code) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accentColor);
        doc.text(`Code: #${meta.code}`, textStartX, lineY);
        const codeWidth = doc.getTextWidth(`Code: #${meta.code}`);
        if (meta.category) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(` | Cat: ${meta.category}`, textStartX + codeWidth, lineY);
        }
      } else if (meta.category) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Category: ${meta.category}`, textStartX, lineY);
      }
      lineY += 3.5;
    }

    // Artwork Name Line
    if (meta.name) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const splitArtworkName = doc.splitTextToSize(`Artwork: ${meta.name}`, textAvailableWidth);
      doc.text(splitArtworkName, textStartX, lineY);
      lineY += splitArtworkName.length * 3.2;
    }

    // Project ID
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);
    doc.text(`#${pId}`, margin + 102, midY, { align: "center" });

    // Qty
    doc.setFont("helvetica", "bold");
    doc.text(`${qty}`, margin + 120, midY, { align: "center" });

    // Financials
    doc.setFont("helvetica", "normal");
    doc.text(unitPrice, margin + 143, midY, { align: "right" });
    doc.text(addlAmt, margin + 162, midY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(amt, margin + 180, midY, { align: "right" });
    doc.setFont("helvetica", "normal");

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
  const designProj = projectsList.find(
    (p: any) =>
      p.design_date && p.design_date !== "null" && String(p.design_date).trim() !== ""
  );
  const designDateStr = designProj
    ? formatDate(designProj.design_date)
    : rawOrderData?.design_date
    ? formatDate(rawOrderData.design_date)
    : null;

  const printProj = projectsList.find(
    (p: any) =>
      p.printing_date && p.printing_date !== "null" && String(p.printing_date).trim() !== ""
  );
  const printDateStr = printProj
    ? formatDate(printProj.printing_date)
    : rawOrderData?.print_date || rawOrderData?.printing_date
    ? formatDate(rawOrderData.print_date || rawOrderData.printing_date)
    : null;

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
}

/**
 * Convenience helper to fetch full order details & project assignments by Order ID,
 * and immediately trigger download of the Production Order PDF.
 */
export async function downloadProductionOrderPdf(
  orderId: number,
  fallbackOrderNumber?: string,
  role: UserRole = "project-manager"
): Promise<void> {
  const [assignmentsData, orderData] = await Promise.all([
    getOrderProjectsAssignments(orderId, role).catch((err) => {
      console.warn("Could not fetch project assignments:", err);
      return [];
    }),
    getPMOrderById(orderId, role),
  ]);

  const orderProjects = orderData?.projects || [];
  const projectDetailsMap = new Map<number, any>();
  orderProjects.forEach((p: any) => {
    projectDetailsMap.set(p.id, p);
  });

  const today = new Date().toISOString().split("T")[0];

  const formattedProjects = (assignmentsData && assignmentsData.length > 0 ? assignmentsData : orderProjects).map((proj: any) => {
    const projId = proj.project_id || proj.id;
    const details = projectDetailsMap.get(projId) || {};

    const designDateVal = details.design_date || proj.design_date;
    const printingDateVal = details.printing_date || proj.printing_date;
    const fallbackDate = orderData?.commit_date ? orderData.commit_date.substring(0, 10) : today;

    return {
      project_id: projId,
      id: projId,
      product_name: proj.product_name || proj.project_name || details.project_name,
      project_name: proj.product_name || proj.project_name || details.project_name,
      quantity: proj.quantity || details.quantity,
      unit_price: details.unit_price ?? proj.unit_price,
      additional_amount: details.additional_amount ?? proj.additional_amount,
      amount: details.amount ?? proj.amount,
      design_date: designDateVal && designDateVal !== "null" ? designDateVal.substring(0, 10) : fallbackDate,
      printing_date: printingDateVal && printingDateVal !== "null" ? printingDateVal.substring(0, 10) : fallbackDate,
      departments: (proj.departments || []).map((d: any) => ({
        department_id: d.id || d.department_id,
        name: d.name || d.department_name,
        is_assigned: Boolean(d.is_assigned),
      })),
      image_code_details: details.image_code_details || proj.image_code_details,
      image_code: details.image_code || proj.image_code,
      image_name: details.image_name || proj.image_name,
      image_category_name:
        details.image_category_name ||
        details.image_code_details?.category_name ||
        proj.image_category_name,
      project_images: details.project_images || proj.project_images,
    };
  });

  const resolvedOrderNumber =
    orderData?.order_number || fallbackOrderNumber || String(orderId);

  await generateProductionOrderPdfFromData({
    orderNumber: resolvedOrderNumber,
    rawOrderData: orderData,
    projectsList: formattedProjects,
    rawAssignmentsData: assignmentsData,
  });
}
